# Logo Integration Guide

This document outlines how the TheGreenRoom.ai logo has been integrated throughout the application and how to maintain it.

## Logo Files

### Current Logo

- **File**: `public/logo.svg`
- **Format**: SVG (scalable vector graphics)
- **Size**: ~1.8MB
- **Usage**: Primary logo used throughout the application

### Generated Variants

The logo is used in various sizes throughout the application:

- **Navigation**: 32x32px (AppNavigation.tsx)
- **Landing Page Hero**: 80x80px (index.tsx)
- **Auth Pages**: 64x64px (login.tsx)
- **Onboarding Modal**: 48x48px (OnboardingModal.tsx)
- **Footer**: 64x64px (index.tsx)
- **Favicon**: 16x16px, 32x32px, 48x48px (browser tabs)

## Integration Points

### 1. Navigation Header

**File**: `components/AppNavigation.tsx`

- Logo appears in the top-left corner
- Links to dashboard when clicked
- Responsive design with proper spacing

### 2. Landing Page

**File**: `pages/index.tsx`

- Hero section: Large logo above main heading
- Footer: Smaller logo above copyright text
- Animated entrance with Framer Motion

### 3. Authentication Pages

**File**: `pages/auth/login.tsx`

- Centered above welcome message
- Consistent branding across auth flows

### 4. Onboarding Modal

**File**: `components/OnboardingModal.tsx`

- Header section with logo and welcome message
- Maintains brand consistency during onboarding

### 5. Browser Assets

**Files**:

- `public/index.html` - Favicon and app icons
- `public/manifest.json` - PWA manifest icons

## Technical Implementation

### Next.js Image Component

All logo instances use Next.js `Image` component for:

- Automatic optimization
- Lazy loading
- Proper sizing
- WebP format support

### Example Usage

```tsx
import Image from 'next/image';

<Image
  src='/logo.svg'
  alt='TheGreenRoom.ai Logo'
  width={32}
  height={32}
  className='object-contain'
/>;
```

### Responsive Design

- Logo scales appropriately on different screen sizes
- Maintains aspect ratio with `object-contain`
- Proper spacing with Tailwind CSS classes

## Maintenance

### Updating the Logo

1. Replace `public/logo.svg` with new logo file
2. Ensure new logo is SVG format for best quality
3. Test all integration points
4. Update favicon if needed

### Generating Logo Variants

If you need different formats or sizes:

```bash
# Install ImageMagick (if not already installed)
brew install imagemagick

# Generate logo variants
npm run generate-logos
```

This will create:

- `favicon.ico` (16x16, 32x32, 48x48)
- `logo-192.png` (192x192)
- `logo-512.png` (512x512)
- `apple-touch-icon.png` (180x180)

### Best Practices

1. **Always use SVG** for the main logo file
2. **Maintain aspect ratio** with `object-contain`
3. **Provide alt text** for accessibility
4. **Use consistent sizing** across similar contexts
5. **Test on different devices** and screen sizes

## Brand Guidelines

### Logo Usage

- **Minimum size**: 16px for favicon
- **Recommended size**: 32px for navigation
- **Maximum size**: 80px for hero sections
- **Background**: Works on light and dark backgrounds
- **Spacing**: Maintain 8px minimum margin around logo

### Color Considerations

- Logo should work on both light and dark themes
- Ensure sufficient contrast for accessibility
- Test on various background colors

## Troubleshooting

### Common Issues

1. **Logo not displaying**: Check file path and Next.js Image configuration
2. **Poor quality**: Ensure using SVG format and proper sizing
3. **Layout issues**: Check container sizing and CSS classes
4. **Performance**: SVG format provides best performance

### Debug Steps

1. Verify logo file exists in `public/` directory
2. Check browser console for image loading errors
3. Test with different screen sizes
4. Validate Next.js Image component props

## Future Enhancements

### Potential Improvements

1. **Dark mode variants**: Different logo colors for dark theme
2. **Animated logo**: Subtle animations for special occasions
3. **Logo variants**: Different styles for different contexts
4. **Performance optimization**: Further image optimization

### Monitoring

- Track logo loading performance
- Monitor user engagement with logo interactions
- A/B test different logo placements
- Gather feedback on logo visibility and recognition
