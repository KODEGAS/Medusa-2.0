# Medusa 2.0 - Inter-University CTF Competition

A high-performance React application for the Medusa 2.0 cybersecurity competition platform.

## 🚀 Performance Optimizations

This project has been optimized for production with the following improvements:

### Bundle Optimization
- **Code Splitting**: Automatic route-based code splitting reduces initial bundle size
- **Vendor Chunking**: React, UI components, and utilities are split into separate chunks
- **Lazy Loading**: Pages are loaded on-demand for faster initial page loads
- **Tree Shaking**: Unused code is automatically removed during build

### Current Bundle Sizes (Gzipped)
- **React Vendor**: 44.92 kB
- **Main App**: 21.01 kB
- **UI Components**: 18.61 kB
- **Home Page**: 9.36 kB (lazy loaded)
- **Registration Page**: 3.68 kB (lazy loaded)
- **Total Initial Load**: ~85 kB (vs 112 kB before optimization)

### Runtime Optimizations
- **React.memo**: Prevents unnecessary re-renders of components
- **useCallback**: Optimizes event handlers and functions
- **Service Worker**: Enables offline functionality and caching
- **Image Optimization**: Proper loading attributes and lazy loading

### SEO & Performance
- **Meta Tags**: Comprehensive Open Graph and Twitter Card support
- **Structured Data**: JSON-LD schema markup for search engines
- **Font Optimization**: Optimized Google Fonts loading strategy
- **Resource Hints**: DNS prefetch and preconnect for external resources

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC compiler
- **Styling**: Tailwind CSS with custom cyber theme
- **UI Components**: shadcn/ui with Radix UI primitives
- **Routing**: React Router v6 with lazy loading
- **State Management**: React Query for server state
- **Icons**: Lucide React
- **Package Manager**: Bun

## 📦 Installation & Setup

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd medusa-2.0

# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Analyze bundle size
bun run build:analyze
```

## 🎯 Development Scripts

- `bun run dev` - Start development server
- `bun run build` - Production build with optimizations
- `bun run build:analyze` - Build and analyze bundle composition
- `bun run lint` - Run ESLint
- `bun run lint:fix` - Fix ESLint errors automatically
- `bun run type-check` - TypeScript type checking
- `bun run preview` - Preview production build locally

## 🔧 Configuration

### Vite Configuration
- **Chunk Splitting**: Automatic vendor and route-based splitting
- **Minification**: Terser with console/debugger removal
- **CSS Code Splitting**: Separate CSS chunks for better caching
- **Source Maps**: Disabled in production for smaller bundles

### Performance Features
- **Service Worker**: Automatic registration for offline support
- **Lazy Loading**: Route-based code splitting
- **Image Optimization**: Loading and decoding optimizations
- **Font Loading**: Optimized Google Fonts strategy

## 📊 Performance Metrics

### Before Optimization
- Initial Bundle: 364.40 kB (111.97 kB gzipped)
- Single large chunk with all dependencies

### After Optimization
- Initial Load: ~85 kB gzipped
- 11 optimized chunks with intelligent splitting
- Lazy-loaded routes for better performance
- 23% reduction in initial bundle size

## 🌐 Deployment

The application is optimized for deployment on:
- **Vercel** (recommended)
- **Netlify**
- **GitHub Pages**
- **AWS S3 + CloudFront**
- **Any static hosting service**

### Environment Variables
No environment variables are required for the frontend application.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Backend Repository**: [Medusa Backend](https://github.com/kavix/medusa-backend)
