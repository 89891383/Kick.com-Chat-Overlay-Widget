/**
 * Kick Centrifugo client (2026) — anonymous, no login.
 */

export type StatusCb = (status: string, detail?: string) => void;
export type MsgCb = (msg: any, isSystem?: boolean, category?: string) => void;

const clientId = () => "kc-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function decode(v: unknown): any {
  if (typeof v === "string") {
    try { return JSON.parse(v); } catch { return {}; }
  }
  return v || {};
}

export class KickChatClient {
  private ws: WebSocket | null = null;
  private clientId = clientId();
  private chatroomId: number | null = null;
  private channelId: number | null = null;
  private userId: number | null = null;
  private token = "";
  private tokenExp = 0;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private msgId = 1;
  private disposed = false;
  private onMessage: MsgCb;
  private onStatus: StatusCb;
  private showSystem: boolean;
  public emoteMap = new Map<string, string>();
  public subscriberBadges: any[] = [];
  public channelSlug = "";

  constructor(onMessage: MsgCb, onStatus: StatusCb, showSystem = true) {
    this.onMessage = onMessage;
    this.onStatus = onStatus;
    this.showSystem = showSystem;
  }

  async connect(channelSlug: string) {
    this.disposed = false;
    this.channelSlug = channelSlug;
    this.onStatus("connecting");
    try {
      const res = await fetch(
        `https://kick.com/api/v2/channels/${encodeURIComponent(channelSlug)}`,
        { headers: { Accept: "application/json" }, cache: "no-store" }
      );
      if (!res.ok) throw new Error(`Nie znaleziono kanału: ${channelSlug}`);
      const data = await res.json();
      this.chatroomId = data.chatroom?.id;
      this.channelId = data.id;
      this.userId = data.user_id || data.user?.id;
      this.subscriberBadges = Array.isArray(data.subscriber_badges)
        ? [...data.subscriber_badges].sort((a: any, b: any) => b.months - a.months)
        : [];
      if (!this.chatroomId) throw new Error("Brak chatroom ID");
      this.onStatus("loading-emotes");
      await this.load7TV();
      await this.negotiateAndConnect();
      this.onStatus("connected");
    } catch (e) {
      this.onStatus("error", (e as Error).message || "Błąd połączenia");
    }
  }

  private async load7TV() {
    this.emoteMap = new Map();
    try {
      const g = await fetch("https://7tv.io/v3/emote-sets/global");
      if (g.ok) {
        const d = await g.json();
        for (const e of d.emotes || []) {
          if (e?.name && e?.id) this.emoteMap.set(e.name, `https://cdn.7tv.app/emote/${e.id}/2x.webp`);
        }
      }
    } catch {}
    if (this.userId) {
      try {
        const c = await fetch(`https://7tv.io/v3/users/kick/${this.userId}`);
        if (c.ok) {
          const d = await c.json();
          let emotes = (d?.emote_set?.emotes || []).filter((e: any) => e?.name && e?.id);
          if (!emotes.length && d?.emote_set_id) {
            const s = await fetch(`https://7tv.io/v3/emote-sets/${d.emote_set_id}`);
            if (s.ok) {
              const sd = await s.json();
              emotes = (sd.emotes || []).filter((e: any) => e?.name && e?.id);
            }
          }
          for (const e of emotes) this.emoteMap.set(e.name, `https://cdn.7tv.app/emote/${e.id}/2x.webp`);
        }
      } catch {}
    }
  }

