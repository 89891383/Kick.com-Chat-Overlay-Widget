# KickChat Overlay + Emote Wall (15.10.2026)

Nowoczesny **Kick chat overlay** i **Emote Wall** pod OBS / Browser Source.  
Next.js static export → Cloudflare Pages. Centrifugo (aktualny protokół Kick), 7TV, 8 presetów, 30+ fontów.

## Funkcje

### Chat Overlay (`/` + `/overlay/`)
- Centrifugo realtime (stary Pusher już nie działa)
- 8 presetów: Clean, Neon Kick, Cyberpunk, Retro Pixel, Bold, Soft, Pro, Hype
- 30+ fontów (Inter, Outfit, Space Grotesk, JetBrains, Press Start 2P…)
- Osobny font/waga nicków
- Animacje 60 FPS: slide / fade / scale / bounce
- Kierunek bottom-up / top-down
- Fade timer, max messages, line spacing, badge/emote scale
- Timestampy, highlight mods/subs
- Source tag (dot / icon / label)
- Blacklist userów, botów, prefiksów
- 7TV + natywne Kick emotes + badges
- Live preview + kopiuj URL do OBS

### Emote Wall (`/emote-wall/`)
- Emoty z czatu (Kick + 7TV) na cały ekran
- Animacje: rain, bounce, rotation, fireworks, random
- Wybuchy na sub/gift (opcjonalnie follow/raid)
- Osobny URL pod OBS (1920×1080, transparent)

## Deploy Cloudflare Pages

1. Wrzuć repo na GitHub
2. Cloudflare Pages → Create project → Connect GitHub
3. **Build command:** `npm run build`
4. **Output directory:** `out`
5. Framework preset: Next.js (Static HTML Export) lub None

Lokalnie:

```bash
npm install
npm run build
# folder out/ = gotowy static site
npx serve out
```

## OBS

**Chat:** Browser Source → URL z konfiguratora (`/overlay/?kick=KANAL&...`)  
Zalecany rozmiar: **450 × 700**

**Emote Wall:** Browser Source → `/emote-wall/?channel=KANAL&obs=1`  
Rozmiar: **1920 × 1080**, Shutdown source when not visible: off

## Struktura

```
src/app/page.tsx          — konfigurator chatu
src/app/overlay/page.tsx  — transparent chat overlay
src/app/emote-wall/       — emote wall config + overlay
src/components/           — ChatMessage, ChatOverlay
src/lib/                  — Centrifugo client, fonts, presets, badges
```

## Licencja

MIT

Zbudowane 15.10.2026
