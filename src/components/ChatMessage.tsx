"use client";
import type { ChatConfig } from "@/lib/types";
import { parseKickEmotes } from "@/lib/kick-client";
import { KICK_BADGE_URLS, KICK_ICON_SVG, fallbackColor, readableColor, escapeHtml } from "@/lib/badges";
import { SIZES, getStroke, getMsgShadow } from "@/lib/sizes";
import { loadGoogleFont } from "@/lib/fonts";

const CATEGORY_ICON: Record<string, string> = { subscription: "★", gift: "🎁", raid: "👥", cheer: "💰", follow: "❤️", announcement: "📣" };

export default function ChatMessage({ msg, isSystem, category, cfg, emoteMap, subscriberBadges = [], fading }: {
  msg: any; isSystem?: boolean; category?: string; cfg: ChatConfig; emoteMap: Map<string, string>; subscriberBadges?: any[]; fading?: boolean;
}) {
  const szBase = SIZES[cfg.textSize] || SIZES.medium;
  const custom = typeof cfg.fontSize === "number" && cfg.fontSize >= 8 ? cfg.fontSize : 0;
  const ratio = custom ? custom / szBase.fontSize : 1;
  const fontSize = custom || szBase.fontSize;
  const lineHeight = Math.round((custom || szBase.lineHeight) * (cfg.lineSpacing || 1.4) / 1.4);
  const badgeS = Math.round(szBase.badge * ratio * (cfg.badgeScale || 1));
  const emoteH = Math.round(szBase.emote * ratio * (cfg.emoteScale || 1));
  const sender = msg?.sender || {};
  const username = sender.username || sender.slug || "";
  const contentStr = typeof msg.content === "string" ? msg.content : "";
  const uLow = username.toLowerCase();
  if (cfg.userBL.includes(uLow) || cfg.botNames.includes(uLow)) return null;
  const cLow = contentStr.toLowerCase();
  if (cfg.prefixBL.some((p: string) => cLow.startsWith(p))) return null;
  const { text, emotes } = parseKickEmotes(contentStr);
  const color = readableColor(sender.identity?.color || fallbackColor(username));
  const msgShadow = getMsgShadow(cfg.textShadow);
  const stroke = getStroke(cfg.stroke);
  const animClass = cfg.animation === "slide" ? "msg-anim-slide" : cfg.animation === "fade" ? "msg-anim-fade" : cfg.animation === "scale" ? "msg-anim-scale" : cfg.animation === "bounce" ? "msg-anim-bounce" : "";
  const nickFont = cfg.nickGoogleFont || cfg.nickFont ? loadGoogleFont(cfg.nickFont, cfg.nickGoogleFont) : null;

  const sourceTag = () => {
    if (cfg.sourceTag === "dot") return <span className="inline-block w-[0.5em] h-[0.5em] rounded-full bg-[#53FC18] mr-[0.4em] align-middle" />;
    if (cfg.sourceTag === "icon") return <span className="inline-flex mr-[0.4em] align-middle" style={{ width: "1em", height: "1em" }} dangerouslySetInnerHTML={{ __html: KICK_ICON_SVG }} />;
    if (cfg.sourceTag === "label") return <span className="text-[0.72em] font-bold text-[#53FC18] bg-[rgba(83,252,24,0.16)] px-[0.4em] py-[0.12em] rounded-[0.4em] mr-[0.4em] align-middle">Kick</span>;
    return null;
  };

  const renderText = (t: string) => {
    if (!emoteMap.size) return escapeHtml(t);
    return t.split(" ").map((w, i, arr) => {
      const url = emoteMap.get(w);
      if (url) return <img key={i} className="inline-block object-contain align-middle" src={url} alt={w} style={{ maxHeight: emoteH, maxWidth: emoteH * 3, height: emoteH }} loading="lazy" />;
      return <span key={i}>{escapeHtml(w)}{i < arr.length - 1 ? " " : ""}</span>;
    });
  };

  const renderBody = () => {
    if (!emotes.length) return <>{renderText(text)}</>;
    const chars = [...text];
    const sorted = [...emotes].sort((a, b) => a.begin - b.begin);
    const parts: React.ReactNode[] = [];
    let cursor = 0;
    for (const e of sorted) {
      if (e.begin > cursor) parts.push(<span key={"t" + cursor}>{renderText(chars.slice(cursor, e.begin).join(""))}</span>);
      parts.push(<img key={"e" + e.begin} className="inline-block object-contain align-middle" src={e.url} alt={e.text} style={{ maxHeight: emoteH, maxWidth: emoteH * 3, height: emoteH }} loading="lazy" />);
      cursor = e.end;
    }
    if (cursor < chars.length) parts.push(<span key="end">{renderText(chars.slice(cursor).join(""))}</span>);
    return <>{parts}</>;
  };

  const renderBadges = () => {
    const identity = sender.identity || {};
    const badges: React.ReactNode[] = [];
    const bStyle = { width: badgeS, height: badgeS, minWidth: badgeS, borderRadius: "10%", display: "block" as const };
    for (const b of identity.badges || []) {
      if (!b?.type) continue;
      let url = KICK_BADGE_URLS[b.type];
      if (b.type === "subscriber") {
        const months = Number(b.count ?? 0);
        const match = subscriberBadges.find((sb: any) => months >= sb.months);
        url = match?.badge_image?.src || KICK_BADGE_URLS.subscriber;
      }
      if (url) badges.push(<img key={b.type + badges.length} src={url} alt={b.type} style={bStyle} loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />);
    }
    for (const b of identity.badges_v2 || []) {
      if (!b?.image_url) continue;
      badges.push(<img key={(b.name || "") + badges.length} src={b.image_url} alt={b.name || "badge"} style={bStyle} loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />);
    }
    if (!badges.length) return null;
    return <span className="inline-flex items-center gap-0.5 mr-1.5 align-middle">{badges}</span>;
  };

  const isMod = (sender.identity?.badges || []).some((b: any) => b.type === "moderator" || b.type === "broadcaster");
  const isSub = (sender.identity?.badges || []).some((b: any) => b.type === "subscriber");
  let highlightStyle: React.CSSProperties = {};
  if (cfg.highlightMods && isMod) highlightStyle = { borderLeft: "2px solid #53FC18", paddingLeft: 6, background: "linear-gradient(90deg, rgba(83,252,24,0.12), transparent)" };
  else if (cfg.highlightSubs && isSub) highlightStyle = { borderLeft: "2px solid #ffc900", paddingLeft: 6, background: "linear-gradient(90deg, rgba(255,201,0,0.1), transparent)" };

  const baseStyle: React.CSSProperties = {
    filter: msgShadow || undefined, fontSize, lineHeight: lineHeight + "px", fontWeight: cfg.msgWeight,
    textTransform: cfg.msgCaps ? "uppercase" : undefined, textShadow: stroke || undefined,
    color: cfg.fontColor || "white", marginBottom: 4, wordBreak: "break-word",
  };

  if (isSystem) {
    const icon = CATEGORY_ICON[category || ""] || "📣";
    return (
      <div className={animClass + (fading ? " msg-fading" : "")} style={baseStyle}>
        <div className="flex items-start gap-1" style={highlightStyle}>
          {sourceTag()}
          <div className="flex-1 min-w-0 rounded-md px-2" style={{ borderLeft: "2px solid #53FC18", background: "linear-gradient(90deg, rgba(83,252,24,0.2), transparent)" }}>
            <span className="mr-1">{icon}</span><span>{escapeHtml(text)}</span>
          </div>
        </div>
      </div>
    );
  }

  let replyNode: React.ReactNode = null;
  const meta = msg.type === "reply" ? msg.metadata : null;
  if (meta?.original_sender && meta?.original_message) {
    const rUser = meta.original_sender.username || "Unknown";
    const rText = parseKickEmotes(typeof meta.original_message.content === "string" ? meta.original_message.content : "").text;
    replyNode = <div className="opacity-70 text-[0.6em] leading-snug ml-1 pl-2 border-l-2 border-white/25 truncate">↪ <strong>{escapeHtml(rUser)}</strong> {rText ? escapeHtml(rText) : ""}</div>;
  }

  const time = cfg.showTimestamp ? <span className="opacity-40 text-[0.65em] mr-1.5 tabular-nums">{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span> : null;

  return (
    <div className={animClass + (fading ? " msg-fading" : "")} style={baseStyle}>
      {replyNode}
      <div style={highlightStyle}>
        {time}{sourceTag()}
        {!cfg.hideNames && (
          <span className="inline">
            {renderBadges()}
            <span style={{ color, fontWeight: cfg.nickWeight, fontFamily: nickFont || undefined }}>{escapeHtml(username)}</span>
            <span className="mr-1">:</span>
          </span>
        )}
        <span>{renderBody()}</span>
      </div>
    </div>
  );
}
