# 3D Asset Credits & Licensing — APEX MOTORWORKS

This document records the origin, authorship, and license terms of the 3D vehicle asset integrated into the **APEX MOTORWORKS** demonstration website.

---

## Primary 3D Vehicle Model

- **Model Title:** Dodge Challenger (SRT Hellcat Body Configuration)
- **Original Author:** [OneSteven (Steven007)](https://sketchfab.com/Steven007)
- **Original Source URL:** [https://sketchfab.com/3d-models/dodge-challenger-ef40662c84eb4beb85acdfce5ac4f40e](https://sketchfab.com/3d-models/dodge-challenger-ef40662c84eb4beb85acdfce5ac4f40e)
- **Open Repository Mirror Used:** [https://github.com/fewwwww/hellcat.co/tree/master/public/dodge_challenger](https://github.com/fewwwww/hellcat.co/tree/master/public/dodge_challenger)
- **License:** [Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)](http://creativecommons.org/licenses/by-nc/4.0/)
- **Local Project Path:** `public/models/dodge_challenger.glb`

---

## Technical Processing & Integration Notes

1. **Format Optimization (`.gltf` + `.bin` + PNG textures → `.glb`):**
   - The original Sketchfab glTF 2.0 export (`scene.gltf`, `scene.bin`, `textures/Material.009_baseColor.png`, `textures/Material.009_normal.png`, `textures/grills_baseColor.png`, `textures/grills_normal.png`) was packed lossless into a single self-contained binary glTF file (`public/models/dodge_challenger.glb`, ~1.99 MB) so that it loads in a single HTTP request and works reliably under GitHub Pages project subdirectories (`/service3/`).
2. **Coordinate & Scale Calibration:**
   - The source model uses centimeter units (`100 units = 1.0 m`, overall length `5.01 m`, width `2.19 m`, height `1.50 m`).
   - In `src/three/carModel.ts`, the loaded scene is normalized to meter scale (`0.01`) and grounded flush onto the studio floor (`y = 0`).
3. **PBR Material Calibration:**
   - All 32 meshes (body shell, front split grille, quad halo LED headlight rings, smoked cabin glass, interior cockpit, rear LED tail lamp ribbon, twin exhaust tips, 4 multi-spoke alloy wheels with tread normal maps, slotted brake rotors, and 4 Brembo brake calipers) are preserved and enhanced with physically based `MeshPhysicalMaterial` / `MeshStandardMaterial` studio properties.

---

## Required Attribution Text

> "Dodge Challenger" (https://sketchfab.com/3d-models/dodge-challenger-ef40662c84eb4beb85acdfce5ac4f40e) by OneSteven (https://sketchfab.com/Steven007) is licensed under Creative Commons Attribution-NonCommercial 4.0 (http://creativecommons.org/licenses/by-nc/4.0/).

*Note for commercial deployment:* Because the asset is licensed under **CC BY-NC 4.0**, it is suitable for non-commercial portfolio, educational, and demonstration use. Before using the website in commercial advertising for a live business, either obtain commercial permission from the author or replace `public/models/dodge_challenger.glb` with a commercially licensed `.glb` asset.
