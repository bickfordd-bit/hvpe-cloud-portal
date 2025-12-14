# Design Tokens & Variables Reference

Complete token system for consistent theming, spacing, typography, and animation across HVPE.

---

## Color Tokens

### Primary Colors (Brand)
```typescript
{
  primary: {
    50: "#EBF5FF",
    100: "#D6EAFF",
    200: "#ADD6FF",
    300: "#85C1FF",
    400: "#5CADFF",
    500: "#2A82FF",    // Primary blue
    600: "#2275ED",
    700: "#1A68DB",
    800: "#125BC9",
    900: "#0A4FB7",
  }
}
```

### Neutral Colors (Grayscale)
```typescript
{
  neutral: {
    0: "#FFFFFF",
    50: "#F9F9F9",
    100: "#F3F3F3",
    200: "#E8E8E8",
    300: "#D3D3D3",
    400: "#BEBEBE",
    500: "#A9A9A9",
    600: "#949494",
    700: "#7F7F7F",
    800: "#6A6A6A",
    900: "#4F4F4F",
    950: "#1F1F1F",
    990: "#0A0A0A",
    1000: "#000000",
  }
}
```

### Semantic Colors
```typescript
{
  success: {
    light: "#E8F9F0",
    main: "#00FF9D",
    dark: "#00B86B",
  },
  error: {
    light: "#FFE8E8",
    main: "#FF3B3B",
    dark: "#CC0000",
  },
  warning: {
    light: "#FFF4E8",
    main: "#FF8B00",
    dark: "#CC6E00",
  },
  accent: {
    light: "#E8F9FF",
    main: "#2AF0FF",
    dark: "#00B3CC",
  },
}
```

### Gradient Tokens
```typescript
{
  gradients: {
    purplePink: "from-purple-500 via-pink-500 to-purple-600",
    blueSlate: "from-slate-900 via-blue-900 to-slate-900",
    cyanBlue: "from-emerald-400 to-blue-400",
    whiteFade: "from-white/10 to-white/5",
    darkFade: "from-black via-neutral-950 to-black",
    purpleBlue: "from-purple-900/50 to-blue-900/50",
  }
}
```

---

## Spacing Scale

```typescript
{
  spacing: {
    0: "0px",
    1: "4px",      // xs
    2: "8px",      // sm
    3: "12px",     // md
    4: "16px",     // base
    5: "20px",     // lg
    6: "24px",     // xl
    8: "32px",     // 2xl
    10: "40px",    // 3xl
    12: "48px",    // 4xl
    16: "64px",    // 5xl
    20: "80px",    // 6xl
    24: "96px",    // 7xl
  }
}
```

### Common Spacing Combinations
- **Component padding**: `p-4 md:p-5` (16px → 20px)
- **Container padding**: `px-4 md:px-6 py-6 md:py-8`
- **Gap between cards**: `gap-4`
- **Section margin**: `mb-6`
- **Header padding**: `py-4 md:py-6`

---

## Typography Scale

### Font Sizes
```typescript
{
  fontSize: {
    xs: "12px",       // 0.75rem
    sm: "14px",       // 0.875rem
    base: "16px",     // 1rem
    lg: "18px",       // 1.125rem
    xl: "20px",       // 1.25rem
    "2xl": "24px",    // 1.5rem
    "3xl": "30px",    // 1.875rem
    "4xl": "36px",    // 2.25rem
    "5xl": "48px",    // 3rem
  }
}
```

### Font Weights
```typescript
{
  fontWeight: {
    thin: 100,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  }
}
```

### Line Heights
```typescript
{
  lineHeight: {
    tight: 1.25,      // Headings
    normal: 1.5,      // Body text
    relaxed: 1.625,   // Readable text
    loose: 2,         // Spaced text
  }
}
```

### Letter Spacing
```typescript
{
  letterSpacing: {
    tight: "-0.02em",
    normal: "0em",
    wide: "0.02em",
    wider: "0.05em",    // Decorative labels
    widest: "0.08em",   // Small caps
    elegant: "0.24em",  // Feature labels (tracking-[0.24em])
  }
}
```

---

## Border & Radius

### Border Radius
```typescript
{
  borderRadius: {
    none: "0px",
    sm: "4px",
    base: "6px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    "2xl": "20px",
    "3xl": "24px",
    full: "9999px",
  }
}
```

### Border Widths
```typescript
{
  borderWidth: {
    0: "0px",
    1: "1px",         // Default
    2: "2px",
    4: "4px",
  }
}
```

### Common Border Styles
- **Card border**: `border border-neutral-800`
- **Subtle border**: `border-neutral-800/50`
- **Focus border**: `focus:border-blue-500`
- **Accent border**: `border border-blue-500/50`

---

## Shadow System

```typescript
{
  boxShadow: {
    none: "none",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    base: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    // Custom glow effects
    glow: "0 0 40px rgba(0, 0, 0, 0.65)",      // Card glow
    glowBlue: "0 0 30px rgba(42, 130, 255, 0.3)",   // Blue glow
    glowPurple: "0 0 30px rgba(147, 51, 234, 0.3)", // Purple glow
  }
}
```

---

## Animation Tokens

### Durations
```typescript
{
  duration: {
    fast: "150ms",
    base: "200ms",
    normal: "250ms",
    slow: "300ms",
    slower: "500ms",
  }
}
```

### Easing
```typescript
{
  easing: {
    linear: "linear",
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
    // Custom easing
    spring: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  }
}
```

