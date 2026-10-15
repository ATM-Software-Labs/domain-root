# ATM Software Labs design system

Stable files:

- https://trujillomingorance.com/brand/tokens.css
- https://trujillomingorance.com/brand/fonts.css
- https://trujillomingorance.com/css/site.css
- https://trujillomingorance.com/brand/
- https://trujillomingorance.com/en/brand/
- https://trujillomingorance.com/ca/brand/
- https://trujillomingorance.com/brand/favicon.svg
- https://trujillomingorance.com/brand/logo/
- https://trujillomingorance.com/brand/export/
- https://trujillomingorance.com/brand/labs/favicon.svg
- https://trujillomingorance.com/brand/labs/lockup.svg
- https://trujillomingorance.com/brand/labs/og.png
- https://trujillomingorance.com/brand/labs/banner.png

`Access-Control-Allow-Origin: *` is set on `/brand/*` and `/css/site.css`.
On this origin, pages load `/css/fonts.css` (relative font URLs).
On another origin, load `/brand/fonts.css` (absolute font URLs) before `site.css`.

```html
<link rel="stylesheet" href="https://trujillomingorance.com/brand/tokens.css">
<link rel="stylesheet" href="https://trujillomingorance.com/brand/fonts.css">
<link rel="stylesheet" href="https://trujillomingorance.com/css/site.css">
```

## Tokens

- `--atm-bg`: #07080b
- `--atm-bg-raise`: #0d1117
- `--atm-line`: rgba(232, 238, 245, 0.1)
- `--atm-line-strong`: rgba(232, 238, 245, 0.2)
- `--atm-text`: #f4f7fb
- `--atm-body`: #c5d0dc
- `--atm-muted`: #9aabbd
- `--atm-emerald`: #e6e8ec
- `--atm-cyan`: #c8cdd4
- `--atm-soon`: #9aa3ae
- `--atm-font-sans`: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif
- `--atm-font-mono`: "JetBrains Mono", "IBM Plex Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace
- `--atm-text-xs`: 0.8125rem
- `--atm-text-sm`: 0.92rem
- `--atm-text-md`: 1.0625rem
- `--atm-text-lg`: clamp(1.2rem, 2.1vw, 1.45rem)
- `--atm-text-xl`: clamp(1.65rem, 2.8vw, 2.05rem)
- `--atm-text-hero`: clamp(2.55rem, 6.2vw, 4.5rem)
- `--atm-space-1`: 0.25rem
- `--atm-space-2`: 0.5rem
- `--atm-space-3`: 0.75rem
- `--atm-space-4`: 1rem
- `--atm-space-5`: 1.5rem
- `--atm-space-6`: 2.5rem
- `--atm-radius-sm`: 8px
- `--atm-radius-md`: 12px
- `--atm-radius-pill`: 999px
- `--atm-header`: 4.5rem
- `--atm-wrap`: 70rem
- `--atm-motion`: 0.2s ease
- `--atm-motion-slow`: 90s linear

## Header and footer

Use `header.site-header`, `a.brand`, `nav.site-nav`, `nav.lang` and `footer.site-footer`.
The language switcher sets `localStorage["atm_lang_choice"]` from `data-lang-switch`.
Section links point at the language home plus `#ecosistema` or `#estado`.
Contact points at the about page for that language.
The footer links GitHub, LinkedIn, terms and privacy.
Credits: © 2026 ATM Software Labs · Alberto Trujillo Mingorance.
