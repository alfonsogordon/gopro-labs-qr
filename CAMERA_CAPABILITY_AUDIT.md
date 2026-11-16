# Camera capability audit

Sources:
- GoPro Labs command language: https://gopro.github.io/labs/control/tech/
- GoPro Labs extensions: https://gopro.github.io/labs/control/extensions/
- GoPro Labs official firmware feature matrix: https://github.com/gopro/labs

## Source of truth
`cameraProfiles` in `app.js` is the runtime normalized camera capability registry. It combines `modelCapabilities`, `fpsByModel`, `labsSupport` and the provisional HERO9 `hero9Matrix`. Filtering must use this registry. These are **model-level candidates**, not fully verified recording combinations.

## Camera audit status

| Camera | Model-level resolutions/lenses | FPS list | Full resolution x FPS x lens x EIS | Labs feature support |
|---|---|---|---|---|
| HERO5 Session | provisional | provisional | NOT VERIFIED | partial |
| HERO7 Black | provisional | provisional | NOT VERIFIED | partial |
| HERO8 Black | provisional | provisional | NOT VERIFIED | partial |
| HERO9 Black | manufacturer manual | manufacturer manual | Resolution/FPS and lens rows populated; stabilization remains unverified | partial |
| HERO10 Black | provisional | provisional | NOT VERIFIED | partial |
| HERO10 Bones | provisional | provisional | NOT VERIFIED | partial |
| HERO11 Black | provisional | provisional | NOT VERIFIED | partial |
| HERO11 Black Mini | GoPro product specification | GoPro product specification | Resolution/FPS populated; lens/stabilization combinations unverified | partial; Mini exceptions |
| HERO12 Black | provisional | provisional | NOT VERIFIED | partial |
| HERO13 Black | provisional | provisional | NOT VERIFIED | partial |
| MAX | provisional | provisional | NOT VERIFIED | partial |
| MAX2 | provisional | provisional | NOT VERIFIED | partial |
| MISSION 1 | provisional | provisional | NOT VERIFIED | partial |
| MISSION 1 Pro | provisional | provisional | NOT VERIFIED | partial |
| MISSION 1 Pro ILS | provisional | provisional | NOT VERIFIED | partial |

## Validated against official command language
- Basic mode `mV`, resolution `r4T`, frame rate `p60`, lens `fW`, color `cF`, WB `w55`, and Labs `$BITR=150` are documented.
- Time-lapse interval `p.5` and night-photo exposure `e5` are documented.
- Non-MISSION ISO+shutter is `i16S180`; the minimum ISO cannot be appended as `M...` to that form.
- MISSION shutter uses `s180`, MISSION ISO range uses `i16`.
- HERO13 noise reduction uses `oN0/oN1/oN2`; MISSION uses distinct `dL/dM/dH` commands.
- HERO11 Mini and HERO10 Bones require special handling and should not inherit every feature of their full-size equivalents.

## Remaining blocking work
1. Collect manufacturer mode tables for each exact camera model and firmware, then populate per-resolution valid FPS, lens and HyperSmooth combinations.
2. Verify Labs extensions by camera, including partial support, firmware requirements and persistent vs temporary settings.
3. Test QR payloads against Labs parser/camera and create automated tests for invalid combinations.
4. Move all profile definitions into a dedicated versioned JSON module once schema and tests are stable.
5. Audit saved presets: existing index-based storage can shift when controls are inserted. Migrate to stable label-based keys without losing user presets.

Do not mark the app fully validated or advertise that invalid combinations are impossible until these steps pass.

## Validated recording matrix sources (16 November 2026)

- HERO9 Black: [GoPro HERO9 Black user manual, Tech Specs: Video, pp. 122–124](https://gopro.com/content/dam/help/hero9-black/manuals/HERO9Black_UM_ENG_REVA.pdf). Populated 5K, 4K, 4K 4:3, 2.7K, 2.7K 4:3, 1440p, 1080p resolution/FPS and the listed digital lenses. Some lens options differ at 4K high frame rate and 1080p 240fps. HyperSmooth level compatibility is **not** yet independently validated.
- HERO11 Black Mini: [GoPro official product specifications](https://gopro.com/en/us/shop/cameras/hero11-black-mini/CHDHF-111-master.html). Populated 5.3K 8:7, 16:9, 4:3; 4K 8:7, 16:9, 4:3; 2.7K 16:9, 4:3; 1080p. Lens-by-FPS and stabilization combinations remain **unverified**.
- Other 13 models: existing model-level candidate lists remain **unverified**, and the app must not present them as a complete compatibility matrix.
