/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        'surface-elevated': 'var(--color-surface-elevated)',
        'surface-subtle': 'var(--color-surface-subtle)',
        'surface-muted': 'var(--color-surface-muted)',
        border: 'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',
        ink: 'var(--color-ink)',
        'ink-muted': 'var(--color-ink-muted)',
        'ink-subtle': 'var(--color-ink-subtle)',
        brand: 'var(--color-brand)',
        'brand-hover': 'var(--color-brand-hover)',
        'brand-subtle': 'var(--color-brand-subtle)',
        accent: 'var(--color-accent)',
        'accent-subtle': 'var(--color-accent-subtle)',
        success: 'var(--color-success)',
        'success-subtle': 'var(--color-success-subtle)',
        warning: 'var(--color-warning)',
        'warning-subtle': 'var(--color-warning-subtle)',
        danger: 'var(--color-danger)',
        'danger-subtle': 'var(--color-danger-subtle)',
      },
      fontFamily: {
        serif: ["'Inter Tight'", '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ["'Inter Tight'", '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
