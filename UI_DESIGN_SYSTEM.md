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
- **BillionaireTracker** - Net worth tracking
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

## References

- [src/components/ui/Card.tsx](src/components/ui/Card.tsx) - Card component
- [src/lib/hvpeTheme.ts](src/lib/hvpeTheme.ts) - Color definitions
- [src/app/globals.css](src/app/globals.css) - Global styles
- [src/components/layout/](src/components/layout/) - Layout components
- [src/components/shared/](src/components/shared/) - Reusable UI patterns
- [CONFIGURATION_GUIDE.md](CONFIGURATION_GUIDE.md) - Instance configuration

