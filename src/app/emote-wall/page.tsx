"use client";
import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { KickChatClient, parseKickEmotes } from "@/lib/kick-client";

type Anim = "random" | "rain" | "bounce" | "rotation" | "fireworks";

interface EWConfig {
  channel: string;
  animation: Anim;
  durationMultiplier: number;
  disableOnChat: boolean;
  extraEmotes: boolean;
  explosionOnSub: boolean;
  explosionOnFollow: boolean;
  explosionOnRaid: boolean;
}

const DEFAULT: EWConfig = {
  channel: "",
  animation: "random",
  durationMultiplier: 1,
  disableOnChat: false,
  extraEmotes: true,
  explosionOnSub: true,
  explosionOnFollow: false,
  explosionOnRaid: false,
};

const ANIMS: Anim[] = ["bounce", "rotation", "fireworks", "rain"];

function EmoteWallApp() {
  const sp = useSearchParams();
  const isOverlay = sp.get("obs") === "1" || sp.get("overlay") === "1";
  const [cfg, setCfg] = useState<EWConfig>(() => {
    const c = { ...DEFAULT };
    c.channel = (sp.get("channel") || sp.get("kick") || "").toLowerCase();
    c.animation = (sp.get("animation") as Anim) || "random";
    c.durationMultiplier = parseFloat(sp.get("durationMultiplier") || "1") || 1;
    c.disableOnChat = sp.get("disableOnChat") === "true";
    c.extraEmotes = sp.get("extraEmotes") !== "false";
    c.explosionOnSub = sp.get("explosionOnSub") !== "false";
    c.explosionOnFollow = sp.get("explosionOnFollow") === "true";
    c.explosionOnRaid = sp.get("explosionOnRaid") === "true";
    return c;
  });
  const [status, setStatus] = useState("oczekiwanie");
  const [statusOk, setStatusOk] = useState(2);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const partsRef = useRef<any[]>([]);
  const poolRef = useRef<string[]>([]);
  const byNameRef = useRef(new Map<string, string>());
  const cacheRef = useRef(new Map<string, HTMLImageElement>());
  const failRef = useRef(new Set<string>());
  const budgetRef = useRef(0);
  const clientRef = useRef<KickChatClient | null>(null);
  const rafRef = useRef(0);

  const update = (p: Partial<EWConfig>) => setCfg((c) => ({ ...c, ...p }));

  const overlayUrl = typeof window !== "undefined"
    ? (() => {
        const q = new URLSearchParams();
        if (cfg.channel) q.set("channel", cfg.channel);
        if (cfg.animation !== "random") q.set("animation", cfg.animation);
        if (cfg.durationMultiplier !== 1) q.set("durationMultiplier", String(cfg.durationMultiplier));
        if (cfg.disableOnChat) q.set("disableOnChat", "true");
        if (!cfg.extraEmotes) q.set("extraEmotes", "false");
        if (!cfg.explosionOnSub) q.set("explosionOnSub", "false");
        if (cfg.explosionOnFollow) q.set("explosionOnFollow", "true");
        if (cfg.explosionOnRaid) q.set("explosionOnRaid", "true");
        q.set("obs", "1");
        return `${window.location.origin}/emote-wall/?${q.toString()}`;
      })()
    : "";

  const loadImg = (src: string): Promise<HTMLImageElement> => {
    if (!src || failRef.current.has(src)) return Promise.reject();
    if (cacheRef.current.has(src)) return Promise.resolve(cacheRef.current.get(src)!);
    return new Promise((ok, no) => {
      const i = new Image();
      i.crossOrigin = "anonymous";
      i.onload = () => { cacheRef.current.set(src, i); ok(i); };
      i.onerror = () => { failRef.current.add(src); no(); };
      i.src = src;
    });
  };

  const remember = (n: string, u: string) => {
    if (!n || !u) return;
    const k = n.toLowerCase();
    if (!byNameRef.current.has(k)) {
      byNameRef.current.set(k, u);
      poolRef.current.push(u);
    }
  };

  const pickAnim = (force?: string): Anim => {
    if (force && ANIMS.includes(force as Anim)) return force as Anim;
    if (cfg.animation !== "random" && ANIMS.includes(cfg.animation)) return cfg.animation;
    return ANIMS[Math.floor(Math.random() * 4)];
  };

  const spawn = useCallback(async (x: number, y: number, src: string, force?: string) => {
    if (budgetRef.current >= 120) return;
    budgetRef.current++;
    setTimeout(() => budgetRef.current--, 1000);
    let im: HTMLImageElement;
    try { im = await loadImg(src); } catch { return; }
    const mx = Math.min(window.innerHeight / 10, 72);
    let w = Math.floor(Math.random() * mx + 24);
    let h = Math.floor(w * (im.naturalHeight / im.naturalWidth || 1));
    if (im.naturalWidth > im.naturalHeight) { h = w; w = Math.floor(h * (im.naturalWidth / im.naturalHeight || 1)); }
    const type = pickAnim(force);
    const now = Date.now();
    const mul = cfg.durationMultiplier;
    if (type === "rotation") {
      partsRef.current.push({ type, img: im, x, y, width: w, height: h, destX: x + 300 * (Math.random() - 0.5), destY: y + 300 * (Math.random() - 0.5), rotation: 520 * Math.random(), start: now, duration: 1000 * Math.random() + 5000 * mul });
    } else if (type === "bounce") {
      partsRef.current.push({ type, img: im, x, y, width: w, height: h, vx: 8 * (Math.random() - 0.5), vy: 8 * (Math.random() - 0.5), ax: 0, ay: 0.15, start: now, duration: 4000 * Math.random() + 4000 * mul });
    } else if (type === "fireworks") {
      for (let i = 0; i < 12; i++) {
        const a = Math.random() * Math.PI * 2, d = 100 + 180 * Math.random();
        partsRef.current.push({ type, img: im, x, y, width: w * 0.7, height: h * 0.7, dx: Math.cos(a) * d, dy: Math.sin(a) * d, start: now, duration: 1400 });
      }
    } else {
      const depth = Math.random();
      const ww = w * (0.7 + 0.6 * depth), hh = h * (0.7 + 0.6 * depth), vy = 6 + 10 * depth;
      partsRef.current.push({ type: "rain", img: im, x: Math.random() * Math.max(1, window.innerWidth - ww), y: -hh, width: ww, height: hh, vy, sway: (Math.random() - 0.5) * (depth < 0.5 ? 1 : 2), swaySpeed: 0.008 + 0.012 * Math.random(), swayPhase: Math.random() * Math.PI * 2, rotation: 10 * (Math.random() - 0.5), depth, start: now, duration: ((window.innerHeight + hh) / vy) * 16, fadeOut: 0.15 + 0.1 * Math.random() });
    }
  }, [cfg.animation, cfg.durationMultiplier]);

  const burst = (src: string) => spawn(Math.floor(Math.random() * window.innerWidth), Math.floor(Math.random() * window.innerHeight), src, "fireworks");

  const explode = async (list?: string[]) => {
    const L = (list && list.length ? list : poolRef.current).filter(Boolean);
    if (!L.length) return;
    const n = 14;
    const u: string[] = [];
    while (u.length < n) { u.push(L[Math.floor(Math.random() * L.length)]); if (u.length > 60) break; }
    for (let i = 0; i < Math.ceil(u.length / 2); i++) burst(u[i]);
    await new Promise((r) => setTimeout(r, 600));
    for (let i = Math.ceil(u.length / 2); i < u.length; i++) burst(u[i]);
  };

  // Draw loop
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const resize = () => { cv.width = window.innerWidth; cv.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const draw = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      const now = Date.now();
      for (let i = partsRef.current.length - 1; i >= 0; i--) {
        if (now - partsRef.current[i].start >= partsRef.current[i].duration) partsRef.current.splice(i, 1);
      }
      for (const p of partsRef.current) {
        const t = (now - p.start) / p.duration;
        let x = p.x, y = p.y, s = 1, a = 1, r = 0;
        if (p.type === "fireworks") { x = p.x + p.dx * t; y = p.y + p.dy * t; s = 1 - 0.5 * t; a = 1 - t; }
        else if (p.type === "bounce") {
          p.vx += p.ax; p.vy += p.ay; p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > cv.width - p.width) p.vx *= -1;
          if (p.y < 0 || p.y > cv.height - p.height) p.vy *= -0.85;
          x = p.x; y = p.y; a = 1 - t;
        } else if (p.type === "rotation") {
          x = p.x + (p.destX - p.x) * t; y = p.y + (p.destY - p.y) * t; r = p.rotation * t; a = 1 - t;
        } else {
          const e = now - p.start;
          y = p.y + p.vy * e / 16;
          x = p.x + 32 * Math.sin(p.swayPhase + e * p.swaySpeed) * p.sway;
          r = p.rotation * Math.sin(p.swayPhase + e * p.swaySpeed * 0.7);
          a = t > 1 - p.fadeOut ? 1 - (t - (1 - p.fadeOut)) / p.fadeOut : 0.85 + 0.15 * p.depth;
          s = 1 + 0.2 * (1 - p.depth);
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, a));
        ctx.translate(x + p.width / 2, y + p.height / 2);
        if (r) ctx.rotate((r * Math.PI) / 180);
        ctx.drawImage(p.img, -p.width / 2, -p.height / 2, p.width * s, p.height * s);
        ctx.restore();
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, []);

  // Connect
  useEffect(() => {
    if (!cfg.channel) return;
    if (isOverlay) document.documentElement.classList.add("emote-wall-mode");
    const client = new KickChatClient(
      (msg, isSystem, cat) => {
        if (isSystem) {
          if (cat === "subscription" || cat === "gift") {
            if (cfg.explosionOnSub) explode();
          }
          return;
        }
        if (cfg.disableOnChat) return;
        const content = typeof msg.content === "string" ? msg.content : "";
        const { text, emotes } = parseKickEmotes(content);
        for (const e of emotes) {
          remember(e.text, e.url);
          spawn(Math.floor(Math.random() * window.innerWidth), Math.floor(Math.random() * window.innerHeight), e.url);
        }
        // 7TV by name
        for (const w of text.split(/\s+/)) {
          const u = byNameRef.current.get(w.toLowerCase());
          if (u) spawn(Math.floor(Math.random() * window.innerWidth), Math.floor(Math.random() * window.innerHeight), u);
        }
      },
      (s, d) => {
        if (s === "connected") { setStatusOk(1); setStatus(cfg.channel + " · " + poolRef.current.length + " emotów"); }
        else if (s === "error") { setStatusOk(0); setStatus(d || "błąd"); }
        else if (s === "connecting") { setStatusOk(2); setStatus("łączenie…"); }
        else if (s === "loading-emotes") { setStatusOk(2); setStatus("ładowanie emotek…"); }
      },
      true
    );
    clientRef.current = client;
    client.connect(cfg.channel).then(() => {
      // merge 7TV map into pool
      client.emoteMap.forEach((url, name) => remember(name, url));
      setStatus(cfg.channel + " · " + poolRef.current.length + " emotów");
    });
    return () => {
      client.disconnect();
      document.documentElement.classList.remove("emote-wall-mode");
    };
  }, [cfg.channel, isOverlay, cfg.disableOnChat, cfg.explosionOnSub]);

  const test = () => {
    const demo = poolRef.current.length
      ? poolRef.current.slice(0, 10)
      : ["https://files.kick.com/emotes/37226/fullsize", "https://cdn.7tv.app/emote/01F6M9G1S8000ESDAA4C7Y8Q20/2x.webp"];
    demo.forEach((u, i) => setTimeout(() => burst(u), i * 50));
  };

  if (isOverlay) {
    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }} />;
  }

  return (
    <div className="min-h-screen bg-[#0c0e14] text-[#eef2f8]">
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }} />
      <div className="relative z-10 max-w-[820px] mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#53FC18] text-black font-extrabold grid place-items-center">W</div>
          <div>
            <h1 className="text-xl font-bold">Emote Wall</h1>
            <p className="text-sm text-[#8b93a7]">Emoty z czatu Kick na cały ekran · osobny overlay OBS</p>
          </div>
          <div className="ml-auto flex gap-2">
            <Link href="/" className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 text-white/70 hover:bg-white/10">Chat Overlay</Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-[#141822] border border-[#262c3a] rounded-2xl p-4">
            <h2 className="text-[13px] uppercase tracking-wider text-[#8b93a7] mb-3">Kanał</h2>
            <label className="block text-xs text-[#8b93a7] mb-1">Nick Kick</label>
            <input className="w-full bg-[#0d1018] border border-[#262c3a] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#53FC18]"
              value={cfg.channel} onChange={(e) => update({ channel: e.target.value.trim().toLowerCase() })} placeholder="np. xqc" />
            <p className="text-xs text-[#8b93a7] mt-2">OBS: Browser Source 1920×1080, przezroczyste tło.</p>
          </div>

          <div className="bg-[#141822] border border-[#262c3a] rounded-2xl p-4">
            <h2 className="text-[13px] uppercase tracking-wider text-[#8b93a7] mb-3">Animacja</h2>
            <label className="block text-xs text-[#8b93a7] mb-1">Typ</label>
            <select className="w-full bg-[#0d1018] border border-[#262c3a] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#53FC18]"
              value={cfg.animation} onChange={(e) => update({ animation: e.target.value as Anim })}>
              <option value="random">losowa</option>
              <option value="rain">rain</option>
              <option value="bounce">bounce</option>
              <option value="rotation">rotation</option>
              <option value="fireworks">fireworks</option>
            </select>
            <label className="block text-xs text-[#8b93a7] mt-3 mb-1">Czas trwania ×</label>
            <input type="number" min={0.5} max={4} step={0.1} className="w-full bg-[#0d1018] border border-[#262c3a] rounded-lg px-3 py-2.5 text-sm"
              value={cfg.durationMultiplier} onChange={(e) => update({ durationMultiplier: parseFloat(e.target.value) || 1 })} />
            <label className="flex items-center gap-2 mt-3 text-sm"><input type="checkbox" checked={cfg.disableOnChat} onChange={(e) => update({ disableOnChat: e.target.checked })} /> tylko eventy, bez czatu</label>
            <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" checked={cfg.extraEmotes} onChange={(e) => update({ extraEmotes: e.target.checked })} /> 7TV / BTTV</label>
            <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" checked={cfg.explosionOnSub} onChange={(e) => update({ explosionOnSub: e.target.checked })} /> wybuch na sub / gift</label>
            <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" checked={cfg.explosionOnFollow} onChange={(e) => update({ explosionOnFollow: e.target.checked })} /> wybuch na follow</label>
            <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" checked={cfg.explosionOnRaid} onChange={(e) => update({ explosionOnRaid: e.target.checked })} /> wybuch na host / raid</label>
          </div>

          <div className="md:col-span-2 bg-[#141822] border border-[#262c3a] rounded-2xl p-4">
            <h2 className="text-[13px] uppercase tracking-wider text-[#8b93a7] mb-3">OBS</h2>
            <div className="flex flex-wrap gap-2">
              <button onClick={test} className="bg-[#1b2130] border border-[#262c3a] text-white font-bold px-4 py-2.5 rounded-lg text-sm">Test</button>
              <button onClick={async () => { try { await navigator.clipboard.writeText(overlayUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {} }}
                className="bg-[#53FC18] text-black font-bold px-4 py-2.5 rounded-lg text-sm">{copied ? "Skopiowano!" : "Kopiuj URL"}</button>
            </div>
            <div className="mt-3 bg-[#0d1018] border border-[#262c3a] rounded-lg px-3 py-2.5 text-xs text-[#b8c0d0] break-all">{cfg.channel ? overlayUrl : "wpisz nick kanału"}</div>
            <div className={`mt-2 text-xs ${statusOk === 1 ? "text-[#53FC18]" : statusOk === 0 ? "text-[#ff6b6b]" : "text-[#8b93a7]"}`}>{status}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmoteWallPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white/50">Ładowanie…</div>}>
      <EmoteWallApp />
    </Suspense>
  );
}