  private async negotiateAndConnect(): Promise<void> {
    const neg = await fetch("https://web.kick.com/api/v1/realtime/connection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://kick.com",
        Referer: "https://kick.com/",
      },
      body: JSON.stringify({
        client: { id: this.clientId, type: "web" },
        capabilities: { accepted_providers: [{ provider: "centrifugo" }, { provider: "pusher" }] },
      }),
    });
    if (!neg.ok) throw new Error("Negocjacja realtime nieudana");
    const negData = await neg.json();
    const url =
      negData?.data?.connections?.[0]?.credentials?.url ||
      "wss://realtime.us-east-1.platform.kick.com/connection/websocket";

    await this.refreshToken();

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);
      const t = setTimeout(() => reject(new Error("Timeout WS")), 15000);
      this.ws.onopen = () => {
        this.send({ id: this.msgId++, connect: { token: this.token, name: "kickchat-overlay" } });
      };
      this.ws.onmessage = (ev) => {
        this.handleFrame(String(ev.data), () => {
          clearTimeout(t);
          resolve();
        }, (err) => {
          clearTimeout(t);
          reject(err);
        });
      };
      this.ws.onerror = () => {
        clearTimeout(t);
        reject(new Error("WebSocket error"));
      };
      this.ws.onclose = () => {
        if (!this.disposed) this.scheduleReconnect();
      };
    });
  }

  private async refreshToken() {
    const res = await fetch("https://web.kick.com/api/v1/realtime/auth/connection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://kick.com",
        Referer: "https://kick.com/",
      },
      body: JSON.stringify({ client_id: this.clientId }),
    });
    if (!res.ok) throw new Error("Auth token failed");
    const data = await res.json();
    this.token = data?.data?.token || "";
    this.tokenExp = Date.now() + 40 * 60 * 1000;
  }

  private send(obj: object) {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(obj));
  }

  private handleFrame(raw: string, onOk?: () => void, onErr?: (e: Error) => void) {
    for (const line of raw.split("\n").filter(Boolean)) {
      let msg: any;
      try { msg = JSON.parse(line); } catch { continue; }

      if (msg.connect) {
        this.send({ id: this.msgId++, subscribe: { channel: `chatrooms.${this.chatroomId}.v2` } });
        if (this.channelId) {
          this.send({ id: this.msgId++, subscribe: { channel: `channel.${this.channelId}` } });
        }
        this.startPing();
        onOk?.();
        continue;
      }
      if (msg.subscribe) continue;

      // Centrifugo publication formats
      const pub = msg.push?.pub || msg.pub;
      if (pub) {
        const data = decode(pub.data);
        this.dispatch(data);
        continue;
      }
      // Some payloads come as direct event wrappers
      if (msg.data && (msg.event || msg.type)) {
        this.dispatch(decode(msg.data));
      }
      if (Object.keys(msg).length === 0 || msg.ping != null) {
        this.send({});
      }
    }
  }

  private dispatch(data: any) {
    // Normalize various shapes
    const event = String(data.event || data.type || "");
    const payload = decode(data.data ?? data);

    const isChat =
      event.includes("ChatMessage") ||
      payload.content !== undefined ||
      (payload.sender && (payload.id || payload.message_id));

    if (isChat) {
      this.onMessage(payload, false);
      return;
    }

    if (!this.showSystem) return;

    if (event.includes("Subscription") && !event.includes("Gifted")) {
      const u = payload.username || "";
      this.onMessage(
        {
          id: `sys-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          content: `${u} subscribed!${Number(payload.months) > 1 ? ` (${payload.months} months)` : ""}`,
          sender: { username: u, identity: {} },
        },
        true,
        "subscription"
      );
    } else if (event.includes("GiftedSubscriptions") || event.includes("Gifted")) {
      const c = Array.isArray(payload.gifted_usernames)
        ? payload.gifted_usernames.length
        : Number(payload.count || 1);
      const u = payload.gifter_username || "";
      this.onMessage(
        {
          id: `sys-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          content: `${u} gifted ${c} sub${c === 1 ? "" : "s"}!`,
          sender: { username: u, identity: {} },
        },
        true,
        "gift"
      );
    }
  }

  private startPing() {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      if (Date.now() > this.tokenExp - 60_000) this.refreshToken().catch(() => {});
      this.send({});
    }, 20000);
  }

  private stopPing() {
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.pingTimer = null;
  }

  private scheduleReconnect() {
    if (this.reconnectTimer || this.disposed) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.chatroomId && !this.disposed) {
        this.negotiateAndConnect().catch(() => this.scheduleReconnect());
      }
    }, 2500);
  }

  disconnect() {
    this.disposed = true;
    this.stopPing();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }
}

/** Parse Kick native emote markers [emote:ID:name] */
export function parseKickEmotes(content: string) {
  const re = /\[(?:emote|emoji):(\w+):([^\]]*)\]/g;
  const emotes: { begin: number; end: number; text: string; url: string }[] = [];
  let text = "";
  let last = 0;
  let cp = 0;
  for (const m of content.matchAll(re)) {
    const pre = content.slice(last, m.index);
    text += pre;
    cp += [...pre].length;
    const name = m[2] || "emote";
    const nl = [...name].length;
    emotes.push({
      begin: cp,
      end: cp + nl,
      text: name,
      url: `https://files.kick.com/emotes/${m[1]}/fullsize`,
    });
    text += name;
    cp += nl;
    last = (m.index || 0) + m[0].length;
  }
  text += content.slice(last);
  return { text, emotes };
}
