# HVPE Cloud Portal — UI Design System

Complete reference for the visual design language, component patterns, and styling conventions used across all instances (Derek, Bickford, trading engines, dashboards).

---

## Color Palette

### Primary Theme Colors
```typescript
// src/lib/hvpeTheme.ts
{
  primary: "#2A82FF",      // Vibrant blue
  background: "#0A0A0A",   // Near-black (almost pure black)
  card: "#111111",         // Slightly lighter for contrast
  border: "#1F1F1F",       // Subtle neutral borders
  success: "#00FF9D",      // Bright emerald green
  warn: "#FF8B00",         // Warm orange
  error: "#FF3B3B",        // Error red
  accent: "#2AF0FF",       // Cyan accent
  gold: "#D5B45D",         // Luxury gold
}
```

### Tailwind Color Extensions

**Status Colors (StatusPill):**
- **Running**: `bg-emerald-500/10` with `text-emerald-200` and `border-emerald-500/50`
- **Live Trading**: `bg-red-500/10` with `text-red-200` and `border-red-500/50`
- **Error**: `bg-red-500/15` with `text-red-200` and `border-red-600/60`
- **Learning**: `bg-blue-500/10` with `text-blue-200` and `border-blue-500/50`
- **Idle**: `bg-neutral-700/20` with `text-neutral-200` and `border-neutral-600/60`

**Gradient Accent Colors:**
- Purple/Pink Gradient: `from-purple-500 via-pink-500 to-purple-600`
- Dark Blue Gradient: `from-slate-900 via-blue-900 to-slate-900`
- Cyan/Blue Gradient: `from-emerald-400 to-blue-400`

---

## Typography

### Heading Hierarchy

**H1 - Main Page Title:**
```tsx
<h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-200">
  Title Text
</h1>
```
- Size: `text-4xl`
- Weight: `font-bold`
- Color: Gradient from white to purple/pink

**H2 - Section Header:**
```tsx
<h2 className="text-2xl font-semibold mb-2">Section Title</h2>
```
- Size: `text-2xl`
- Weight: `font-semibold`

**H3 - Subsection:**
```tsx
<h3 className="text-xl font-bold text-white flex items-center gap-2">
  <Icon />
  Subsection Title
</h3>
```
- Size: `text-xl`
- Weight: `font-bold`
- Often paired with icons

**H4 - Label:**
```tsx
<h4 className="font-bold text-white">Label Text</h4>
```

### Text Styles

**Primary/Body Text:**
```tsx
<p className="text-white">Primary text</p>
```

**Muted Text:**
```tsx
<span className="text-neutral-500">Muted text</span>
<span className="text-white/60">Faded white</span>
```

**Small/Caption:**
```tsx
<div className="text-xs text-neutral-500">Small caption</div>
<div className="text-[11px] text-neutral-300">Tiny label</div>
```

**Uppercase Labels (Decorative):**
```tsx
<div className="text-xs uppercase tracking-[0.24em] text-neutral-500">
  FEATURE LABEL
</div>
```
- Size: `text-xs`
- Spacing: `tracking-[0.24em]` for elegant letter-spacing
- Color: `text-neutral-500` for subtlety

---

## Card Component

### Base Card Pattern

The foundational component for all content containers.

```tsx
// src/components/ui/Card.tsx
import { cn } from "@/lib/utils";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border shadow-xl p-4 md:p-5 bg-neutral-950/90 backdrop-blur-sm animate-[fadeIn_0.25s_ease]",
        "border-neutral-800",
        className
      )}
      style={{
        boxShadow: "0 0 40px rgba(0,0,0,0.65)",
      }}
    >
      {children}
    </section>
  );
}
```

**Key Features:**
- `rounded-xl` - Sharp but smooth corners
- `bg-neutral-950/90` - Dark with transparency
- `backdrop-blur-sm` - Glassmorphic effect
- `border-neutral-800` - Subtle border
- `shadow-xl` + custom box-shadow - Depth & glow
- `animate-[fadeIn_0.25s_ease]` - Entrance animation

**Usage:**
```tsx
<Card>
  <div className="text-xs uppercase tracking-[0.24em] text-neutral-500 mb-1">
    Label
  </div>
  <div className="text-lg font-bold text-white">
    Content
  </div>
</Card>
```

---

## Layout Components

### AppShell

Main layout wrapper for authenticated experiences.

```tsx
// src/components/layout/AppShell.tsx
<div className="flex h-screen w-screen bg-neutral-950 text-neutral-50 overflow-hidden">
  <Sidebar />
  <div className="flex flex-col flex-1 min-w-0">
    <Header />
    <main className="flex-1 overflow-auto bg-gradient-to-b from-black via-neutral-950 to-black p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {children}
      </div>
    </main>
    <StatusBar />
  </div>
</div>
```

