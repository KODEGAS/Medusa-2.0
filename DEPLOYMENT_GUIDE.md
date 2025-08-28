# Medusa 2.0 Deployment Configuration

## 🌐 Domain Configuration
**Production Domain:** https://medusa.ecsc-uok.com
**Development Domain:** http://localhost:8080

## 📦 Build Configuration

### Environment Variables
Create a `.env.production` file in the root directory:

```bash
# Production Environment Variables
VITE_APP_TITLE="Medusa 2.0 - Inter-University CTF Competition"
VITE_APP_URL="https://medusa.ecsc-uok.com"
VITE_APP_ENV="production"
VITE_GA_TRACKING_ID="GA_MEASUREMENT_ID"  # Replace with actual GA4 ID
```

### Build Commands

```bash
# Production build
bun run build

# Development build
bun run build:dev

# Build with bundle analysis
bun run build:analyze

# Preview production build locally
bun run preview
```

## 🚀 Deployment Methods

### Option 1: Manual FTP/SCP Upload
```bash
# Build the project
bun run build

# Upload the 'dist' folder contents to your web server
# Target directory: /var/www/medusa.ecsc-uok.com/html/ (or equivalent)
```

### Option 2: GitHub Actions (Recommended)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build
      run: npm run build

    - name: Deploy to Server
      uses: appleboy/scp-action@master
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SERVER_SSH_KEY }}
        source: "dist/*"
        target: "/var/www/medusa.ecsc-uok.com/html/"
        rm: true
```

### Option 3: Docker Deployment
```dockerfile
# Dockerfile
FROM nginx:alpine

# Copy built files
COPY dist/ /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name medusa.ecsc-uok.com;
        root /usr/share/nginx/html;
        index index.html;

        # Enable gzip compression
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

        # Security headers
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

## 🔧 Server Requirements

### Minimum Requirements
- **Web Server:** Apache 2.4+ or Nginx 1.18+
- **PHP:** Not required (static site)
- **SSL Certificate:** Required for HTTPS
- **Disk Space:** 50MB minimum

### Recommended Configuration
- **Node.js:** 18+ (for building)
- **Memory:** 512MB RAM
- **Storage:** 1GB available space
- **HTTPS:** Required for security

## 📋 Pre-Deployment Checklist

- [ ] Domain DNS configured to point to server
- [ ] SSL certificate installed and configured
- [ ] Web server configured (Apache/Nginx)
- [ ] File permissions set correctly (755 for directories, 644 for files)
- [ ] Build completed successfully (`bun run build`)
- [ ] All assets uploaded to correct directory
- [ ] Test site functionality in browser
- [ ] Check all links and navigation work
- [ ] Verify SEO meta tags are correct
- [ ] Test mobile responsiveness
- [ ] Check loading performance

## 🔍 Post-Deployment Verification

### SEO & Performance
```bash
# Test SEO meta tags
curl -s https://medusa.ecsc-uok.com | grep -E "(title|description|og:|twitter:)"

# Check sitemap accessibility
curl -s https://medusa.ecsc-uok.com/sitemap.xml

# Test robots.txt
curl -s https://medusa.ecsc-uok.com/robots.txt
```

### Performance Testing
```bash
# Google PageSpeed Insights
# https://developers.google.com/speed/pagespeed/insights/

# WebPageTest
# https://www.webpagetest.org/

# GTmetrix
# https://gtmetrix.com/
```

## 📊 Monitoring & Analytics

### Google Analytics Setup
1. Create GA4 property for medusa.ecsc-uok.com
2. Update VITE_GA_TRACKING_ID in environment variables
3. Add GA script to index.html (uncomment the existing GA code)
4. Verify tracking is working

### Search Console Setup
1. Add medusa.ecsc-uok.com to Google Search Console
2. Submit sitemap: https://medusa.ecsc-uok.com/sitemap.xml
3. Verify indexing and monitor search performance

## 🚨 Troubleshooting

### Common Issues

**404 Errors on Refresh:**
- Configure server for SPA routing (see nginx.conf example above)
- Ensure .htaccess is present for Apache

**Assets Not Loading:**
- Check file permissions
- Verify correct paths in built files
- Ensure all files were uploaded

**SSL Certificate Issues:**
- Verify certificate is valid and not expired
- Check certificate matches domain name
- Ensure intermediate certificates are installed

**Performance Issues:**
- Enable gzip compression
- Set appropriate cache headers
- Optimize images before deployment

## 📞 Support

For deployment issues, check:
1. Server error logs
2. Browser developer tools console
3. Network tab for failed requests
4. Test locally with `bun run preview`

---

**Deployment Date:** August 27, 2025
**Domain:** medusa.ecsc-uok.com
**Status:** Ready for deployment 🚀
