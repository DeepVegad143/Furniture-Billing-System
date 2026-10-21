import { Font } from '@react-pdf/renderer';

// Register standard Noto Sans and Noto Sans Gujarati for @react-pdf/renderer
export function registerPdfFonts() {
  try {
    Font.register({
      family: 'NotoSans',
      fonts: [
        {
          src: 'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/latin-400-normal.ttf',
          fontWeight: 'normal',
        },
        {
          src: 'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/latin-700-normal.ttf',
          fontWeight: 'bold',
        },
      ],
    });

    Font.register({
      family: 'NotoSansGujarati',
      fonts: [
        {
          src: 'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-gujarati@latest/gujarati-400-normal.ttf',
          fontWeight: 'normal',
        },
        {
          src: 'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-gujarati@latest/gujarati-700-normal.ttf',
          fontWeight: 'bold',
        },
      ],
    });
  } catch (err) {
    console.warn('Notice: PDF font registration error or already registered:', err);
  }
}
