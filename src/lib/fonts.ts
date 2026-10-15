/** Font presets — system + Google Fonts (2026) */
export const FONT_FAMILIES: Record<string, string> = {
  arial: "Arial, Helvetica, sans-serif",
  helvetica: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  verdana: "Verdana, Geneva, sans-serif",
  tahoma: "Tahoma, Geneva, sans-serif",
  trebuchet: "'Trebuchet MS', sans-serif",
  segoe: "'Segoe UI', Tahoma, sans-serif",
  times: "'Times New Roman', Times, serif",
  georgia: "Georgia, 'Times New Roman', serif",
  courier: "'Courier New', Courier, monospace",
  impact: "Impact, Charcoal, sans-serif",
  comic: "'Comic Sans MS', 'Chalkboard SE', cursive",
  inter: "'Inter', system-ui, sans-serif",
  roboto: "'Roboto', sans-serif",
  opensans: "'Open Sans', Arial, sans-serif",
  lato: "'Lato', sans-serif",
  poppins: "'Poppins', sans-serif",
  montserrat: "'Montserrat', sans-serif",
  nunito: "'Nunito', sans-serif",
  oswald: "'Oswald', sans-serif",
  bebas: "'Bebas Neue', sans-serif",
  raleway: "'Raleway', sans-serif",
  ubuntu: "'Ubuntu', sans-serif",
  worksans: "'Work Sans', sans-serif",
  fira: "'Fira Sans', sans-serif",
  sourcecode: "'Source Code Pro', monospace",
  jetbrains: "'JetBrains Mono', monospace",
  comfortaa: "'Comfortaa', cursive",
  dancing: "'Dancing Script', cursive",
  pacifico: "'Pacifico', cursive",
  permanent: "'Permanent Marker', cursive",
  press: "'Press Start 2P', cursive",
  spacegrotesk: "'Space Grotesk', sans-serif",
  dmsans: "'DM Sans', sans-serif",
  outfit: "'Outfit', sans-serif",
  sora: "'Sora', sans-serif",
  manrope: "'Manrope', sans-serif",
  plusjakarta: "'Plus Jakarta Sans', sans-serif",
  figtree: "'Figtree', sans-serif",
};

export const FONT_SPECS: Record<string, string> = {
  inter: "Inter:wght@100..900",
  roboto: "Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,400",
  opensans: "Open+Sans:ital,wght@0,300..800;1,300..800",
  lato: "Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,400",
  poppins: "Poppins:ital,wght@0,100;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400",
  montserrat: "Montserrat:ital,wght@0,100..900;1,100..900",
  nunito: "Nunito:ital,wght@0,200..900;1,200..900",
  oswald: "Oswald:wght@200..700",
  bebas: "Bebas+Neue",
  raleway: "Raleway:ital,wght@0,100..900;1,100..900",
  ubuntu: "Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,400",
  worksans: "Work+Sans:ital,wght@0,100..900;1,100..900",
  fira: "Fira+Sans:ital,wght@0,100..900;1,100..900",
  sourcecode: "Source+Code+Pro:ital,wght@0,200..900;1,200..900",
  jetbrains: "JetBrains+Mono:ital,wght@0,100..800;1,100..800",
  comfortaa: "Comfortaa:wght@300;400;500;600;700",
  dancing: "Dancing+Script:wght@400;500;600;700",
  pacifico: "Pacifico",
  permanent: "Permanent+Marker",
  press: "Press+Start+2P",
  spacegrotesk: "Space+Grotesk:wght@300..700",
  dmsans: "DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000",
  outfit: "Outfit:wght@100..900",
  sora: "Sora:wght@100..800",
  manrope: "Manrope:wght@200..800",
  plusjakarta: "Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800",
  figtree: "Figtree:ital,wght@0,300..900;1,300..900",
};

export const FONT_OPTIONS = [
  { group: "System (no download)", items: [
    { value: "arial", label: "Arial" },
    { value: "helvetica", label: "Helvetica" },
    { value: "verdana", label: "Verdana" },
    { value: "segoe", label: "Segoe UI" },
    { value: "georgia", label: "Georgia" },
    { value: "courier", label: "Courier New" },
    { value: "impact", label: "Impact" },
  ]},
  { group: "Google — Sans", items: [
    { value: "inter", label: "Inter" },
    { value: "roboto", label: "Roboto" },
    { value: "opensans", label: "Open Sans" },
    { value: "poppins", label: "Poppins" },
    { value: "montserrat", label: "Montserrat" },
    { value: "nunito", label: "Nunito" },
    { value: "dmsans", label: "DM Sans" },
    { value: "outfit", label: "Outfit" },
    { value: "sora", label: "Sora" },
    { value: "manrope", label: "Manrope" },
    { value: "plusjakarta", label: "Plus Jakarta Sans" },
    { value: "figtree", label: "Figtree" },
    { value: "spacegrotesk", label: "Space Grotesk" },
    { value: "worksans", label: "Work Sans" },
    { value: "raleway", label: "Raleway" },
    { value: "ubuntu", label: "Ubuntu" },
  ]},
  { group: "Google — Display / Mono", items: [
    { value: "oswald", label: "Oswald" },
    { value: "bebas", label: "Bebas Neue" },
    { value: "jetbrains", label: "JetBrains Mono" },
    { value: "sourcecode", label: "Source Code Pro" },
    { value: "press", label: "Press Start 2P" },
    { value: "comfortaa", label: "Comfortaa" },
    { value: "dancing", label: "Dancing Script" },
    { value: "pacifico", label: "Pacifico" },
    { value: "permanent", label: "Permanent Marker" },
  ]},
];

const loaded = new Set<string>();

export function loadGoogleFont(preset: string, customName?: string): string {
  if (typeof document === "undefined") {
    return customName ? `'${customName}', system-ui, sans-serif` : (FONT_FAMILIES[preset] || FONT_FAMILIES.inter);
  }
  if (customName) {
    const spec = customName.replace(/ /g, "+");
    const href = `https://fonts.googleapis.com/css2?family=${spec}:wght@100..900&display=swap`;
    if (!loaded.has(href)) {
      loaded.add(href);
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }
    return `'${customName}', system-ui, sans-serif`;
  }
  const spec = FONT_SPECS[preset];
  if (spec) {
    const href = `https://fonts.googleapis.com/css2?family=${spec}&display=swap`;
    if (!loaded.has(href)) {
      loaded.add(href);
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }
  }
  return FONT_FAMILIES[preset] || FONT_FAMILIES.inter;
}
