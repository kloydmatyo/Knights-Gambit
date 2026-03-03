# Knight's Gambit - Deployment Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git (for version control)

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production

```bash
npm run build
```

### 4. Test Production Build

```bash
npm start
```

## Deploy to Vercel (Recommended)

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Deploy to production:
```bash
vercel --prod
```

### Option 2: Deploy via GitHub

1. Push code to GitHub repository

2. Go to [vercel.com](https://vercel.com)

3. Click "New Project"

4. Import your GitHub repository

5. Configure:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

6. Click "Deploy"

Your game will be live at: `https://your-project.vercel.app`

## Deploy to Netlify

### Via Netlify CLI

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login:
```bash
netlify login
```

3. Initialize:
```bash
netlify init
```

4. Deploy:
```bash
netlify deploy --prod
```

### Via Netlify Dashboard

1. Build the project:
```bash
npm run build
```

2. Go to [netlify.com](https://netlify.com)

3. Drag and drop the `.next` folder

## Environment Variables

If you add features that need environment variables:

### Local Development
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=your_api_url
```

### Production (Vercel)
Add in Vercel Dashboard → Settings → Environment Variables

### Production (Netlify)
Add in Netlify Dashboard → Site Settings → Environment Variables

## Custom Domain

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Netlify
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Configure DNS

## Performance Optimization

### Already Implemented
- ✅ Code splitting
- ✅ Lazy loading
- ✅ Optimized images
- ✅ Minified CSS/JS
- ✅ Tree shaking

### Additional Optimizations
1. Enable Vercel Analytics
2. Add Vercel Speed Insights
3. Configure caching headers
4. Enable compression

## Monitoring

### Vercel Analytics
```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## SEO Optimization

Already configured in `app/layout.tsx`:
- ✅ Meta title
- ✅ Meta description
- ✅ Keywords
- ✅ Viewport settings

### Add More SEO
```typescript
export const metadata = {
  title: "Knight's Gambit",
  description: "...",
  openGraph: {
    title: "Knight's Gambit",
    description: "...",
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Knight's Gambit",
    description: "...",
  },
};
```

## Troubleshooting

### Build Errors

**Issue**: TypeScript errors
```bash
npm run build
```
Fix all TypeScript errors before deploying.

**Issue**: Missing dependencies
```bash
npm install
```

### Runtime Errors

**Issue**: "Module not found"
- Check import paths
- Ensure all files are committed

**Issue**: Hydration errors
- Check for client/server mismatches
- Use `'use client'` directive where needed

## Post-Deployment Checklist

- [ ] Test on mobile devices
- [ ] Test on different browsers
- [ ] Check loading times
- [ ] Verify all features work
- [ ] Test responsive design
- [ ] Check console for errors
- [ ] Verify SEO meta tags
- [ ] Test social media sharing

## Continuous Deployment

### Vercel (Automatic)
- Push to `main` branch → Auto-deploy to production
- Push to other branches → Auto-deploy to preview

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Success!

Your game is now live and accessible worldwide! 🎉

**Next Steps:**
1. Share the link
2. Gather feedback
3. Monitor analytics
4. Plan updates

## Support

For issues:
1. Check console errors
2. Review build logs
3. Check Vercel/Netlify status
4. Review documentation

**Your game is production-ready and deployed!** 🚀
