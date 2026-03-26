#!/usr/bin/env python3
"""
Micodex NFT Image Assembler

Composites NFT trait layer images onto template layers (background, body, arms)
to generate preview images for the Mibera Codex. Each trait consists of one or
more PNG layers at specific z-indices; the assembler stacks them in order to
produce a final character portrait as a WebP file.

Originally developed in the micodex-images repo (github.com/0xHoneyJar/micodex-images).
Copied into the codex at _codex/scripts/ during Cycle 019 (Trait Image Embedding)
so that future sessions can generate images without needing the external repo.

Source files (not checked into this repo):
    Templates:  ~/Downloads/micodex images/  (arms.PNG, body.PNG, background.PNG — 1848x2500)
    Layers:     ~/Desktop/Mibera_ Actually Final/  (main trait layers, z-indexed folders)
    VM layers:  ~/Downloads/Mibera_ Actually Final/new stuff for da vm/

Output is uploaded to s3://mibera/traits/ and embedded into codex entries
by _codex/scripts/embed-images.py.

Usage:
    python3 _codex/scripts/micodex-assembler.py \\
        --templates "~/Downloads/micodex images" \\
        --traits "~/Desktop/Mibera_ Actually Final" \\
        --output "~/micodex-images/output"

    # VM-only layers:
    python3 _codex/scripts/micodex-assembler.py \\
        --templates "~/Downloads/micodex images" \\
        --traits "~/Downloads/Mibera_ Actually Final/new stuff for da vm" \\
        --output "/tmp/vm-images"

Dependencies:
    pip install Pillow tqdm

Note: This is the ONE exception to the codex's stdlib-only Python convention.
Image compositing requires Pillow; there is no stdlib alternative.
"""

# /// script
# requires-python = ">=3.11"
# dependencies = ["Pillow>=10.0", "tqdm>=4.65"]
# ///

from __future__ import annotations

import argparse
import re
import sys
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterator

from PIL import Image
from tqdm import tqdm


# =============================================================================
# Data Models
# =============================================================================


@dataclass
class Layer:
    """A single image layer with z-index."""

    path: Path
    z_index: int

    def load(self) -> Image.Image:
        """Load image as RGBA."""
        return Image.open(self.path).convert("RGBA")


@dataclass
class Trait:
    """A trait consisting of one or more layers."""

    name: str  # Base name (output filename)
    category: str  # Folder category (e.g., "eyes", "hats")
    layers: list[Layer] = field(default_factory=list)

    def add_layer(self, path: Path, z_index: int) -> None:
        self.layers.append(Layer(path, z_index))

    @property
    def output_name(self) -> str:
        return f"{self.name}.webp"


@dataclass
class Templates:
    """The three template layers with fixed z-indices."""

    background: Image.Image  # z=0
    body: Image.Image  # z=20
    arms: Image.Image  # z=200

    BACKGROUND_Z = 0
    BODY_Z = 20
    ARMS_Z = 200


# =============================================================================
# Z-Index Parser
# =============================================================================


