#!/usr/bin/env python3
"""Reproducible, programmatic pixel-art placeholder pack (Python 3 + Pillow).

No mockup pixels are copied. Every operation is on the native 32px grid; no
resampling, anti-aliasing, gradients or text are used in the game atlas.
Run --check to validate the committed atlas without overwriting it.
"""
import argparse
import hashlib
import json
import random
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public/assets/academy/tilesets"
QA = ROOT / "artifacts/academy/asset-pack-01"
TILE = 32
COLS = 8
GRASS = ["#7eaa58", "#76a253", "#87b260", "#6e9a4c"]
PATH = ["#d6c7a9", "#dcccaf", "#cfbea0", "#d9c9ac"]
PLAZA = ["#dcd7c9", "#d7d2c5", "#e0dacd", "#d9d3c6"]
MORTAR = {"path": "#9e9079", "plaza": "#aaa79b"}


def grass(variant):
    image = Image.new("RGBA", (TILE, TILE), GRASS[0])
    pixels = image.load()
    for y in range(TILE):
        for x in range(TILE):
            # Shared toroidal edge texture, with low-contrast 2px clusters.
            gx, gy = (x % 31) // 2, (y % 31) // 2
            value = (gx * 73 + gy * 151 + gx * gy * 13) % 101
            pixels[x, y] = tuple(int(GRASS[1 if value < 11 else 2 if value > 94 else 0][i:i + 2], 16) for i in (1, 3, 5)) + (255,)
    draw = ImageDraw.Draw(image)
    rng = random.Random(7100 + variant)
    for _ in range(9):
        x, y = rng.randrange(4, 27), rng.randrange(5, 27)
        color = rng.choice([GRASS[1], GRASS[2]])
        draw.point([(x, y), (x + 2, y), (x + 1, y - 1)], fill=color)
    return image


def paving(variant, material):
    image = Image.new("RGBA", (TILE, TILE), MORTAR[material])
    draw = ImageDraw.Draw(image)
    rng = random.Random((1600 if material == "path" else 3200) + variant)
    if material == "path":
        for x, y in [(1, 1), (17, 1), (1, 17), (17, 17)]:
            draw.polygon([(x + 2, y), (x + 11, y), (x + 13, y + 2), (x + 13, y + 11), (x + 11, y + 13), (x + 2, y + 13), (x, y + 11), (x, y + 2)], fill=rng.choice(PATH))
            draw.line([(x + 3, y + 1), (x + 10, y + 1)], fill="#eee1c5")
            draw.line([(x + 1, y + 3), (x + 1, y + 10)], fill="#e5d7ba")
            draw.line([(x + 3, y + 12), (x + 10, y + 12)], fill="#b9aa8d")
            draw.line([(x + 12, y + 3), (x + 12, y + 10)], fill="#b9aa8d")
            # Fine chips stay inside the stone, away from shared tile edges.
            draw.point((x + rng.randrange(4, 10), y + rng.randrange(4, 10)), fill="#c3b397")
    else:
        draw.polygon([(3, 1), (28, 1), (30, 3), (30, 28), (28, 30), (3, 30), (1, 28), (1, 3)], fill=rng.choice(PLAZA))
        draw.line([(4, 2), (27, 2)], fill="#f0ecdf")
        draw.line([(2, 4), (2, 27)], fill="#e9e4d8")
        draw.line([(4, 29), (27, 29)], fill="#bebbad")
        draw.line([(29, 4), (29, 27)], fill="#c5c0b3")
        for _ in range(5):
            x, y = rng.randrange(5, 27), rng.randrange(5, 27)
            draw.line([(x, y), (x + 1, y)], fill=rng.choice(["#d0cabc", "#e5dfd1"]))
    return image


def edge_tile(material, mask):
    """N=1, E=2, S=4, W=8. Transparent exterior reveals the grass layer."""
    image = paving(0, material)
    alpha = Image.new("L", (TILE, TILE), 0)
    draw = ImageDraw.Draw(alpha)
    north, east, south, west = (bool(mask & bit) for bit in (1, 2, 4, 8))
    left, top = (0 if west else 3), (0 if north else 3)
    right, bottom = (31 if east else 28), (31 if south else 28)
    draw.rectangle((left, top, right, bottom), fill=255)
    # Pixel-cut convex corners. These are intentional mask pixels, not filtering.
    for absent, corner in [
        (not north and not west, "nw"), (not north and not east, "ne"),
        (not south and not west, "sw"), (not south and not east, "se"),
    ]:
        if absent:
            for row in range(2):
                for col in range(2 - row):
                    x = left + col if "w" in corner else right - col
                    y = top + row if "n" in corner else bottom - row
                    alpha.putpixel((x, y), 0)
    image.putalpha(alpha)
    pixels = image.load()
    for y in range(TILE):
        for x in range(TILE):
            if not alpha.getpixel((x, y)):
                continue
            if not north and y == top or not west and x == left:
                pixels[x, y] = (235, 225, 201, 255) if material == "path" else (236, 232, 218, 255)
            elif not south and y == bottom or not east and x == right:
                pixels[x, y] = (148, 134, 108, 255) if material == "path" else (155, 151, 137, 255)
    return image


