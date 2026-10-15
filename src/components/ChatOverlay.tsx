"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import type { ChatConfig } from "@/lib/types";
import { KickChatClient } from "@/lib/kick-client";
import { loadGoogleFont } from "@/lib/fonts";
import ChatMessage from "./ChatMessage";

interface Entry {
  id: string;
  msg: any;
  isSystem?: boolean;
  category?: string;
  fading?: boolean;
}

export default function ChatOverlay({ cfg, live = true }: { cfg: ChatConfig; live?: boolean }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [status, setStatus] = useState("idle");
  const [emoteMap, setEmoteMap] = useState<Map<string, string>>(new Map());
  const [subBadges, setSubBadges] = useState<any[]>([]);
  const clientRef = useRef<KickChatClient | null>(null);
  const idsRef = useRef(new Set<string>());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadGoogleFont(cfg.font, cfg.googleFont);
    if (cfg.nickFont || cfg.nickGoogleFont) loadGoogleFont(cfg.nickFont, cfg.nickGoogleFont);
  }, [cfg.font, cfg.googleFont, cfg.nickFont, cfg.nickGoogleFont]);

  const addMsg = useCallback((raw: any, isSystem?: boolean, category?: string) => {
    const id = (raw.id?.toString() || `m-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    if (idsRef.current.has(id)) return;
    idsRef.current.add(id);
    setEntries((prev) => {
      const next = [...prev, { id, msg: raw, isSystem, category }];
      const max = cfg.maxMessages || 50;
      while (next.length > max) {
        const removed = next.shift();
        if (removed) idsRef.current.delete(removed.id);
      }
      return next;
    });
    if (cfg.fadeEnabled && cfg.fadeSeconds > 0) {
      setTimeout(() => {
        setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, fading: true } : e)));
        setTimeout(() => {
          setEntries((prev) => {
            idsRef.current.delete(id);
            return prev.filter((e) => e.id !== id);
          });
        }, 300);
      }, cfg.fadeSeconds * 1000);
    }
  }, [cfg.maxMessages, cfg.fadeEnabled, cfg.fadeSeconds]);

  useEffect(() => {
    if (!live || !cfg.channel) return;
    const client = new KickChatClient(addMsg, (s) => setStatus(s), cfg.showSystemMsgs);
    clientRef.current = client;
    client.connect(cfg.channel).then(() => {
      setEmoteMap(new Map(client.emoteMap));
      setSubBadges(client.subscriberBadges || []);
    });
    return () => { client.disconnect(); };
  }, [cfg.channel, live, cfg.showSystemMsgs, addMsg]);

  useEffect(() => {
    if (containerRef.current && cfg.direction === "bottom") {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [entries, cfg.direction]);

  const style: React.CSSProperties = {
    fontFamily: loadGoogleFont(cfg.font, cfg.googleFont),
    width: "100%",
    height: "100%",
    overflow: "hidden",
    display: "flex",
    flexDirection: cfg.direction === "top" ? "column" : "column-reverse",
    background: cfg.bgColor || "transparent",
    padding: 8,
  };

  return (
    <div ref={containerRef} style={style} className="scrollbar-thin">
      {entries.map((e) => (
        <ChatMessage
          key={e.id}
          msg={e.msg}
          isSystem={e.isSystem}
          category={e.category}
          cfg={cfg}
          emoteMap={emoteMap}
          subscriberBadges={subBadges}
          fading={e.fading}
        />
      ))}
      {!cfg.channel && live && (
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, padding: 12 }}>Wpisz kanał i połącz</div>
      )}
    </div>
  );
}
