#!/usr/bin/env python3
"""Audit/fix transparent backgrounds for PNG sprites using only Python stdlib.

Default behavior is audit mode: list files that have no transparent pixels.
Use --fix to make edge-connected background pixels transparent.
"""

from __future__ import annotations

import argparse
import struct
import zlib
from collections import Counter, deque
from pathlib import Path

PNG_SIG = b"\x89PNG\r\n\x1a\n"


def paeth_predictor(a: int, b: int, c: int) -> int:
    p = a + b - c
    pa = abs(p - a)
    pb = abs(p - b)
    pc = abs(p - c)
    if pa <= pb and pa <= pc:
        return a
    if pb <= pc:
        return b
    return c


class PNGImage:
    def __init__(self, width: int, height: int, color_type: int, rows: list[bytearray], chunks: list[tuple[bytes, bytes]]):
        self.width = width
        self.height = height
        self.color_type = color_type
        self.rows = rows
        self.chunks = chunks

    @property
    def channels(self) -> int:
        return {2: 3, 6: 4}[self.color_type]


def decode_png(path: Path) -> PNGImage:
    data = path.read_bytes()
    if data[:8] != PNG_SIG:
        raise ValueError(f"{path} is not a PNG")

    i = 8
    ihdr = None
    idat_parts: list[bytes] = []
    chunks: list[tuple[bytes, bytes]] = []

    while i < len(data):
        length = struct.unpack(">I", data[i : i + 4])[0]
        i += 4
        ctype = data[i : i + 4]
        i += 4
        chunk_data = data[i : i + length]
        i += length
        _crc = data[i : i + 4]
        i += 4

        if ctype == b"IHDR":
            ihdr = chunk_data
        elif ctype == b"IDAT":
            idat_parts.append(chunk_data)
        elif ctype != b"IEND":
            chunks.append((ctype, chunk_data))

    if ihdr is None:
        raise ValueError(f"{path} is missing IHDR")

    width, height, bit_depth, color_type, _comp, _filt, interlace = struct.unpack(">IIBBBBB", ihdr)
    if bit_depth != 8 or interlace != 0 or color_type not in (2, 6):
        raise ValueError(f"Unsupported PNG format in {path}: bit_depth={bit_depth}, color_type={color_type}, interlace={interlace}")

    channels = {2: 3, 6: 4}[color_type]
    stride = width * channels
    raw = zlib.decompress(b"".join(idat_parts))

    rows: list[bytearray] = []
    pos = 0
    prev = bytearray(stride)

    for _ in range(height):
        f = raw[pos]
        pos += 1
        cur = bytearray(raw[pos : pos + stride])
        pos += stride

        if f == 1:  # Sub
            for x in range(stride):
                cur[x] = (cur[x] + (cur[x - channels] if x >= channels else 0)) & 0xFF
        elif f == 2:  # Up
            for x in range(stride):
                cur[x] = (cur[x] + prev[x]) & 0xFF
        elif f == 3:  # Average
            for x in range(stride):
                left = cur[x - channels] if x >= channels else 0
                cur[x] = (cur[x] + ((left + prev[x]) >> 1)) & 0xFF
        elif f == 4:  # Paeth
            for x in range(stride):
                left = cur[x - channels] if x >= channels else 0
                up = prev[x]
                up_left = prev[x - channels] if x >= channels else 0
                cur[x] = (cur[x] + paeth_predictor(left, up, up_left)) & 0xFF
        elif f != 0:
            raise ValueError(f"Unsupported filter type {f} in {path}")

        rows.append(cur)
        prev = cur

    return PNGImage(width, height, color_type, rows, chunks)


