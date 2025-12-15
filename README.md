# iion VAST Tag

Self-hosted VAST tag for GAM video ad integration.

## Quick Start

1. Enable GitHub Pages on this repo (Settings → Pages → Source: main branch)
2. Your tag URL will be: `https://[username].github.io/iion-vast-tag/vast.xml`
3. Use this URL as the VAST Tag in GAM
4. Swap creatives by replacing files in `creatives/current/`

## Swapping Creatives

1. Replace `creatives/current/vast.xml` with your VAST XML
2. Place video files (MP4, WebM) in `creatives/current/`
3. Update MediaFile URLs in vast.xml to match your video filenames
4. Commit and push
5. Cache-busting handled via VAST wrapper

## Structure

```
├── vast.xml                # Entry point wrapper (GAM points here) - DO NOT MODIFY
├── creatives/
│   └── current/
│       ├── vast.xml        # Your active VAST creative
│       ├── video.mp4       # Video file(s)
│       └── companion/      # Companion banner images (optional)
└── archive/                # Store old creatives for reference
```

## Supported Formats

- VAST 2.0, 3.0, 4.0, 4.2
- Video: MP4 (H.264), WebM (VP9)
- Companion: PNG, JPG, GIF
