# ZED TECH - Checkout Booster Website

Modern, SEO-optimized landing page built with Next.js 14+, Tailwind CSS, and next-intl for internationalization.

## 🚀 Features

- ✅ **Next.js 14+ App Router** - Modern React framework with server components
- ✅ **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- ✅ **Internationalization (i18n)** - French (`/fr-FR`) and English (`/en-EN`) versions
- ✅ **SEO Optimized** - Sitemap, robots.txt, meta tags, Open Graph, structured data, favicon
- ✅ **Working Contact Form** - Server-side form submission with nodemailer
- ✅ **Responsive Design** - Mobile-first, works on all devices
- ✅ **TypeScript** - Type-safe code throughout

## 📁 Project Structure

```
├── app/
│   ├── [locale]/          # Internationalized routes
│   │   ├── layout.tsx     # Locale-specific layout
│   │   ├── page.tsx       # Home page
│   │   ├── not-found.tsx  # Custom 404 page
│   │   └── opengraph-image.tsx  # Social sharing image
│   ├── actions/           # Server actions
│   │   └── waitlist.ts    # Form submission handler
│   ├── icon.tsx           # Favicon
│   ├── apple-icon.tsx     # Apple touch icon
│   ├── manifest.ts        # PWA manifest
│   ├── robots.ts          # Robots.txt
│   ├── sitemap.ts         # XML sitemap
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Hero.tsx
│   ├── Choices.tsx
│   ├── Notice.tsx
│   ├── Story.tsx
│   ├── SocialProof.tsx
│   ├── Process.tsx
│   ├── Offers.tsx
│   ├── Waitlist.tsx       # Contact form with submission
│   └── Footer.tsx
├── messages/              # Translation files
│   ├── fr-FR.json         # French translations
│   └── en-EN.json         # English translations
├── .env.local             # Environment variables (not in git)
└── middleware.ts          # i18n routing middleware
```

## 🛠️ Setup & Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   The `.env.local` file is already configured with your Gmail credentials:
   ```
   NODE_ENV="development"
   CONTACT_MAIL_ADDRESS="piveteauit@gmail.com"
   CONTACT_MAIL_PASSWORD="pgzn hklr ugeb yteo"
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - French version: http://localhost:3000/fr-FR
   - English version: http://localhost:3000/en-EN

## 🌐 Routes

The website uses locale-based routing:

- `/fr-FR` - French version
- `/en-EN` - English version

All routes are automatically prefixed with the locale.

## 📧 Contact Form

The waitlist form uses Next.js Server Actions to submit data via nodemailer. The form:

- Validates all required fields
- Sends email to configured address
- Shows success/error feedback
- Resets form on successful submission

## 🎨 Customization

### Colors

Edit `tailwind.config.ts` to customize the color palette:

```typescript
colors: {
  beige: '#F5EDE4',
  salmon: '#FFC9B9',
  navy: '#1E2A47',
  'navy-light': '#2D3E5F',
  'text-dark': '#1A1A1A',
  'text-gray': '#5A5A5A',
  accent: '#E88B7A',
}
```

### Translations

Edit translation files in `messages/`:
- `fr-FR.json` - French translations
- `en-EN.json` - English translations

### Images

Replace placeholder images in components with your actual images. Current placeholders use placehold.co.

## 🚀 Deployment

### Build for production:
```bash
npm run build
```

### Start production server:
```bash
npm start
```

### Deploy to Vercel (recommended):
```bash
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## 📊 SEO Features

- ✅ XML Sitemap (`/sitemap.xml`)
- ✅ Robots.txt (`/robots.txt`)
- ✅ Favicon and app icons
- ✅ PWA manifest
- ✅ Dynamic meta tags per locale (title, description, keywords)
- ✅ Open Graph tags for social sharing
- ✅ Twitter Card support
- ✅ Canonical URLs
- ✅ Language alternates (hreflang)
- ✅ Structured data (JSON-LD)
- ✅ Custom 404 page
- ✅ Semantic HTML structure
- ✅ Optimized images with Next.js Image component

## 🔧 Tech Stack

- **Framework:** Next.js 14+
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **i18n:** next-intl
- **Email:** nodemailer
- **Fonts:** Google Fonts (Inter)

## 📝 License

ISC

## 👤 Author

Romain Piveteau
- Email: romain@zedcheckout.com
- LinkedIn: https://linkedin.com/in/romain-piveteau
- Portfolio: https://piveteau.digital
