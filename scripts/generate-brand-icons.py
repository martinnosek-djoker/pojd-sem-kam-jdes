#!/usr/bin/env python3
"""Regenerate every app icon / splash from the web's terracotta bridge mark.

    python3 scripts/generate-brand-icons.py

Source: public/images/logo-mark.png (only its alpha channel is used, so the
mark can be recoloured). Writes the Android launcher + splash resources, the
Play Store icon, resources/icon.png + splash.png and the PWA icons. The Play
feature graphic is rendered separately by scripts/generate-feature-graphic.js.
"""
import glob
import os

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
TERRACOTTA = (193, 87, 46)  # tailwind terracotta
CREAM = (251, 243, 231)  # tailwind bg


def path(*p):
    return os.path.join(ROOT, *p)


def load_mark_alpha():
    """Alpha of the bridge mark, cropped and upscaled 4x with the edge re-sharpened."""
    a = Image.open(path("public", "images", "logo-mark.png")).convert("RGBA").split()[3]
    a = a.crop(a.getbbox())
    a = a.resize((a.width * 4, a.height * 4), Image.LANCZOS)
    # Steepen the edge ramp so the upscaled line art stays crisp, not blurry.
    return a.point(lambda v: 0 if v < 70 else 255 if v > 185 else int((v - 70) * 255 / 115))


MARK = load_mark_alpha()


def mark_layer(size, width_frac, color, offset_y=0.0):
    """Transparent size x size image with the mark centred, `width_frac` of the width wide."""
    w = round(size * width_frac)
    h = round(w * MARK.height / MARK.width)
    m = MARK.resize((w, h), Image.LANCZOS)
    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    solid = Image.new("RGBA", (w, h), color + (255,))
    solid.putalpha(m)
    layer.alpha_composite(solid, ((size - w) // 2, (size - h) // 2 + round(size * offset_y)))
    return layer


def flat(size, bg, width_frac, fg):
    img = Image.new("RGBA", (size, size), bg + (255,))
    img.alpha_composite(mark_layer(size, width_frac, fg))
    return img


def shaped(img, shape):
    """Mask a square icon to a circle or rounded square (legacy launcher icons)."""
    s = img.width
    big = s * 4
    mask = Image.new("L", (big, big), 0)
    d = ImageDraw.Draw(mask)
    if shape == "circle":
        d.ellipse((0, 0, big - 1, big - 1), fill=255)
    else:
        d.rounded_rectangle((0, 0, big - 1, big - 1), radius=round(big * 0.22), fill=255)
    mask = mask.resize((s, s), Image.LANCZOS)
    out = img.copy()
    out.putalpha(ImageChops.multiply(out.split()[3], mask))
    return out


def save(img, *parts, fmt=None, **kw):
    p = path(*parts)
    img.save(p, fmt, **kw)
    print("wrote", os.path.relpath(p, ROOT))


# --- Android launcher icons -------------------------------------------------
DENSITIES = {"ldpi": 36, "mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
for dens, legacy in DENSITIES.items():
    d = path("android", "app", "src", "main", "res", f"mipmap-{dens}")
    adaptive = legacy * 9 // 4  # 108dp canvas for a 48dp launcher icon
    save(Image.new("RGBA", (adaptive, adaptive), TERRACOTTA + (255,)), d, "ic_launcher_background.png")
    # The XML insets both layers by 16.7%, so the mark can fill most of the layer.
    save(mark_layer(adaptive, 0.78, CREAM), d, "ic_launcher_foreground.png")
    base = flat(legacy * 4, TERRACOTTA, 0.62, CREAM)
    for name, shape in (("ic_launcher.png", "square"), ("ic_launcher_round.png", "circle")):
        save(shaped(base, shape).resize((legacy, legacy), Image.LANCZOS), d, name)

# --- Store / source icons ---------------------------------------------------
icon_1024 = flat(1024, TERRACOTTA, 0.68, CREAM)
save(icon_1024, "resources", "icon.png")
save(icon_1024.resize((512, 512), Image.LANCZOS).convert("RGB"), "store-listing", "graphics", "app-icon-512.png")

# PWA icons (maskable, so keep the mark inside the safe zone)
for f in glob.glob(path("icons", "icon-*.webp")):
    size = int(os.path.basename(f)[5:-5])
    flat(size * 2, TERRACOTTA, 0.6, CREAM).resize((size, size), Image.LANCZOS).save(f, "WEBP", quality=92)
    print("wrote", os.path.relpath(f, ROOT))

# --- Splash screen ----------------------------------------------------------
splash = Image.new("RGBA", (2732, 2732), CREAM + (255,))
splash.alpha_composite(mark_layer(2732, 0.34, TERRACOTTA))
save(splash, "resources", "splash.png")
for f in glob.glob(path("android", "app", "src", "main", "res", "drawable*", "splash.png")):
    w, h = Image.open(f).size
    scale = min(w, h) / 2732
    canvas = Image.new("RGBA", (w, h), CREAM + (255,))
    # Same mark size relative to the shorter side as the master splash.
    side = round(2732 * scale)
    canvas.alpha_composite(mark_layer(side, 0.34, TERRACOTTA), ((w - side) // 2, (h - side) // 2))
    canvas.save(f)
    print("wrote", os.path.relpath(f, ROOT))
