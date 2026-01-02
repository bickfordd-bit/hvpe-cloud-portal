# Adding Bickford Custom Font

## Status: Using Google Caveat as Fallback

Currently using **Google Caveat** font (handwritten style similar to the Bickford signature) as a fallback until the custom font files are added.

## To Add Custom Bickford Font Files

1. **Convert the font image to actual font files:**
   - Use a service like Calligraphr (https://www.calligraphr.com/)
   - Or FontForge to digitize the handwritten signature
   - Export as `.woff2` and `.woff` formats

2. **Add font files to:**
   ```
   public/fonts/
   ├── bickford-regular.woff2
   ├── bickford-regular.woff
   ├── bickford-bold.woff2
   └── bickford-bold.woff
   ```

3. **The app will automatically use them** - font setup is already complete in:
   - `src/app/fonts.ts` - Font configuration
   - `src/app/globals.css` - @font-face declarations
   - `src/app/layout.tsx` - Applied globally
   - `tailwind.config.js` - Tailwind theme extension

## Current Font Stack

```css
font-family: 'Bickford', 'Caveat', 'Brush Script MT', cursive;
```

**Fallback Fonts:**
1. Bickford (custom, when files are added)
2. Caveat (Google Fonts - handwritten style)
3. Brush Script MT (system font)
4. Generic cursive

## Usage in Components

The font is applied globally, but you can also use Tailwind classes:

```tsx
<h1 className="font-bickford">This uses Bickford font</h1>
<p className="font-sans">This also uses Bickford (default sans)</p>
```

## Font Characteristics

Based on the signature image:
- **Style**: Handwritten script
- **Weight**: 400 (regular), 700 (bold)
- **Character**: Casual, flowing, personal
- **Use case**: Brand identity, headers, signature elements

## Testing

Currently using Caveat from Google Fonts. To test:

```bash
npm run dev
# Visit http://localhost:3000
# All text should appear in handwritten style
```

## Future: Custom Font Generation

If you want to generate a proper Bickford font from the signature:

1. **Using Calligraphr** (free tier):
   - Create account
   - Use template to write alphabet
   - Upload handwritten characters
   - Generate and download font

2. **Using FontForge** (free, open source):
   - Trace signature letters
   - Create font glyphs
   - Export as web fonts

3. **Professional option**:
   - Hire a type designer to create complete character set
   - Based on the signature style
   - Cost: $500-5000 depending on completeness
