## Tools
- React: 19.x
- TypeScript: 5.x
- Apollo client: 4.x
- MUI: 9.x

## MUI
### Installation
```bash
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
```
### Config and Setup

-  [`src/theme.ts`](../frontend/src/theme.ts)
    - Defines the global palette, primary colors (`#1976d2`), typography hierarchy (`Inter`), and component-level defaults.
    - Any change here (border radius, brand colors, spacing unit) instantly propagates to every MUI component in the tree.

- [`src/main.tsx`](../frontend/src/main.tsx) - Theme Injection
    - Wraps the root `<App />` with `<ThemeProvider theme={theme}>`.
    - Includes `<CssBaseline />`, which normalizes browser styles (resets margins, applies standard background and font smoothing).

## Apollo Client
### Installation
```bash
npm install @apollo/client graphql
```

### Config & Setup

- [`src/lib/apollo.ts`](../frontend/src/lib/apollo.ts) - Client Instance

- [`vite.config.ts`](../frontend/vite.config.ts) - Development Proxy
    - Configures Vite dev server proxy:
  ```typescript
  server: {
    proxy: {
      '/graphql': {
        target: 'http://localhost:8080',
        changeOrigin: true, // This changes the HTTP Host header in the proxied request to match the target server.
      },
    },
  }
  ```

-  [`src/main.tsx`](../frontend/src/main.tsx) - Context Provider
    - `<ApolloProvider client={client}>` injects the client into React context so any component can use `useQuery` or `useMutation`.
