# Frontend Walkthrough: Material UI (MUI) & Apollo Client

This walkthrough is a presentation guide for explaining how we built the Notes App frontend using modern **Material UI (MUI)** and **Apollo Client**. Every section includes clickable links directly to source files so you can pull up relevant code on screen during your talk.

---

## 1. Stack Overview

| Tool | Version | Role | Key Benefit |
|---|---|---|---|
| **React + TypeScript** | `19.x` / `5.x` | UI framework | Strict type safety across UI and GraphQL operations |
| **Vite** | `8.x` | Build tool & dev server | Sub-second HMR + built-in dev proxy for API calls |
| **Material UI (MUI)** | `9.x` (`latest`) | Component library | Accessible, production-ready design system |
| **Apollo Client** | `4.x` (`latest`) | GraphQL state manager | Normalized in-memory caching + declarative hooks |

---

## 2. Setting Up Material UI (MUI)

### Installation
```bash
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
```

### Config & Core Setup Files

#### 1. [`src/theme.ts`](../../frontend/src/theme.ts) — Design System Tokens
- Defines the global palette, primary colors (`#1976d2`), typography hierarchy (`Inter`), and component-level defaults.
- Any change here (border radius, brand colors, spacing unit) instantly propagates to every MUI component in the tree.

#### 2. [`src/main.tsx`](../../frontend/src/main.tsx) - Theme Injection
- Wraps the root `<App />` with `<ThemeProvider theme={theme}>`.
- Includes `<CssBaseline />`, which normalizes browser styles (resets margins, applies standard background and font smoothing).

---

## 3. MUI Components Showcase (Files to Show Your Team)

When presenting MUI to your team, pull up these specific files to demonstrate how different component categories solve real UI problems:

### 1. Complex Form & Input: [`src/components/notes/NoteFormModal.tsx`](../../frontend/src/components/notes/NoteFormModal.tsx)
- **`<Autocomplete>` with `freeSolo`**:
  - Acts as a multi-select dropdown for existing tags (`GET_TAGS`).
  - Users can also type arbitrary text to create a brand-new tag on the fly.
  - Demonstrates `renderValue` (custom chip rendering) and `filterOptions`.
- **`<TextField>` with `slotProps`**:
  - Demonstrates multiline text area handling (`rows={6}`).
  - Uses `slotProps={{ htmlInput: { maxLength: 255 } }}` for clean native attribute forwarding without deprecated props.
- **`<Button>` with `<CircularProgress>`**:
  - Dynamically disables and displays an inline spinner during active mutation loading states.

### 2. Interactive Card Layout: [`src/components/notes/NoteCard.tsx`](../../frontend/src/components/notes/NoteCard.tsx)
- **`<CardActionArea>` vs `<CardActions>`**:
  - Clicking the card body triggers full-note view.
  - Action buttons (`Edit`, `Delete`) live in `<CardActions>` and call `e.stopPropagation()`, ensuring actions don't accidentally trigger card expansion.
- **`<Chip>`**: Renders tag labels cleanly with compact sizing (`size="small"`, `variant="outlined"`).
- **`sx` Prop Hover Elevation**: Demonstrates `transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 6 }` for smooth elevation without extra CSS classes.

### 3. Application Shell & Navigation: [`src/components/layout/MainLayout.tsx`](../../frontend/src/components/layout/MainLayout.tsx) & [`src/components/layout/Sidebar.tsx`](../../frontend/src/components/layout/Sidebar.tsx)
- **`<AppBar>` + `<Toolbar>`**: Fixed top navigation header elevated above page content.
- **`<Drawer variant="permanent">`**: Responsive left sidebar with `<List>` and `<ListItemButton>` for smooth navigation between "Notes" and "Create Note".

### 4. Perceived Performance: [`src/components/common/LoadingSkeletons.tsx`](../../frontend/src/components/common/LoadingSkeletons.tsx)
- **`<Skeleton>`**: Renders placeholder cards (rectangular and text variants) matching exact NoteCard dimensions while Apollo executes queries, preventing layout shift (CLS).

