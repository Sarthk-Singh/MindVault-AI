# Design Tokens and Styling Configuration

The application uses Tailwind CSS v4 for styling. Custom theme parameters, spacing, colors, font families, and border radii are configured via `@theme` in `src/index.css`.

## Full CSS Stylesheet (`index.css`)

- **File Path**: [index.css](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/index.css)

```css
@import "tailwindcss";

@theme {
  --color-on-surface-variant: #45474c;
  --color-outline: #75777d;
  --color-on-secondary-fixed: #191c1e;
  --color-secondary-fixed: #e0e3e5;
  --color-surface-container-lowest: #ffffff;
  --color-inverse-surface: #213145;
  --color-on-secondary-container: #626567;
  --color-surface-container-high: #dce9ff;
  --color-surface: #f8f9ff;
  --color-on-error: #ffffff;
  --color-on-primary-fixed: #111c2d;
  --color-tertiary-container: #35260c;
  --color-error-container: #ffdad6;
  --color-outline-variant: #c5c6cd;
  --color-on-background: #0b1c30;
  --color-secondary-fixed-dim: #c4c7c9;
  --color-on-primary-fixed-variant: #3c475a;
  --color-surface-tint: #545f73;
  --color-secondary-container: #e0e3e5;
  --color-inverse-on-surface: #eaf1ff;
  --color-surface-bright: #f8f9ff;
  --color-tertiary-fixed-dim: #ddc39d;
  --color-on-tertiary-container: #a38c6a;
  --color-on-primary-container: #8590a6;
  --color-surface-container-low: #eff4ff;
  --color-on-tertiary: #ffffff;
  --color-on-error-container: #93000a;
  --color-on-secondary-fixed-variant: #444749;
  --color-background: #f8f9ff;
  --color-on-tertiary-fixed: #271902;
  --color-primary-container: #1e293b;
  --color-on-surface: #0b1c30;
  --color-primary-fixed-dim: #bcc7de;
  --color-on-tertiary-fixed-variant: #564427;
  --color-surface-container-highest: #d3e4fe;
  --color-surface-variant: #d3e4fe;
  --color-on-secondary: #ffffff;
  --color-tertiary-fixed: #fadfb8;
  --color-secondary: #5c5f61;
  --color-primary: #091426;
  --color-inverse-primary: #bcc7de;
  --color-tertiary: #1e1200;
  --color-surface-container: #e5eeff;
  --color-error: #ba1a1a;
  --color-surface-dim: #cbdbf5;
  --color-primary-fixed: #d8e3fb;
  --color-on-primary: #ffffff;

  --border-radius-DEFAULT: 0.125rem;
  --border-radius-lg: 0.25rem;
  --border-radius-xl: 0.5rem;
  --border-radius-full: 0.75rem;

  --spacing-lg: 24px;
  --spacing-xl: 40px;
  --spacing-xs: 4px;
  --spacing-md: 16px;
  --spacing-base: 4px;
  --spacing-gutter: 24px;
  --spacing-container-max: 1440px;
  --spacing-sm: 8px;

  --font-family-body-lg: "Inter", sans-serif;
  --font-family-body-md: "Inter", sans-serif;
  --font-family-body-sm: "Inter", sans-serif;
  --font-family-display-lg: "Geist", sans-serif;
  --font-family-label-sm: "Geist", sans-serif;
  --font-family-headline-lg: "Geist", sans-serif;
  --font-family-label-md: "Geist", sans-serif;
  --font-family-headline-sm: "Geist", sans-serif;
  --font-family-headline-md: "Geist", sans-serif;
}

body {
  background-color: #f8f9ff;
  font-family: 'Inter', sans-serif;
  margin: 0;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  display: inline-block;
  vertical-align: middle;
  line-height: 1;
}

.auth-card, .login-card {
  background: #ffffff;
  border: 1px solid #E2E8F0;
  box-shadow: 0px 4px 12px rgba(0,0,0,0.05);
}

.modal-backdrop {
  background-color: rgba(11, 28, 48, 0.4);
  backdrop-filter: blur(4px);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```