**Structure:**
- Sidebar (left navigation)
- Header (top bar)
- Main content area with gradient background
- StatusBar (footer)

### DoDLayout (Department of Defense)

Light theme for government/official pages.

```tsx
<div className="min-h-screen bg-gradient-to-b from-[#F3F6FB] to-white text-[#0A1F44]">
  <div className="mx-auto max-w-6xl px-4 py-8">
    {children}
  </div>
</div>
```

**Colors:**
- Background: Light blue to white gradient
- Text: Dark navy `#0A1F44`
- For official/compliance-heavy sections

---

## Pattern: Glassmorphic Containers

Modern layered design with transparency and blur.

```tsx
<div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl border border-white/20 p-5 shadow-2xl">
  {/* content */}
</div>
```

**Elements:**
- `bg-gradient-to-br from-white/10 to-white/5` - Subtle white gradient
- `backdrop-blur-md` - Medium blur for depth
- `rounded-2xl` - Larger radius for modern feel
- `border border-white/20` - Subtle white border
- `shadow-2xl` - Strong shadow for elevation

---

## Animations

### Fade-in (Default Card Animation)

```css
/* src/app/globals.css */
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
```

Applied via: `animate-[fadeIn_0.25s_ease]`
- Duration: 250ms
- Easing: ease (smooth)
- Subtle vertical shift: 4px down to 0

### Bounce Animation

```tsx
<div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce"></div>
<div 
  className="w-2.5 h-2.5 bg-pink-400 rounded-full animate-bounce" 
  style={{ animationDelay: "0.15s" }}
/>
```

Used for loading indicators and active states.

---

## Common Component Patterns

### Status Pill

Used for displaying system/engine state.

```tsx
// src/components/shared/StatusPill.tsx
type Status = "running" | "live" | "error" | "learning" | "idle";

const statusMap = {
  running: {
    label: "Running",
    dot: "bg-emerald-400",
    bg: "bg-emerald-500/10",
    text: "text-emerald-200",
    border: "border-emerald-500/50",
  },
  // ... other states
};

export function StatusPill({ status }: { status: Status }) {
  const config = statusMap[status];
  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg} border ${config.border}`}>
      <div className={`w-2 h-2 rounded-full ${config.dot}`} />
      <span className={`text-xs font-medium ${config.text}`}>{config.label}</span>
    </div>
  );
}
```

### Icon + Text Header

Common pattern for section headers with leading icon.

```tsx
<h3 className="text-xl font-bold text-white flex items-center gap-2">
  <Zap className="h-5 w-5 text-yellow-400" />
  Section Title
</h3>
```

**Features:**
- Icon is 20x20px (`h-5 w-5`)
- Icon color distinct from text
- 8px gap between icon and text

### Metric Display

For numerical KPIs and stats.

```tsx
<div className="space-y-2">
  <div className="text-xs uppercase tracking-[0.16em] text-neutral-500 mb-1">
    Metric Label
  </div>
  <div className="text-lg font-bold text-white">
    1,234,567
  </div>
  <div className="text-xs text-neutral-500 mt-2">
    Supporting detail
  </div>
</div>
```

---

## Grid Layouts

### Responsive Dashboard Grid

```tsx
// One column on mobile, three on desktop
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  {/* Cards here */}
</div>

// Asymmetric layout
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <div className="lg:col-span-2">
    {/* Wide card */}
  </div>
  <div>
    {/* Narrow card */}
  </div>
</div>
```

---

## Global Styles

### Root Styles

```css
/* src/app/globals.css */
:root {
  color-scheme: dark;
}

