# GoPro Labs QR Creator reference audit

Reference: https://gopro.github.io/labs/control/custom/ (official GoPro QR Code Creator, page updated October 10, 2024).

This page is a **command and UI reference**, not a complete hardware resolution/FPS/lens compatibility matrix. Its superscript model annotations apply chiefly to HERO generations listed there, and should not automatically be transferred to MAX2 or MISSION cameras.

## Controls explicitly listed in the official QR creator

| Area | Controls to represent in LabsBuddy | Notes |
|---|---|---|
| Recording | Video, Performance, Endurance, Stationary; HERO12/13 Standard/HDR/Log; HERO10/11 presets | Mode/preset availability is camera dependent |
| Video | Resolution, FPS, HyperSmooth, digital lens, Max Lens Mod, zoom | Cross-field restrictions require manufacturer mode tables |
| Time-lapse | TimeWarp speed, time-lapse interval, night-lapse interval | Distinct controls; do not encode all as FPS |
| Photo | Burst style, RAW+JPEG, night shutter, Live Burst | Some modes require a preset created on the camera |
| Capture | Hindsight, duration, spot meter, exposure lock, wind reduction | Camera generation restrictions |
| Protune | Colour, bit depth, bitrate, white balance, ISO min, ISO max, shutter angle, EV, sharpness, RAW audio | ISO min and max are **separate controls** on official creator |
| Preferences | GPS, voice, QuickCapture, default mode, beeps, brightness, LEDs, orientation, auto-off, Wi-Fi, voice language | Verify exact encoded values against GoPro's JavaScript |
| Scheduling | Date/time, delayed capture, sunrise/sunset, motion triggers, GPS speed, repeat | More than a simple camera-setting dropdown |
| Advanced | Custom named presets, additional command input | Model- and firmware-specific |

## Important validation findings

1. Official QR Creator has **separate ISO Min and ISO Max** controls. LabsBuddy currently uses an ISO range selector and an ISO-linked shutter angle. Compare command generation to official implementation before claiming exact equivalence.
2. **Night-lapse photo and video** may require their respective presets to exist on camera. Merely generating a mode QR is insufficient.
3. **RAW Audio** includes Off in addition to Low/Medium/High.
4. **Time-lapse and night-lapse intervals** are separate controls with different options.
5. **Video duration** and **wind reduction** are missing from LabsBuddy's current UI.
6. The creator includes **burst style, TimeWarp speed, Max Lens Mod, spot metering, delayed capture, GPS speed triggers, motion detection** and many other controls not yet implemented.
7. Model superscripts on the official page are a starting point, **not** a full compatibility matrix for all 15 supported cameras.

## Next steps

- Inspect GoPro's source JavaScript to map each setting to the exact QR token.
- Add one command-definition record per control with its supported models, input type, encoding, and source URL.
- Validate combinations using the existing `data/recording-matrix.json` rather than inferring them from the command reference.
- Add test vectors comparing LabsBuddy output against GoPro's official QR creator.
