# ATM Software Labs logo

The symbol is a terminal prompt: an emerald chevron and a cyan underscore on a near-black rounded square. It is the same drawing as the favicon.

## Files

- `logo/` — SVG masters. Each of symbol, horizontal lockup, stacked lockup, and wordmark has dark, light, white, and black versions.
- `export/github-avatar.png` — 500×500, glyph inside the circular crop.
- `export/linkedin-logo.png` — 400×400.
- `export/linkedin-cover.png` — 1128×191.
- `export/github-social.png` — 1280×640.
- `export/og.png` — 1200×630.

Published copies live at `https://trujillomingorance.com/brand/`.

## Color

- Near black `#07080b` for dark backgrounds.
- Paper `#f4f7fb` for light backgrounds and for type on dark.
- Emerald `#8fe8c4` for the chevron and the ATM word on dark.
- Cyan `#9ad7e6` for the underscore on dark.
- On a light background use the light or black master. Emerald on white does not meet contrast.

## Type

The wordmark is JetBrains Mono Medium. Do not restack the letters, change the case, or add a gradient, shadow, or outline. Keep clear space equal to the symbol height. Do not draw the symbol smaller than 16px.

Regenerate with `python3 brand/build_logo.py` when the glyph changes.
