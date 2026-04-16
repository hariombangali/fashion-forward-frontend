/**
 * ThemeApplicator — mounts with no visible output.
 * Whenever settings change it:
 *  1. Writes CSS custom-properties onto :root (colors, fonts, gradients)
 *  2. Injects / updates the Google Fonts <link> tag (ALL fonts preloaded so picker previews work)
 *  3. Updates favicon + apple-touch-icon + theme-color meta
 *  4. Updates <title> with store name
 *  5. Syncs admin's darkModeDefault if user hasn't stored a personal pref yet
 */
import { useEffect } from 'react';
import useSettingsStore from '../../store/settingsStore';

// All fonts available in the admin picker.
export const HEADING_FONTS = [
  { name: 'Inter',               label: 'Inter — Clean Modern',        weights: '400;600;700;800;900' },
  { name: 'Playfair Display',    label: 'Playfair Display — Elegant Serif', weights: '400;600;700;800;900' },
  { name: 'Cormorant Garamond',  label: 'Cormorant Garamond — Luxury', weights: '400;600;700' },
  { name: 'Raleway',             label: 'Raleway — Fashion Sans',      weights: '400;600;700;800;900' },
  { name: 'Montserrat',          label: 'Montserrat — Bold & Clean',   weights: '400;600;700;800;900' },
  { name: 'DM Serif Display',    label: 'DM Serif — Editorial',        weights: '400' },
  { name: 'Josefin Sans',        label: 'Josefin Sans — Geometric',    weights: '400;600;700' },
  { name: 'Cinzel',              label: 'Cinzel — Dramatic',           weights: '400;600;700;800;900' },
  { name: 'Bebas Neue',          label: 'Bebas Neue — Display Bold',   weights: '400' },
  { name: 'Nunito',              label: 'Nunito — Friendly',           weights: '400;600;700;800;900' },
];

export const BODY_FONTS = [
  { name: 'Inter',         label: 'Inter — Default Clean',    weights: '400;500;600;700' },
  { name: 'Poppins',       label: 'Poppins — Modern',         weights: '400;500;600;700' },
  { name: 'Nunito',        label: 'Nunito — Soft & Readable', weights: '400;500;600;700' },
  { name: 'Lato',          label: 'Lato — Classic',           weights: '400;700' },
  { name: 'Open Sans',     label: 'Open Sans — Neutral',      weights: '400;500;600;700' },
  { name: 'DM Sans',       label: 'DM Sans — Minimal',        weights: '400;500;600;700' },
  { name: 'Outfit',        label: 'Outfit — Contemporary',    weights: '400;500;600;700' },
  { name: 'Source Sans 3', label: 'Source Sans 3 — Readable', weights: '400;600;700' },
];

const FONT_LINK_ID = 'ff-google-fonts';

/**
 * Build a single Google Fonts URL loading ALL fonts in the picker.
 * This is a one-time cost (~30KB) so the admin preview shows true font differences,
 * and customers see the correct font immediately (no FOUC on font switch).
 */
function buildAllFontsUrl() {
  const seen = new Set();
  const families = [];
  [...HEADING_FONTS, ...BODY_FONTS].forEach((f) => {
    if (f.name === 'Inter' || seen.has(f.name)) return;
    seen.add(f.name);
    families.push(`family=${encodeURIComponent(f.name)}:wght@${f.weights}`);
  });
  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
}

/**
 * Convert a Tailwind gradient-class triplet into a real CSS linear-gradient.
 * Admin stores strings like "from-indigo-600" / "via-purple-600" / "to-pink-500".
 */
const TAILWIND_COLOR_MAP = {
  // Slate / Gray
  'slate-500': '#64748b', 'slate-600': '#475569', 'slate-700': '#334155', 'slate-800': '#1e293b', 'slate-900': '#0f172a',
  'gray-500': '#6b7280', 'gray-600': '#4b5563', 'gray-700': '#374151', 'gray-800': '#1f2937', 'gray-900': '#111827',
  // Red / Rose
  'red-500': '#ef4444', 'red-600': '#dc2626', 'red-700': '#b91c1c',
  'rose-500': '#f43f5e', 'rose-600': '#e11d48', 'rose-700': '#be123c',
  // Orange / Amber
  'orange-500': '#f97316', 'orange-600': '#ea580c', 'orange-700': '#c2410c',
  'amber-500': '#f59e0b', 'amber-600': '#d97706',
  // Yellow
  'yellow-400': '#facc15', 'yellow-500': '#eab308',
  // Green / Emerald / Teal
  'green-500': '#22c55e', 'green-600': '#16a34a',
  'emerald-500': '#10b981', 'emerald-600': '#059669',
  'teal-500': '#14b8a6', 'teal-600': '#0d9488',
  // Cyan / Sky / Blue
  'cyan-500': '#06b6d4', 'cyan-600': '#0891b2',
  'sky-500': '#0ea5e9', 'sky-600': '#0284c7',
  'blue-500': '#3b82f6', 'blue-600': '#2563eb', 'blue-700': '#1d4ed8', 'blue-800': '#1e40af', 'blue-900': '#1e3a8a',
  // Indigo / Violet / Purple / Fuchsia / Pink
  'indigo-500': '#6366f1', 'indigo-600': '#4f46e5', 'indigo-700': '#4338ca',
  'violet-500': '#8b5cf6', 'violet-600': '#7c3aed', 'violet-700': '#6d28d9',
  'purple-500': '#a855f7', 'purple-600': '#9333ea', 'purple-700': '#7e22ce',
  'fuchsia-500': '#d946ef', 'fuchsia-600': '#c026d3',
  'pink-500': '#ec4899', 'pink-600': '#db2777',
};

