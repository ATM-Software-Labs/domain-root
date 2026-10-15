#!/usr/bin/env python3
"""Build the ATM Software Labs logo masters, favicon, and social exports.

Geometry is a 16-unit terminal prompt: emerald chevron, cyan underscore.
Wordmarks are JetBrains Mono Medium outlines. Statements use Inter Regular.
"""

from __future__ import annotations

import os
import shutil
import subprocess
import tempfile
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "brand"
PUBLIC = ROOT / "public"
RESVG = os.environ.get(
    "RESVG_MODULE",
    "/tmp/logo-tools/node_modules/@resvg/resvg-js/index.js",
)
MONO = Path("/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Medium.ttf")
SANS = Path("/usr/share/fonts/truetype/macos/Inter-Regular.ttf")

BG = "#07080b"
INK = "#07080b"
PAPER = "#f4f7fb"
EMERALD = "#8fe8c4"
CYAN = "#9ad7e6"
MUTED = "#9aabbd"
WHITE = "#ffffff"

CHEVRON = "M2 3h3l5 5-5 5H2l5-5-5-5z"
UNDER = (11, 11, 3, 2)

STATEMENTS = {
    "es": "Ingeniería de sistemas, arquitectura de red, Web3 y código abierto.",
    "en": "Systems engineering, network architecture, Web3, and open source.",
    "ca": "Enginyeria de sistemes, arquitectura de xarxa, Web3 i codi obert.",
}


def svg_text(view_w: float, view_h: float, body: str, label: str) -> str:
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {view_w:g} {view_h:g}" '
        f'width="{view_w:g}" height="{view_h:g}" role="img" aria-label="{label}">\n'
        f"{body}</svg>\n"
    )


def glyph(fill_chevron: str, fill_under: str, scale: float = 1, x: float = 0, y: float = 0) -> str:
    ux, uy, uw, uh = UNDER
    return (
        f'<g transform="translate({x:g} {y:g}) scale({scale:g})">'
        f'<path fill="{fill_chevron}" d="{CHEVRON}"/>'
        f'<rect x="{ux}" y="{uy}" width="{uw}" height="{uh}" fill="{fill_under}"/>'
        f"</g>"
    )


def plate(w: float, h: float, fill: str, rx: float = 0) -> str:
    radius = f' rx="{rx:g}"' if rx else ""
    return f'<rect width="{w:g}" height="{h:g}"{radius} fill="{fill}"/>'


def font_path(font: TTFont, text: str, size: float, x0: float, baseline: float) -> tuple[str, float]:
    glyph_set = font.getGlyphSet()
    cmap = font.getBestCmap()
    scale = size / font["head"].unitsPerEm
    x = x0
    chunks: list[str] = []
    for char in text:
        name = cmap.get(ord(char))
        if name is None:
            raise SystemExit(f"missing glyph {char!r}")
        pen = SVGPathPen(glyph_set)
        glyph_set[name].draw(TransformPen(pen, (scale, 0, 0, -scale, x, baseline)))
        commands = pen.getCommands()
        if commands:
            chunks.append(commands)
        x += font["hmtx"][name][0] * scale
    return "".join(chunks), x - x0


def text_width(font: TTFont, text: str, size: float) -> float:
    cmap = font.getBestCmap()
    scale = size / font["head"].unitsPerEm
    width = 0.0
    for char in text:
        width += font["hmtx"][cmap[ord(char)]][0] * scale
    return width


def cap_height(font: TTFont, size: float) -> float:
    scale = size / font["head"].unitsPerEm
    return font["OS/2"].sCapHeight * scale


def word_paths(font: TTFont, size: float, x: float, baseline: float, atm_fill: str, rest_fill: str) -> str:
    atm, atm_w = font_path(font, "ATM", size, x, baseline)
    rest, _rest_w = font_path(font, " Software Labs", size, x + atm_w, baseline)
    return f'<path fill="{atm_fill}" d="{atm}"/><path fill="{rest_fill}" d="{rest}"/>'


def render_png(svg: str, width: int) -> Image.Image:
    with tempfile.TemporaryDirectory() as tmp:
        src = Path(tmp) / "in.svg"
        dest = Path(tmp) / "out.png"
        src.write_text(svg)
        script = f"""
import {{ readFileSync, writeFileSync }} from "node:fs";
import {{ Resvg }} from "{RESVG}";
const svg = readFileSync("{src}");
const png = new Resvg(svg, {{ fitTo: {{ mode: "width", value: {width} }} }}).render().asPng();
writeFileSync("{dest}", png);
"""
        subprocess.run(["node", "--input-type=module", "-e", script], check=True)
        return Image.open(dest).convert("RGBA")