def inner_corner(material, corner):
    image = Image.new("RGBA", (TILE, TILE), (0, 0, 0, 0))
    base = grass(0)
    for row in range(5):
        for col in range(5):
            x = col if "w" in corner else 31 - col
            y = row if "n" in corner else 31 - row
            if col + row < 4:
                image.putpixel((x, y), base.getpixel((x, y)))
            elif col + row == 4:
                color = (158, 144, 121, 255) if material == "path" else (170, 167, 155, 255)
                image.putpixel((x, y), color)
    return image


def build():
    images, tiles = [], []

    def add(image, name, material, role, **extra):
        tile_id = len(images)
        images.append(image)
        props = {"name": name, "material": material, "role": role, **extra}
        tiles.append({"id": tile_id, "type": material, "properties": [{"name": key, "type": "int" if isinstance(value, int) else "string", "value": value} for key, value in props.items()]})

    for i in range(8):
        add(grass(i), f"grass_{i:02}", "grass", "fill", assetId="TER-001" if i == 0 else "TER-002")
    for i in range(8):
        add(paving(i, "path"), f"path_fill_{i:02}", "path", "fill", assetId="TER-003")
    for mask in range(16):
        add(edge_tile("path", mask), f"path_edge_{mask:02}", "path", "edge", neighborMask=mask, assetId="TER-004")
    for i in range(8):
        add(paving(i, "plaza"), f"plaza_fill_{i:02}", "plaza", "fill", assetId="TER-005")
    for mask in range(16):
        add(edge_tile("plaza", mask), f"plaza_edge_{mask:02}", "plaza", "edge", neighborMask=mask, assetId="TER-006")
    for material in ["path", "plaza"]:
        for corner in ["nw", "ne", "sw", "se"]:
            add(inner_corner(material, corner), f"{material}_inner_{corner}", material, "inner-corner", corner=corner, assetId="TER-004" if material == "path" else "TER-006")
    atlas = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    for tile_id, image in enumerate(images):
        atlas.paste(image, ((tile_id % COLS) * TILE, (tile_id // COLS) * TILE))
    tileset = {"type": "tileset", "version": "1.10", "name": "academy-terrain-01", "tilewidth": TILE, "tileheight": TILE, "columns": COLS, "tilecount": len(images), "margin": 0, "spacing": 0, "image": "terrain.png", "imagewidth": 256, "imageheight": 256, "tiles": tiles}
    return atlas, tileset


def validate(atlas, metadata):
    assert atlas.mode == "RGBA" and atlas.size == (256, 256)
    assert metadata["tilewidth"] == metadata["tileheight"] == TILE
    assert metadata["tilecount"] == 64 and metadata["columns"] == COLS

    def tile(i):
        x, y = i % COLS * TILE, i // COLS * TILE
        return atlas.crop((x, y, x + TILE, y + TILE))

    pairs = 0
    for start in [0, 8, 32]:
        for a in range(start, start + 8):
            first = tile(a)
            assert first.getchannel("A").getextrema() == (255, 255)
            for b in range(start, start + 8):
                second = tile(b)
                assert list(first.crop((31, 0, 32, 32)).getdata()) == list(second.crop((0, 0, 1, 32)).getdata()), (a, b, "horizontal")
                assert list(first.crop((0, 31, 32, 32)).getdata()) == list(second.crop((0, 0, 32, 1)).getdata()), (a, b, "vertical")
                pairs += 2
    connected_pairs = 0
    # All connected edges match along the 22px core. Corner pixels depend on
    # diagonal neighbours and are handled by the four explicit overlay layers.
    for fill_start, edge_start in [(8, 16), (32, 40)]:
        for horizontal in [True, False]:
            first_bit, second_bit = (2, 8) if horizontal else (4, 1)
            first_ids = list(range(fill_start, fill_start + 8)) + [edge_start + m for m in range(16) if m & first_bit]
            second_ids = list(range(fill_start, fill_start + 8)) + [edge_start + m for m in range(16) if m & second_bit]
            for a in first_ids:
                for b in second_ids:
                    left, right = tile(a), tile(b)
                    for p in range(5, 27):
                        assert left.getpixel((31, p) if horizontal else (p, 31)) == right.getpixel((0, p) if horizontal else (p, 0)), (a, b, "connected core")
                    connected_pairs += 1
    # Every cardinal combination exposes a solid centre and all connected arms.
    for start in [16, 40]:
        for mask in range(16):
            alpha = tile(start + mask).getchannel("A")
            assert alpha.getpixel((16, 16)) == 255
            for bit, point in [(1, (16, 0)), (2, (31, 16)), (4, (16, 31)), (8, (0, 16))]:
                assert (alpha.getpixel(point) == 255) == bool(mask & bit)
    assert set(atlas.getchannel("A").getdata()) <= {0, 255}, "Anti-aliased alpha detected"
    colors = set(atlas.getdata())
    return {"status": "automated-checks-passed-visual-review-pending", "tileSize": [32, 32], "atlasSize": list(atlas.size), "tileCount": 64, "fillEdgeComparisons": pairs, "connectedEdgeCoreComparisons": connected_pairs, "edgeMasksChecked": 32, "alphaValues": [0, 255], "paletteColorsIncludingTransparent": len(colors), "note": "Matching edge pixels and binary alpha are automated checks, not a production-art approval. Inspect the in-game screenshots and repeated surfaces."}


def reviews(atlas):
    # Three adjacent 8x8 mosaics exercise all variants without an obvious sequence.
    review = Image.new("RGBA", (768, 256), "#fff8f3")
    for group, start in enumerate([0, 8, 32]):
        for y in range(8):
            for x in range(8):
                i = start + (x * 5 + y * 3 + x * y) % 8
                sx, sy = i % COLS * TILE, i // COLS * TILE
                review.paste(atlas.crop((sx, sy, sx + TILE, sy + TILE)), (group * 256 + x * TILE, y * TILE))
    review.resize((1536, 512), Image.Resampling.NEAREST).save(QA / "repeat-review.png")
    sheet = Image.new("RGBA", (272, 272), "#fff8f3")
    for i in range(64):
        x, y = i % COLS * TILE, i // COLS * TILE
        sheet.alpha_composite(atlas.crop((x, y, x + TILE, y + TILE)), (i % COLS * 34, i // COLS * 34))
    sheet.resize((816, 816), Image.Resampling.NEAREST).save(QA / "tileset-review.png")


def review_map(atlas, write=False):
    path = ROOT / "public/assets/academy/maps/academy_plaza_terrain.json"
    if not path.exists():
        return None
    data = json.loads(path.read_text())
    assert (data["width"], data["height"], data["tilewidth"], data["tileheight"]) == (80, 60, 32, 32)
    image = Image.new("RGBA", (2560, 1920), (0, 0, 0, 0))
    tiles = [atlas.crop((i % COLS * TILE, i // COLS * TILE, i % COLS * TILE + TILE, i // COLS * TILE + TILE)) for i in range(64)]
    for layer in data["layers"]:
        assert len(layer["data"]) == 80 * 60
        for i, gid in enumerate(layer["data"]):
            if gid:
                image.alpha_composite(tiles[gid - 1], (i % 80 * TILE, i // 80 * TILE))
    assert image.getchannel("A").getextrema() == (255, 255), "Transparent gap in composed terrain map"
    if write:
        image.save(QA / "terrain-map-review.png")
    return {"size": list(image.size), "alphaMin": 255, "alphaMax": 255, "visualLayers": len(data["layers"])}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--review-map", action="store_true")
    args = parser.parse_args()
    atlas, metadata = build()
    if args.check:
        stored = Image.open(ASSETS / "terrain.png").convert("RGBA")
        assert stored.tobytes() == atlas.tobytes(), "Committed PNG differs from the deterministic generator"
        assert json.loads((ASSETS / "terrain.tsj").read_text()) == metadata
        atlas = stored
    else:
        ASSETS.mkdir(parents=True, exist_ok=True)
        QA.mkdir(parents=True, exist_ok=True)
        atlas.save(ASSETS / "terrain.png", optimize=False)
        (ASSETS / "terrain.tsj").write_text(json.dumps(metadata, indent=2) + "\n")
        reviews(atlas)
    report = validate(atlas, metadata)
    map_report = review_map(atlas, write=args.review_map)
    if map_report:
        report["composedMap"] = map_report
    report["pngSha256"] = hashlib.sha256((ASSETS / "terrain.png").read_bytes()).hexdigest()
    if not args.check or args.review_map:
        (QA / "tile-qa.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