### 5. Dialogs & Confirmations: [`src/components/notes/DeleteConfirmModal.tsx`](../../frontend/src/components/notes/DeleteConfirmModal.tsx)
- Standard accessible modal with destructive action styling (`color="error"`).

---

## 4. Setting Up Apollo Client

### Installation
```bash
npm install @apollo/client graphql
```

### Config & Setup Files

#### 1. [`src/lib/apollo.ts`](../../frontend/src/lib/apollo.ts) — Client Instance
```typescript
import { ApolloClient, InMemoryCache } from '@apollo/client/core';
import { HttpLink } from '@apollo/client/link/http';

const client = new ApolloClient({
  link: new HttpLink({ uri: '/graphql' }),
  cache: new InMemoryCache(),
});

export default client;
```
- **`HttpLink`**: Points to `/graphql`.
- **`InMemoryCache`**: Automatically normalizes incoming data by `__typename` and `id` (e.g. `Note:1`, `Tag:2`).

#### 2. [`vite.config.ts`](../../frontend/vite.config.ts) — Development Proxy
- Configures Vite dev server proxy:
  ```typescript
  server: {
    proxy: {
      '/graphql': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  }
  ```
- **Why this matters for your presentation**: Browsers block cross-origin requests (`localhost:5173` -> `localhost:8080`) by default. Instead of cluttering backend code with CORS configurations, the Vite dev proxy transparently forwards requests, mirroring production reverse proxies (like Nginx).

#### 3. [`src/main.tsx`](../../frontend/src/main.tsx) — Context Provider
- `<ApolloProvider client={client}>` injects the client into React context so any component can use `useQuery` or `useMutation`.

---

## 5. Apollo CRUD Operations (Queries & Mutations)

All operations are centralized in two files:

### Queries: [`src/graphql/queries.ts`](../../frontend/src/graphql/queries.ts)

```graphql
# READ ALL NOTES
query GetNotes {
  notes {
    id
    title
    content
    createdAt
    tags {
      id
      name
    }
  }
}

# READ ALL TAGS
query GetTags {
  tags {
    id
    name
  }
}
```

### Mutations: [`src/graphql/mutations.ts`](../../frontend/src/graphql/mutations.ts)

```graphql
# CREATE
mutation CreateNote($input: CreateNoteInput!) {
  createNote(input: $input) {
    id title content createdAt tags { id name }
  }
}

# UPDATE
mutation UpdateNote($id: ID!, $input: UpdateNoteInput!) {
  updateNote(id: $id, input: $input) {
    id title content createdAt tags { id name }
  }
}

# DELETE
mutation DeleteNote($id: ID!) {
  deleteNote(id: $id)
}

# CREATE TAG
mutation CreateTag($name: String!) {
  createTag(name: $name) {
    id name
  }
}
```

---

## 6. End-to-End Request/Response Cycle

Walk through this sequential flow during your presentation to show how the frontend and backend connect:

```
[1. User Click] ──> [2. React Component] ──> [3. Apollo useMutation] ──> [4. Vite Proxy]
                                                                                │
[8. UI Re-renders] <── [7. Normalized Cache] <── [6. JSON Payload] <── [5. Spring Boot Engine]
```

### Step-by-Step Code Trail:
1. **Trigger**: User fills out the modal in [`NoteFormModal.tsx`](../../frontend/src/components/notes/NoteFormModal.tsx) and clicks **Save**.
2. **Hook Execution**: Calls `createNote({ variables: { input: { title, content, tagIds } } })`.
3. **HTTP Transport**: Apollo issues an HTTP `POST` to `/graphql`.
4. **Proxy**: Vite intercepts `/graphql` and forwards it to `http://localhost:8080/graphql`.
5. **Backend Processing**:
   - Spring Boot receives the request.
   - Matches operation `createNote` to [`NoteController.java`](../../notes/src/main/java/com/cognitree/notes/controller/NoteController.java).
   - Validates against [`schema.graphqls`](../../notes/src/main/resources/graphql/schema.graphqls).
   - Persists entity to H2 database and returns the newly created Note.
