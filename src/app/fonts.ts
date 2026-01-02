import { Caveat } from 'next/font/google';

// Use Google's Caveat font as Bickford signature style
// TODO: Replace with custom Bickford font files when available
export const bickfordFont = Caveat({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-bickford',
  display: 'swap',
});
