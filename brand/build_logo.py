#!/usr/bin/env python3
"""Build the ATM Software Labs logo from the geometric avatar mark.

The source drawing is public/avatar.png: white line art on black (stars,
chevrons, and the triangles that form the A). Strokes are dilated by one
pixel so the same vectors stay readable at 16px. Domain-root uses an emerald
accent on the lower A. Labs uses cyan on that same A, plus a LABS tag.
"""

from __future__ import annotations

import shutil
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from PIL import Image
from potrace import Bitmap

ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "brand"
PUBLIC = ROOT / "public"
AVATAR = PUBLIC / "avatar.png"
RESVG = "/tmp/logo-tools/node_modules/@resvg/resvg-js/index.js"
MONO = Path("/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Medium.ttf")
SANS = Path("/usr/share/fonts/truetype/macos/Inter-Regular.ttf")

BG = "#07080b"
INK = "#07080b"
PAPER = "#f4f7fb"
EMERALD = "#8fe8c4"
CYAN = "#9ad7e6"
MUTED = "#9aabbd"
WHITE = "#ffffff"

STATEMENTS = {
    "es": "Ingeniería de sistemas, arquitectura de red, Web3 y código abierto.",
    "en": "Systems engineering, network architecture, Web3, and open source.",
    "ca": "Enginyeria de sistemes, arquitectura de xarxa, Web3 i codi obert.",
}


class Mark:
    def __init__(self, d: str, width: float, height: float, accent_y: float) -> None:
        self.d = d
        self.width = width
        self.height = height
        self.accent_y = accent_y


def svg_text(view_w: float, view_h: float, body: str, label: str) -> str:
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {view_w:g} {view_h:g}" '
        f'width="{view_w:g}" height="{view_h:g}" role="img" aria-label="{label}">\n'
        f"{body}</svg>\n"
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


def dilate(mask: np.ndarray, radius: int) -> np.ndarray:
    out = mask.copy()
    ys, xs = np.where(mask)
    height, width = mask.shape
    for dy in range(-radius, radius + 1):
        for dx in range(-radius, radius + 1):
            if dx == 0 and dy == 0:
                continue
            yy = ys + dy
            xx = xs + dx
            ok = (yy >= 0) & (yy < height) & (xx >= 0) & (xx < width)
            out[yy[ok], xx[ok]] = True
    return out


def curve_d(curve) -> str:
    parts = [f"M{curve.start_point.x:.2f} {curve.start_point.y:.2f}"]
    for seg in curve:
        if seg.is_corner:
            parts.append(f"L{seg.c.x:.2f} {seg.c.y:.2f}L{seg.end_point.x:.2f} {seg.end_point.y:.2f}")
        else:
            parts.append(
                f"C{seg.c1.x:.2f} {seg.c1.y:.2f} {seg.c2.x:.2f} {seg.c2.y:.2f} "
                f"{seg.end_point.x:.2f} {seg.end_point.y:.2f}"
            )
    parts.append("Z")
    return " ".join(parts)


def curve_box(curve) -> tuple[float, float, float, float]:
    pts = [(curve.start_point.x, curve.start_point.y)]
    for seg in curve:
        pts.append((seg.end_point.x, seg.end_point.y))
        if seg.is_corner:
            pts.append((seg.c.x, seg.c.y))
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    return min(xs), min(ys), max(xs), max(ys)


def load_mark() -> Mark:
    image = Image.open(AVATAR).convert("RGBA")
    arr = np.array(image)
    ink = (arr[:, :, 3] > 160) & (arr[:, :, 0] > 180)
    ys, xs = np.where(ink)
    y0, y1 = int(ys.min()) - 1, int(ys.max()) + 1
    x0, x1 = int(xs.min()) - 1, int(xs.max()) + 1
    mask = ink[y0 : y1 + 1, x0 : x1 + 1]
    mask = mask | mask[:, ::-1]
    mask = dilate(mask, 1)
    height, width = mask.shape
    # potrace foreground is the dark pixels after its internal invert,
    # so the ink is passed as black.
    bitmap = Image.fromarray(((~mask).astype(np.uint8) * 255), mode="L")
    curves = Bitmap(bitmap).trace(turdsize=2, alphamax=1.0, opticurve=True, opttolerance=0.45)
    if len(curves) < 2:
        raise SystemExit("trace did not keep the counters of the mark")
    holes = []
    for curve in curves:
        if curve._path.sign:
            continue
        left, top, right, bottom = curve_box(curve)
        holes.append((top, bottom, (top + bottom) / 2, left, right))
    a_holes = [hole for hole in holes if hole[2] > height * 0.72]
    if len(a_holes) < 2:
        raise SystemExit(f"expected the two counters of the A, found {len(a_holes)}")
    accent_y = min(hole[0] for hole in a_holes) - 8
    others = [hole for hole in holes if hole not in a_holes]
    if others:
        accent_y = max(accent_y, max(hole[1] for hole in others) + 2)
    return Mark(" ".join(curve_d(curve) for curve in curves), float(width), float(height), accent_y)


