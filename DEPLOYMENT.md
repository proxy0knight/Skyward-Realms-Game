# 🚀 Deployment Guide

This guide will help you deploy your Skyward Realms Game to various hosting platforms.

## 📋 Prerequisites

1. **Build the project**:
   ```bash
   cd game-client
   npm run build
   ```

2. **Verify the build**:
   ```bash
   npm run preview
   ```

## 🌐 Deployment Options

### 1. GitHub Pages (Free)

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json**:
   ```json
   {
     "scripts": {
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://YOUR_USERNAME.github.io/Skyward-Realms-Game"
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

4. **Configure GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Save

### 2. Netlify (Free)

1. **Drag and Drop**:
   - Go to [netlify.com](https://netlify.com)
   - Drag your `dist` folder to the deploy area
   - Your site will be live instantly

2. **Git Integration**:
   - Connect your GitHub repository
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Deploy automatically on push

### 3. Vercel (Free)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Follow the prompts**:
   - Link to existing project or create new
   - Set build command: `npm run build`
   - Set output directory: `dist`

### 4. Firebase Hosting (Free)

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login and initialize**:
   ```bash
   firebase login
   firebase init hosting
   ```

3. **Configure**:
   - Public directory: `dist`
   - Single-page app: Yes
   - GitHub Actions: Optional

4. **Deploy**:
   ```bash
   firebase deploy
   ```

### 5. AWS S3 + CloudFront

1. **Create S3 bucket**:
   - Enable static website hosting
   - Upload `dist` contents

2. **Configure CloudFront**:
   - Origin: S3 bucket
   - Default root object: `index.html`
   - Error pages: Redirect to `index.html`

3. **Deploy**:
   ```bash
   aws s3 sync dist/ s3://your-bucket-name
   ```

## 🔧 Environment Configuration

### Production Build
```bash
# Set production environment
NODE_ENV=production npm run build
```

### Environment Variables
Create `.env.production`:
```env
VITE_API_URL=https://your-api-domain.com
VITE_GAME_VERSION=1.0.0
```

## 📱 PWA Configuration

For Progressive Web App features:

1. **Add to vite.config.js**:
   ```javascript
   import { VitePWA } from 'vite-plugin-pwa'

   export default {
     plugins: [
       VitePWA({
         registerType: 'autoUpdate',
         workbox: {
           globPatterns: ['**/*.{js,css,html,ico,png,svg}']
         }
       })
     ]
   }
   ```

2. **Install plugin**:
   ```bash
   npm install vite-plugin-pwa
   ```

## 🔒 Security Considerations

1. **HTTPS Only**: Ensure your hosting uses HTTPS
2. **Content Security Policy**: Add CSP headers
3. **Asset Optimization**: Compress images and assets
4. **Caching**: Configure proper cache headers

## 📊 Performance Optimization

1. **Asset Compression**:
   ```bash
   npm install --save-dev compression-webpack-plugin
   ```

2. **Image Optimization**:
   ```bash
   npm install --save-dev imagemin-webpack-plugin
   ```

3. **Bundle Analysis**:
   ```bash
   npm install --save-dev webpack-bundle-analyzer
   ```

## 🐛 Troubleshooting

### Common Issues

1. **404 Errors on Refresh**:
   - Configure your hosting to serve `index.html` for all routes
   - Add `_redirects` file (Netlify) or similar

2. **Asset Loading Issues**:
   - Check base URL configuration
   - Verify asset paths are relative

3. **Build Failures**:
   - Clear node_modules and reinstall
   - Check for TypeScript errors
   - Verify all dependencies are installed

### Debug Commands
```bash
# Check build size
npm run build -- --analyze

# Check for unused dependencies
npm install -g depcheck
depcheck

# Lint code
npm run lint
```

## 📈 Monitoring

1. **Analytics**: Add Google Analytics or similar
2. **Error Tracking**: Implement error reporting (Sentry, etc.)
3. **Performance**: Monitor Core Web Vitals
4. **Uptime**: Set up uptime monitoring

## 🔄 Continuous Deployment

### GitHub Actions Example
```yaml
name: Deploy to Netlify
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run build
      - uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: './dist'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
```

---

**Happy Deploying! 🚀** 