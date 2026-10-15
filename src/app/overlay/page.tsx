"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { paramsToConfig } from "@/lib/presets";
import ChatOverlay from "@/components/ChatOverlay";

function OverlayInner() {
  const sp = useSearchParams();
  const [cfg, setCfg] = useState(() => paramsToConfig(new URLSearchParams(sp.toString())));

  useEffect(() => {
    document.documentElement.classList.add("overlay-mode");
    return () => document.documentElement.classList.remove("overlay-mode");
  }, []);

  useEffect(() => {
    setCfg(paramsToConfig(new URLSearchParams(sp.toString())));
  }, [sp]);

  return (
    <div style={{ width: "100vw", height: "100vh", background: cfg.bgColor || "transparent" }}>
      <ChatOverlay cfg={cfg} live={!!cfg.channel} />
    </div>
  );
}

export default function OverlayPage() {
  return (
    <Suspense fallback={null}>
      <OverlayInner />
    </Suspense>
  );
}