class ZIndexParser:
    """Parse z-index from folder and file names."""

    # Pattern for folder names: eyes__z69, hats__z160 (NO HAIR), etc.
    FOLDER_PATTERN = re.compile(r"__z(-?\d+)")

    # Pattern for file z-index override: Blue Suit__z85.PNG or Blue Suit_z85.PNG
    FILE_Z_PATTERN = re.compile(r"_z(-?\d+)\.[pP][nN][gG]$")

    # Pattern for _FRONT suffix (scene foreground layers)
    FRONT_PATTERN = re.compile(r"_FRONT\.[pP][nN][gG]$", re.IGNORECASE)

    # Pattern for rarity weight to strip: Angelic__w4.PNG
    FILE_W_PATTERN = re.compile(r"__w\d+")

    # Folders that should be excluded (background-like or work files)
    EXCLUDED_FOLDERS = {
        "simple", "simple background", "simple black", "simple blue",
        "simple brown", "simple green", "simple purple", "simple red",
        "simple white", "simple yellow", "simples for shadows",
    }

    # Default z-indices for folders without explicit patterns
    # Based on what the traits appear to be
    DEFAULT_Z_INDICES = {
        # Constellations go behind body but above background (z=10)
        "constellations": 10,
        "overlay stuff": 180,
        "elements": 180,
        "molecule (new)": 180,
        "moon": 180,
        "ranking": 180,
        "rising": 180,
        "sun": 180,
        # Masks go at face level (z=100)
        "masks": 100,
        "mask": 100,
        # Items/accessories
        "items": 170,
        "hat fix": 160,
        "hats": 160,
        # Hair
        "kigu hair": 70,
        "hair": 70,
        # Eyes/face
        "eyes": 69,
        "mouth": 90,
        "mouth special": 90,
        "face acc": 60,
        "face accessories": 60,
        # Glasses/earrings/necklaces
        "glasses": 140,
        "earrings": 130,
        "necklaces": 45,
        # Shirts
        "shirts": 50,
        # Overlays
        "overlays": 180,
        # Misc - default to items level
        "mibera updates part twoooo": 170,
        "new stuff for da vm": 170,
        "updated partners": 170,
        "jani mask 1-1s": 100,
        "cypherpunk floppies": 160,
        "bong bears": 170,
        # Special crossover characters - on top of everything
        "miladys": 250,
        "miladys and json": 250,
        # Tattoos - on top of everything
        "tattoos": 250,
    }

    @classmethod
    def from_folder(cls, folder_name: str) -> int | None:
        """Extract z-index from folder name.

        Examples:
            'eyes__z69' → 69
            'hats__z160 (NO HAIR)' → 160
            'hair__z70 (HATS)' → 70
            'Constellations' → 180 (inferred)
            'simple' → None (excluded)
        """
        # Check if excluded
        if folder_name.lower() in cls.EXCLUDED_FOLDERS:
            return None

        # Try explicit pattern first
        match = cls.FOLDER_PATTERN.search(folder_name)
        if match:
            return int(match.group(1))

        # Try to infer from folder name
        folder_lower = folder_name.lower()
        if folder_lower in cls.DEFAULT_Z_INDICES:
            return cls.DEFAULT_Z_INDICES[folder_lower]

        # Try partial matches for nested folders
        for key, z in cls.DEFAULT_Z_INDICES.items():
            if key in folder_lower or folder_lower in key:
                return z

        return None

    @classmethod
    def from_file(cls, filename: str) -> int | None:
        """Extract z-index override from filename.

        Examples:
            'Blue Suit__z85.PNG' → 85
            'Blue Suit_z85.PNG' → 85
            'Classic Black__z-32.png' → -32
            'Blue Suit.PNG' → None
            'pacioli_FRONT.PNG' → None (handled separately)
        """
        # _FRONT files don't have explicit z-index (handled by is_front_layer)
        if cls.FRONT_PATTERN.search(filename):
            return None
        match = cls.FILE_Z_PATTERN.search(filename)
        return int(match.group(1)) if match else None

    @classmethod
    def is_front_layer(cls, filename: str) -> bool:
        """Check if file is a _FRONT layer (scene foreground)."""
        return bool(cls.FRONT_PATTERN.search(filename))

    @classmethod
    def base_name(cls, filename: str) -> str:
        """Extract base trait name, stripping __w, __z, _z, and _FRONT suffixes.

        Examples:
            'Angelic__w4.PNG' → 'Angelic'
            'Blue Suit 2__z85.PNG' → 'Blue Suit 2'
            'Blue Suit 2_z85.PNG' → 'Blue Suit 2'
            'SS1_milady_Blue Suit 2.PNG' → 'SS1_milady_Blue Suit 2'
            'pacioli_FRONT.PNG' → 'pacioli'
        """
        # Remove extension
        name = Path(filename).stem

        # Remove _FRONT suffix
        name = re.sub(r"_FRONT$", "", name, flags=re.IGNORECASE)

        # Remove __w{weight} suffix
        name = cls.FILE_W_PATTERN.sub("", name)

        # Remove _z{index} or __z{index} suffix (match one or two underscores)
        name = re.sub(r"_+z-?\d+$", "", name)

        return name.strip()


# =============================================================================
# Trait Discovery
# =============================================================================


