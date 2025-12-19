import localFont from 'next/font/local';

// Bickford handwritten font - the signature style
export const bickfordFont = localFont({
  src: [
    {
      path: '../../public/fonts/bickford-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/bickford-bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-bickford',
  display: 'swap',
  fallback: ['Caveat', 'Comic Sans MS', 'cursive'],
});

// Alternative: Use Google's Caveat as fallback until custom font is added
export const bickfordFallback = localFont({
  src: [],
  variable: '--font-bickford',
  fallback: ['Caveat', 'Brush Script MT', 'cursive'],
});
