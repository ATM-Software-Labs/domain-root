# ATM Software Labs logo

The symbol is the geometric mark from `public/avatar.png`: a pure white line drawing on black, with stars across the top, chevrons, and triangles that form an A. Stroke weight matches the original bitmap. No part of the mark is tinted. The favicon is that same drawing.

Labs uses the same white mark. It is distinguished only by the word Labs next to the wordmark, in `labs/lockup.svg`, `labs/banner.png`, and `labs/og.png`.

## Files

- `logo/` — SVG masters. Each of symbol, horizontal lockup, stacked lockup, and wordmark has dark, light, white, and black versions.
- `export/github-avatar.png` — 500×500, mark inside the circular crop.
- `export/linkedin-logo.png` — 400×400.
- `export/linkedin-cover.png` — 1128×191.
- `export/github-social.png` — 1280×640.
- `export/og.png` — 1200×630.
- `labs/` — favicon.svg, favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png, og.png, lockup.svg, banner.png.

Published copies live at `https://trujillomingorance.com/brand/` and `https://trujillomingorance.com/brand/labs/`.

## Color

- Near black `#07080b` for dark backgrounds.
- Paper `#f4f7fb` for light backgrounds and for type on dark.
- White `#ffffff` for the mark on dark.
- Muted `#9aabbd` for secondary lines on cards.

The mark itself stays white on dark and ink on light. Do not add an accent color to any stroke.

## Type

The wordmark is JetBrains Mono Medium. Do not restack the letters, change the case, or add a gradient, shadow, or outline. Keep clear space equal to the symbol height. Do not draw the symbol smaller than 16px. Only `favicon.ico` at 16 and 32 may use a one-pixel weight bump, and only when the faithful drawing does not hold together at those sizes.

Regenerate with `python3 brand/build_logo.py` when the avatar changes.