class TraitDiscoverer:
    """Discover and group traits from directory structure."""

    def __init__(self, traits_dir: Path):
        self.traits_dir = traits_dir
        self.parser = ZIndexParser

    # Z-index for _FRONT layers (above everything including arms)
    FRONT_Z = 250

    # Z-index for sleeve layers (above arms at z=200)
    SLEEVE_Z = 210

    def discover(self) -> list[Trait]:
        """Scan directories and return grouped traits."""
        # Group files by (category, base_name) to handle multi-layer traits
        trait_groups: dict[str, Trait] = {}
        warnings: list[str] = []

        for folder in self._scan_folders():
            folder_z = self.parser.from_folder(folder.name)
            category = self._extract_category(folder.name)
            is_shirt_folder = "shirt" in folder.name.lower()
            is_body_folder = "body" in folder.name.lower()
            is_tattoo_folder = "tattoo" in folder.name.lower()

            # Find all PNG files (case-insensitive)
            png_files = list(folder.glob("*.PNG")) + list(folder.glob("*.png"))

            for file in png_files:
                base_name = self.parser.base_name(file.name)
                file_z = self.parser.from_file(file.name)
                is_front = self.parser.is_front_layer(file.name)

                # Determine z-index
                if is_front:
                    # _FRONT layers go above everything
                    z_index = self.FRONT_Z
                elif file_z is not None:
                    # File has explicit z-index override
                    # For shirt sleeve layers (z=85), put above arms
                    if is_shirt_folder and file_z == 85:
                        z_index = self.SLEEVE_Z
                    # For body/skin arms layers (z=80), put above template arms
                    elif is_body_folder and file_z == 80:
                        z_index = self.SLEEVE_Z
                    # Negative z-index means "behind body" - put between background and body
                    elif file_z < 0:
                        z_index = 10  # Between background (z=0) and body (z=20)
                    else:
                        z_index = file_z
                else:
                    # Use folder z-index
                    z_index = folder_z

                # Tattoos always on top of everything
                if is_tattoo_folder:
                    z_index = 250

                if z_index is None:
                    warnings.append(f"No z-index for: {file.relative_to(self.traits_dir)}")
                    continue

                # Group by (category, base_name) to avoid collisions between folders
                key = f"{category}:{base_name}"
                if key not in trait_groups:
                    trait_groups[key] = Trait(name=base_name, category=category)
                trait_groups[key].add_layer(file, z_index)

        # Print warnings
        if warnings:
            print(f"Warnings: {len(warnings)} files skipped (no z-index)")
            for w in warnings[:5]:
                print(f"  - {w}")
            if len(warnings) > 5:
                print(f"  ... and {len(warnings) - 5} more")

        return list(trait_groups.values())

    def _scan_folders(self) -> Iterator[Path]:
        """Recursively find all folders containing PNGs."""
        for item in self.traits_dir.rglob("*"):
            if item.is_dir():
                # Check if folder has PNG files
                if list(item.glob("*.PNG")) or list(item.glob("*.png")):
                    yield item

    def _extract_category(self, folder_name: str) -> str:
        """Extract category from folder name.

        'eyes__z69' → 'eyes'
        'hats__z160 (NO HAIR)' → 'hats'
        'shirts__z50 (LONG)' → 'shirts'
        """
        # Split on __z and take the first part
        parts = folder_name.split("__z")
        base = parts[0].strip()

        # Also strip parenthetical variants
        base = re.sub(r"\s*\([^)]*\)$", "", base)

        return base


# =============================================================================
# Composition Engine
# =============================================================================


class CompositionEngine:
    """Composite layers to create final images."""

    def __init__(self, templates: Templates):
        self.templates = templates
        self.canvas_size = templates.background.size  # (1848, 2500)

    def render(self, trait: Trait) -> Image.Image:
        """Render a single trait with all its layers onto templates."""
        # Create fresh canvas
        canvas = Image.new("RGBA", self.canvas_size, (0, 0, 0, 0))

        # Collect all layers with their z-indices
        all_layers: list[tuple[int, Image.Image]] = [
            (Templates.BACKGROUND_Z, self.templates.background),
            (Templates.BODY_Z, self.templates.body),
        ]

        # Add trait layers
        for layer in trait.layers:
            img = layer.load()
            # Ensure same size as canvas
            if img.size != self.canvas_size:
                img = img.resize(self.canvas_size, Image.Resampling.LANCZOS)
            all_layers.append((layer.z_index, img))

        # Add arms on top
        all_layers.append((Templates.ARMS_Z, self.templates.arms))

        # Sort by z-index (lowest first = bottom of stack)
        all_layers.sort(key=lambda x: x[0])

        # Composite in order
        for z_index, img in all_layers:
            canvas = Image.alpha_composite(canvas, img)

        return canvas


# =============================================================================
# Output Writer
# =============================================================================


