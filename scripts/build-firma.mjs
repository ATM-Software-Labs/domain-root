#!/usr/bin/env node
/**
 * Rasterize the email-signature assets into public/assets/firma/.
 *
 * Cloudflare Pages publishes `public/` (see wrangler.toml pages_build_output_dir),
 * so these files are served at https://trujillomingorance.com/assets/firma/<file>.
 *
 * logo.png reuses brand/logo/symbol-white.svg, the vector of the geometric
 * emblem traced from public/avatar.png (white lines on black, stars and the
 * triangles that form the A). It is not recolored. The tile is #000000 with
 * rounded corners; the pixels outside that curve are opaque #ffffff so a
 * white Gmail background shows a rounded badge and clients that mishandle
 * alpha still get a solid image.
 *
 * Icons are drawn at 4x and box-filtered to 32x32 so the 16x16 <img> tags
 * stay sharp. PNGs are RGB (color type 2), with no alpha channel.
 *
 *   npm run build:firma
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { crc32, deflateSync } from "node:zlib";
import { Resvg } from "@resvg/resvg-js";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT = join(ROOT, "public/assets/firma");
const SUPERSAMPLE = 4;

const LINKEDIN_PATH =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z";
const GITHUB_PATH =
  "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12";

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const sum = Buffer.alloc(4);
  sum.writeUInt32BE(crc32(body) >>> 0, 0);
  return Buffer.concat([length, body, sum]);
}

function encodeRgbPng(width, height, rgb) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const stride = width * 3;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgb.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

function raster(svg, size) {
  const rendered = new Resvg(svg, {
    fitTo: { mode: "width", value: size * SUPERSAMPLE },
    shapeRendering: 2
  }).render();
  const srcW = rendered.width;
  const srcH = rendered.height;
  const pixels = rendered.pixels;
  if (srcW !== size * SUPERSAMPLE || srcH !== size * SUPERSAMPLE) {
    throw new Error(`expected ${size * SUPERSAMPLE}px raster, got ${srcW}x${srcH}`);
  }
  const out = Buffer.alloc(size * size * 3);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let n = 0;
      const x0 = x * SUPERSAMPLE;
      const y0 = y * SUPERSAMPLE;
      for (let yy = y0; yy < y0 + SUPERSAMPLE; yy++) {
        for (let xx = x0; xx < x0 + SUPERSAMPLE; xx++) {
          const i = (yy * srcW + xx) * 4;
          const alpha = pixels[i + 3] / 255;
          r += pixels[i] * alpha + 255 * (1 - alpha);
          g += pixels[i + 1] * alpha + 255 * (1 - alpha);
          b += pixels[i + 2] * alpha + 255 * (1 - alpha);
          n++;
        }
      }
      const o = (y * size + x) * 3;
      out[o] = Math.round(r / n);
      out[o + 1] = Math.round(g / n);
      out[o + 2] = Math.round(b / n);
    }
  }
  return out;
}

function svgDoc(size, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="geometricPrecision">${body}</svg>`;
}

function markGroup() {
  const source = readFileSync(join(ROOT, "brand/logo/symbol-white.svg"), "utf8");
  const mark = source.match(/<g[\s\S]*<\/g>/);
  if (!mark) throw new Error("brand/logo/symbol-white.svg has no emblem group");
  if (!mark[0].includes('fill="#ffffff"') || !mark[0].includes('fill-rule="evenodd"')) {
    throw new Error("symbol-white.svg is not the white even-odd emblem");
  }
  return mark[0];
}

function logoSvg() {
  const tile = 128;
  const radius = 28;
  const box = 96;
  const offset = (tile - box) / 2;
  return svgDoc(
    tile,
    `<rect width="${tile}" height="${tile}" fill="#ffffff"/>` +
      `<rect width="${tile}" height="${tile}" rx="${radius}" fill="#000000"/>` +
      `<g transform="translate(${offset} ${offset}) scale(${box / 32})">${markGroup()}</g>`
  );
}

function iconSvg(inner) {
  return svgDoc(32, `<rect width="32" height="32" fill="#ffffff"/>${inner}`);
}

function brandIcon(path, fill) {
  const pad = 1.25;
  const scale = (32 - pad * 2) / 24;
  return iconSvg(`<g transform="translate(${pad} ${pad}) scale(${scale})"><path fill="${fill}" d="${path}"/></g>`);
}

function emailSvg() {
  return iconSvg(
    `<rect x="2" y="6" width="28" height="20" rx="3" fill="#0A66C2"/>` +
      `<path d="M5 10.2 L16 17.4 L27 10.2" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>`
  );
}

function pixel(rgb, size, x, y) {
  const i = (y * size + x) * 3;
  return [rgb[i], rgb[i + 1], rgb[i + 2]];
}

function assertCornersWhite(rgb, size, name) {
  for (const [x, y] of [
    [0, 0],
    [size - 1, 0],
    [0, size - 1],
    [size - 1, size - 1]
  ]) {
    const [r, g, b] = pixel(rgb, size, x, y);
    if (r !== 255 || g !== 255 || b !== 255) {
      throw new Error(`${name} corner ${x},${y} is ${r},${g},${b}, expected opaque white`);
    }
  }
}

function hasExact(rgb, r, g, b) {
  for (let i = 0; i < rgb.length; i += 3) {
    if (rgb[i] === r && rgb[i + 1] === g && rgb[i + 2] === b) return true;
  }
  return false;
}

function assertLogo(rgb) {
  assertCornersWhite(rgb, 128, "logo.png");
  let black = 0;
  let whiteInk = 0;
  for (let i = 0; i < rgb.length; i += 3) {
    const r = rgb[i];
    const g = rgb[i + 1];
    const b = rgb[i + 2];
    if (Math.max(r, g, b) - Math.min(r, g, b) > 2) {
      throw new Error(`logo.png has a tinted pixel ${r},${g},${b}`);
    }
    if (r === 0) black++;
    if (r === 255) whiteInk++;
  }
  if (black < 1000) throw new Error("logo.png is missing the black tile");
  if (whiteInk < 400) throw new Error("logo.png is missing the white emblem or corner fill");
}

const files = {
  "logo.png": { svg: logoSvg(), size: 128, check: assertLogo },
  "linkedin.png": {
    svg: brandIcon(LINKEDIN_PATH, "#0A66C2"),
    size: 32,
    check(rgb) {
      assertCornersWhite(rgb, 32, "linkedin.png");
      if (!hasExact(rgb, 0x0a, 0x66, 0xc2)) throw new Error("linkedin.png is missing #0A66C2");
    }
  },
  "github.png": {
    svg: brandIcon(GITHUB_PATH, "#181717"),
    size: 32,
    check(rgb) {
      assertCornersWhite(rgb, 32, "github.png");
      if (!hasExact(rgb, 0x18, 0x17, 0x17)) throw new Error("github.png is missing #181717");
    }
  },
  "email.png": {
    svg: emailSvg(),
    size: 32,
    check(rgb) {
      assertCornersWhite(rgb, 32, "email.png");
      if (!hasExact(rgb, 0x0a, 0x66, 0xc2)) throw new Error("email.png is missing #0A66C2");
    }
  }
};

mkdirSync(OUT, { recursive: true });
for (const [name, spec] of Object.entries(files)) {
  const rgb = raster(spec.svg, spec.size);
  spec.check(rgb);
  const png = encodeRgbPng(spec.size, spec.size, rgb);
  writeFileSync(join(OUT, name), png);
  console.log(`${name} ${spec.size}x${spec.size} rgb ${png.length} bytes`);
}