def save_png(image: Image.Image, path: Path, expect: tuple[int, int]) -> None:
    if image.size != expect:
        raise SystemExit(f"{path.name} is {image.size}, expected {expect}")
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, "PNG")


def composite(image: Image.Image, color: str = BG) -> Image.Image:
    red = int(color[1:3], 16)
    green = int(color[3:5], 16)
    blue = int(color[5:7], 16)
    base = Image.new("RGBA", image.size, (red, green, blue, 255))
    base.alpha_composite(image)
    return base.convert("RGB")


def build_svgs(mono: TTFont) -> dict[str, str]:
    files: dict[str, str] = {}
    variants = {
        "dark": (BG, EMERALD, CYAN, EMERALD, PAPER, True),
        "light": (PAPER, INK, INK, INK, INK, True),
        "white": (None, WHITE, WHITE, WHITE, WHITE, False),
        "black": (None, INK, INK, INK, INK, False),
    }

    for name, (background, chevron, under, atm, rest, _plated) in variants.items():
        body = []
        if background:
            body.append(plate(16, 16, background, rx=3))
        body.append(glyph(chevron, under))
        files[f"symbol-{name}.svg"] = svg_text(16, 16, "".join(body), "ATM")

    size = 42
    cap = cap_height(mono, size)
    symbol = 88
    gap = 28
    pad = 36
    text_w = text_width(mono, "ATM Software Labs", size)
    lock_w = pad + symbol + gap + text_w + pad
    lock_h = pad + symbol + pad
    baseline = (lock_h + cap) / 2

    for name, (background, chevron, under, atm, rest, _plated) in variants.items():
        body = []
        if background:
            body.append(plate(lock_w, lock_h, background))
        body.append(glyph(chevron, under, scale=symbol / 16, x=pad, y=pad))
        body.append(word_paths(mono, size, pad + symbol + gap, baseline, atm, rest))
        files[f"lockup-horizontal-{name}.svg"] = svg_text(lock_w, lock_h, "".join(body), "ATM Software Labs")

    stack_symbol = 112
    stack_gap = 28
    stack_pad = 40
    stack_w = max(stack_symbol, text_w) + stack_pad * 2
    stack_h = stack_pad + stack_symbol + stack_gap + cap + stack_pad
    text_x = (stack_w - text_w) / 2
    stack_baseline = stack_pad + stack_symbol + stack_gap + cap
    symbol_x = (stack_w - stack_symbol) / 2
    for name, (background, chevron, under, atm, rest, _plated) in variants.items():
        body = []
        if background:
            body.append(plate(stack_w, stack_h, background))
        body.append(glyph(chevron, under, scale=stack_symbol / 16, x=symbol_x, y=stack_pad))
        body.append(word_paths(mono, size, text_x, stack_baseline, atm, rest))
        files[f"lockup-stacked-{name}.svg"] = svg_text(stack_w, stack_h, "".join(body), "ATM Software Labs")

    word_pad_x = 28
    word_pad_y = 22
    word_w = text_w + word_pad_x * 2
    word_h = cap + word_pad_y * 2
    word_baseline = word_pad_y + cap
    for name, (background, _chevron, _under, atm, rest, _plated) in variants.items():
        body = []
        if background:
            body.append(plate(word_w, word_h, background))
        body.append(word_paths(mono, size, word_pad_x, word_baseline, atm, rest))
        files[f"wordmark-{name}.svg"] = svg_text(word_w, word_h, "".join(body), "ATM Software Labs")
    return files


def field_glyph(size: int, chevron: str = EMERALD, under: str = CYAN, background: str = BG) -> str:
    # Glyph sits in the inner 58% so a circular crop keeps a clear margin.
    glyph_size = size * 0.58
    offset = (size - glyph_size) / 2
    body = plate(size, size, background) + glyph(chevron, under, scale=glyph_size / 16, x=offset, y=offset)
    return svg_text(size, size, body, "ATM")