def mark_group(mark: Mark, fill: str, accent: str | None, scale: float, x: float, y: float, clip_id: str) -> str:
    body = (
        f'<g transform="translate({x:g} {y:g}) scale({scale:g})">'
        f'<path fill="{fill}" fill-rule="evenodd" d="{mark.d}"/>'
    )
    if accent:
        body += (
            f'<clipPath id="{clip_id}"><rect x="0" y="{mark.accent_y:g}" '
            f'width="{mark.width:g}" height="{mark.height - mark.accent_y:g}"/></clipPath>'
            f'<path fill="{accent}" fill-rule="evenodd" clip-path="url(#{clip_id})" d="{mark.d}"/>'
        )
    return body + "</g>"


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


def icon_svg(mark: Mark, background: str | None, fill: str, accent: str | None, label: str) -> str:
    size = 32
    pad = 1.4
    scale = min((size - pad * 2) / mark.width, (size - pad * 2) / mark.height)
    drawn_w = mark.width * scale
    drawn_h = mark.height * scale
    x = (size - drawn_w) / 2
    y = (size - drawn_h) / 2
    body = []
    if background:
        body.append(plate(size, size, background, rx=6))
    body.append(mark_group(mark, fill, accent, scale, x, y, "accent"))
    return svg_text(size, size, "".join(body), label)


def placed_mark(mark: Mark, fill: str, accent: str | None, box: float, x: float, y: float, clip_id: str) -> str:
    scale = box / max(mark.width, mark.height)
    drawn_w = mark.width * scale
    drawn_h = mark.height * scale
    return mark_group(mark, fill, accent, scale, x + (box - drawn_w) / 2, y + (box - drawn_h) / 2, clip_id)


def field_svg(mark: Mark, size: int, fill: str, accent: str | None) -> str:
    # Longer side stays inside 68% so a circular crop keeps a margin.
    box = size * 0.68
    offset = (size - box) / 2
    body = plate(size, size, BG) + placed_mark(mark, fill, accent, box, offset, offset, "accent")
    return svg_text(size, size, body, "ATM")


def labs_tag(font: TTFont, x: float, center_y: float, fill: str, text_fill: str) -> tuple[str, float]:
    size = 18
    label = "LABS"
    width = text_width(font, label, size)
    cap = cap_height(font, size)
    pad_x = 10
    pad_y = 6
    box_w = width + pad_x * 2
    box_h = cap + pad_y * 2
    box_y = center_y - box_h / 2
    baseline = box_y + pad_y + cap
    path, _ = font_path(font, label, size, x + pad_x, baseline)
    body = (
        f'<rect x="{x:g}" y="{box_y:g}" width="{box_w:g}" height="{box_h:g}" rx="8" fill="{fill}"/>'
        f'<path fill="{text_fill}" d="{path}"/>'
    )
    return body, box_w


def assert_legible(mark: Mark) -> None:
    tile = icon_svg(mark, BG, WHITE, EMERALD, "ATM")
    small = np.array(composite(render_png(tile, 16)).convert("L"))
    medium = np.array(composite(render_png(tile, 32)).convert("L"))
    white16 = int((small > 140).sum())
    if not 50 <= white16 <= 180:
        raise SystemExit(f"16px mark collapsed or flooded ({white16} light pixels)")
    # 32px must still show a counter: a dark pixel fully inside the light drawing.
    ink = medium > 140
    height, width = ink.shape
    ys, xs = np.where(ink)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    interior = ~ink[y0 + 1 : y1, x0 + 1 : x1]
    if int(interior.sum()) < 8:
        raise SystemExit("32px mark has no counter")
    print(f"16px light pixels {white16}; 32px interior {int(interior.sum())}")


