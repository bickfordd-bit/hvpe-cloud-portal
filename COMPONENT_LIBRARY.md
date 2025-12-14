# Component Library Reference

Interactive guide to building and using HVPE design system components. Copy-paste ready examples with live patterns.

---

## Quick Start

### Import Common Components

```tsx
import { Card } from "@/components/ui/Card";
import { AppShell } from "@/components/layout/AppShell";
import { StatusPill } from "@/components/shared/StatusPill";
```

---

## UI Components

### Card (Base Container)

**Variants:**
- Default card
- Gradient overlay
- Bordered emphasis
- Glow effect

```tsx
import { Card } from "@/components/ui/Card";

// Default
<Card>
  <div className="text-white">Content here</div>
</Card>

// With custom styling
<Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50">
  <h2 className="text-xl font-bold text-white mb-2">Gradient Card</h2>
  <p className="text-neutral-300">Custom styled card</p>
</Card>

// Bordered emphasis
<Card className="border border-blue-500/50">
  <div className="text-blue-300">Important content</div>
</Card>
```

### Button System

**All Variants with Hover States:**

```tsx
// Primary - Most important action
<button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all hover:scale-105 shadow-lg hover:shadow-blue-500/50">
  Primary Action
</button>

// Secondary - Alternative action
<button className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-lg border border-neutral-700 transition">
  Secondary Action
</button>

// Tertiary - Low priority
<button className="px-6 py-3 text-white hover:bg-white/10 font-semibold rounded-lg transition">
  Tertiary Action
</button>

// Success - Positive action
<button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition">
  Confirm
</button>

// Danger - Destructive action
<button className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition">
  Delete
</button>

// Loading state
<button disabled className="px-6 py-3 bg-blue-500/50 text-white font-semibold rounded-lg cursor-not-allowed flex items-center gap-2">
  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
  Loading...
</button>

// Icon button
<button className="p-2 rounded-lg hover:bg-neutral-800 transition-colors" title="Menu">
  <span className="text-xl">☰</span>
</button>
```

### Form Inputs

**Complete Form Section:**

```tsx
export function ExampleForm() {
  return (
    <Card className="max-w-md">
      <h2 className="text-lg font-bold text-white mb-6">Contact Form</h2>
      
      <form className="space-y-4">
        {/* Text Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Email Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Email</label>
          <input
            type="email"
            placeholder="john@example.com"
            className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Textarea */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Message</label>
          <textarea
            placeholder="Your message..."
            rows={4}
            className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition resize-none"
          />
        </div>

        {/* Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Category</label>
          <select className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition">
            <option>Select category</option>
            <option>Support</option>
            <option>Feedback</option>
            <option>Other</option>
          </select>
        </div>

        {/* Checkbox */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 accent-blue-500"
          />
          <span className="text-sm text-neutral-300">Subscribe to updates</span>
        </label>

        {/* Button */}
        <button className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition mt-6">
          Send Message
        </button>
      </form>
    </Card>
  );
}
```

---

## Layout Components

### AppShell (Full Layout)

```tsx
import { AppShell } from "@/components/layout/AppShell";

export function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        {/* Your dashboard content */}
      </div>
    </AppShell>
  );
}
```

### Header Pattern

```tsx
<div className="border-b border-white/20 bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-md sticky top-0 z-40">
  <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <h1 className="text-2xl font-bold text-white">HVPE</h1>
    </div>
    <nav className="flex items-center gap-6">
      <a href="#" className="text-neutral-300 hover:text-white transition">Dashboard</a>
      <a href="#" className="text-neutral-300 hover:text-white transition">Docs</a>
    </nav>
  </div>
</div>
```

### Sidebar Navigation

```tsx
<aside className="w-64 bg-neutral-950 border-r border-neutral-800 p-4 space-y-4">
  <nav className="space-y-2">
    <a href="#" className="block px-4 py-2 rounded-lg text-white bg-blue-500/20 hover:bg-blue-500/30 transition">
      🏠 Dashboard
    </a>
    <a href="#" className="block px-4 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition">
      📊 Analytics
    </a>
    <a href="#" className="block px-4 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition">
      ⚙️ Settings
    </a>
  </nav>
</aside>
```

---

## Status & Indicators

### Status Pill States

```tsx
import { StatusPill } from "@/components/shared/StatusPill";

<div className="space-y-2 p-4">
  <StatusPill status="running" />
  <StatusPill status="live" />
  <StatusPill status="error" />
  <StatusPill status="learning" />
  <StatusPill status="idle" />
</div>
```

### Progress Bar

```tsx
<div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
  <div 
    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
    style={{ width: "75%" }}
  />
</div>
```

### Loading Spinner

```tsx
<div className="flex items-center justify-center p-8">
  <div className="w-12 h-12 border-4 border-neutral-700 border-t-blue-500 rounded-full animate-spin" />
</div>
```

### Info Badge

```tsx
<div className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-xs font-semibold">
  New Feature
</div>
```

---

## Data Display

### Table Pattern

