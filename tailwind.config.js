/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Segoe UI Variable"',
          '"Segoe UI"',
          '"Microsoft YaHei UI"',
          'system-ui',
          'sans-serif'
        ],
        mono: ['"Cascadia Code"', '"Cascadia Mono"', 'Consolas', 'monospace']
      },
      colors: {
        fluent: {
          accent: '#0067C0',
          accentHover: '#005FB8',
          accentDark: '#60CDFF',
          accentDarkHover: '#4CC2FF',
          micaLight: '#F3F3F3',
          micaDark: '#202020',
          layerLight: '#FBFBFB',
          layerDark: '#2B2B2B',
          cardLight: '#FFFFFF',
          cardDark: '#2D2D2D'
        }
      },
      boxShadow: {
        'fluent-card': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'fluent-flyout': '0 8px 16px rgba(0, 0, 0, 0.14), 0 0 2px rgba(0, 0, 0, 0.12)',
        'fluent-dialog': '0 32px 64px rgba(0, 0, 0, 0.24), 0 2px 21px rgba(0, 0, 0, 0.15)'
      }
    }
  },
  plugins: []
}
