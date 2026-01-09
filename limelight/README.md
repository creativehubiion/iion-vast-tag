# Limelight Inc. Rewarded Video Ad Template

Interactive rewarded video ads for the Limelight Inc. programmatic marketplace using VAST 4.0 with HTML5 companion end cards.

## Quick Start

### 1. Deploy to GitHub Pages

```bash
# Commit and push all files
git add limelight/
git commit -m "Add Limelight rewarded video ad creative"
git push origin master
```

Your assets will be available at:
```
https://creativehubiion.github.io/iion-vast-tag/limelight/vast-template.xml
```

### 2. Test Locally

```bash
# Start a local server (Python 3)
cd limelight
python -m http.server 8000

# Open in browser
http://localhost:8000/test-player.html
```

### 3. Submit to Limelight

Use this VAST tag URL in your Limelight campaign:
```
https://creativehubiion.github.io/iion-vast-tag/limelight/vast-template.xml
```

---

## File Structure

```
limelight/
├── vast-template.xml    # VAST 4.0 XML (submit this URL to Limelight)
├── endcard.html         # Interactive HTML5 end card
├── endcard.css          # End card styling
├── endcard.js           # End card interactivity + tracking
├── test-player.html     # Local testing tool
├── assets/              # Optional: Store images here
└── README.md            # This file
```

---

## Customization Guide

### Step 1: Update Video

The template uses a 15-second video. To change it:

1. Upload your video to the `limelight/` folder
2. Edit `vast-template.xml`, find `<MediaFile>` and update the URL:

```xml
<MediaFile delivery="progressive" type="video/mp4" width="1280" height="720" ...>
  <![CDATA[https://creativehubiion.github.io/iion-vast-tag/limelight/YOUR_VIDEO.mp4]]>
</MediaFile>
```

3. Update `<Duration>` to match your video length:
```xml
<Duration>00:00:15</Duration>  <!-- Format: HH:MM:SS -->
```

### Step 2: Update End Card

Edit `endcard.js` and modify the `CONFIG` object:

```javascript
var CONFIG = {
  // App Information
  appName: 'Your App Name',
  appSubtitle: 'Your Tagline',
  appRating: '4.8',
  appReviews: '10K ratings',

  // Click-through URL (App Store or Landing Page)
  clickUrl: 'https://apps.apple.com/app/your-app-id',

  // Screenshot URLs (3-4 images recommended)
  screenshots: [
    'https://your-cdn.com/screenshot1.jpg',
    'https://your-cdn.com/screenshot2.jpg',
    'https://your-cdn.com/screenshot3.jpg',
    'https://your-cdn.com/screenshot4.jpg'
  ],

  // App Icon URL
  appIcon: 'https://your-cdn.com/app-icon.png',

  // Tracking URL (your tracking pixel endpoint)
  trackingUrl: 'https://your-tracking.com/pixel',

  // CTA Button Text
  ctaText: 'Install Now',

  // Auto-rotate carousel (ms, 0 to disable)
  autoRotateInterval: 4000
};
```

### Step 3: Update Tracking

Edit `vast-template.xml` and replace all tracking URLs:

```xml
<!-- Replace this base URL throughout the file -->
https://tracking.example.com/pixel

<!-- With your actual tracking endpoint -->
https://your-tracking-server.com/vast
```

**Tracking events included:**
- `impression` - Ad loaded
- `start` - Video started
- `firstQuartile` - 25% watched
- `midpoint` - 50% watched
- `thirdQuartile` - 75% watched
- `complete` - Video finished
- `endcard_view` - End card displayed
- `endcard_click` - End card clicked

### Step 4: Update Click-Through URLs

In `vast-template.xml`, update:

```xml
<ClickThrough id="store"><![CDATA[https://apps.apple.com/app/YOUR-APP-ID]]></ClickThrough>
```

```xml
<CompanionClickThrough><![CDATA[https://apps.apple.com/app/YOUR-APP-ID]]></CompanionClickThrough>
```

---

## Screenshot Best Practices

For optimal end card performance:

| Aspect | Recommendation |
|--------|----------------|
| Format | JPG or PNG |
| Size | Max 200KB each |
| Dimensions | 16:9 ratio (e.g., 1280x720) |
| Quantity | 3-4 screenshots |
| Total | Keep under 500KB total |

**Tips:**
- Use compressed images (TinyPNG, ImageOptim)
- Show key gameplay/features
- Avoid text-heavy images (won't read on small screens)

---

## VAST Tag Macros

Limelight supports these macros in tracking URLs:

| Macro | Description |
|-------|-------------|
| `[CACHEBUSTING]` | Random number for cache busting |
| `[TIMESTAMP]` | Unix timestamp |
| `[ERRORCODE]` | VAST error code (error URLs only) |

Example usage:
```xml
<Tracking event="start">
  <![CDATA[https://tracking.com/pixel?event=start&cb=[CACHEBUSTING]]]>
</Tracking>
```

---

## Testing Checklist

Before submitting to Limelight:

- [ ] Video loads and plays correctly
- [ ] Video duration matches `<Duration>` tag
- [ ] All tracking events fire (check test player logs)
- [ ] End card displays after video completes
- [ ] Screenshot carousel swipes smoothly
- [ ] CTA button is visible and clickable
- [ ] Click-through opens correct URL
- [ ] Works on mobile (test on real device)
- [ ] Total file size under 5MB (video + images)

---

## Submitting to Limelight

### Via Limelight Dashboard

1. Log into Limelight Inc. dashboard
2. Navigate to **Campaigns** > **Create New**
3. Select **Rewarded Video** format
4. Enter your VAST tag URL:
   ```
   https://creativehubiion.github.io/iion-vast-tag/limelight/vast-template.xml
   ```
5. Set targeting and budget
6. Submit for review

### Via API

```bash
curl -X POST https://api.limelight.com/v1/campaigns \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Rewarded Campaign",
    "type": "rewarded_video",
    "vast_url": "https://creativehubiion.github.io/iion-vast-tag/limelight/vast-template.xml",
    "targeting": {
      "countries": ["US", "CA", "GB"],
      "platforms": ["ios", "android"]
    }
  }'
```

---

## Troubleshooting

### Video Not Playing

- Ensure video URL is HTTPS
- Check CORS headers on your CDN
- Verify video codec (H.264 recommended)
- Test video file directly in browser

### End Card Not Showing

- Verify `HTMLResource` URL in VAST is correct
- Check browser console for errors
- Ensure end card files are deployed

### Tracking Not Firing

- Check network tab for blocked requests
- Verify tracking URLs are HTTPS
- Replace `[CACHEBUSTING]` with actual values for testing

### Low Fill Rate on Limelight

- Ensure VAST validates (use IAB VAST validator)
- Check video duration (15-30s recommended)
- Verify all required VAST elements present

---

## Support

- **iion Docs**: Internal wiki
- **Limelight Support**: support@limelight.com
- **VAST Validator**: https://developers.google.com/interactive-media-ads/docs/sdks/html5/vastinspector

---

## File Sizes

Current deployment sizes:
- `vast-template.xml`: ~4KB
- `endcard.html`: ~2KB
- `endcard.css`: ~6KB
- `endcard.js`: ~8KB
- Video: ~2MB (varies)

**Total end card: ~16KB** (well under 500KB limit)