def build_svgs(mark: Mark, mono: TTFont) -> dict[str, str]:
    files: dict[str, str] = {
        "symbol-dark.svg": icon_svg(mark, BG, WHITE, EMERALD, "ATM"),
        "symbol-light.svg": icon_svg(mark, PAPER, INK, None, "ATM"),
        "symbol-white.svg": icon_svg(mark, None, WHITE, None, "ATM"),
        "symbol-black.svg": icon_svg(mark, None, INK, None, "ATM"),
    }
    size = 42
    cap = cap_height(mono, size)
    symbol = 96
    gap = 28
    pad = 36
    text_w = text_width(mono, "ATM Software Labs", size)
    lock_w = pad + symbol + gap + text_w + pad
    lock_h = pad + symbol + pad
    baseline = (lock_h + cap) / 2
    accents = {
        "dark": (BG, WHITE, EMERALD, EMERALD, PAPER, True),
        "light": (PAPER, INK, None, INK, INK, True),
        "white": (None, WHITE, None, WHITE, WHITE, False),
        "black": (None, INK, None, INK, INK, False),
    }
    for name, (background, fill, accent, atm, rest, _plated) in accents.items():
        body = []
        if background:
            body.append(plate(lock_w, lock_h, background))
        body.append(placed_mark(mark, fill, accent, symbol, pad, pad, "accent"))
        body.append(word_paths(mono, size, pad + symbol + gap, baseline, atm, rest))
        files[f"lockup-horizontal-{name}.svg"] = svg_text(lock_w, lock_h, "".join(body), "ATM Software Labs")

    stack_symbol = 120
    stack_gap = 28
    stack_pad = 40
    stack_w = max(stack_symbol, text_w) + stack_pad * 2
    stack_h = stack_pad + stack_symbol + stack_gap + cap + stack_pad
    text_x = (stack_w - text_w) / 2
    stack_baseline = stack_pad + stack_symbol + stack_gap + cap
    symbol_x = (stack_w - stack_symbol) / 2
    for name, (background, fill, accent, atm, rest, _plated) in accents.items():
        body = []
        if background:
            body.append(plate(stack_w, stack_h, background))
        body.append(placed_mark(mark, fill, accent, stack_symbol, symbol_x, stack_pad, "accent"))
        body.append(word_paths(mono, size, text_x, stack_baseline, atm, rest))
        files[f"lockup-stacked-{name}.svg"] = svg_text(stack_w, stack_h, "".join(body), "ATM Software Labs")

    word_pad_x = 28
    word_pad_y = 22
    word_w = text_w + word_pad_x * 2
    word_h = cap + word_pad_y * 2
    word_baseline = word_pad_y + cap
    for name, (background, _fill, _accent, atm, rest, _plated) in accents.items():
        body = []
        if background:
            body.append(plate(word_w, word_h, background))
        body.append(word_paths(mono, size, word_pad_x, word_baseline, atm, rest))
        files[f"wordmark-{name}.svg"] = svg_text(word_w, word_h, "".join(body), "ATM Software Labs")
    return files


def labs_lockup(mark: Mark, mono: TTFont) -> str:
    size = 42
    cap = cap_height(mono, size)
    symbol = 96
    gap = 28
    pad = 36
    atm_w = text_width(mono, "ATM", size)
    tag_gap = 16
    _tag, tag_w = labs_tag(mono, 0, 0, CYAN, INK)
    lock_w = pad + symbol + gap + atm_w + tag_gap + tag_w + pad
    lock_h = pad + symbol + pad
    baseline = (lock_h + cap) / 2
    text_x = pad + symbol + gap
    tag, _tag_w = labs_tag(mono, text_x + atm_w + tag_gap, baseline - cap / 2, CYAN, INK)
    atm_path, _ = font_path(mono, "ATM", size, text_x, baseline)
    body = [
        plate(lock_w, lock_h, BG),
        placed_mark(mark, WHITE, CYAN, symbol, pad, pad, "accent"),
        f'<path fill="{CYAN}" d="{atm_path}"/>',
        tag,
    ]
    return svg_text(lock_w, lock_h, "".join(body), "ATM Labs")


