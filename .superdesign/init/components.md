# Shared UI Components

This project does not contain separate reusable primitive UI components (like `<Button>` or `<Input>`) in a dedicated UI folder. All UI primitives are rendered using native HTML tags styled inline with Tailwind CSS v4 tokens and classes. 

Below are the standard implementation patterns for the primary UI primitives used across the codebase:

## 1. Input Field (with Icon)
Used in: [Login.tsx](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/pages/Login.tsx), [Register.tsx](file:///Users/sarthaksingh/Documents/Projects/MindVault-AI copy/frontend/src/pages/Register.tsx)

```tsx
<div className="flex flex-col gap-xs">
  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="email">
    Email Address
  </label>
  <div className="relative flex items-center">
    <span className="material-symbols-outlined absolute left-md text-outline">mail</span>
    <input
      id="email"
      type="email"
      placeholder="name@company.com"
      className="w-full pl-[48px] pr-md py-md border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-surface transition-all font-body-md text-body-md outline-none"
    />
  </div>
</div>
```

## 2. Primary Button
Used in: Form submissions and primary actions.

```tsx
<button
  type="submit"
  className="w-full bg-primary text-surface py-md rounded-lg font-label-md hover:bg-primary/90 transition-all font-bold flex items-center justify-center gap-sm"
>
  <span>Submit</span>
</button>
```

## 3. Secondary / Icon Button
Used for actions that are secondary to the main CTA.

```tsx
<button
  type="button"
  className="px-md py-sm border border-outline-variant text-on-surface hover:bg-surface-container rounded-lg font-label-md transition-all flex items-center gap-sm"
>
  <span className="material-symbols-outlined">add</span>
  <span>Add Item</span>
</button>
```

## 4. Status Badge
Used in: Tables and lists for meeting processing state.

```tsx
// Done state
<span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">
  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
  <span>DONE</span>
</span>

// Processing state
<span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold">
  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
  <span>PROCESSING</span>
</span>
```

## 5. Modal / Dialog Wrapper
Used in: Create Workspace, Create Meeting, Invite Member.

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-md">
  <div className="modal-backdrop absolute inset-0 bg-[#0b1c30]/40 backdrop-blur-sm" onClick={onClose} />
  <div className="relative bg-surface border border-outline-variant rounded-xl w-full max-w-[520px] shadow-xl overflow-hidden p-lg md:p-xl flex flex-col gap-lg z-10">
    <div className="flex justify-between items-start">
      <h3 className="font-headline-sm text-headline-sm">Modal Title</h3>
      <button onClick={onClose} className="p-xs rounded-full hover:bg-surface-container text-on-surface-variant">
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
    {/* Form/Content */}
  </div>
</div>
```
