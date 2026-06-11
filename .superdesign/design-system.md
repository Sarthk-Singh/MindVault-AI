# Design System — AI Meeting Memory System (AMMS)

This document defines the branding, visual direction, design tokens, and components specifications for the AMMS platform.

## 1. Visual Style & Theme
- **Theme Mode**: Dark Space/Premium theme.
- **Brand Aesthetic**: Futuristic glassmorphism inspired by high-end developer tools (Notion, Linear, Vercel). Features clean glass cards, glowing mouse-track blurs, and animated particle constellations.

## 2. Color Palette
The colors are mapped to Tailwind CSS v4 variables:

| Token | CSS Variable | Value | Description |
|---|---|---|---|
| Background | `--color-background` | `#f8f9ff` | Core layout background |
| Surface | `--color-surface` | `#f8f9ff` | Default surface card fill |
| Primary Accent | `--color-primary` | `#091426` | Deep navy for main titles, primary text & CTAs |
| Secondary | `--color-secondary` | `#5c5f61` | Cool gray for subtitles and non-interactive text |
| Workspace Container | `--color-primary-container` | `#1e293b` | Dark slate for workspace headers / active items |
| Border outline | `--color-outline-variant` | `#c5c6cd` | Subtle border separators |
| Error State | `--color-error` | `#ba1a1a` | Warning messages and red buttons |
| Success State | *Custom Green* | `#22c55e` | Success states and badges |

## 3. Typography
- **Headings & Labels**: **Geist** Sans-Serif font (weights: 500, 600, 700). Used for page titles, headers, modal titles, and tables.
- **Body Content**: **Inter** Sans-Serif font (weights: 400, 500). Used for transcripts, summaries, paragraphs, and description fields.

## 4. Spacing & Grid System
We use a standard spacing scale:
- `xs` (Extra Small): `4px`
- `sm` (Small): `8px`
- `md` (Medium): `16px`
- `lg` (Large): `24px`
- `xl` (Extra Large): `40px`
- `gutter` (Layout padding): `24px`
- `container-max`: `1440px`

## 5. Border Radii
- Default border-radius: `0.125rem` (2px)
- `lg` border-radius: `0.25rem` (4px)
- `xl` border-radius: `0.5rem` (8px)
- `full` border-radius: `0.75rem` (12px)

## 6. Key UI Patterns
- **Glassmorphism**: Glass cards use thin semi-transparent white borders (`border border-outline-variant`), white/blueish tint backgrounds, and smooth blur shadows to give depth.
- **Side Nav Layout**: Left sidebar is fixed to `280px` on desktop with sidebar routes, and content area has a padded margin.
- **Header**: Top nav has absolute height `16` (mobile) / `20` (desktop) and displays notifications and search.