class OutputWriter:
    """Write rendered images as WebP."""

    def __init__(self, output_dir: Path, quality: int = 95):
        self.output_dir = output_dir
        self.quality = quality
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def save(self, image: Image.Image, trait: Trait) -> Path:
        """Save image as WebP, return output path."""
        output_path = self.output_dir / trait.output_name
        image.save(
            output_path,
            "WEBP",
            quality=self.quality,
            lossless=False,  # Near-lossless with high quality
            method=4,  # Balanced compression speed/quality
        )
        return output_path


# =============================================================================
# Template Loader
# =============================================================================


def load_templates(templates_dir: Path) -> Templates:
    """Load and validate template images."""
    expected_size = (1848, 2500)

    # Find template files (case-insensitive)
    def find_template(name: str) -> Path:
        for ext in [".PNG", ".png"]:
            path = templates_dir / f"{name}{ext}"
            if path.exists():
                return path
        raise FileNotFoundError(f"Template not found: {name}.PNG in {templates_dir}")

    bg_path = find_template("background")
    body_path = find_template("body")
    arms_path = find_template("arms")

    bg = Image.open(bg_path).convert("RGBA")
    body = Image.open(body_path).convert("RGBA")
    arms = Image.open(arms_path).convert("RGBA")

    # Validate dimensions
    for img, name in [(bg, "background"), (body, "body"), (arms, "arms")]:
        if img.size != expected_size:
            raise ValueError(
                f"{name}.PNG has size {img.size}, expected {expected_size}"
            )

    return Templates(background=bg, body=body, arms=arms)


# =============================================================================
# CLI
# =============================================================================


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Composite NFT trait images onto template layers",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python micodex_assembler.py \\
        --templates "/Users/gumi/Downloads/micodex images" \\
        --traits "/Users/gumi/Desktop/Mibera_ Actually Final" \\
        --output "./output"
""",
    )
    parser.add_argument(
        "--templates",
        "-t",
        type=Path,
        required=True,
        help="Directory containing arms.PNG, body.PNG, background.PNG",
    )
    parser.add_argument(
        "--traits",
        "-i",
        type=Path,
        required=True,
        help="Directory containing trait folders (e.g., eyes__z69/)",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=Path,
        required=True,
        help="Output directory for WebP files",
    )
    parser.add_argument(
        "--quality",
        "-q",
        type=int,
        default=95,
        help="WebP quality (1-100, default: 95)",
    )

    args = parser.parse_args()

    # Validate paths
    if not args.templates.is_dir():
        print(f"ERROR: Templates directory not found: {args.templates}")
        return 2

    if not args.traits.is_dir():
        print(f"ERROR: Traits directory not found: {args.traits}")
        return 2

    # Load templates
    print(f"Loading templates from: {args.templates}")
    try:
        templates = load_templates(args.templates)
        print(f"  ✓ Loaded templates ({templates.background.size[0]}x{templates.background.size[1]})")
    except (FileNotFoundError, ValueError) as e:
        print(f"ERROR: {e}")
        return 2

    # Discover traits
    print(f"\nDiscovering traits from: {args.traits}")
    discoverer = TraitDiscoverer(args.traits)
    traits = discoverer.discover()
    print(f"  ✓ Discovered {len(traits)} traits")

    if not traits:
        print("ERROR: No traits found")
        return 2

    # Show sample of multi-layer traits
    multi_layer = [t for t in traits if len(t.layers) > 1]
    if multi_layer:
        print(f"\n  Multi-layer traits: {len(multi_layer)}")
        for t in multi_layer[:3]:
            layers_info = ", ".join(f"z={l.z_index}" for l in sorted(t.layers, key=lambda x: x.z_index))
            print(f"    - {t.name} ({layers_info})")
        if len(multi_layer) > 3:
            print(f"    ... and {len(multi_layer) - 3} more")

    # Process
    print(f"\nRendering to: {args.output}")
    engine = CompositionEngine(templates)
    writer = OutputWriter(args.output, args.quality)

    successes = 0
    failures: list[tuple[str, str]] = []

    for trait in tqdm(traits, desc="Rendering", unit="trait"):
        try:
            image = engine.render(trait)
            writer.save(image, trait)
            successes += 1
        except Exception as e:
            failures.append((trait.name, str(e)))

    # Summary
    print(f"\n{'='*50}")
    print(f"Complete: {successes} succeeded, {len(failures)} failed")

    if failures:
        print("\nFailures:")
        for name, error in failures[:10]:
            print(f"  ✗ {name}: {error}")
        if len(failures) > 10:
            print(f"  ... and {len(failures) - 10} more")
        return 1

    print(f"\nOutput: {args.output.resolve()}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
