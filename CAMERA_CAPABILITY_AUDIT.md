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
| HERO9 Black | provisional | provisional | 3 provisional rules only | partial |
| HERO10 Black | provisional | provisional | NOT VERIFIED | partial |
| HERO10 Bones | provisional | provisional | NOT VERIFIED | partial |
| HERO11 Black | provisional | provisional | NOT VERIFIED | partial |
| HERO11 Black Mini | provisional | provisional | NOT VERIFIED | partial; Mini exceptions |
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
