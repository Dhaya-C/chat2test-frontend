# AI Coding Agent Instructions for AI-Practice-Frontend

## Project Overview
**TestSamurAI** is a Next.js-based AI-powered testing automation platform. The frontend handles authentication, chat-based test generation, dashboards, project management, and test execution workflows.

## Architecture & Critical Patterns

### 1. Authentication & Protected Routes
- **Token Storage**: JWT tokens stored in `localStorage` with key `'auth_token'` (see `src/lib/auth.ts`)
- **Auth Flow**: Centralized via `AuthContext` provider in `src/context/AuthContext.tsx`
- **Route Protection**: Use `<ProtectedRoute>` wrapper (not middleware) for client-side protection
- **API Auth**: Axios interceptor in `src/lib/api.ts` auto-attaches tokens; 401 errors trigger logout
- **Server Sync**: On auth init, fetch `/user/me` to validate token and populate user state

### 2. Context & Provider Architecture
All providers wrapped in `<Providers>` component (`src/components/providers/Providers.tsx`):
- `ErrorBoundary` (top-level error catching)
- `ThemeProvider` (dark mode default)
- `ToastProvider` (notifications)
- `AuthProvider` (authentication)

This order matters—auth must wrap components that check auth state.

### 3. API Communication
- **Base URL**: `API_BASE_URL` from env `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:8080/Chat2Test/v1`)
- **HTTP Client**: Axios instance at `src/lib/api.ts` with request/response interceptors
- **Error Handling**: Network errors propagate to components; 401 redirects to login
- **File Uploads**: Respect size limits in `src/utils/constants.ts` (3MB images, 5MB PDFs, 2MB audio)

### 4. State Management Strategy
- **Contexts**: Auth, Toast (simple global state)
- **Hooks**: Domain-specific hooks (useChat, useDashboard, useTestCases, etc.) managing API calls and local state
- **No Redux**: Use React hooks with `useState`, `useCallback`, `useReducer` patterns
- **Pattern**: Hooks return state + action callbacks; components consume via hooks

Example (`useChat` in `src/hooks/useChat.ts`):
```tsx
const { chats, selectedChat, messages, loading, createChat, selectChat } = useChat(projectId);
```

### 5. Component Organization
```
src/components/
  ├── auth/          # Auth forms, login/signup logic
  ├── chat/          # Chat UI, message list, input
  ├── dashboard/     # KPIs, charts, analytics
  ├── layout/        # AppLayout, AppSidebar
  ├── landing/       # Public landing page sections
  ├── providers/     # Context providers (must wrap app)
  └── shared/        # Reusable UI utilities
```

Each domain typically exports an `index.ts` barrel file for clean imports.

### 6. Routing & Navigation
- **App Router**: Next.js 16 with `app/` directory structure
- **Protected Routes**: Dashboard routes wrapped in `<ProtectedRoute>` component in layout
- **Redirects**: Use `useRouter().push()` from `next/navigation` for client-side navigation
- **Route Constants**: Centralized in `src/utils/constants.ts` (ROUTES object)

### 7. Styling Strategy
- **Tailwind CSS**: Primary styling with custom color theme using CSS variables
- **Dark Mode**: Default theme is dark; override with `setTheme()` from `next-themes`
- **UI Components**: Use Radix UI primitives (alerts, dialogs, dropdowns, etc.) with Tailwind classes
- **Custom Classes**: Avoid custom CSS; leverage Tailwind + Radix theming
- **Icons**: Mix of Lucide React, React Icons, FontAwesome

## Development Workflows

### Build & Run
```bash
npm run dev          # Start dev server (Next.js with webpack)
npm run build        # Production build
npm start            # Run production server
npm run lint         # Run ESLint
```

### Key Environment Variables
- `NEXT_PUBLIC_API_BASE_URL`: Backend API URL (required for API calls)
- `NEXT_PUBLIC_` prefix: Variables exposed to browser

### Debugging Tips
- **Auth Issues**: Check `localStorage` for `auth_token`; verify API auth header in Network tab
- **404 Not Found**: Route may not be in `app/` directory or needs proper `page.tsx`
- **Toast Not Showing**: Ensure component is inside `<Providers>` in layout
- **TypeScript Errors**: Check `tsconfig.json` path alias `@/*` maps to `./src/*`

## Code Patterns & Conventions

### Custom Hooks Pattern
All data-fetching hooks follow this structure:
```tsx
export function useMyFeature(param?: string): UseMyFeatureReturn {
  const [data, setData] = useState<Type[]>([]);
  const [loading, setLoading] = useState(false);
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/endpoint', { params: { param } });
      setData(res.data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  }, [param]);
  
  useEffect(() => { fetchData(); }, [fetchData]);
  
  return { data, loading, refresh: fetchData, /* actions */ };
}
```

### Component Prop Pattern
Use typed interfaces for props; destructure with defaults:
```tsx
interface MyComponentProps {
  title: string;
  loading?: boolean;
  onSubmit: (data: Data) => void;
}

export function MyComponent({ title, loading = false, onSubmit }: MyComponentProps) {
  // ...
}
```

### Error Boundaries
Wrap feature sections in `<ErrorBoundary>` for isolated error catching:
```tsx
<ErrorBoundary>
  <FeatureComponent />
</ErrorBoundary>
```

### Toast Notifications
Use `useToast()` hook for user feedback:
```tsx
const { success, error, info } = useToast();
success('Operation completed');
error('Failed to save');
```

## File & Import Conventions

### Path Aliases
- `@/*`: Maps to `src/*` (use for all imports within src)
- Import format: `import { Component } from '@/components/path'`

### Type Files
- `src/types/index.ts`: Central export for all types
- Domain-specific: `src/types/auth.ts`, `src/types/chat.ts`, `src/types/dashboard.ts`
- Don't scatter types; group by domain

### Barrel Exports
Use `index.ts` for clean imports:
```tsx
// src/components/chat/index.ts
export { ChatInput } from './ChatInput';
export { ChatMessage } from './ChatMessage';
// Then: import { ChatInput } from '@/components/chat'
```

## Project-Specific Gotchas

1. **Server vs Client**: Mark components with `"use client"` if using hooks/context; `RootLayout` must export metadata (server component)
2. **Hydration**: Be careful with `localStorage` access in `getToken()`—check `typeof window` first
3. **Theme Switching**: Landing page forces light theme temporarily; restore on unmount (see `src/app/page.tsx`)
4. **File Uploads**: Max 5 files at once; validate file types/sizes before upload
5. **Chat Persistence**: Messages stored locally after fetch; use `setMessages()` to update state manually
6. **Lazy Loading**: Use React.lazy + Suspense for code splitting large features

## Common Tasks

### Add a New Page
1. Create `src/app/path/page.tsx`
2. Export default component (no `"use client"` unless needed)
3. Wrap in `<AppLayout>` if it's an authenticated page
4. Add route constant to `src/utils/constants.ts`

### Add a New API Endpoint Hook
1. Create `src/hooks/useFeature.ts`
2. Follow hook pattern above (state, loading, useCallback, useEffect)
3. Export return type interface
4. Add to `src/hooks/index.ts` barrel export

### Add Toast Feedback
```tsx
const { success, error } = useToast();
try {
  await someApiCall();
  success('Saved successfully');
} catch (err) {
  error('Failed to save');
}
```

### Style a Component
- Use Tailwind classes directly
- Reference theme colors: `bg-primary`, `text-muted-foreground`, `border-border`
- For Radix UI components: apply Tailwind to wrapper divs
- Dark mode is default; light mode is rare (landing page only)
