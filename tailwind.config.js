/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './app/**/*.{html,js,jsx,ts,tsx,mdx}',
        './components/**/*.{html,js,jsx,ts,tsx,mdx}',
        './utils/**/*.{html,js,jsx,ts,tsx,mdx}',
        './*.{html,js,jsx,ts,tsx,mdx}',
        './src/**/*.{html,js,jsx,ts,tsx,mdx}',
    ],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#7c5cff',
                    foreground: '#fafafa',
                    50: '#f2e6ee',
                    100: '#ffccf2',
                    200: '#e0b8ff',
                    300: '#c19cff',
                    400: '#a280ff',
                    500: '#7c5cff',
                    600: '#624fe2',
                    700: '#3c2eff',
                    800: '#1d14c7',
                    900: '#0e0a64',
                },
                secondary: {
                    DEFAULT: '#3b82f6',
                    foreground: '#fafafa',
                    50: '#eff6ff',
                    100: '#d0edff',
                    200: '#a3dcff',
                    300: '#6cbcff',
                    400: '#409cff',
                    500: '#007bff',
                    600: '#0062cc',
                    700: '#004a99',
                    800: '#003166',
                    900: '#001933',
                },
                error: {
                    DEFAULT: '#ff4d4f',
                    foreground: '#fafafa',
                    50: '#fdecec',
                    100: '#fac5c5',
                    200: '#f8a9a9',
                    300: '#f48282',
                    400: '#ff4d4f',
                    500: '#e71010',
                    600: '#cf1322',
                    700: '#a8071a',
                    800: '#820014',
                    900: '#5c0011',
                },
                success: {
                    DEFAULT: '#10b981',
                    foreground: '#fafafa',
                    50: '#edfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#78eb7b',
                    500: '#10b981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                },
                muted: '#f5f5f5',
                card: '#f3f3f3',
                'muted-foreground': '#737373',
                accent: '#f5f5f5',
                'accent-foreground': '#171717',
                border: {
                    DEFAULT: '#e5e5e5',
                    100: '#f5f5f5',
                    200: '#e5e5e5',
                    300: '#d4d4d4',
                    400: '#bababa',
                    primary: '#c2d8fc',
                    secondary: '#4c515b',
                    error: '#ff4d4f',
                },
                input: '#e5e5e5',
                ring: '#0a0a0a',
                'color-dark': '#171738',
                'text-primary': '#7c5cff',
                'text-secondary': '#624fe2',
                'text-error': '#e71010',
                'text-success': '#78eb7b',
                chart: {
                    1: '#3b82f6',
                    2: '#10b981',
                    3: '#ff4d4f',
                    4: '#c19cff',
                    5: '#facc15',
                },
                sidebar: {
                    background: 'hsl(0 0% 98%)',
                    foreground: 'hsl(240 5.3% 26.1%)',
                    primary: 'hsl(240 5.9% 10%)',
                    'primary-foreground': 'hsl(0 0% 98%)',
                    accent: 'hsl(240 4.8% 95.9%)',
                    'accent-foreground': 'hsl(240 5.9% 10%)',
                    border: 'hsl(220 13% 91%)',
                    ring: 'hsl(217.2 91.2% 59.8%)',
                },
            },
            fontFamily: {
                heading: undefined,
                body: undefined,
                mono: undefined,
                jakarta: ['var(--font-plus-jakarta-sans)'],
                roboto: ['var(--font-roboto)'],
                code: ['var(--font-source-code-pro)'],
                inter: ['var(--font-inter)'],
                'space-mono': ['var(--font-space-mono)'],
            },
            fontWeight: {
                extrablack: '950',
            },
            fontSize: {
                '2xs': '17px', //
                xs: '0.75rem', // 12px
                sm: '0.875rem', // 14px
                base: '1rem', // 16px
                lg: '1.125rem', // 18px
                xl: '1.25rem', // 20px
                '2xl': '1.5rem', // 24px
                '3xl': '1.875rem', // 30px
                '4xl': '2.25rem', // 36px
                '5xl': '3rem', // 48px
                '6xl': '3.75rem', // 60px
                '7xl': '4.5rem', // 72px
                '8xl': '6rem', // 96px
                '9xl': '8rem', // 128px
            },
            boxShadow: {
                '2xs':
                    '0px 0px 3px 2px rgba(23, 23, 23, 0.18), 0px 3px 6px 2px rgba(23, 23, 23, 0.18), 0px 3px 6px 2px rgba(23, 23, 23, 0.28)',
                xs: '0px 3px 6px 2px rgba(0, 0, 0, 0.28), 0px 4px 8px 2px rgba(16, 24, 40, 0.24), 0px 3px 14px -1px rgba(16, 24, 40, 0.22)',
                sm: '0px 3px 8px 2px rgba(0, 0, 0, 0.12), 0px 6px 14px 2px rgba(0, 0, 0, 0.14), 0px 3px 18px 0px rgba(0, 0, 0, 0.24)',
                rg: '0px 5px 12px 2px rgba(0, 0, 0, 0.22), 0px 6px 10px 2px rgba(16, 24, 40, 0.2), 0px 3px 18px 0px rgba(16, 24, 40, 0.16)',
                md: '0px 6px 14px 2px rgba(0, 0, 0, 0.4), 0px 10px 18px 2px rgba(0, 0, 0, 0.4), 0px 3px 22px 0px rgba(0, 0, 0, 0.4)',
                lg: '0px 10px 18px 3px rgba(0, 0, 0, 0.45), 0px 12px 24px 3px rgba(0, 0, 0, 0.45), 0px 3px 34px 0px rgba(0, 0, 0, 0.45)',
                xl: '0px 0px 28px 3px rgba(0, 0, 0, 0.5), 0px 0px 34px 3px rgba(0, 0, 0, 0.5), 0px 0px 64px 0px rgba(0, 0, 0, 0.5)',
                '2xl':
                    '0px 12px 24px 3px rgba(0, 0, 0, 0.24), 0px 16px 34px 3px rgba(16, 24, 40, 0.24), 0px 3px 42px 0px rgba(16, 24, 40, 0.24)',
                '3xl':
                    '0px 16px 34px 3px rgba(0, 0, 0, 0.24), 0px 20px 42px 3px rgba(0, 0, 0, 0.24), 0px 3px 60px 0px rgba(16, 24, 40, 0.24)',
                '4xl':
                    '0px 12px 52px 3px rgba(0, 0, 61, 0.16), 0px 16px 42px -16px rgba(0, 0, 0, 0.16)',
            },
            borderRadius: {
                DEFAULT: '0.5rem',
            },
        },
    },
};