def social_card(mark: Mark, width: int, height: int, mono: TTFont, sans: TTFont, statement: str | None, accent: str) -> str:
    pad_x = 72
    symbol = min(176, height * 0.4)
    title = 54 if width >= 1200 else 42
    name_size = 28
    line_size = 24
    cap = cap_height(mono, title)
    name_cap = cap_height(sans, name_size)
    line_cap = cap_height(sans, line_size) if statement else 0
    block_h = cap + (18 + name_cap) + ((16 + line_cap) if statement else 0)
    block_y = (height - block_h) / 2
    symbol_y = (height - symbol) / 2
    title_baseline = block_y + cap
    name_baseline = title_baseline + 18 + name_cap
    text_x = pad_x + symbol + 36
    body = [plate(width, height, BG), plate(width, 8, accent)]
    body.append(placed_mark(mark, WHITE, accent, symbol, pad_x, symbol_y, "accent"))
    body.append(word_paths(mono, title, text_x, title_baseline, accent, PAPER))
    name_path, _name_w = font_path(sans, "Alberto Trujillo Mingorance", name_size, text_x, name_baseline)
    body.append(f'<path fill="{MUTED}" d="{name_path}"/>')
    if statement:
        line_baseline = name_baseline + 16 + line_cap
        line_path, line_w = font_path(sans, statement, line_size, text_x, line_baseline)
        if text_x + line_w > width - pad_x:
            raise SystemExit(f"statement overflows {width}: {statement}")
        body.append(f'<path fill="{PAPER}" d="{line_path}"/>')
    return svg_text(width, height, "".join(body), "ATM Software Labs")


def cover(mark: Mark, mono: TTFont, accent: str) -> str:
    width, height = 1128, 191
    symbol = 132
    size = 36
    text_w = text_width(mono, "ATM Software Labs", size)
    group_w = symbol + 28 + text_w
    x = (width - group_w) / 2
    y = (height - symbol) / 2
    baseline = (height + cap_height(mono, size)) / 2
    body = [
        plate(width, height, BG),
        plate(width, 6, accent),
        placed_mark(mark, WHITE, accent, symbol, x, y, "accent"),
        word_paths(mono, size, x + symbol + 28, baseline, accent, PAPER),
    ]
    return svg_text(width, height, "".join(body), "ATM Software Labs")


def labs_card(mark: Mark, mono: TTFont, sans: TTFont, width: int, height: int) -> str:
    pad_x = 64 if width > 800 else 36
    symbol = min(168, height * 0.62)
    title = 48 if width >= 1000 else 36
    host_size = 22
    cap = cap_height(mono, title)
    host_cap = cap_height(sans, host_size)
    block_h = cap + 16 + host_cap
    block_y = (height - block_h) / 2
    symbol_y = (height - symbol) / 2
    baseline = block_y + cap
    text_x = pad_x + symbol + 32
    atm_w = text_width(mono, "ATM", title)
    tag, _tag_w = labs_tag(mono, text_x + atm_w + 14, baseline - cap / 2, CYAN, INK)
    atm_path, _ = font_path(mono, "ATM", title, text_x, baseline)
    host_path, host_w = font_path(sans, "labs.trujillomingorance.com", host_size, text_x, baseline + 16 + host_cap)
    if text_x + host_w > width - pad_x:
        raise SystemExit("labs host overflows the card")
    body = [
        plate(width, height, BG),
        plate(width, 8 if height > 400 else 6, CYAN),
        placed_mark(mark, WHITE, CYAN, symbol, pad_x, symbol_y, "accent"),
        f'<path fill="{CYAN}" d="{atm_path}"/>',
        tag,
        f'<path fill="{MUTED}" d="{host_path}"/>',
    ]
    return svg_text(width, height, "".join(body), "ATM Labs")


def labs_banner(mark: Mark, mono: TTFont) -> str:
    width, height = 1128, 191
    symbol = 132
    size = 40
    atm_w = text_width(mono, "ATM", size)
    tag, tag_w = labs_tag(mono, 0, 0, CYAN, INK)
    group_w = symbol + 28 + atm_w + 16 + tag_w
    x = (width - group_w) / 2
    y = (height - symbol) / 2
    cap = cap_height(mono, size)
    baseline = (height + cap) / 2
    atm_path, _ = font_path(mono, "ATM", size, x + symbol + 28, baseline)
    tag, _tag_w = labs_tag(mono, x + symbol + 28 + atm_w + 16, baseline - cap / 2, CYAN, INK)
    body = [
        plate(width, height, BG),
        plate(width, 6, CYAN),
        placed_mark(mark, WHITE, CYAN, symbol, x, y, "accent"),
        f'<path fill="{CYAN}" d="{atm_path}"/>',
        tag,
    ]
    return svg_text(width, height, "".join(body), "ATM Labs")


def write_readme() -> None:
    text = """# ATM Software Labs logo

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
"""
    (BRAND / "README.md").write_text(text)


