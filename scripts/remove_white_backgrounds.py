#!/usr/bin/env python3
"""Convert flat sprite backgrounds to transparency.

Targets near-white backgrounds and non-white studio backdrops (e.g. beige)
by removing edge-connected pixels that match the dominant border color.

Usage:
  python scripts/remove_white_backgrounds.py
  python scripts/remove_white_backgrounds.py --threshold 242 --dry-run
"""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

try:
    from PIL import Image
except ModuleNotFoundError as exc:
    raise SystemExit("Pillow is required. Install with: pip install pillow") from exc


def color_distance(c1: tuple[int, int, int], c2: tuple[float, float, float]) -> float:
    return ((c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2 + (c1[2] - c2[2]) ** 2) ** 0.5


def dominant_edge_color(pixels, width: int, height: int) -> tuple[float, float, float] | None:
    bins: dict[tuple[int, int, int], list[int]] = {}

    def sample(x: int, y: int) -> None:
        r, g, b, a = pixels[x, y]
        if a == 0:
            return
        key = (r // 16, g // 16, b // 16)
        bucket = bins.setdefault(key, [0, 0, 0, 0])
        bucket[0] += 1
        bucket[1] += r
        bucket[2] += g
        bucket[3] += b

    for x in range(width):
        sample(x, 0)
        sample(x, height - 1)
    for y in range(1, height - 1):
        sample(0, y)
        sample(width - 1, y)

    if not bins:
        return None

    _, bucket = max(bins.items(), key=lambda item: item[1][0])
    count = max(bucket[0], 1)
    return bucket[1] / count, bucket[2] / count, bucket[3] / count


def remove_edge_connected_background(
    pixels,
    width: int,
    height: int,
    threshold: int,
    edge_tolerance: int,
    brightness_floor: int,
) -> int:
    target = dominant_edge_color(pixels, width, height)
    if target is None:
        return 0

    visited = [[False] * width for _ in range(height)]
    queue: deque[tuple[int, int]] = deque()

    def push(x: int, y: int) -> None:
        if not (0 <= x < width and 0 <= y < height):
            return
        if visited[y][x]:
            return
        visited[y][x] = True
        queue.append((x, y))

    for x in range(width):
        push(x, 0)
        push(x, height - 1)
    for y in range(1, height - 1):
        push(0, y)
        push(width - 1, y)

    removed = 0
    while queue:
        x, y = queue.popleft()
        r, g, b, a = pixels[x, y]
        if a == 0:
            continue

        near_white = r >= threshold and g >= threshold and b >= threshold
        brightness = (r + g + b) / 3
        near_edge_color = color_distance((r, g, b), target) <= edge_tolerance and brightness >= brightness_floor

        if near_white or near_edge_color:
            pixels[x, y] = (r, g, b, 0)
            removed += 1
            push(x + 1, y)
            push(x - 1, y)
            push(x, y + 1)
            push(x, y - 1)

    return removed


def process_image(path: Path, threshold: int, edge_tolerance: int, brightness_floor: int, dry_run: bool) -> tuple[bool, int]:
    image = Image.open(path).convert("RGBA")
    pixels = image.load()
    width, height = image.size

    changed_pixels = remove_edge_connected_background(
        pixels,
        width,
        height,
        threshold,
        edge_tolerance,
        brightness_floor,
    )

    if changed_pixels and not dry_run:
        image.save(path)

    return changed_pixels > 0, changed_pixels


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--threshold", type=int, default=238, help="RGB threshold treated as white (default: 238)")
    parser.add_argument("--edge-tolerance", type=int, default=42, help="Color-distance tolerance for non-white edge backgrounds")
    parser.add_argument("--brightness-floor", type=int, default=110, help="Minimum brightness for edge background removal")
    parser.add_argument("--dry-run", action="store_true", help="Analyze changes but do not modify files")
    parser.add_argument("--assets-dir", default="assets/characters", help="Directory containing character sprites")
    args = parser.parse_args()

    assets_dir = Path(args.assets_dir)
    if not assets_dir.exists():
        raise SystemExit(f"Assets directory not found: {assets_dir}")

    total = 0
    touched = 0

    for path in sorted(assets_dir.glob("*.png")):
        total += 1
        changed, pixel_count = process_image(path, args.threshold, args.edge_tolerance, args.brightness_floor, args.dry_run)
        if changed:
            touched += 1
            action = "would update" if args.dry_run else "updated"
            print(f"{action}: {path} ({pixel_count} pixels)")

    mode = "Dry run complete" if args.dry_run else "Done"
    print(f"{mode}. Checked {total} PNGs, {'would update' if args.dry_run else 'updated'} {touched}.")


if __name__ == "__main__":
    main()
