export interface ChatConfig {
  channel: string;
  font: string;
  googleFont: string;
  nickFont: string;
  nickGoogleFont: string;
  nickWeight: number;
  msgWeight: number;
  textSize: "small" | "medium" | "large" | "xlarge";
  fontSize: number | "";
  textShadow: "none" | "small" | "medium" | "large";
  stroke: "none" | "thin" | "medium" | "thick" | "thicker";
  sourceTag: "none" | "dot" | "icon" | "label";
  fontColor: string;
  bgColor: string;
  msgCaps: boolean;
  hideNames: boolean;
  msgSlideIn: boolean;
  showSystemMsgs: boolean;
  fadeSeconds: number;
  fadeEnabled: boolean;
  emoteScale: number;
  userBL: string[];
  prefixBL: string[];
  botNames: string[];
  animation: "none" | "slide" | "fade" | "scale" | "bounce";
  direction: "bottom" | "top";
  maxMessages: number;
  lineSpacing: number;
  badgeScale: number;
  showTimestamp: boolean;
  highlightMods: boolean;
  highlightSubs: boolean;
  customCSS: string;
  preset: string;
}

export const DEFAULT_CONFIG: ChatConfig = {
  channel: "",
  font: "inter",
  googleFont: "",
  nickFont: "",
  nickGoogleFont: "",
  nickWeight: 700,
  msgWeight: 400,
  textSize: "medium",
  fontSize: "",
  textShadow: "medium",
  stroke: "none",
  sourceTag: "none",
  fontColor: "",
  bgColor: "",
  msgCaps: false,
  hideNames: false,
  msgSlideIn: true,
  showSystemMsgs: true,
  fadeSeconds: 0,
  fadeEnabled: false,
  emoteScale: 1,
  userBL: [],
  prefixBL: [],
  botNames: ["nightbot", "streamelements", "moobot", "fossabot"],
  animation: "slide",
  direction: "bottom",
  maxMessages: 50,
  lineSpacing: 1.4,
  badgeScale: 1,
  showTimestamp: false,
  highlightMods: true,
  highlightSubs: false,
  customCSS: "",
  preset: "clean",
};

export interface KickMessage {
  id?: string;
  content?: string;
  type?: string;
  sender?: {
    id?: number | string;
    username?: string;
    slug?: string;
    identity?: {
      color?: string;
      badges?: Array<{ type: string; count?: number; text?: string }>;
      badges_v2?: Array<{ image_url?: string; name?: string }>;
    };
  };
  metadata?: {
    original_sender?: { username?: string };
    original_message?: { content?: string };
  };
}

export type StatusCallback = (status: string, detail?: string) => void;