def social_card(width: int, height: int, mono: TTFont, sans: TTFont, statement: str | None) -> str:
    pad_x = 72
    symbol = min(168, height * 0.34)
    title = 54 if width >= 1200 else 42
    name_size = 28
    line_size = 26
    cap = cap_height(mono, title)
    name_cap = cap_height(sans, name_size)
    line_cap = cap_height(sans, line_size) if statement else 0
    block_h = cap + (18 + name_cap) + ((16 + line_cap) if statement else 0)
    block_y = (height - block_h) / 2
    symbol_y = (height - symbol) / 2
    title_baseline = block_y + cap
    name_baseline = title_baseline + 18 + name_cap
    text_x = pad_x + symbol + 36
    body = [plate(width, height, BG), plate(width, 8, EMERALD)]
    body.append(glyph(EMERALD, CYAN, scale=symbol / 16, x=pad_x, y=symbol_y))
    body.append(word_paths(mono, title, text_x, title_baseline, EMERALD, PAPER))
    name_path, _name_w = font_path(sans, "Alberto Trujillo Mingorance", name_size, text_x, name_baseline)
    body.append(f'<path fill="{MUTED}" d="{name_path}"/>')
    if statement:
        line_baseline = name_baseline + 16 + line_cap
        line_path, line_w = font_path(sans, statement, line_size, text_x, line_baseline)
        if text_x + line_w > width - pad_x:
            raise SystemExit(f"statement overflows {width}: {statement}")
        body.append(f'<path fill="{PAPER}" d="{line_path}"/>')
    return svg_text(width, height, "".join(body), "ATM Software Labs")


def cover(mono: TTFont) -> str:
    width, height = 1128, 191
    symbol = 112
    size = 36
    text_w = text_width(mono, "ATM Software Labs", size)
    group_w = symbol + 24 + text_w
    x = (width - group_w) / 2
    y = (height - symbol) / 2
    baseline = (height + cap_height(mono, size)) / 2
    body = [
        plate(width, height, BG),
        plate(width, 6, EMERALD),
        glyph(EMERALD, CYAN, scale=symbol / 16, x=x, y=y),
        word_paths(mono, size, x + symbol + 24, baseline, EMERALD, PAPER),
    ]
    return svg_text(width, height, "".join(body), "ATM Software Labs")


def write_readme() -> None:
    text = """# ATM Software Labs logo

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
"""
    (BRAND / "README.md").write_text(text)


def main() -> None:
    mono = TTFont(str(MONO))
    sans = TTFont(str(SANS))
    logo_dir = BRAND / "logo"
    export_dir = BRAND / "export"
    logo_dir.mkdir(parents=True, exist_ok=True)
    export_dir.mkdir(parents=True, exist_ok=True)

    svgs = build_svgs(mono)
    for name, svg in svgs.items():
        (logo_dir / name).write_text(svg)
        if "<linearGradient" in svg or "gradient" in svg:
            raise SystemExit(f"gradient in {name}")

    favicon = svgs["symbol-dark.svg"]
    (PUBLIC / "favicon.svg").write_text(favicon)
    public_brand = PUBLIC / "brand"
    public_brand.mkdir(parents=True, exist_ok=True)
    (public_brand / "favicon.svg").write_text(favicon)

    icon_svg = svgs["symbol-dark.svg"]
    for size, filename in ((180, "apple-touch-icon.png"), (192, "icon-192.png"), (512, "icon-512.png")):
        image = composite(render_png(icon_svg, size))
        # Keep the rounded tile, with the same near-black filling the square corners.
        save_png(image, PUBLIC / filename, (size, size))
        save_png(image, public_brand / filename, (size, size))

    icon16 = composite(render_png(icon_svg, 16))
    icon32 = composite(render_png(icon_svg, 32))
    ico_path = PUBLIC / "favicon.ico"
    icon32.save(ico_path, format="ICO", sizes=[(16, 16), (32, 32)], append_images=[icon16])
    shutil.copyfile(ico_path, public_brand / "favicon.ico")

    save_png(composite(render_png(field_glyph(500), 500)), export_dir / "github-avatar.png", (500, 500))
    save_png(composite(render_png(field_glyph(400), 400)), export_dir / "linkedin-logo.png", (400, 400))
    save_png(composite(render_png(cover(mono), 1128)), export_dir / "linkedin-cover.png", (1128, 191))
    save_png(composite(render_png(social_card(1280, 640, mono, sans, None), 1280)), export_dir / "github-social.png", (1280, 640))
    save_png(composite(render_png(social_card(1200, 630, mono, sans, None), 1200)), export_dir / "og.png", (1200, 630))

    for lang, statement in STATEMENTS.items():
        card = social_card(1200, 630, mono, sans, statement)
        name = "og-hub.png" if lang == "es" else f"og-hub-{lang}.png"
        save_png(composite(render_png(card, 1200)), PUBLIC / "assets" / name, (1200, 630))

    pub_logo = public_brand / "logo"
    pub_export = public_brand / "export"
    if pub_logo.exists():
        shutil.rmtree(pub_logo)
    if pub_export.exists():
        shutil.rmtree(pub_export)
    shutil.copytree(logo_dir, pub_logo)
    shutil.copytree(export_dir, pub_export)
    write_readme()
    print(f"logo files: {len(list(logo_dir.glob('*.svg')))} svg, {len(list(export_dir.glob('*.png')))} png")


if __name__ == "__main__":
    main()
