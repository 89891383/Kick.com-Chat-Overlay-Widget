"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import type { ChatConfig } from "@/lib/types";
import { DEFAULT_CONFIG } from "@/lib/types";
import { PRESETS, applyPreset, configToParams } from "@/lib/presets";
import { FONT_OPTIONS } from "@/lib/fonts";
import ChatOverlay from "@/components/ChatOverlay";

type Tab = "channel" | "text" | "nick" | "fx" | "filters" | "presets";

export default function HomePage() {
  const [cfg, setCfg] = useState<ChatConfig>({ ...DEFAULT_CONFIG });
  const [tab, setTab] = useState<Tab>("channel");
  const [status, setStatus] = useState("");
  const [copied, setCopied] = useState(false);

  const update = useCallback((patch: Partial<ChatConfig>) => {
    setCfg((c) => ({ ...c, ...patch }));
  }, []);

  const overlayUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const p = configToParams(cfg);
    return `${window.location.origin}/overlay/?${p.toString()}`;
  }, [cfg]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(overlayUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "channel", label: "Kanał" },
    { id: "presets", label: "Presety" },
    { id: "text", label: "Tekst" },
    { id: "nick", label: "Nick" },
    { id: "fx", label: "Efekty" },
    { id: "filters", label: "Filtry" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Sidebar */}
      <aside className="w-[420px] min-w-[420px] flex flex-col border-r border-white/5 bg-[#101015]">
        <div className="px-5 pt-5 pb-3 border-b border-white/5">
          <h1 className="text-lg font-extrabold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#53FC18] shadow-[0_0_10px_rgba(83,252,24,0.6)]" />
            KickChat Overlay
          </h1>
          <p className="text-[11px] text-white/35 mt-1">Konfiguruj · podgląd na żywo · OBS</p>
          <div className="flex gap-2 mt-3">
            <Link href="/" className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#53FC18] text-black">Chat</Link>
            <Link href="/emote-wall/" className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 text-white/70 hover:bg-white/10">Emote Wall</Link>
          </div>
        </div>

        <div className="flex px-2 gap-0.5 border-b border-white/5 bg-[#0d0d12] overflow-x-auto">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition ${tab === t.id ? "text-white border-[#53FC18]" : "text-white/40 border-transparent hover:text-white/70"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
          {tab === "channel" && (
            <>
              <Field label="Kanał Kick">
                <input className="inp" value={cfg.channel} onChange={(e) => update({ channel: e.target.value.trim() })} placeholder="np. xqc" />
              </Field>
              <p className="text-[11px] text-white/40">{status || "Wpisz kanał — podgląd łączy automatycznie"}</p>
              <Field label="Kolor tła overlay (puste = transparent)">
                <div className="flex gap-2">
                  <input type="color" className="w-10 h-9 rounded-lg border border-white/10 bg-[#17171f]" value={cfg.bgColor || "#000000"}
                    onChange={(e) => update({ bgColor: e.target.value })} />
                  <input className="inp flex-1" value={cfg.bgColor.replace("#","")} maxLength={6}
                    onChange={(e) => { const v = e.target.value.replace("#",""); update({ bgColor: /^[0-9a-fA-F]{6}$/.test(v) ? "#"+v : "" }); }} placeholder="puste = transparent" />
                </div>
              </Field>
            </>
          )}

          {tab === "presets" && (
            <div className="grid grid-cols-1 gap-2">
              {PRESETS.map((p) => (
                <button key={p.id} onClick={() => setCfg(applyPreset(p.id, cfg))}
                  className={`text-left p-3 rounded-xl border transition ${cfg.preset === p.id ? "border-[#53FC18] bg-[#53FC18]/10" : "border-white/8 bg-[#17171f] hover:border-white/20"}`}>
                  <div className="font-bold text-sm text-white">{p.name}</div>
                  <div className="text-[11px] text-white/45 mt-0.5">{p.description}</div>
                </button>
              ))}
            </div>
          )}

          {tab === "text" && (
            <>
              <Field label="Rozmiar (preset)">
                <PillGroup value={cfg.textSize} options={["small","medium","large","xlarge"]} onChange={(v) => update({ textSize: v as any })} />
              </Field>
              <Field label="Font size px (nadpisuje preset)">
                <input type="number" className="inp" min={8} max={200} value={cfg.fontSize || ""} onChange={(e) => update({ fontSize: e.target.value ? parseInt(e.target.value,10) : "" })} placeholder="np. 28" />
              </Field>
              <Field label="Font wiadomości">
                <select className="inp" value={cfg.font} onChange={(e) => update({ font: e.target.value })}>
                  {FONT_OPTIONS.map((g) => (
                    <optgroup key={g.group} label={g.group}>
                      {g.items.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
                    </optgroup>
                  ))}
                </select>
              </Field>
              <Field label="Google Font (nadpisuje)">
                <input className="inp" value={cfg.googleFont} onChange={(e) => update({ googleFont: e.target.value.trim() })} placeholder="np. Outfit" />
              </Field>
              <Field label={`Waga tekstu: ${cfg.msgWeight}`}>
                <input type="range" min={100} max={900} step={100} value={cfg.msgWeight} onChange={(e) => update({ msgWeight: parseInt(e.target.value,10) })} className="w-full accent-[#53FC18]" />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Cień">
                  <select className="inp" value={cfg.textShadow} onChange={(e) => update({ textShadow: e.target.value as any })}>
                    <option value="none">Brak</option><option value="small">Mały</option><option value="medium">Średni</option><option value="large">Duży</option>
                  </select>
                </Field>
                <Field label="Obrys">
                  <select className="inp" value={cfg.stroke} onChange={(e) => update({ stroke: e.target.value as any })}>
                    <option value="none">Brak</option><option value="thin">Cienki</option><option value="medium">Średni</option><option value="thick">Gruby</option><option value="thicker">Najgrubszy</option>
                  </select>
                </Field>
              </div>
              <Field label="Kolor czcionki">
                <div className="flex gap-2">
                  <input type="color" className="w-10 h-9 rounded-lg border border-white/10" value={cfg.fontColor || "#ffffff"} onChange={(e) => update({ fontColor: e.target.value })} />
                  <input className="inp flex-1" value={cfg.fontColor.replace("#","")} maxLength={6} onChange={(e) => { const v=e.target.value.replace("#",""); update({ fontColor: /^[0-9a-fA-F]{6}$/.test(v)?"#"+v:"" }); }} />
                </div>
              </Field>
              <Toggle label="CAPS LOCK" on={cfg.msgCaps} onChange={(v) => update({ msgCaps: v })} />
            </>
          )}

          {tab === "nick" && (
            <>
              <Field label="Font nicka">
                <select className="inp" value={cfg.nickFont} onChange={(e) => update({ nickFont: e.target.value })}>
                  <option value="">— ten sam co wiadomości —</option>
                  {FONT_OPTIONS.map((g) => (
                    <optgroup key={g.group} label={g.group}>
                      {g.items.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
                    </optgroup>
                  ))}
                </select>
              </Field>
              <Field label="Google Font nicka">
                <input className="inp" value={cfg.nickGoogleFont} onChange={(e) => update({ nickGoogleFont: e.target.value.trim() })} placeholder="np. Bebas Neue" />
              </Field>
              <Field label={`Waga nicka: ${cfg.nickWeight}`}>
                <input type="range" min={100} max={900} step={100} value={cfg.nickWeight} onChange={(e) => update({ nickWeight: parseInt(e.target.value,10) })} className="w-full accent-[#53FC18]" />
              </Field>
              <Toggle label="Ukryj nicki" on={cfg.hideNames} onChange={(v) => update({ hideNames: v })} />
            </>
          )}

          {tab === "fx" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Fade (sekundy)">
                  <input type="number" className="inp" min={0} value={cfg.fadeSeconds || ""} onChange={(e) => { const v=parseInt(e.target.value,10); update({ fadeSeconds: isNaN(v)?0:v, fadeEnabled: !isNaN(v)&&v>0 }); }} placeholder="0 = off" />
                </Field>
                <Field label="Skala emotek">
                  <input type="number" className="inp" min={0.5} max={3} step={0.1} value={cfg.emoteScale} onChange={(e) => update({ emoteScale: parseFloat(e.target.value)||1 })} />
                </Field>
              </div>
              <Field label="Animacja wejścia">
                <PillGroup value={cfg.animation} options={["none","slide","fade","scale","bounce"]} onChange={(v) => update({ animation: v as any })} />
              </Field>
              <Field label="Kierunek">
                <PillGroup value={cfg.direction} options={["bottom","top"]} onChange={(v) => update({ direction: v as any })} />
              </Field>
              <Field label="Source tag">
                <PillGroup value={cfg.sourceTag} options={["none","dot","icon","label"]} onChange={(v) => update({ sourceTag: v as any })} />
              </Field>
              <Field label={`Max wiadomości: ${cfg.maxMessages}`}>
                <input type="range" min={10} max={100} value={cfg.maxMessages} onChange={(e) => update({ maxMessages: parseInt(e.target.value,10) })} className="w-full accent-[#53FC18]" />
              </Field>
              <Field label={`Line spacing: ${cfg.lineSpacing}`}>
                <input type="range" min={1} max={2.2} step={0.05} value={cfg.lineSpacing} onChange={(e) => update({ lineSpacing: parseFloat(e.target.value) })} className="w-full accent-[#53FC18]" />
              </Field>
              <Field label={`Skala badge: ${cfg.badgeScale}`}>
                <input type="range" min={0.6} max={1.8} step={0.1} value={cfg.badgeScale} onChange={(e) => update({ badgeScale: parseFloat(e.target.value) })} className="w-full accent-[#53FC18]" />
              </Field>
              <Toggle label="Timestampy" on={cfg.showTimestamp} onChange={(v) => update({ showTimestamp: v })} />
              <Toggle label="Highlight moderatorów" on={cfg.highlightMods} onChange={(v) => update({ highlightMods: v })} />
              <Toggle label="Highlight subów" on={cfg.highlightSubs} onChange={(v) => update({ highlightSubs: v })} />
              <Toggle label="Wiadomości systemowe" on={cfg.showSystemMsgs} onChange={(v) => update({ showSystemMsgs: v })} />
            </>
          )}

          {tab === "filters" && (
            <>
              <Field label="Blacklist userów (przecinek)">
                <input className="inp" value={cfg.userBL.join(", ")} onChange={(e) => update({ userBL: e.target.value.toLowerCase().split(",").map(s=>s.trim()).filter(Boolean) })} placeholder="user1, user2" />
              </Field>
              <Field label="Blacklist botów">
                <input className="inp" value={cfg.botNames.join(", ")} onChange={(e) => update({ botNames: e.target.value.toLowerCase().split(",").map(s=>s.trim()).filter(Boolean) })} />
              </Field>
              <Field label="Blacklist prefiksów (komendy)">
                <input className="inp" value={cfg.prefixBL.join(", ")} onChange={(e) => update({ prefixBL: e.target.value.toLowerCase().split(",").map(s=>s.trim()).filter(Boolean) })} placeholder="!, ?, /" />
              </Field>
            </>
          )}
        </div>

        <div className="p-4 border-t border-white/5 bg-[#0d0d12]">
          <label className="text-[10px] font-bold uppercase tracking-wider text-white/45">Link do OBS (Browser Source)</label>
          <div className="mt-2 flex gap-2 items-center bg-[#17171f] border border-white/8 rounded-xl px-3 py-2">
            <input readOnly className="flex-1 bg-transparent text-[11px] text-[#8888aa] font-mono outline-none truncate" value={overlayUrl} />
            <button onClick={copy} className="bg-[#53FC18] text-black text-[11px] font-bold px-3 py-1.5 rounded-lg shrink-0">
              {copied ? "Skopiowano!" : "Kopiuj"}
            </button>
          </div>
        </div>
      </aside>

      {/* Preview */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-widest text-white/30 mb-3">Podgląd na żywo</div>
        <div className={`w-full max-w-[640px] h-[560px] rounded-xl border border-white/6 overflow-hidden relative shadow-2xl ${cfg.bgColor ? "" : "checkerboard"}`}
          style={cfg.bgColor ? { background: cfg.bgColor } : undefined}>
          <ChatOverlay cfg={cfg} live={!!cfg.channel} />
        </div>
        <div className="text-[10px] font-semibold text-white/25 mt-3 tracking-wide">Szachownica = przezroczystość w OBS · 450×700 zalecane</div>
      </main>

      <style jsx global>{`
        .inp {
          width: 100%;
          background: #17171f;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 9px 11px;
          color: #fff;
          font-size: 13px;
          outline: none;
        }
        .inp:focus { border-color: #53FC18; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold uppercase tracking-wider text-white/45">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[13px] text-white/80">{label}</span>
      <button type="button" onClick={() => onChange(!on)}
        className={`w-[38px] h-[22px] rounded-full relative transition ${on ? "bg-[#53FC18]" : "bg-[#23232f]"}`}>
        <span className={`absolute top-[3px] w-4 h-4 rounded-full transition ${on ? "left-[19px] bg-black" : "left-[3px] bg-[#555]"}`} />
      </button>
    </div>
  );
}

function PillGroup({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-white/8 bg-[#17171f]">
      {options.map((o) => (
        <button key={o} type="button" onClick={() => onChange(o)}
          className={`flex-1 py-2 text-xs font-semibold capitalize transition ${value === o ? "bg-[#53FC18] text-black" : "text-white/55 hover:bg-white/5 hover:text-white"}`}>
          {o}
        </button>
      ))}
    </div>
  );
}
