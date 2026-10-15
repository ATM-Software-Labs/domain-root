# ATM Software Labs logo

The symbol is the geometric mark from `public/avatar.png`: white line art on black, with stars across the top, chevrons, and triangles that form an A. It is the same drawing as the favicon. Strokes are one pixel heavier than the bitmap so the mark still reads at 16px.

Domain-root uses that mark in white on `#07080b`, with the lower A in emerald `#8fe8c4`. Labs uses the same mark with the lower A in cyan `#9ad7e6` and a LABS tag. Labs files are in `labs/`.

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
- Emerald `#8fe8c4` for the hub accent (the lower A, and ATM in the wordmark).
- Cyan `#9ad7e6` for the labs accent.
- On a light background use the light or black master. Emerald on white does not meet contrast.

## Type

The wordmark is JetBrains Mono Medium. Do not restack the letters, change the case, or add a gradient, shadow, or outline. Keep clear space equal to the symbol height. Do not draw the symbol smaller than 16px.

Regenerate with `python3 brand/build_logo.py` when the avatar changes.
