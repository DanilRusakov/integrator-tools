# Favicon Setup

## Current Status
- ✅ Multiple favicon formats configured
- ✅ HTML updated to use all favicon types
- ✅ Manifest.json and site.webmanifest updated
- ✅ Progressive Web App (PWA) support configured

## To Force Favicon Update

### Method 1: Hard Refresh (Recommended)
1. Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Or hold Shift and click the refresh button
3. This bypasses browser cache

### Method 2: Clear Browser Cache
1. Open Developer Tools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

### Method 3: Incognito/Private Mode
1. Open the app in incognito/private browsing mode
2. The favicon should appear correctly

## Favicon Files
- `favicon.ico` - Main favicon (ICO format, multiple sizes)
- `favicon-96x96.png` - 96x96 PNG favicon
- `favicon.svg` - SVG favicon (scalable)
- `apple-touch-icon.png` - iOS/macOS app icon
- `web-app-manifest-192x192.png` - PWA icon 192x192
- `web-app-manifest-512x512.png` - PWA icon 512x512

## Customization
To change the favicon:
1. Replace `favicon.svg` with your own SVG
2. Update colors in the gradient (currently indigo to purple)
3. Change the "LC" text to your preferred initials

## Browser Support
- Modern browsers: SVG favicon (recommended)
- Older browsers: Will fall back to PNG logos
- PWA: Uses PNG logos for app icons
