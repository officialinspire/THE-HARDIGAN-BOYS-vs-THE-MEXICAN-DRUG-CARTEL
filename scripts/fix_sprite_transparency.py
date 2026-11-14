from __future__ import annotations

from collections import deque
from pathlib import Path
from typing import Iterable

from PIL import Image

CHAR_DIR = Path("assets/characters")
TARGET_FILES = [
    "char_hank_in_disguise.png",
    "char_ice_smith_smirk.png",
    "char_jonah_confused.png",
    "char_jonah_scared.png",
    "char_luisa_pleading.png",
    "char_lupita_calm.png",
    "char_lupita_smirk.png",
    "char_mom_angry.png",
    "char_mom_nurse_scrubs.png",
    "char_msgray_amused.png",
    "char_msgray_displeased.png",
    "char_msgray_threatening.png",
    "char_sofia_neutral.png",
]

EDGE_BAND = 3
FLOOD_DISTANCE = 50.0
FRINGE_DISTANCE = 70.0
FRINGE_ALPHA_FACTOR = 0.4


def color_distance(a: tuple[int, int, int], b: tuple[int, int, int]) -> float:
    dr = a[0] - b[0]
    dg = a[1] - b[1]
    db = a[2] - b[2]
    return (dr * dr + dg * dg + db * db) ** 0.5


def edge_coordinates(width: int, height: int, band: int = EDGE_BAND) -> set[tuple[int, int]]:
    coords: set[tuple[int, int]] = set()
    max_x = width - 1
    max_y = height - 1
    for y in range(min(band, height)):
        for x in range(width):
            coords.add((x, y))
    for y in range(max(0, height - band), height):
        for x in range(width):
            coords.add((x, y))
    for x in range(min(band, width)):
        for y in range(height):
            coords.add((x, y))
    for x in range(max(0, width - band), width):
        for y in range(height):
            coords.add((x, y))
    return coords


def detect_background_color(pixels, width: int, height: int) -> tuple[int, int, int]:
    coords = edge_coordinates(width, height)
    total_r = total_g = total_b = 0
    for x, y in coords:
        r, g, b, _ = pixels[x, y]
        total_r += r
        total_g += g
        total_b += b

    count = len(coords)
    return (round(total_r / count), round(total_g / count), round(total_b / count))


def neighbors4(x: int, y: int, width: int, height: int) -> Iterable[tuple[int, int]]:
    if x > 0:
        yield x - 1, y
    if x < width - 1:
        yield x + 1, y
    if y > 0:
        yield x, y - 1
    if y < height - 1:
        yield x, y + 1


def neighbors8(x: int, y: int, width: int, height: int) -> Iterable[tuple[int, int]]:
    for ny in range(max(0, y - 1), min(height, y + 2)):
        for nx in range(max(0, x - 1), min(width, x + 2)):
            if nx == x and ny == y:
                continue
            yield nx, ny


def flood_fill_transparency(pixels, width: int, height: int, bg: tuple[int, int, int]) -> set[tuple[int, int]]:
    removed: set[tuple[int, int]] = set()
    queue: deque[tuple[int, int]] = deque()

    for x, y in edge_coordinates(width, height):
        if (x, y) in removed:
            continue
        r, g, b, _ = pixels[x, y]
        if color_distance((r, g, b), bg) <= FLOOD_DISTANCE:
            removed.add((x, y))
            queue.append((x, y))

    while queue:
        x, y = queue.popleft()
        for nx, ny in neighbors4(x, y, width, height):
            if (nx, ny) in removed:
                continue
            r, g, b, _ = pixels[nx, ny]
            if color_distance((r, g, b), bg) <= FLOOD_DISTANCE:
                removed.add((nx, ny))
                queue.append((nx, ny))

    for x, y in removed:
        r, g, b, _ = pixels[x, y]
        pixels[x, y] = (r, g, b, 0)

    return removed


def apply_fringe_antialias(
    pixels,
    width: int,
    height: int,
    bg: tuple[int, int, int],
    removed: set[tuple[int, int]],
) -> int:
    fringe_count = 0
    fringe_alpha = int(255 * FRINGE_ALPHA_FACTOR)
    candidate_fringe: set[tuple[int, int]] = set()

    for x, y in removed:
        for nx, ny in neighbors8(x, y, width, height):
            if (nx, ny) in removed:
                continue
            candidate_fringe.add((nx, ny))

    for x, y in candidate_fringe:
        r, g, b, a = pixels[x, y]
        if a == 0:
            continue
        if color_distance((r, g, b), bg) <= FRINGE_DISTANCE:
            new_alpha = min(a, fringe_alpha)
            if new_alpha < a:
                pixels[x, y] = (r, g, b, new_alpha)
                fringe_count += 1

    return fringe_count


def process_file(filename: str) -> tuple[str, tuple[int, int, int], int, int]:
    path = CHAR_DIR / filename
    image = Image.open(path).convert("RGBA")
    pixels = image.load()
    width, height = image.size

    bg = detect_background_color(pixels, width, height)
    removed = flood_fill_transparency(pixels, width, height, bg)
    fringed = apply_fringe_antialias(pixels, width, height, bg, removed)

    image.save(path, "PNG")
    return filename, bg, len(removed), fringed


def main() -> None:
    for filename in TARGET_FILES:
        name, bg, removed, fringed = process_file(filename)
        print(
            f"{name}: detected_bg={bg}, pixels_removed={removed}, pixels_fringed={fringed}"
        )


if __name__ == "__main__":
    main()
