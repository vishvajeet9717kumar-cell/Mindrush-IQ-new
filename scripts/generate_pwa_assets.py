import zlib
import struct
import math
import os

def create_png(width, height, rgba_data):
    def chunk(chunk_type, data):
        c = chunk_type + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xffffffff)

    header = b"\x89PNG\r\n\x1a\n"
    ihdr = chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
    raw_scanlines = b"".join(b"\x00" + rgba_data[y * width * 4:(y + 1) * width * 4] for y in range(height))
    idat = chunk(b"IDAT", zlib.compress(raw_scanlines, 6))
    iend = chunk(b"IEND", b"")
    return header + ihdr + idat + iend

def generate_icon(size, is_maskable=False):
    pixels = bytearray(size * size * 4)
    cx, cy = size / 2.0, size / 2.0
    r_core = size * (0.28 if is_maskable else 0.35)
    r_halo = size * (0.38 if is_maskable else 0.44)

    bg_r, bg_g, bg_b = 10, 10, 18 # #0a0a12
    p_r, p_g, p_b = 16, 185, 129  # #10b981
    s_r, s_g, s_b = 56, 189, 248  # #38bdf8

    for y in range(size):
        for x in range(size):
            dx = x - cx
            dy = y - cy
            dist = math.sqrt(dx * dx + dy * dy)
            idx = (y * size + x) * 4

            if dist < r_core:
                # Core orb gradient
                t = dist / r_core
                r = int(p_r * (1 - t) + s_r * t)
                g = int(p_g * (1 - t) + s_g * t)
                b = int(p_b * (1 - t) + s_b * t)
                # Add slight highlight on top left
                if dx < 0 and dy < 0 and dist < r_core * 0.5:
                    r = min(255, r + 70)
                    g = min(255, g + 70)
                    b = min(255, b + 70)
                pixels[idx:idx+4] = bytes([r, g, b, 255])
            elif dist < r_halo:
                # Halo glow ring
                ring_t = (dist - r_core) / (r_halo - r_core)
                alpha = int((1.0 - ring_t) * 160)
                r = int(bg_r * (1 - alpha/255.0) + s_r * (alpha/255.0))
                g = int(bg_g * (1 - alpha/255.0) + s_g * (alpha/255.0))
                b = int(bg_b * (1 - alpha/255.0) + s_b * (alpha/255.0))
                pixels[idx:idx+4] = bytes([r, g, b, 255])
            else:
                # Subtle dark background
                pixels[idx:idx+4] = bytes([bg_r, bg_g, bg_b, 255])

    return create_png(size, size, bytes(pixels))

def generate_screenshot(width, height, is_portrait=True):
    pixels = bytearray(width * height * 4)
    for y in range(height):
        # Vertical gradient from #0e111a to #06060c
        gt = y / float(height)
        r = int(14 * (1 - gt) + 6 * gt)
        g = int(17 * (1 - gt) + 6 * gt)
        b = int(26 * (1 - gt) + 12 * gt)

        for x in range(width):
            idx = (y * width + x) * 4
            # Grid pattern lines
            is_grid = (x % 36 == 0) or (y % 36 == 0)
            if is_grid:
                pixels[idx:idx+4] = bytes([r + 15, g + 25, b + 25, 255])
            else:
                pixels[idx:idx+4] = bytes([r, g, b, 255])

    return create_png(width, height, bytes(pixels))

os.makedirs("/app/applet/public", exist_ok=True)

with open("/app/applet/public/pwa-192x192.png", "wb") as f:
    f.write(generate_icon(192))
print("Generated pwa-192x192.png")

with open("/app/applet/public/pwa-512x512.png", "wb") as f:
    f.write(generate_icon(512))
print("Generated pwa-512x512.png")

with open("/app/applet/public/pwa-maskable-512x512.png", "wb") as f:
    f.write(generate_icon(512, is_maskable=True))
print("Generated pwa-maskable-512x512.png")

with open("/app/applet/public/apple-touch-icon.png", "wb") as f:
    f.write(generate_icon(180))
print("Generated apple-touch-icon.png")

with open("/app/applet/public/screenshot-mobile.png", "wb") as f:
    f.write(generate_screenshot(540, 960, is_portrait=True))
print("Generated screenshot-mobile.png")

with open("/app/applet/public/screenshot-desktop.png", "wb") as f:
    f.write(generate_screenshot(1024, 576, is_portrait=False))
print("Generated screenshot-desktop.png")