6. **Cache Synchronization**:
   - Apollo receives HTTP `200 OK`.
   - The `refetchQueries: [{ query: GET_NOTES }]` option in `NoteFormModal.tsx` immediately refetches the notes list.
7. **Reactive UI Update**:
   - [`NotesCatalog.tsx`](../../frontend/src/components/notes/NotesCatalog.tsx) is observing `useQuery(GET_NOTES)`.
   - React detects new data and re-renders the catalog with the new note card instantly.

---

## 7. What to Show in the DevTools Network Tab

During your live demo, open the Chrome/Firefox **Network Tab**, filter by `graphql`, and show:

### A. Query Request (`GetNotes`)
- **Headers**:
  - `Request URL`: `http://localhost:5173/graphql`
  - `Request Method`: `POST`
  - `Status Code`: `200 OK`
- **Request Payload**:
  ```json
  {
    "operationName": "GetNotes",
    "variables": {},
    "query": "query GetNotes { notes { id title content createdAt tags { id name } } }"
  }
  ```
- **Response Payload**:
  ```json
  {
    "data": {
      "notes": [
        {
          "__typename": "Note",
          "id": "1",
          "title": "Architecture Prep",
          "content": "Prepare slides for the Apollo and MUI presentation",
          "createdAt": "2026-11-13 14:00:00",
          "tags": [{ "__typename": "Tag", "id": "1", "name": "work" }]
        }
      ]
    }
  }
  ```

### B. Mutation Request (`CreateNote`)
- **Request Payload**:
  ```json
  {
    "operationName": "CreateNote",
    "variables": {
      "input": {
        "title": "New Idea",
        "content": "Discuss GraphQL caching strategies with team",
        "tagIds": ["1"]
      }
    },
    "query": "mutation CreateNote($input: CreateNoteInput!) { createNote(input: $input) { id title content createdAt tags { id name } } }"
  }
  ```
- **Response Payload**:
  ```json
  {
    "data": {
      "createNote": {
        "__typename": "Note",
        "id": "2",
        "title": "New Idea",
        "content": "Discuss GraphQL caching strategies with team",
        "createdAt": "2026-11-13 15:20:00",
        "tags": [{ "__typename": "Tag", "id": "1", "name": "work" }]
      }
    }
  }
  ```

---

## 8. High-Value Insights to Impress Your Team

Share these architectural points to show deep technical understanding of both libraries:

### 1. Apollo Client Caching: Two Update Strategies
- **Automatic Identity Normalization**:
  When you execute `UPDATE_NOTE`, Apollo inspects the returned object. Because it contains `__typename: "Note"` and `id: "1"`, Apollo updates the cache entry for `Note:1` in place without triggering a network refetch!
- **List Invalidation (`refetchQueries`)**:
  When creating or deleting records (`CREATE_NOTE`, `DELETE_NOTE`), Apollo doesn't automatically know where in the list array the item belongs. We use `refetchQueries: [{ query: GET_NOTES }]` to ensure 100% cache consistency with zero manual array splicing.

### 2. Apollo Client v4 Modernization
- **Modular Subpath Exports**:
  In Apollo Client v4, core utilities (`gql`, `ApolloClient`, `InMemoryCache`) live in `@apollo/client/core`, while React bindings (`ApolloProvider`, `useQuery`, `useMutation`) live in `@apollo/client/react`.
- **Explicit Links**:
  The client constructor now strictly requires a network link (`new HttpLink({ uri })`), giving developers full control to compose links (e.g. auth headers, retry links, error handlers).

### 3. Material UI v9 & Modern Theming
- **The Power of the `sx` Prop**:
  Avoids writing separate `.css` files or styled components for one-off styles. It provides direct access to theme tokens (`theme.palette.primary.main`, `theme.spacing(2)`), keeping layouts responsive and theme-consistent.
- **Modern Slot System**:
  MUI migrated from deprecated props like `inputProps` to the standardized `slotProps={{ htmlInput: { ... } }}` API, allowing deep customization of inner DOM elements without breaking types.