### Predefined Animations
```typescript
{
  animation: {
    fadeIn: "fadeIn 250ms ease",
    fadeOut: "fadeOut 250ms ease",
    slideUp: "slideUp 250ms ease",
    slideDown: "slideDown 250ms ease",
    pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    bounce: "bounce 1s infinite",
    spin: "spin 1s linear infinite",
  }
}
```

### Keyframe Definitions
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    transform: translateY(16px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

---

## Breakpoints

```typescript
{
  breakpoints: {
    xs: "320px",    // Mobile
    sm: "640px",    // Tablet (small)
    md: "768px",    // Tablet
    lg: "1024px",   // Desktop (small)
    xl: "1280px",   // Desktop
    "2xl": "1536px", // Large desktop
  }
}
```

### Media Query Usage
```tsx
// Responsive padding
<div className="px-4 sm:px-6 md:px-8 lg:px-12">
  Responsive spacing
</div>

// Responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
  Responsive layout
</div>

// Show/hide on breakpoints
<div className="hidden md:block">Visible on desktop</div>
```

---

## Z-Index Scale

```typescript
{
  zIndex: {
    hide: -1,
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    backdrop: 40,
    modal: 50,
    popover: 60,
    tooltip: 70,
  }
}
```

### Common Z-Index Usage
- **Backdrop (modal)**: `z-40`
- **Modal content**: `z-50`
- **Dropdown menus**: `z-10`
- **Sticky headers**: `z-20`
- **Tooltips**: `z-70`

---

## Opacity Scale

```typescript
{
  opacity: {
    0: "0",
    5: "0.05",
    10: "0.1",
    20: "0.2",
    30: "0.3",
    40: "0.4",
    50: "0.5",
    60: "0.6",
    70: "0.7",
    80: "0.8",
    90: "0.9",
    95: "0.95",
    100: "1",
  }
}
```

### Common Opacity Patterns
- **Hover states**: `hover:bg-white/10`
- **Disabled**: `opacity-50 cursor-not-allowed`
- **Faded text**: `text-white/60`
- **Subtle borders**: `border-neutral-800/50`
- **Glass effect**: `backdrop-blur-sm` + `bg-white/5`

---

## Max Width Containers

```typescript
{
  maxWidth: {
    sm: "384px",    // 24rem
    md: "448px",    // 28rem
    lg: "512px",    // 32rem
    xl: "576px",    // 36rem
    "2xl": "672px", // 42rem
    "3xl": "768px", // 48rem
    "4xl": "896px", // 56rem
    "5xl": "1024px", // 64rem
    "6xl": "1152px", // 72rem
    "7xl": "1280px", // 80rem - Desktop max
  }
}
```

### Container Patterns
- **Full width**: No max-width
- **Narrow content**: `max-w-2xl`
- **Standard dashboard**: `max-w-7xl`
- **Wide desktop**: `max-w-6xl`

---

## CSS Variables (Custom Properties)

For dynamic theming, define CSS variables:

```css
:root {
  /* Colors */
  --color-primary: #2A82FF;
  --color-background: #0A0A0A;
  --color-card: #111111;
  --color-border: #1F1F1F;
  --color-text: #ffffff;
  --color-text-muted: #999999;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  
  /* Typography */
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 20px;
  --font-size-xl: 24px;
  --font-size-2xl: 36px;
  
  /* Animations */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 500ms;
}
```

**Usage in CSS:**
```css
.card {
  background-color: var(--color-card);
  border-color: var(--color-border);
  padding: var(--space-md);
}
```

---

## Component Token Map

### Card
- Background: `neutral-950/90`
- Border: `neutral-800`
- Shadow: Custom glow
- Padding: `p-4 md:p-5`
- Radius: `rounded-xl`
- Animation: `fadeIn 250ms ease`

### Button Primary
- Background: `bg-blue-500`
- Hover: `hover:bg-blue-600`
- Text: `text-white`
- Weight: `font-semibold`
- Padding: `px-4 py-2` or `px-6 py-3`
- Radius: `rounded-lg`

### Input
- Background: `bg-neutral-900`
- Border: `border-neutral-800`
- Focus: `focus:border-blue-500`
- Text: `text-white`
- Padding: `px-3 py-2` or `px-4 py-2`
- Radius: `rounded-lg`

### Status Pill
- Background: Status-specific (`bg-emerald-500/10`, etc.)
- Text: Status-specific
- Border: Status-specific
- Padding: `px-3 py-1`
- Radius: `rounded-full`
- Font: `text-xs font-medium`

---

## Token Usage Guidelines

### When to Use Tokens
✅ Colors - Always use palette tokens  
✅ Spacing - Use scale (4, 8, 16, 24, etc.)  
✅ Typography - Use defined scales  
✅ Shadows - Use shadow system  
✅ Animations - Use predefined durations/easing  
✅ Radius - Use border radius scale  

### When NOT to Use Custom Values
❌ Random hex colors  
❌ Arbitrary pixel spacing  
❌ Non-standard font sizes  
❌ Custom animation timings  
❌ Inconsistent shadows  

---

## Token Maintenance

**Checklist for adding new tokens:**

- [ ] Token follows naming convention
- [ ] Value is defined in scale
- [ ] Token reusable across components
- [ ] Documentation updated
- [ ] Design system aligned
- [ ] No magic numbers/values
- [ ] Accessibility considered
- [ ] All variants defined

---

## Resources

- [Tailwind CSS Configuration](https://tailwindcss.com/docs/configuration)
- [Design Tokens Format](https://design-tokens.github.io/community-group/format/)
- [Figma Design System](https://www.figma.com/design-system-guide)
- [HVPE Theme](src/lib/hvpeTheme.ts)