body {
  background: #000;
  color: #f4f4f5;
}
```

- Always dark mode
- Near-black background
- Light text color

### Spacing

Default Tailwind spacing with custom max-widths:
- Container: `max-w-7xl`
- Narrow: `max-w-5xl`
- Padding: `px-4 md:px-6`, `py-6 md:py-8`
- Gap: `gap-4` (default between cards)

---

## Instance Configuration (Bickford)

Custom theming per instance via `bickford.config.json`:

```json
{
  "branding": {
    "appName": "Instance Name",
    "tagline": "Instance Tagline",
    "logo": "/path/to/logo.png",
    "favicon": "/path/to/favicon.ico",
    "primaryColor": "#HEX_COLOR",
    "accentColor": "#HEX_COLOR"
  },
  "header": {
    "show": true,
    "title": "Custom Title",
    "subtitle": "Optional Subtitle",
    "showPoweredBy": false
  },
  "privacy": {
    "collectAnalytics": false,
    "storeConversations": false,
    "dataRetentionDays": 30
  }
}
```

---

## Component Architecture

### Layout Layer
- **AppShell** - Main container with sidebar + header + statusbar
- **DoDLayout** - Light theme alternative for official content
- **Card** - Base content container

### Widget Layer
- **IntentToRealityPanel** - Valuation engine display
- **EngineStatusPanel** - System metrics
- **BillionaireTracker** - Net worth & billionaire confidence tracking
- **MoneyVelocityGauge** - Rate gauge
- **SupraHeatmap** - 3x3 signal grid
- **MetricMiniGrid** - KPI tiles

### OPTR Components
- **OptrOpportunityList** - Opportunities grid
- **OptrRunPanel** - Analysis runner
- **OptrStatusPanel** - Result display
- **OptrTraceTable** - Audit trail
- **OptrVoiceAssistant** - Mobile voice interface
- **OptrRequirements** - Requirement tracker

### Shared Components
- **StatusPill** - Status indicator
- **PersonaSelector** - User persona switcher
- **VoiceAssistant** - Voice input/output

---

## Design Principles

✅ **Dark First**: Neutral-950/black backgrounds, light text  
✅ **Glassmorphism**: Backdrop blur + transparency for depth  
✅ **Gradients**: Subtle color overlays, not harsh  
✅ **Minimal Borders**: Neutral-800 only, avoid excess  
✅ **Accessibility**: High contrast text, readable sizes  
✅ **Animation**: Subtle fade-ins, avoid flashiness  
✅ **Spacing**: Consistent gaps, breathing room  
✅ **Typography**: Clear hierarchy, letter-spacing for elegance  
✅ **Icons**: Purposeful, 20-24px, color-coded  
✅ **Mobile First**: Responsive by default  

---

## Usage Checklist

When building new components:

- [ ] Use dark background (`bg-neutral-950` or `bg-black`)
- [ ] Apply Card component for containers
- [ ] Add fade-in animation to cards
- [ ] Use `text-neutral-500` for muted text
- [ ] Include icon + text headers
- [ ] Maintain consistent spacing (`gap-4`, `p-4 md:p-5`)
- [ ] Apply gradient text for headings
- [ ] Use StatusPill for state indicators
- [ ] Test on mobile (responsive grid)
- [ ] Ensure WCAG contrast (AA minimum)

---

## Tools & Frameworks

- **Styling**: Tailwind CSS utility-first
- **Icons**: Lucide React
- **Color Utilities**: `cn()` helper from `@/lib/utils`
- **Animations**: CSS keyframes + Tailwind animate utilities
- **Theming**: `hvpeTheme.ts` for global colors
- **Layout**: CSS Grid, Flexbox

---

---

## Form Components & Input Patterns

### Input Field

```tsx
<div className="space-y-2">
  <label className="text-sm font-medium text-white">Label</label>
  <input
    type="text"
    placeholder="Placeholder text"
    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition"
  />
</div>
```

**Styling:**
- Background: `bg-neutral-900`
- Border: `border-neutral-800`
- Focus state: `focus:border-blue-500`
- Rounded: `rounded-lg`

### Textarea

```tsx
<div className="space-y-2">
  <label className="text-sm font-medium text-white">Description</label>
  <textarea
    placeholder="Multi-line input"
    rows={4}
    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition resize-none"
  />
</div>
```

### Select/Dropdown

```tsx
<select className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition">
  <option value="">Select an option</option>
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</select>
```

### Checkbox

```tsx
<label className="flex items-center gap-2 cursor-pointer">
  <input
    type="checkbox"
    className="w-4 h-4 bg-neutral-900 border border-neutral-800 rounded accent-blue-500"
  />
  <span className="text-sm text-white">Checkbox label</span>
</label>
```

### Toggle Switch

```tsx
export function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? "bg-blue-500" : "bg-neutral-700"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
```

### Button Variants

**Primary Button:**
```tsx
<button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors">
  Primary Action
</button>
```

**Secondary Button:**
```tsx
<button className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-lg border border-neutral-700 transition-colors">
  Secondary Action
</button>
```

**Ghost Button:**
```tsx
<button className="px-4 py-2 text-white hover:bg-white/10 font-semibold rounded-lg transition-colors">
  Ghost Action
</button>
```

**Danger Button:**
```tsx
<button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors">
  Dangerous Action
</button>
```

---

## Dark Mode & Theme Switching

### Theme Context Pattern

```tsx
// src/components/providers/ThemeProvider.tsx
"use client";

import { createContext, useContext, useState } from "react";

type Theme = "dark" | "light";

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({ theme: "dark", toggleTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  const toggleTheme = () => {
    setTheme(t => t === "dark" ? "light" : "dark");
    document.documentElement.classList.toggle("light");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
```

### Theme Toggle Button

```tsx
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-yellow-400" />
      ) : (
        <Moon className="h-5 w-5 text-blue-400" />
      )}
    </button>
  );
}
```

### Light Mode Color Palette

When dark mode is disabled, apply light theme:

```css
.light {
  color-scheme: light;
}

