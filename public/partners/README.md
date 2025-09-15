# Partner Logos Directory

This directory contains the logo images for partners displayed in the PartnersSection component.

## Required Logo Files:

1. **hashx-logo.png** - HashX company logo
2. **daily-mirror-logo.png** - Daily Mirror logo  
3. **hacksl-logo.png** - HackSL organization logo
4. **aws-club-logo.png** - AWS Club logo
5. **nadula-logo.png** - Nadula Wathurakumbura Photography logo

## Image Requirements:

- **Format**: PNG, JPG, or SVG (PNG recommended for transparency)
- **Size**: Recommended max dimensions 200x80px for optimal display
- **Background**: Transparent PNG preferred for best integration
- **Quality**: High resolution for crisp display on all devices

## How to Add Images:

1. Save your partner logo images in this directory
2. Name them exactly as listed above (case-sensitive)
3. Update the file paths in `PartnersSection.tsx` if you use different names

## Fallback System:

If an image fails to load, the component will automatically fall back to displaying the text initials (HX, DM, HS, AC, NW) with the cyber gradient background.

## File Structure:
```
public/
  partners/
    hashx-logo.png
    daily-mirror-logo.png
    hacksl-logo.png
    aws-club-logo.png
    nadula-logo.png
    README.md (this file)
```