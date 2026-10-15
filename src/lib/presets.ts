import type { ChatConfig } from "./types";
import { DEFAULT_CONFIG } from "./types";

export interface Preset {
  id: string;
  name: string;
  description: string;
  config: Partial<ChatConfig>;
}

export const PRESETS: Preset[] = [
  {
    id: "clean",
    name: "Clean",
    description: "Minimal, readable, modern",
    config: {
      font: "inter",
      textSize: "medium",
      textShadow: "small",
      stroke: "none",
      animation: "slide",
      nickWeight: 700,
      msgWeight: 400,
      sourceTag: "none",
      highlightMods: true,
    },
  },
  {
    id: "neon",
    name: "Neon Kick",
    description: "Bright green accents, strong shadow",
    config: {
      font: "poppins",
      textSize: "medium",
      textShadow: "large",
      stroke: "thin",
      animation: "slide",
      fontColor: "e2ffe8",
      nickWeight: 800,
      sourceTag: "dot",
      highlightMods: true,
    },
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Bold mono + thick outline",
    config: {
      font: "jetbrains",
      textSize: "medium",
      textShadow: "none",
      stroke: "thick",
      animation: "fade",
      nickWeight: 700,
      msgWeight: 500,
      sourceTag: "label",
    },
  },
  {
    id: "retro",
    name: "Retro Pixel",
    description: "Press Start vibe",
    config: {
      font: "press",
      textSize: "small",
      textShadow: "medium",
      stroke: "medium",
      animation: "bounce",
      nickWeight: 400,
      msgWeight: 400,
      emoteScale: 0.9,
      lineSpacing: 1.6,
    },
  },
  {
    id: "bold",
    name: "Bold Stream",
    description: "Large readable text for big screens",
    config: {
      font: "montserrat",
      textSize: "large",
      textShadow: "large",
      stroke: "thin",
      animation: "scale",
      nickWeight: 800,
      msgWeight: 500,
      badgeScale: 1.1,
      emoteScale: 1.15,
    },
  },
  {
    id: "soft",
    name: "Soft Pastel",
    description: "Gentle, low contrast",
    config: {
      font: "nunito",
      textSize: "medium",
      textShadow: "small",
      stroke: "none",
      animation: "fade",
      nickWeight: 600,
      msgWeight: 400,
      fontColor: "f0f0f5",
    },
  },
  {
    id: "pro",
    name: "Pro Overlay",
    description: "Tight spacing, timestamps, no fluff",
    config: {
      font: "dmsans",
      textSize: "small",
      textShadow: "medium",
      stroke: "none",
      animation: "none",
      showTimestamp: true,
      lineSpacing: 1.25,
      maxMessages: 40,
      nickWeight: 700,
      sourceTag: "icon",
    },
  },
  {
    id: "hype",
    name: "Hype Mode",
    description: "Big emotes, slide-in, high energy",
    config: {
      font: "outfit",
      textSize: "large",
      textShadow: "large",
      stroke: "thin",
      animation: "bounce",
      emoteScale: 1.4,
      badgeScale: 1.2,
      nickWeight: 800,
      msgSlideIn: true,
    },
  },
];

export function applyPreset(id: string, current: ChatConfig): ChatConfig {
  const p = PRESETS.find((x) => x.id === id);
  if (!p) return current;
  return {
    ...current,
    ...p.config,
    preset: id,
    channel: current.channel,
    userBL: current.userBL,
    prefixBL: current.prefixBL,
    botNames: current.botNames,
  };
}

