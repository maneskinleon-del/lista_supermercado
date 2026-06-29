/**
 * Generates PWA icon PNGs from the source SVGs using sharp.
 * Run with: node scripts/generate-icons.mjs
 *
 * Produces:
 *   public/icons/icon-{72,96,128,144,152,192,256,384,512}.png  (any)
 *   public/icons/icon-maskable-{192,512}.png                   (maskable)
 *   public/icons/badge-72x72.png                               (notifications)
 *   public/icons/apple-touch-icon.png                          (iOS)
 */

import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = resolve(__dirname, "..", "public", "icons");

const SIZES = [72, 96, 128, 144, 152, 192, 256, 384, 512];
const MASKABLE_SIZES = [192, 512];

const PRIMARY_SVG = resolve(ICONS_DIR, "icon.svg");
const MASKABLE_SVG = resolve(ICONS_DIR, "icon-maskable.svg");

async function ensureDir() {
  await mkdir(ICONS_DIR, { recursive: true });
}

async function generate() {
  await ensureDir();

  for (const size of SIZES) {
    const out = resolve(ICONS_DIR, `icon-${size}x${size}.png`);
    await sharp(PRIMARY_SVG).resize(size, size).png().toFile(out);
    console.log(`✓ ${out.replace(process.cwd() + "/", "")}`);
  }

  for (const size of MASKABLE_SIZES) {
    const out = resolve(ICONS_DIR, `icon-maskable-${size}x${size}.png`);
    await sharp(MASKABLE_SVG).resize(size, size).png().toFile(out);
    console.log(`✓ ${out.replace(process.cwd() + "/", "")}`);
  }

  // Notification badge (small monochrome-ish icon)
  const badgeOut = resolve(ICONS_DIR, "badge-72x72.png");
  await sharp(PRIMARY_SVG).resize(72, 72).png().toFile(badgeOut);
  console.log(`✓ ${badgeOut.replace(process.cwd() + "/", "")}`);

  // Apple touch icon (180x180, recommended)
  const appleOut = resolve(ICONS_DIR, "apple-touch-icon.png");
  await sharp(PRIMARY_SVG).resize(180, 180).png().toFile(appleOut);
  console.log(`✓ ${appleOut.replace(process.cwd() + "/", "")}`);
}

generate().catch((err) => {
  console.error("✗ Icon generation failed:", err);
  process.exit(1);
});
