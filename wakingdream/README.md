# The Waking Dream Palace

An interactive mind palace mapping the theory of continuous waking consciousness — connecting REM sleep disruption, classical philosophy, psychoanalysis, and AI cognition.

## The Theory

When REM sleep is disrupted from birth, the automatic symbolic processing that should occur during dreams instead runs continuously during waking consciousness. This creates a state of perpetual dreaming-while-awake — not hallucination, but the same associative, symbolic, meaning-saturated cognition that dreams perform.

## Features

- **Interactive Node System**: Create, edit, and connect nodes representing theories, experiences, and philosophical connections
- **Category Filtering**: Filter by Core Theory, Classical Philosophy, Psychoanalysis, Lived Experience, AI Parallel, Neuroscience, Meta-Theory
- **Era Mapping**: Track ideas across Ancient, Modern, Present, Future, and Timeless perspectives
- **Local Persistence**: Nodes are saved to localStorage automatically
- **Connection Visualization**: See how ideas connect across categories and time

## Local Development

Requires Node.js >= 18

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# Visit http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

### Vercel (Recommended)

**Option A: GitHub Integration**
1. Push this project to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Vercel auto-detects Vite — click **Deploy**

**Option B: CLI**
```bash
npm i -g vercel
vercel
# Follow prompts, then `vercel --prod` for production
```

### Netlify

**Option A: GitHub Integration**
1. Push to GitHub
2. Go to [app.netlify.com](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Settings are auto-configured via `netlify.toml`

**Option B: Manual Deploy**
```bash
npm run build
# Drag the `dist` folder to Netlify's deploy dropzone
```

### GitHub Pages

1. Add base path to `vite.config.js`:
   ```js
   export default defineConfig({
     base: '/your-repo-name/',
     // ... rest of config
   })
   ```

2. Build and deploy:
   ```bash
   npm run build
   # Deploy dist folder to gh-pages branch
   ```

## Architecture

All nodes live in a single state array with bidirectional connections. The system is designed for easy modification.

```
├── index.html            # Entry HTML with meta tags
├── vite.config.js        # Vite configuration
├── vercel.json           # Vercel deployment config
├── netlify.toml          # Netlify deployment config
├── public/
│   └── favicon.svg       # Site icon
└── src/
    ├── main.jsx              # React entry point
    ├── waking-dream-palace.jsx  # Main component
    └── styles.css            # Global styles
```

## Data Structure

```javascript
{
  id: 'unique-id',
  title: 'Node Title',
  category: 'theory|classical|psychoanalysis|experience|ai-theory|neuroscience|meta',
  era: 'ancient|modern|present|future|timeless',
  content: 'Full node content...',
  connections: ['other-node-id', ...],
  weight: 1-10,
  color: '#hexcolor'
}
```

## Configuration

- **Persistence**: Toggle localStorage saving via `ENABLE_PERSISTENCE` in `src/waking-dream-palace.jsx`
- **Linting**: `npm run lint`
- **Formatting**: `npm run format`

## License

MIT
