# Design System Notes

This document records the current design-system baseline for CreepJS while E1 is
in progress. It is the source of truth for theme behavior and shared visual
tokens used by the shipped UI.

## Theme decision

CreepJS ships a real persisted `light` / `dark` theme toggle.

- Storage key: `creepjs-theme`
- Initial theme: stored preference, otherwise system `prefers-color-scheme`
- No-flash behavior: an inline head script sets the `dark` class before React
  hydration
- Accessibility: the toggle exposes an explicit aria-label for the next theme

## Core tokens

These tokens currently live in [`apps/web/src/app/globals.css`](/Volumes/SSD/dev/ip-dataset/creepjs/apps/web/src/app/globals.css).

| Token                | Light               | Dark                | Use                  |
| -------------------- | ------------------- | ------------------- | -------------------- |
| `--background`       | `0 0% 100%`         | `222.2 84% 4.9%`    | App background       |
| `--foreground`       | `222.2 84% 4.9%`    | `210 40% 98%`       | Primary text         |
| `--primary`          | `221.2 83.2% 53.3%` | `217.2 91.2% 59.8%` | Primary CTA / focus  |
| `--secondary`        | `210 40% 96.1%`     | `217.2 32.6% 17.5%` | Secondary surfaces   |
| `--muted`            | `210 40% 96.1%`     | `217.2 32.6% 17.5%` | Subtle surfaces      |
| `--muted-foreground` | `215.4 16.3% 46.9%` | `215 20.2% 65.1%`   | Secondary text       |
| `--destructive`      | `0 84.2% 60.2%`     | `0 62.8% 30.6%`     | Error states         |
| `--border`           | `214.3 31.8% 91.4%` | `217.2 32.6% 17.5%` | Borders / dividers   |
| `--ring`             | `221.2 83.2% 53.3%` | `224.3 76.3% 48%`   | Focus ring           |
| `--radius`           | `0.5rem`            | `0.5rem`            | Shared corner radius |

## Shipped primitives

Current shared primitives in `components/ui/`:

- `alert`
- `badge`
- `button`
- `card`
- `input`
- `skeleton`
- `tabs`

## Usage guidance

Do:

- use semantic Tailwind tokens such as `bg-background`, `text-foreground`, and `border-border`
- prefer shared UI primitives over bespoke button/card/tab variants
- keep focus states visible in both themes

Do not:

- hardcode `<html className="dark">` when a persisted theme is supported
- encode theme-specific hex colors inline in page components unless there is no semantic token yet
- introduce new interactive primitives without first deciding whether they belong in `components/ui/`