function tailwindGradientToCss(from, via, to) {
  const parse = (cls) => {
    if (!cls) return null;
    const m = cls.match(/(?:from|via|to)-(.+)/);
    if (!m) return null;
    return TAILWIND_COLOR_MAP[m[1]] || null;
  };
  const fromC = parse(from) || '#4f46e5';
  const viaC  = parse(via);
  const toC   = parse(to)   || '#ec4899';
  if (viaC) return `linear-gradient(135deg, ${fromC}, ${viaC}, ${toC})`;
  return `linear-gradient(135deg, ${fromC}, ${toC})`;
}

export default function ThemeApplicator() {
  const settings = useSettingsStore((s) => s.settings);
  const initDarkMode = useSettingsStore((s) => s.initDarkMode);

  // ── Preload ALL fonts once on mount (not dependent on settings) ──
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement('link');
    link.id   = FONT_LINK_ID;
    link.rel  = 'stylesheet';
    link.href = buildAllFontsUrl();
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (!settings) return;

    const { theme, typography, darkModeDefault, storeName, faviconUrl, announcement, flashSale } = settings;
    const root = document.documentElement;

    // ── 1. CSS custom properties — colors ──
    const primary = theme?.primaryColor || '#4f46e5';
    const accent  = theme?.accentColor  || '#ec4899';
    root.style.setProperty('--color-primary', primary);
    root.style.setProperty('--color-accent',  accent);

    // Helper to slightly darken a hex color for hover states
    const darken = (hex, pct = 10) => {
      const h = hex.replace('#', '');
      const num = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
      let r = (num >> 16) - Math.round(255 * pct / 100);
      let g = ((num >> 8) & 0xff) - Math.round(255 * pct / 100);
      let b = (num & 0xff) - Math.round(255 * pct / 100);
      r = Math.max(0, r); g = Math.max(0, g); b = Math.max(0, b);
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    };
    root.style.setProperty('--color-primary-hover', darken(primary, 8));
    root.style.setProperty('--color-accent-hover',  darken(accent, 8));

    // ── 2. Gradient CSS (real linear-gradient, not Tailwind classes) ──
    const brandGradient = tailwindGradientToCss(
      theme?.gradientFrom, theme?.gradientVia, theme?.gradientTo
    );
    root.style.setProperty('--gradient-brand', brandGradient);

    if (announcement?.bgGradient) {
      // e.g. "from-indigo-600 via-purple-600 to-pink-500"
      const parts = announcement.bgGradient.split(/\s+/);
      const f = parts.find((p) => p.startsWith('from-'));
      const v = parts.find((p) => p.startsWith('via-'));
      const t = parts.find((p) => p.startsWith('to-'));
      root.style.setProperty('--gradient-announcement', tailwindGradientToCss(f, v, t));
    }
    if (flashSale?.bgGradient) {
      const parts = flashSale.bgGradient.split(/\s+/);
      const f = parts.find((p) => p.startsWith('from-'));
      const v = parts.find((p) => p.startsWith('via-'));
      const t = parts.find((p) => p.startsWith('to-'));
      root.style.setProperty('--gradient-flash', tailwindGradientToCss(f, v, t));
    }

    // ── 3. Fonts — CSS custom properties ──
    const headingFont = typography?.headingFont || 'Inter';
    const bodyFont    = typography?.bodyFont    || 'Inter';

    const headingStack = `'${headingFont}', 'Playfair Display', Georgia, serif`;
    const bodyStack    = `'${bodyFont}', 'Inter', system-ui, -apple-system, sans-serif`;

    root.style.setProperty('--font-heading', headingStack);
    root.style.setProperty('--font-body',    bodyStack);

    // Force body font application (overrides Tailwind defaults)
    document.body.style.fontFamily = bodyStack;

    // ── 4. Favicon + apple-touch-icon + theme-color ──
    if (faviconUrl) {
      const favicon = document.getElementById('ff-favicon');
      if (favicon) favicon.href = faviconUrl;

      const appleIcon = document.getElementById('ff-apple-icon');
      if (appleIcon) appleIcon.href = faviconUrl;
    }

    const themeColorMeta = document.getElementById('ff-theme-color');
    if (themeColorMeta) themeColorMeta.setAttribute('content', primary);

    // ── 5. Page title ──
    if (storeName) {
      const currentTitle = document.title;
      // Only update if title hasn't been set by a specific page
      if (!currentTitle.includes(' — ') || currentTitle.startsWith('Fashion Forward')) {
        document.title = `${storeName} — Premium Indian Fashion`;
      }
    }

    // ── 6. Dark mode default ─────
    if (localStorage.getItem('ff_dark_mode') === null) {
      initDarkMode(darkModeDefault ?? false);
    }
  }, [settings, initDarkMode]);

  return null;
}
