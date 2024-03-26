const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        unocha: {
          pallete: {
            red: {
              dark: '#990000',
              light: '#ffb3b3',
            },
            orange: {
              dark2: '#b44d0e',
              dark1: '#d05b10',
              DEFAULT: '#e16856',
              light: '#FF9E5F',
            },
            yellow: {
              DEFAULT: '#FFC000',
              dark: '#E6A300',
              light: '#FFD966',
            },
            blue: {
              dark2: '#025995',
              DEFAULT: '#026cb6',
              light: '#96c3e1',
            },
            green: {
              DEFAULT: '#2e7d32',
              light: '#afdfb0',
            },
            gray: {
              DEFAULT: '#333333',
              light: '#6f7e94',
              light1: '#999999',
              light2: '#d1d1d1',
              light3: '#dadada',
              light4: '#e6ecf1',
              light5: '#f3f5f8',
            },
          },
          primary: {
            dark2: '#025995',
            DEFAULT: '#026cb6',
            light: '#96c3e1',
          },
          secondary: {
            dark2: '#b44d0e',
            dark1: '#d05b10',
            DEFAULT: '#e16856',
            light: '#FF9E5F',
          },
          success: {
            DEFAULT: '#2e7d32',
            light: '#afdfb0',
          },
          error: {
            DEFAULT: '#990000',
            light: '#ffb3b3',
          },
          warning: {
            DEFAULT: '#FFC000',
            dark: '#E6A300',
            light: '#FFD966',
          },
          text: {
            DEFAULT: '#333333',
            light: '#6f7e94',
            link: '#b44d0e',
            error: {
              DEFAULT: '#990000',
              light: '#ffb3b3',
            },
          },
          text: '#333333',
          textLight: '#6f7e94',
          textLink: '#b44d0e',
          textError: '#990000',
          textErrorLight: '#ffb3b3',
          dividers: '#e6ecf1',
          panel: {
            border: '#d1d1d1',
            bg: '#f3f5f8',
            bgSelected: '#dadada',
            bgHover: '#e6ecf1',
          },
        },
      },
      spacing: {
        sm: '5px',
        md: '15px',
        lg: '30px',
      },
      borderRadius: {
        sm: '3px',
        md: '6px',
      },
      container: {
        screens: {
          xl: '1240px',
        },
      },
      fontSize: {
        sm: '0.8rem',
      },
      height: {
        singleLineBlockItem: '49px',
      },
      animation: {
        fast: '0.2s ease-out',
      },
    },
  },
  plugins: [],
};
