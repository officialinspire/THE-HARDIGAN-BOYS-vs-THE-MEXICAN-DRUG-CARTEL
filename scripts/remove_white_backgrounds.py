#!/usr/bin/env python3
"""Convert near-white pixels in character assets to transparent.

Usage:
  python scripts/remove_white_backgrounds.py
  python scripts/remove_white_backgrounds.py --threshold 242 --dry-run
"""

from __future__ import annotations

import argparse
from pathlib import Path

try:
    from PIL import Image
except ModuleNotFoundError as exc:
    raise SystemExit("Pillow is required. Install with: pip install pillow") from exc


def process_image(path: Path, threshold: int, dry_run: bool) -> tuple[bool, int]:
    image = Image.open(path).convert("RGBA")
    data = image.getdata()

    changed_pixels = 0
    transformed = []
    for r, g, b, a in data:
        if r >= threshold and g >= threshold and b >= threshold and a > 0:
            transformed.append((r, g, b, 0))
            changed_pixels += 1
        else:
            transformed.append((r, g, b, a))

    if changed_pixels and not dry_run:
        image.putdata(transformed)
        image.save(path)

    return changed_pixels > 0, changed_pixels


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--threshold", type=int, default=238, help="RGB threshold treated as white (default: 238)")
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
        changed, pixel_count = process_image(path, args.threshold, args.dry_run)
        if changed:
            touched += 1
            action = "would update" if args.dry_run else "updated"
            print(f"{action}: {path} ({pixel_count} pixels)")

    mode = "Dry run complete" if args.dry_run else "Done"
    print(f"{mode}. Checked {total} PNGs, {'would update' if args.dry_run else 'updated'} {touched}.")


if __name__ == "__main__":
    main()