.light {
  background: #ffffff;
  color: #0a0a0a;
}

.light body {
  background: #ffffff;
}

.light .bg-neutral-950 {
  background-color: #f5f5f5;
}

.light .bg-neutral-900 {
  background-color: #fafafa;
}

.light .border-neutral-800 {
  border-color: #e5e5e5;
}

.light .text-white {
  color: #0a0a0a;
}

.light .text-neutral-500 {
  color: #666666;
}
```

---

## Accessibility Guidelines

### Color Contrast

- Text on background: Minimum WCAG AA (4.5:1 for normal text, 3:1 for large text)
- Use tools: WebAIM Contrast Checker
- Test with: Chrome DevTools → Lighthouse Accessibility

### Keyboard Navigation

```tsx
// Always support keyboard navigation
<button
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  }}
  aria-label="Descriptive label"
>
  Button
</button>
```

### ARIA Labels

```tsx
// Form inputs
<label htmlFor="email" className="text-sm text-white">
  Email Address
</label>
<input
  id="email"
  type="email"
  aria-label="Email address input"
  aria-required="true"
/>

// Interactive elements
<button aria-label="Close dialog">×</button>

// Status updates
<div role="status" aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

### Focus States

Always visible focus indicators:

```tsx
<button className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black">
  Accessible Button
</button>
```

### Text Readability

- Line height: `leading-relaxed` (1.625) minimum
- Font size: `text-sm` (14px) minimum for body text
- Max line length: ~65 characters for optimal readability
- Color contrast: 4.5:1 for normal text, 3:1 for large text

---

## Component Library Examples

### Badge Component

```tsx
export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "error" | "warning";
}) {
  const variants = {
    default: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    success: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    error: "bg-red-500/20 text-red-300 border border-red-500/30",
    warning: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  };

  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
}
```

### Alert Component

```tsx
export function Alert({
  children,
  type = "info",
  title,
}: {
  children: React.ReactNode;
  type?: "info" | "success" | "error" | "warning";
  title?: string;
}) {
  const icons = {
    info: "ℹ️",
    success: "✓",
    error: "⚠️",
    warning: "⚡",
  };

  const colors = {
    info: "bg-blue-500/10 border-blue-500/30 text-blue-300",
    success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    error: "bg-red-500/10 border-red-500/30 text-red-300",
    warning: "bg-yellow-500/10 border-yellow-500/30 text-yellow-300",
  };

  return (
    <div className={`rounded-lg border p-4 ${colors[type]}`}>
      {title && (
        <div className="font-semibold mb-2">
          {icons[type]} {title}
        </div>
      )}
      {children}
    </div>
  );
}
```

### Modal/Dialog

```tsx
export function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl shadow-xl max-w-lg w-full mx-4">
          <div className="flex items-center justify-between p-6 border-b border-neutral-800">
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-white transition"
            >
              ×
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </>
  );
}
```

### Tooltip

```tsx
export function Tooltip({
  children,
  content,
}: {
  children: React.ReactNode;
  content: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-neutral-800 text-white text-xs rounded whitespace-nowrap">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-l-transparent border-r-transparent border-t-neutral-800" />
        </div>
      )}
    </div>
  );
}
```

---

## Implementation Checklist

### Before Shipping a Component

- [ ] Color contrast meets WCAG AA (4.5:1 min)
- [ ] Keyboard navigation fully supported
- [ ] ARIA labels present and accurate
- [ ] Focus state clearly visible
- [ ] Works on mobile (tested at 375px)
- [ ] Works on tablet (tested at 768px)
- [ ] Works on desktop (tested at 1440px)
- [ ] Loading state handled
- [ ] Error state handled
- [ ] Empty state handled
- [ ] Animations smooth (60fps)
- [ ] No console warnings/errors
- [ ] Accessibility audit passed
- [ ] Component matches design system

---

## References

- [src/components/ui/Card.tsx](src/components/ui/Card.tsx) - Card component
- [src/lib/hvpeTheme.ts](src/lib/hvpeTheme.ts) - Color definitions
- [src/app/globals.css](src/app/globals.css) - Global styles
- [src/components/layout/](src/components/layout/) - Layout components
- [src/components/shared/](src/components/shared/) - Reusable UI patterns
- [CONFIGURATION_GUIDE.md](CONFIGURATION_GUIDE.md) - Instance configuration

## External Resources

- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Lucide React Icons](https://lucide.dev)
- [Web Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Web Docs - Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Inclusive Components](https://inclusive-components.design/)