def encode_png(image: PNGImage, path: Path) -> None:
    width, height, color_type = image.width, image.height, image.color_type
    channels = image.channels
    stride = width * channels

    raw = bytearray()
    for row in image.rows:
        if len(row) != stride:
            raise ValueError("Row stride mismatch")
        raw.append(0)  # no filter
        raw.extend(row)

    idat = zlib.compress(bytes(raw), level=9)

    out = bytearray(PNG_SIG)

    def put_chunk(ctype: bytes, cdata: bytes) -> None:
        out.extend(struct.pack(">I", len(cdata)))
        out.extend(ctype)
        out.extend(cdata)
        crc = zlib.crc32(ctype)
        crc = zlib.crc32(cdata, crc)
        out.extend(struct.pack(">I", crc & 0xFFFFFFFF))

    ihdr = struct.pack(">IIBBBBB", width, height, 8, color_type, 0, 0, 0)
    put_chunk(b"IHDR", ihdr)
    for ctype, cdata in image.chunks:
        put_chunk(ctype, cdata)
    put_chunk(b"IDAT", idat)
    put_chunk(b"IEND", b"")

    path.write_bytes(bytes(out))


def has_transparency(image: PNGImage) -> bool:
    if image.color_type == 2:
        return False
    for row in image.rows:
        if any(a < 255 for a in row[3::4]):
            return True
    return False


def edge_background_color(image: PNGImage) -> tuple[int, int, int]:
    c = image.channels
    samples = []
    w, h = image.width, image.height

    def rgb_at(x: int, y: int) -> tuple[int, int, int]:
        row = image.rows[y]
        i = x * c
        return row[i], row[i + 1], row[i + 2]

    for x in range(w):
        samples.append(rgb_at(x, 0))
        samples.append(rgb_at(x, h - 1))
    for y in range(1, h - 1):
        samples.append(rgb_at(0, y))
        samples.append(rgb_at(w - 1, y))

    return Counter(samples).most_common(1)[0][0]


def remove_edge_background(image: PNGImage, tolerance: int = 20) -> int:
    # Ensure RGBA first
    if image.color_type == 2:
        rgba_rows = []
        for row in image.rows:
            out = bytearray()
            for i in range(0, len(row), 3):
                out.extend((row[i], row[i + 1], row[i + 2], 255))
            rgba_rows.append(out)
        image.rows = rgba_rows
        image.color_type = 6

    w, h = image.width, image.height
    bg = edge_background_color(image)
    removed = 0

    def is_bg(px: tuple[int, int, int]) -> bool:
        return all(abs(px[i] - bg[i]) <= tolerance for i in range(3))

    q: deque[tuple[int, int]] = deque()
    seen = [[False] * w for _ in range(h)]

    def push(x: int, y: int) -> None:
        if 0 <= x < w and 0 <= y < h and not seen[y][x]:
            seen[y][x] = True
            q.append((x, y))

    for x in range(w):
        push(x, 0)
        push(x, h - 1)
    for y in range(1, h - 1):
        push(0, y)
        push(w - 1, y)

    while q:
        x, y = q.popleft()
        row = image.rows[y]
        i = x * 4
        r, g, b, a = row[i], row[i + 1], row[i + 2], row[i + 3]
        if a == 0:
            continue
        if is_bg((r, g, b)):
            row[i + 3] = 0
            removed += 1
            push(x + 1, y)
            push(x - 1, y)
            push(x, y + 1)
            push(x, y - 1)

    return removed


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--assets-dir", default="assets/characters")
    parser.add_argument("--fix", action="store_true", help="Apply transparency fix in-place")
    parser.add_argument("--tolerance", type=int, default=20)
    args = parser.parse_args()

    assets_dir = Path(args.assets_dir)
    files = sorted(assets_dir.glob("*.png"))
    if not files:
        raise SystemExit(f"No PNGs found in {assets_dir}")

    non_transparent = []
    fixed = []

    for path in files:
        img = decode_png(path)
        if not has_transparency(img):
            non_transparent.append(path)
            if args.fix:
                removed = remove_edge_background(img, tolerance=args.tolerance)
                if removed > 0:
                    encode_png(img, path)
                    fixed.append((path, removed))

    if non_transparent:
        print("Sprites without transparency:")
        for p in non_transparent:
            print(f" - {p}")
    else:
        print("All sprites already contain transparency.")

    if args.fix:
        print(f"Fixed {len(fixed)} sprite(s).")
        for p, removed in fixed:
            print(f" * {p} ({removed} px set transparent)")
    else:
        print("Run with --fix to update files in-place.")


if __name__ == "__main__":
    main()