def write_icons(svg: str, directory: Path, ico_name: str = "favicon.ico") -> None:
    directory.mkdir(parents=True, exist_ok=True)
    for size, filename in ((180, "apple-touch-icon.png"), (192, "icon-192.png"), (512, "icon-512.png")):
        save_png(composite(render_png(svg, size)), directory / filename, (size, size))
    icon16 = composite(render_png(svg, 16))
    icon32 = composite(render_png(svg, 32))
    ico_path = directory / ico_name
    icon32.save(ico_path, format="ICO", sizes=[(16, 16), (32, 32)], append_images=[icon16])


def main() -> None:
    mark = load_mark()
    print(f"mark {mark.width:g}x{mark.height:g} accent_y {mark.accent_y:g}")
    assert_legible(mark)
    mono = TTFont(str(MONO))
    sans = TTFont(str(SANS))
    logo_dir = BRAND / "logo"
    export_dir = BRAND / "export"
    labs_dir = BRAND / "labs"
    logo_dir.mkdir(parents=True, exist_ok=True)
    export_dir.mkdir(parents=True, exist_ok=True)
    labs_dir.mkdir(parents=True, exist_ok=True)

    svgs = build_svgs(mark, mono)
    for name, svg in svgs.items():
        if "gradient" in svg or "currentColor" in svg:
            raise SystemExit(f"unexpected paint in {name}")
        (logo_dir / name).write_text(svg)

    favicon = svgs["symbol-dark.svg"]
    (PUBLIC / "favicon.svg").write_text(favicon)
    public_brand = PUBLIC / "brand"
    public_brand.mkdir(parents=True, exist_ok=True)
    (public_brand / "favicon.svg").write_text(favicon)

    for size, filename in ((180, "apple-touch-icon.png"), (192, "icon-192.png"), (512, "icon-512.png")):
        image = composite(render_png(favicon, size))
        save_png(image, PUBLIC / filename, (size, size))
        save_png(image, public_brand / filename, (size, size))
    icon16 = composite(render_png(favicon, 16))
    icon32 = composite(render_png(favicon, 32))
    ico_path = PUBLIC / "favicon.ico"
    icon32.save(ico_path, format="ICO", sizes=[(16, 16), (32, 32)], append_images=[icon16])
    shutil.copyfile(ico_path, public_brand / "favicon.ico")

    save_png(composite(render_png(field_svg(mark, 500, WHITE, EMERALD), 500)), export_dir / "github-avatar.png", (500, 500))
    save_png(composite(render_png(field_svg(mark, 400, WHITE, EMERALD), 400)), export_dir / "linkedin-logo.png", (400, 400))
    save_png(composite(render_png(cover(mark, mono, EMERALD), 1128)), export_dir / "linkedin-cover.png", (1128, 191))
    save_png(composite(render_png(social_card(mark, 1280, 640, mono, sans, None, EMERALD), 1280)), export_dir / "github-social.png", (1280, 640))
    save_png(composite(render_png(social_card(mark, 1200, 630, mono, sans, None, EMERALD), 1200)), export_dir / "og.png", (1200, 630))
    for lang, statement in STATEMENTS.items():
        card = social_card(mark, 1200, 630, mono, sans, statement, EMERALD)
        name = "og-hub.png" if lang == "es" else f"og-hub-{lang}.png"
        save_png(composite(render_png(card, 1200)), PUBLIC / "assets" / name, (1200, 630))

    labs_favicon = icon_svg(mark, BG, WHITE, CYAN, "ATM Labs")
    (labs_dir / "favicon.svg").write_text(labs_favicon)
    (labs_dir / "lockup.svg").write_text(labs_lockup(mark, mono))
    write_icons(labs_favicon, labs_dir)
    save_png(composite(render_png(labs_card(mark, mono, sans, 1200, 630), 1200)), labs_dir / "og.png", (1200, 630))
    save_png(composite(render_png(labs_banner(mark, mono), 1128)), labs_dir / "banner.png", (1128, 191))

    pub_logo = public_brand / "logo"
    pub_export = public_brand / "export"
    pub_labs = public_brand / "labs"
    for dest, src in ((pub_logo, logo_dir), (pub_export, export_dir), (pub_labs, labs_dir)):
        if dest.exists():
            shutil.rmtree(dest)
        shutil.copytree(src, dest)
    write_readme()
    print(f"logo files: {len(list(logo_dir.glob('*.svg')))} svg, {len(list(export_dir.glob('*.png')))} png, labs {len(list(labs_dir.iterdir()))}")


if __name__ == "__main__":
    main()
