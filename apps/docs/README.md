# Documentation App

This is a standalone VitePress documentation app for PokeDex Manager.

## Development

To start the development server:

```bash
pnpm dev
```

The documentation will be available at `http://localhost:5173` (or the next available port).

## Building

To build the documentation for production:

```bash
pnpm build
```

The built files will be in the `.vitepress/dist` directory.

## Preview

To preview the production build locally:

```bash
pnpm preview
```

## Structure

- `index.md` - Home page
- `guide/` - Documentation guides
- `.vitepress/config.ts` - VitePress configuration