export function configToParams(cfg: ChatConfig): URLSearchParams {
  const p = new URLSearchParams();
  if (cfg.channel) p.set("kick", cfg.channel);
  if (cfg.font !== DEFAULT_CONFIG.font) p.set("font", cfg.font);
  if (cfg.googleFont) p.set("googleFont", cfg.googleFont);
  if (cfg.nickFont) p.set("nickFont", cfg.nickFont);
  if (cfg.nickGoogleFont) p.set("nickGoogleFont", cfg.nickGoogleFont);
  if (cfg.nickWeight !== DEFAULT_CONFIG.nickWeight) p.set("nickWeight", String(cfg.nickWeight));
  if (cfg.msgWeight !== DEFAULT_CONFIG.msgWeight) p.set("msgWeight", String(cfg.msgWeight));
  if (cfg.textSize !== DEFAULT_CONFIG.textSize) p.set("textSize", cfg.textSize);
  if (cfg.fontSize) p.set("fontSize", String(cfg.fontSize));
  if (cfg.textShadow !== DEFAULT_CONFIG.textShadow) p.set("textShadow", cfg.textShadow);
  if (cfg.stroke !== DEFAULT_CONFIG.stroke) p.set("stroke", cfg.stroke);
  if (cfg.sourceTag !== DEFAULT_CONFIG.sourceTag) p.set("sourceTag", cfg.sourceTag);
  if (cfg.fontColor) p.set("fontColor", cfg.fontColor.replace("#", ""));
  if (cfg.bgColor) p.set("bgColor", cfg.bgColor.replace("#", ""));
  if (cfg.msgCaps) p.set("msgCaps", "true");
  if (cfg.hideNames) p.set("hideNames", "true");
  if (cfg.msgSlideIn) p.set("msgSlideIn", "1");
  if (!cfg.showSystemMsgs) p.set("showSystemMsgs", "false");
  if (cfg.fadeEnabled && cfg.fadeSeconds > 0) p.set("fade", String(cfg.fadeSeconds));
  if (cfg.emoteScale !== 1) p.set("emoteScale", String(cfg.emoteScale));
  if (cfg.userBL.length) p.set("userBL", cfg.userBL.join(","));
  if (cfg.botNames.length) p.set("botNames", cfg.botNames.join(","));
  if (cfg.prefixBL.length) p.set("prefixBL", cfg.prefixBL.join(","));
  if (cfg.animation !== DEFAULT_CONFIG.animation) p.set("animation", cfg.animation);
  if (cfg.direction !== DEFAULT_CONFIG.direction) p.set("direction", cfg.direction);
  if (cfg.maxMessages !== DEFAULT_CONFIG.maxMessages) p.set("maxMessages", String(cfg.maxMessages));
  if (cfg.lineSpacing !== DEFAULT_CONFIG.lineSpacing) p.set("lineSpacing", String(cfg.lineSpacing));
  if (cfg.badgeScale !== 1) p.set("badgeScale", String(cfg.badgeScale));
  if (cfg.showTimestamp) p.set("showTimestamp", "true");
  if (!cfg.highlightMods) p.set("highlightMods", "false");
  if (cfg.highlightSubs) p.set("highlightSubs", "true");
  if (cfg.preset !== "clean") p.set("preset", cfg.preset);
  return p;
}

export function paramsToConfig(params: URLSearchParams): ChatConfig {
  const fade = parseInt(params.get("fade") || "", 10);
  const cfg: ChatConfig = {
    ...DEFAULT_CONFIG,
    channel: params.get("kick") || params.get("channel") || "",
    font: params.get("font") || DEFAULT_CONFIG.font,
    googleFont: params.get("googleFont") || "",
    nickFont: params.get("nickFont") || "",
    nickGoogleFont: params.get("nickGoogleFont") || "",
    nickWeight: parseInt(params.get("nickWeight") || "700", 10) || 700,
    msgWeight: parseInt(params.get("msgWeight") || "400", 10) || 400,
    textSize: (params.get("textSize") as ChatConfig["textSize"]) || "medium",
    fontSize: params.get("fontSize") ? parseInt(params.get("fontSize")!, 10) : "",
    textShadow: (params.get("textShadow") as ChatConfig["textShadow"]) || "medium",
    stroke: (params.get("stroke") as ChatConfig["stroke"]) || "none",
    sourceTag: (params.get("sourceTag") as ChatConfig["sourceTag"]) || "none",
    fontColor: /^[0-9a-fA-F]{6}$/.test(params.get("fontColor") || "")
      ? "#" + params.get("fontColor")
      : "",
    bgColor: /^[0-9a-fA-F]{6}$/.test(params.get("bgColor") || "")
      ? "#" + params.get("bgColor")
      : "",
    msgCaps: params.get("msgCaps") === "true",
    hideNames: params.get("hideNames") === "true",
    msgSlideIn: params.get("msgSlideIn") === "1" || params.get("msgSlideIn") === "true",
    showSystemMsgs: params.get("showSystemMsgs") !== "false",
    fadeSeconds: isNaN(fade) ? 0 : fade,
    fadeEnabled: !isNaN(fade) && fade > 0,
    emoteScale: parseFloat(params.get("emoteScale") || "1") || 1,
    userBL: (params.get("userBL") || "").toLowerCase().split(",").map((s) => s.trim()).filter(Boolean),
    prefixBL: (params.get("prefixBL") || "").toLowerCase().split(",").map((s) => s.trim()).filter(Boolean),
    botNames: (params.get("botNames") || DEFAULT_CONFIG.botNames.join(",")).toLowerCase().split(",").map((s) => s.trim()).filter(Boolean),
    animation: (params.get("animation") as ChatConfig["animation"]) || "slide",
    direction: (params.get("direction") as ChatConfig["direction"]) || "bottom",
    maxMessages: parseInt(params.get("maxMessages") || "50", 10) || 50,
    lineSpacing: parseFloat(params.get("lineSpacing") || "1.4") || 1.4,
    badgeScale: parseFloat(params.get("badgeScale") || "1") || 1,
    showTimestamp: params.get("showTimestamp") === "true",
    highlightMods: params.get("highlightMods") !== "false",
    highlightSubs: params.get("highlightSubs") === "true",
    customCSS: "",
    preset: params.get("preset") || "clean",
  };
  return cfg;
}