```tsx
<Card>
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-neutral-800">
        <th className="text-left px-4 py-3 text-neutral-500 font-semibold">Name</th>
        <th className="text-left px-4 py-3 text-neutral-500 font-semibold">Status</th>
        <th className="text-left px-4 py-3 text-neutral-500 font-semibold">Value</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-neutral-800/50 hover:bg-white/5 transition">
        <td className="px-4 py-3 text-white">Item 1</td>
        <td className="px-4 py-3 text-emerald-300">Active</td>
        <td className="px-4 py-3 text-white">$1,234</td>
      </tr>
      <tr className="border-b border-neutral-800/50 hover:bg-white/5 transition">
        <td className="px-4 py-3 text-white">Item 2</td>
        <td className="px-4 py-3 text-neutral-400">Inactive</td>
        <td className="px-4 py-3 text-white">$567</td>
      </tr>
    </tbody>
  </table>
</Card>
```

### List with Icons

```tsx
<ul className="space-y-3">
  <li className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition">
    <span className="text-xl">✓</span>
    <span className="text-white">Feature enabled</span>
  </li>
  <li className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition">
    <span className="text-xl">⚠️</span>
    <span className="text-yellow-300">Warning: Action required</span>
  </li>
  <li className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition">
    <span className="text-xl">✕</span>
    <span className="text-red-300">Error occurred</span>
  </li>
</ul>
```

---

## Grid Layouts

### 3-Column Dashboard

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>
    <div className="text-xs uppercase tracking-[0.16em] text-neutral-500 mb-2">
      Metric 1
    </div>
    <div className="text-3xl font-bold text-white">$1.2M</div>
  </Card>
  <Card>
    <div className="text-xs uppercase tracking-[0.16em] text-neutral-500 mb-2">
      Metric 2
    </div>
    <div className="text-3xl font-bold text-white">+45%</div>
  </Card>
  <Card>
    <div className="text-xs uppercase tracking-[0.16em] text-neutral-500 mb-2">
      Metric 3
    </div>
    <div className="text-3xl font-bold text-white">98/100</div>
  </Card>
</div>
```

### 2:1 Asymmetric Layout

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <div className="lg:col-span-2">
    <Card>
      <h2 className="text-xl font-bold text-white mb-4">Main Content</h2>
      {/* Wide card content */}
    </Card>
  </div>
  <div>
    <Card>
      <h2 className="text-xl font-bold text-white mb-4">Sidebar</h2>
      {/* Narrow card content */}
    </Card>
  </div>
</div>
```

---

## Animation Examples

### Fade In on Mount

```tsx
<div className="animate-[fadeIn_0.25s_ease]">
  <Card>Appears smoothly on load</Card>
</div>
```

### Pulse Effect

```tsx
<div className="animate-pulse">
  <div className="h-8 bg-neutral-800 rounded w-full" />
</div>
```

### Hover Lift

```tsx
<div className="transition-transform hover:scale-105 hover:shadow-lg">
  <Card>Lifts on hover</Card>
</div>
```

### Bounce Loading

```tsx
<div className="flex gap-2">
  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" />
  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
  <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
</div>
```

---

## Dark/Light Theme Support

### Conditional Styling

```tsx
<div className="
  bg-white dark:bg-neutral-950
  text-black dark:text-white
  border-gray-200 dark:border-neutral-800
">
  Content adapts to theme
</div>
```

### Theme-aware Card

```tsx
<div className="
  bg-white dark:bg-neutral-950
  border border-gray-200 dark:border-neutral-800
  rounded-xl p-4
  shadow-md dark:shadow-xl
">
  <h3 className="text-black dark:text-white font-bold">
    Theme-aware component
  </h3>
</div>
```

---

## Copy-Paste Ready Patterns

### Alert Box

```tsx
<div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300">
  ℹ️ This is an informational alert
</div>
```

### Success Message

```tsx
<div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
  ✓ Operation completed successfully
</div>
```

### Error Message

```tsx
<div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
  ✕ An error occurred. Please try again.
</div>
```

### Warning Message

```tsx
<div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300">
  ⚠️ This action cannot be undone
</div>
```

---

## Performance Tips

✅ Use `memo()` for frequently rendered components  
✅ Lazy load heavy components with `dynamic()`  
✅ Implement virtual scrolling for long lists  
✅ Debounce input handlers  
✅ Use CSS animations instead of JS when possible  
✅ Optimize images with Next.js Image component  
✅ Profile with React DevTools & Lighthouse

---

## Testing Components

### Basic Snapshot Test

```tsx
import { render } from "@testing-library/react";
import { Card } from "@/components/ui/Card";

describe("Card", () => {
  it("renders children", () => {
    const { getByText } = render(<Card>Test content</Card>);
    expect(getByText("Test content")).toBeInTheDocument();
  });
});
```

### Accessibility Test

```tsx
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

it("has no accessibility violations", async () => {
  const { container } = render(<Card>Content</Card>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 12+, Chrome for Android

---

## Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Lucide React Icons](https://lucide.dev)
- [Web Accessibility](https://www.w3.org/WAI/WCAG21/quickref/)
- [Next.js Documentation](https://nextjs.org/docs)

