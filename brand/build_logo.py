#!/usr/bin/env python3
"""Build the ATM Software Labs logo from the geometric avatar mark.

The source drawing is public/avatar.png: white line art on black (stars,
chevrons, and the triangles that form the A). Strokes stay at the bitmap
weight. No part of the mark is tinted. Labs uses the same white mark and is
distinguished only by the word Labs. The 16/32 favicon.ico may use a one-pixel
weight bump when the faithful drawing does not hold together at those sizes.
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
MUTED = "#9aabbd"
WHITE = "#ffffff"

STATEMENTS = {
    "es": "Trabajo en sistemas, cloud y ciberseguridad desde Barcelona.",
    "en": "I work in systems, cloud, and cybersecurity from Barcelona.",
    "ca": "Treballo en sistemes, cloud i ciberseguretat des de Barcelona.",
}
ROLES = {
    "es": "Administración de sistemas, cloud y ciberseguridad · Barcelona",
    "en": "Systems administration, cloud, and cybersecurity · Barcelona",
    "ca": "Administració de sistemes, cloud i ciberseguretat · Barcelona",
}


class Mark:
    def __init__(self, d: str, width: float, height: float) -> None:
        self.d = d
        self.width = width
        self.height = height


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


def word_paths(font: TTFont, text: str, size: float, x: float, baseline: float, fill: str) -> tuple[str, float]:
    path, width = font_path(font, text, size, x, baseline)
    return f'<path fill="{fill}" d="{path}"/>', width


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


def load_mark(radius: int = 0) -> Mark:
    image = Image.open(AVATAR).convert("RGBA")
    arr = np.array(image)
    ink = (arr[:, :, 3] > 160) & (arr[:, :, 0] > 180)
    ys, xs = np.where(ink)
    y0, y1 = int(ys.min()) - 1, int(ys.max()) + 1
    x0, x1 = int(xs.min()) - 1, int(xs.max()) + 1
    mask = ink[y0 : y1 + 1, x0 : x1 + 1]
    mask = mask | mask[:, ::-1]
    if radius:
        mask = dilate(mask, radius)
    height, width = mask.shape
    # potrace foreground is the dark pixels after its internal invert,
    # so the ink is passed as black.
    bitmap = Image.fromarray(((~mask).astype(np.uint8) * 255), mode="L")
    curves = Bitmap(bitmap).trace(turdsize=2, alphamax=1.0, opticurve=True, opttolerance=0.45)
    if len(curves) < 2:
        raise SystemExit("trace did not keep the counters of the mark")
    holes = [curve for curve in curves if not curve._path.sign]
    if len(holes) < 7:
        raise SystemExit(f"expected the original counters, found {len(holes)}")
    return Mark(" ".join(curve_d(curve) for curve in curves), float(width), float(height))


def mark_group(mark: Mark, fill: str, scale: float, x: float, y: float) -> str:
    return (
        f'<g transform="translate({x:g} {y:g}) scale({scale:g})">'
        f'<path fill="{fill}" fill-rule="evenodd" d="{mark.d}"/>'
        f"</g>"
    )


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


def icon_svg(mark: Mark, background: str | None, fill: str, label: str) -> str:
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
    body.append(mark_group(mark, fill, scale, x, y))
    return svg_text(size, size, "".join(body), label)


def placed_mark(mark: Mark, fill: str, box: float, x: float, y: float) -> str:
    scale = box / max(mark.width, mark.height)
    drawn_w = mark.width * scale
    drawn_h = mark.height * scale
    return mark_group(mark, fill, scale, x + (box - drawn_w) / 2, y + (box - drawn_h) / 2)


def field_svg(mark: Mark, size: int, fill: str) -> str:
    # Longer side stays inside 68% so a circular crop keeps a margin.
    box = size * 0.68
    offset = (size - box) / 2
    body = plate(size, size, BG) + placed_mark(mark, fill, box, offset, offset)
    return svg_text(size, size, body, "ATM")


def light_stats(image: Image.Image) -> tuple[int, int]:
    ink = np.array(image.convert("L")) > 140
    total = int(ink.sum())
    if total == 0:
        return 0, 0
    seen = np.zeros_like(ink)
    best = 0
    height, width = ink.shape
    for y in range(height):
        for x in range(width):
            if not ink[y, x] or seen[y, x]:
                continue
            stack = [(y, x)]
            seen[y, x] = True
            count = 0
            while stack:
                cy, cx = stack.pop()
                count += 1
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = cy + dy, cx + dx
                    if 0 <= ny < height and 0 <= nx < width and ink[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        stack.append((ny, nx))
            best = max(best, count)
    return total, best


def ico_needs_bump(mark: Mark) -> bool:
    tile = icon_svg(mark, BG, WHITE, "ATM")
    small = composite(render_png(tile, 16))
    total, largest = light_stats(small)
    # A faithful 16px raster falls apart when no single stroke run holds the drawing.
    return largest < total * 0.55 or total < 40


def build_svgs(mark: Mark, mono: TTFont) -> dict[str, str]:
    files: dict[str, str] = {
        "symbol-dark.svg": icon_svg(mark, BG, WHITE, "ATM"),
        "symbol-light.svg": icon_svg(mark, PAPER, INK, "ATM"),
        "symbol-white.svg": icon_svg(mark, None, WHITE, "ATM"),
        "symbol-black.svg": icon_svg(mark, None, INK, "ATM"),
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
    plates = {
        "dark": (BG, WHITE, PAPER),
        "light": (PAPER, INK, INK),
        "white": (None, WHITE, WHITE),
        "black": (None, INK, INK),
    }
    for name, (background, fill, word) in plates.items():
        body = []
        if background:
            body.append(plate(lock_w, lock_h, background))
        body.append(placed_mark(mark, fill, symbol, pad, pad))
        word_svg, _width = word_paths(mono, "ATM Software Labs", size, pad + symbol + gap, baseline, word)
        body.append(word_svg)
        files[f"lockup-horizontal-{name}.svg"] = svg_text(lock_w, lock_h, "".join(body), "ATM Software Labs")

    stack_symbol = 120
    stack_gap = 28
    stack_pad = 40
    stack_w = max(stack_symbol, text_w) + stack_pad * 2
    stack_h = stack_pad + stack_symbol + stack_gap + cap + stack_pad
    text_x = (stack_w - text_w) / 2
    stack_baseline = stack_pad + stack_symbol + stack_gap + cap
    symbol_x = (stack_w - stack_symbol) / 2
    for name, (background, fill, word) in plates.items():
        body = []
        if background:
            body.append(plate(stack_w, stack_h, background))
        body.append(placed_mark(mark, fill, stack_symbol, symbol_x, stack_pad))
        word_svg, _width = word_paths(mono, "ATM Software Labs", size, text_x, stack_baseline, word)
        body.append(word_svg)
        files[f"lockup-stacked-{name}.svg"] = svg_text(stack_w, stack_h, "".join(body), "ATM Software Labs")

    word_pad_x = 28
    word_pad_y = 22
    word_w = text_w + word_pad_x * 2
    word_h = cap + word_pad_y * 2
    word_baseline = word_pad_y + cap
    for name, (background, _fill, word) in plates.items():
        body = []
        if background:
            body.append(plate(word_w, word_h, background))
        word_svg, _width = word_paths(mono, "ATM Software Labs", size, word_pad_x, word_baseline, word)
        body.append(word_svg)
        files[f"wordmark-{name}.svg"] = svg_text(word_w, word_h, "".join(body), "ATM Software Labs")
    return files


def labs_line(mono: TTFont, size: float, x: float, baseline: float, fill: str) -> tuple[str, float]:
    main, main_w = word_paths(mono, "ATM Software Labs", size, x, baseline, fill)
    tag_size = size * 0.62
    cap = cap_height(mono, size)
    tag_cap = cap_height(mono, tag_size)
    tag_baseline = baseline - (cap - tag_cap) / 2
    tag, tag_w = word_paths(mono, "Labs", tag_size, x + main_w + size * 0.55, tag_baseline, fill)
    return main + tag, main_w + size * 0.55 + tag_w


def labs_lockup(mark: Mark, mono: TTFont) -> str:
    size = 42
    cap = cap_height(mono, size)
    symbol = 96
    gap = 28
    pad = 36
    line, line_w = labs_line(mono, size, 0, 0, WHITE)
    lock_w = pad + symbol + gap + line_w + pad
    lock_h = pad + symbol + pad
    baseline = (lock_h + cap) / 2
    line, _line_w = labs_line(mono, size, pad + symbol + gap, baseline, WHITE)
    body = [
        plate(lock_w, lock_h, BG),
        placed_mark(mark, WHITE, symbol, pad, pad),
        line,
    ]
    return svg_text(lock_w, lock_h, "".join(body), "ATM Software Labs. Labs")


def social_card(mark: Mark, width: int, height: int, mono: TTFont, sans: TTFont, role: str, statement: str | None) -> str:
    pad_x = 72
    symbol = min(168, height * 0.36)
    name_size = 48 if width >= 1200 else 40
    role_size = 22
    org_size = 26
    line_size = 22
    name_cap = cap_height(sans, name_size)
    role_cap = cap_height(sans, role_size)
    org_cap = cap_height(mono, org_size)
    line_cap = cap_height(sans, line_size) if statement else 0
    block_h = name_cap + 14 + role_cap + 18 + org_cap + ((16 + line_cap) if statement else 0)
    block_y = (height - block_h) / 2
    symbol_y = (height - symbol) / 2
    name_baseline = block_y + name_cap
    role_baseline = name_baseline + 14 + role_cap
    org_baseline = role_baseline + 18 + org_cap
    text_x = pad_x + symbol + 36
    body = [plate(width, height, BG)]
    body.append(placed_mark(mark, WHITE, symbol, pad_x, symbol_y))
    name_path, _name_w = font_path(sans, "Alberto Trujillo Mingorance", name_size, text_x, name_baseline)
    role_path, role_w = font_path(sans, role, role_size, text_x, role_baseline)
    org_path, _org_w = word_paths(mono, "ATM Software Labs", org_size, text_x, org_baseline, PAPER)
    if text_x + role_w > width - pad_x:
        raise SystemExit(f"role overflows {width}: {role}")
    body.append(f'<path fill="{PAPER}" d="{name_path}"/>')
    body.append(f'<path fill="{MUTED}" d="{role_path}"/>')
    body.append(org_path)
    if statement:
        line_baseline = org_baseline + 16 + line_cap
        line_path, line_w = font_path(sans, statement, line_size, text_x, line_baseline)
        if text_x + line_w > width - pad_x:
            raise SystemExit(f"statement overflows {width}: {statement}")
        body.append(f'<path fill="{PAPER}" d="{line_path}"/>')
    return svg_text(width, height, "".join(body), "Alberto Trujillo Mingorance")


def cover(mark: Mark, mono: TTFont, sans: TTFont, role: str) -> str:
    width, height = 1128, 191
    symbol = 128
    name_size = 36
    role_size = 18
    name_cap = cap_height(sans, name_size)
    role_cap = cap_height(sans, role_size)
    block_h = name_cap + 10 + role_cap
    text_x_gap = 28
    name_w = text_width(sans, "Alberto Trujillo Mingorance", name_size)
    group_w = symbol + text_x_gap + name_w
    x = (width - group_w) / 2
    y = (height - symbol) / 2
    block_y = (height - block_h) / 2
    text_x = x + symbol + text_x_gap
    body = [
        plate(width, height, BG),
        placed_mark(mark, WHITE, symbol, x, y),
        f'<path fill="{PAPER}" d="{font_path(sans, "Alberto Trujillo Mingorance", name_size, text_x, block_y + name_cap)[0]}"/>',
        f'<path fill="{MUTED}" d="{font_path(sans, role, role_size, text_x, block_y + name_cap + 10 + role_cap)[0]}"/>',
    ]
    return svg_text(width, height, "".join(body), "Alberto Trujillo Mingorance")


def labs_card(mark: Mark, mono: TTFont, sans: TTFont, width: int, height: int) -> str:
    pad_x = 64 if width > 800 else 36
    symbol = min(160, height * 0.46)
    title = 42 if width >= 1000 else 32
    host_size = 22
    cap = cap_height(mono, title)
    host_cap = cap_height(sans, host_size)
    block_h = cap + 16 + host_cap
    block_y = (height - block_h) / 2
    symbol_y = (height - symbol) / 2
    baseline = block_y + cap
    text_x = pad_x + symbol + 32
    line, line_w = labs_line(mono, title, text_x, baseline, PAPER)
    host_path, host_w = font_path(sans, "labs.trujillomingorance.com", host_size, text_x, baseline + 16 + host_cap)
    if text_x + max(line_w, host_w) > width - pad_x:
        raise SystemExit("labs card overflows")
    body = [
        plate(width, height, BG),
        placed_mark(mark, WHITE, symbol, pad_x, symbol_y),
        line,
        f'<path fill="{MUTED}" d="{host_path}"/>',
    ]
    return svg_text(width, height, "".join(body), "ATM Software Labs. Labs")


def labs_banner(mark: Mark, mono: TTFont) -> str:
    width, height = 1128, 191
    symbol = 128
    size = 36
    cap = cap_height(mono, size)
    line, line_w = labs_line(mono, size, 0, 0, PAPER)
    group_w = symbol + 28 + line_w
    x = (width - group_w) / 2
    y = (height - symbol) / 2
    baseline = (height + cap) / 2
    line, _line_w = labs_line(mono, size, x + symbol + 28, baseline, PAPER)
    body = [
        plate(width, height, BG),
        placed_mark(mark, WHITE, symbol, x, y),
        line,
    ]
    return svg_text(width, height, "".join(body), "ATM Software Labs. Labs")


def write_readme() -> None:
    text = """# ATM Software Labs logo

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
"""
    (BRAND / "README.md").write_text(text)


def write_png_icons(svg: str, directory: Path) -> None:
    directory.mkdir(parents=True, exist_ok=True)
    for size, filename in ((180, "apple-touch-icon.png"), (192, "icon-192.png"), (512, "icon-512.png")):
        save_png(composite(render_png(svg, size)), directory / filename, (size, size))


def write_ico(svg16: str, svg32: str, path: Path) -> None:
    icon16 = composite(render_png(svg16, 16))
    icon32 = composite(render_png(svg32, 32))
    path.parent.mkdir(parents=True, exist_ok=True)
    icon32.save(path, format="ICO", sizes=[(16, 16), (32, 32)], append_images=[icon16])


def reject_accent(name: str, svg: str) -> None:
    banned = ("gradient", "currentColor", "#8fe8c4", "#9ad7e6")
    for token in banned:
        if token in svg:
            raise SystemExit(f"unexpected paint {token} in {name}")


def main() -> None:
    mark = load_mark(0)
    print(f"mark {mark.width:g}x{mark.height:g}")
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
        reject_accent(name, svg)
        (logo_dir / name).write_text(svg)

    favicon = svgs["symbol-dark.svg"]
    public_brand = PUBLIC / "brand"
    public_brand.mkdir(parents=True, exist_ok=True)
    (PUBLIC / "favicon.svg").write_text(favicon)
    (public_brand / "favicon.svg").write_text(favicon)
    (labs_dir / "favicon.svg").write_text(favicon)

    write_png_icons(favicon, PUBLIC)
    write_png_icons(favicon, public_brand)
    write_png_icons(favicon, labs_dir)

    # 16px of the faithful trace falls apart. 32px still reads, so only the
    # 16px ICO frame gets the one-pixel bump.
    bump16 = ico_needs_bump(mark)
    ico16 = icon_svg(load_mark(1), BG, WHITE, "ATM") if bump16 else favicon
    print(f"favicon.ico 16px weight bump: {bump16}")
    ico_path = PUBLIC / "favicon.ico"
    write_ico(ico16, favicon, ico_path)
    shutil.copyfile(ico_path, public_brand / "favicon.ico")
    shutil.copyfile(ico_path, PUBLIC / "assets" / "favicon.ico")
    shutil.copyfile(ico_path, labs_dir / "favicon.ico")

    role = ROLES["es"]
    statement = STATEMENTS["es"]
    save_png(composite(render_png(field_svg(mark, 500, WHITE), 500)), export_dir / "github-avatar.png", (500, 500))
    save_png(composite(render_png(field_svg(mark, 400, WHITE), 400)), export_dir / "linkedin-logo.png", (400, 400))
    save_png(composite(render_png(cover(mark, mono, sans, role), 1128)), export_dir / "linkedin-cover.png", (1128, 191))
    save_png(
        composite(render_png(social_card(mark, 1280, 640, mono, sans, role, statement), 1280)),
        export_dir / "github-social.png",
        (1280, 640),
    )
    save_png(
        composite(render_png(social_card(mark, 1200, 630, mono, sans, role, statement), 1200)),
        export_dir / "og.png",
        (1200, 630),
    )
    for lang in STATEMENTS:
        card = social_card(mark, 1200, 630, mono, sans, ROLES[lang], STATEMENTS[lang])
        name = "og-hub.png" if lang == "es" else f"og-hub-{lang}.png"
        save_png(composite(render_png(card, 1200)), PUBLIC / "assets" / name, (1200, 630))

    reject_accent("labs/lockup.svg", labs_lockup(mark, mono))
    (labs_dir / "lockup.svg").write_text(labs_lockup(mark, mono))
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
