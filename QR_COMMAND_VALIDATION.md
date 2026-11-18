# QR command validation status

Reference: https://gopro.github.io/labs/control/custom/

This is a code-level audit, **not** physical-camera validation. The official custom QR page describes supported controls but the rendered page does not independently establish the command encoding for every control.

## Current findings

- QR rendering uses `QRCode(...,{text:code,...})`. This passes the displayed command string to the QR library, but an independent QR decode round-trip has not yet been completed.
- The app concatenates all selected option tokens without separators. This needs comparison against official generated QR payloads, including mixed settings and Labs extension commands.
- HERO9 2.7K 4:3 recording matrix currently lists 50/60fps. The app now uses that row directly for FPS choices.
- Shutter angle plus ISO range is transformed from `i<max>M<min>` to `i<max>S<angle>`; the selected minimum ISO is lost. This is flagged in the UI pending a confirmed official encoding.
- The app's 'Leave unchanged' choices omit the corresponding token. For resolution with no FPS chosen, the camera may retain its prior FPS.
- `labs-feature-matrix.json` expresses feature compatibility, **not command-token correctness**. Grouped and partial support require separate model validation.
- HERO11 Mini, MAX2, and HERO9 must be tested on actual Labs firmware before declaring device-level success.

## Validation acceptance criteria

1. For every supported control, record official documentation URL, generated reference payload, expected behavior, camera/firmware, and status.
2. Compare LabsBuddy's command payload byte-for-byte with an official reference for the same settings.
3. Decode a generated QR and assert that it exactly matches the displayed payload.
4. Check every recorded resolution/FPS/lens/stabilization combination against the recording matrix, and reject invalid combinations when coverage is complete.
5. Scan representative QR codes on HERO9, HERO11 Mini, and MAX2; confirm the actual camera settings, including mixed-setting QR codes.
6. Mark a control 'verified' only after the relevant evidence is recorded.

Until these checks pass, treat all QR output as experimental.
