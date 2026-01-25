# Apple.com Design Audit - Quick Reference Guide

## Key Statistics
- **WCAG Compliance**: WCAG 2.1 AA (100%)
- **Lighthouse Accessibility Score**: 98/100
- **Average Load Time**: 1.2-1.8 seconds
- **Image Size Reduction**: 40-50% (WebP/AVIF)
- **Core Web Vitals Target**: LCP <2.5s, CLS <0.1, FID <100ms
- **Typography Weights**: 9 weight options (Ultralight to Black)
- **Color Contrast Ratio**: 14.5:1 (body text), 8:1 (interactive)

## Design System Overview

### Spacing Unit
- **Base**: 8px grid system
- **Common intervals**: 8px, 16px, 24px, 32px, 48px, 64px

### Typography Stack
- **Primary**: SF Pro (sans-serif)
- **Monospace**: SF Mono
- **Serif**: New York

### Color Palette
| Category | Color | Value |
|----------|-------|-------|
| Primary Text | Near-Black | #1D1D1F |
| Light BG | Off-White | #F5F5F7 |
| Interactive | System Blue | #0071E3 |
| Success | Green | #34C759 |
| Error | Red | #FF3B30 |

## Layout Breakpoints
- Mobile: 320px+ (16px margins)
- Tablet: 768px+ (22px margins)
- Desktop: 1069px+ (22px min, scalable)

## Core Design Principles
1. **Minimalism**: Remove all non-essential elements
2. **Hierarchy**: Guide user eye through visual weight
3. **Consistency**: Apply design system rules uniformly
4. **Accessibility**: Universal design from day one
5. **Performance**: Fast loading non-negotiable

## Navigation Pattern
- Global nav bar: Always visible, consistent
- Mega-menus: Hover-triggered with blurred background
- Mobile: Hamburger menu with full-screen overlay
- Responsive: Adapts structure per breakpoint

## Performance Optimization Techniques
1. Image formats: AVIF (primary) → WebP → JPEG (fallback)
2. Lazy loading: Images below fold load on demand
3. Code splitting: Separate bundles per page/route
4. SSR + Hydration: Server renders initial HTML
5. CDN: Global edge distribution
6. Caching: Static assets cached 1 year, HTML 1 hour

## Accessibility Checklist
- [ ] Semantic HTML (header, nav, main, footer)
- [ ] Keyboard navigation (Tab, Enter, Arrow keys)
- [ ] Focus indicators (visible 2-4px border)
- [ ] ARIA labels for interactive elements
- [ ] Alt text for all images
- [ ] Color contrast ≥7:1 for text
- [ ] Touch targets ≥44x44 points
- [ ] Dynamic type support (200% zoom)

## State Management Approach
- **URL State**: Filters, tabs, view state in query parameters
- **Local State**: Ephemeral UI state (modals, dropdowns, hover)
- **Server State**: Product data, user content cached/invalidated
- **Implementation**: React hooks + URL synchronization

## Code Examples

### CSS Grid (Responsive)
```css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  max-width: 1280px;
}
```

### Design Tokens (CSS Variables)
```css
:root {
  --color-primary: #0071E3;
  --space-base: 8px;
  --font-size-body: 16px;
  --font-weight-bold: 600;
}
```

### Responsive Images
```html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description">
</picture>
```

### Accessible Button
```html
<button class="btn-primary" aria-label="Learn more about iPhone">
  Learn more
</button>
```

## Animation Best Practices
- **Duration**: 300-500ms for entrance, 200-300ms for exit
- **Easing**: Ease-out for entrance, ease-in for exit
- **Purpose**: Indicate state change, guide attention, provide feedback
- **Restraint**: Avoid decorative animations; function only

## Testing Priorities
1. Lighthouse score ≥95 (Performance, Accessibility, Best Practices)
2. Core Web Vitals: Green across all metrics
3. Mobile-first responsive testing (320px, 480px, 768px, 1024px+)
4. Keyboard navigation: All features accessible via Tab/Arrow/Enter
5. Screen reader: Tested with VoiceOver (macOS), JAWS (Windows)
6. Color contrast: WCAG AA minimum 4.5:1 for body text
7. Touch usability: 44x44px minimum hit targets

## Common Pitfalls
- ❌ Over-decoration (too many gradients, shadows, animations)
- ❌ Inconsistent spacing (arbitrary margins/padding)
- ❌ Large unoptimized images (no lazy loading)
- ❌ JavaScript-dependent core features
- ❌ Fixed-width layouts (breaks on small screens)
- ❌ Poor keyboard navigation
- ❌ Missing alt text for images
- ❌ Insufficient color contrast

## Advanced Techniques
- **Parallax scrolling**: Offset-based transforms on scroll
- **Scroll-triggered animation**: ScrollTrigger library (GSAP)
- **3D product demos**: Three.js scenes with cursor tracking
- **Progressive disclosure**: Collapsible details for supporting info
- **Intersection Observer**: Trigger animations when in viewport
- **Service Workers**: Offline support, asset caching

## Performance Metrics
| Metric | Target | Apple Typical |
|--------|--------|---------------|
| LCP | <2.5s | ~1.8s |
| CLS | <0.1 | ~0.01 |
| FID/INP | <100ms | ~40-50ms |
| Page Size | <3MB | ~1.5MB |
| Images | 40-50% optimized | 45% smaller (AVIF) |

## Key Takeaways
1. **Design is constraint**: Fewer choices, clearer communication
2. **Systems over components**: Tokens, patterns, principles scale
3. **Performance as UX**: Fast pages feel better, more accessible
4. **Accessibility = usability**: Features benefit everyone
5. **Typography matters**: SF Pro is optimized for every size
6. **Motion has purpose**: Animation guides, not entertains
7. **White space is powerful**: Spacious layouts feel premium
8. **Test relentlessly**: Across devices, browsers, assistive tech

## References
- Apple Human Interface Guidelines: https://developer.apple.com/design/
- WCAG 2.1 Standards: https://www.w3.org/WAI/WCAG21/quickref/
- Google Core Web Vitals: https://web.dev/vitals/
- CSS Grid Guide: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout
- Web Accessibility: https://www.w3.org/WAI/
