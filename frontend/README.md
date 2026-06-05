# OpsMind Frontend

AI-Powered Observability & Incident Intelligence Platform - React Frontend

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (https://nodejs.org/)
- npm 10+ (comes with Node.js)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# The app will be available at http://localhost:5173
```

### Build for Production

```bash
# Build the project
npm run build

# Preview the built version locally
npm run preview
```

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable React components
│   │   ├── Sidebar.tsx    # Navigation sidebar
│   │   └── Header.tsx     # Top navigation header
│   ├── pages/            # Page components
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── IncidentsPage.tsx
│   │   ├── AlertsPage.tsx
│   │   └── SettingsPage.tsx
│   ├── layouts/          # Layout components
│   │   ├── AuthLayout.tsx
│   │   └── AppLayout.tsx
│   ├── hooks/            # Custom React hooks
│   │   └── index.ts      # Auth, org, data fetching hooks
│   ├── services/         # API client and business logic
│   │   └── api.ts        # Axios instance with interceptors
│   ├── stores/           # Zustand state management
│   │   └── auth.ts       # Auth, UI, org stores
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts      # All API types and interfaces
│   ├── utils/            # Utility functions
│   │   └── cn.ts         # Classname merge utility
│   ├── App.tsx           # Root component
│   ├── main.tsx          # React entry point
│   └── index.css         # Global styles with Tailwind
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
└── README.md            # This file
```

## 🛠️ Technology Stack

### Core
- **React 19** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Next generation frontend build tool

### State Management
- **Zustand** - Lightweight state management
- **TanStack React Query** - Server state management

### Styling
- **Tailwind CSS 3** - Utility-first CSS framework
- **Radix UI** - Headless UI components
- **ShadCN UI** - Component library built on Radix UI

### HTTP Client
- **Axios** - Promise-based HTTP client
- **Interceptors** - Auto token refresh, error handling

### Routing
- **React Router v6** - Client-side routing

### Data Visualization
- **Recharts** - Composable charting library

### Utilities
- **date-fns** - Date manipulation
- **sonner** - Toast notifications
- **lucide-react** - Icon library

### Development
- **Vitest** - Unit testing framework
- **@testing-library/react** - Component testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🔐 Authentication

The frontend implements JWT-based authentication:

1. **Login/Register** - User credentials sent to backend
2. **Token Storage** - Access & refresh tokens stored in persistent Zustand store
3. **Auto Refresh** - Axios interceptor automatically refreshes expired tokens
4. **Protected Routes** - `useRequireAuth()` hook ensures authentication

### Authentication Flow

```typescript
// Login
const { login } = useAuth()
login({ email, password })

// Token automatically added to all requests
// Authorization: Bearer <access_token>

// Auto token refresh on 401
// Axios interceptor handles refresh token exchange
```

## 🏗️ Architecture

### Clean Architecture Principles
- **Separation of Concerns** - Clear boundaries between layers
- **Dependency Inversion** - Components depend on abstractions
- **Single Responsibility** - Each component has one job

### Layer Structure
```
Components/Pages
      ↓
Hooks (useAuth, useQuery, etc.)
      ↓
Services (API client)
      ↓
Stores (State management)
      ↓
Types (TypeScript definitions)
```

### Hooks Pattern
- `useAuth()` - Authentication state and methods
- `useRequireAuth()` - Protected route enforcement
- `useOrganization()` - Organization context
- `useAsyncData()` - Data fetching with React Query
- `useAsyncMutation()` - Data mutations
- `useLocalStorage()` - Local storage sync
- `useDebounce()` - Input debouncing

## 🔌 API Integration

### Base URL Configuration
```typescript
// Vite environment variable
VITE_API_URL=http://localhost:8080/api

// In vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  }
}
```

### API Client Usage
```typescript
import { apiClient } from '@/services/api'

// Auth
await apiClient.login({ email, password })
await apiClient.register(...)

// Users
await apiClient.getCurrentUser()
await apiClient.getUsers(orgId)

// Incidents
await apiClient.getIncidents(orgId, filters)
await apiClient.createIncident(orgId, data)

// Alerts
await apiClient.getAlerts(orgId)
await apiClient.acknowledgeAlert(alertId)
```

## 🎨 Styling

### Tailwind CSS
- Utility-first approach
- Responsive design with breakpoints
- Dark mode support (class-based)

### Color Palette
Defined in `tailwind.config.js` using CSS variables:
- `primary` - Main brand color
- `secondary` - Secondary actions
- `destructive` - Dangerous actions
- `muted` - Disabled or secondary text
- `accent` - Accent colors

### Dark Mode
```typescript
import { useUIStore } from '@/stores/auth'

const { theme, setTheme } = useUIStore()

// Apply dark mode
if (theme === 'dark') {
  document.documentElement.classList.add('dark')
}
```

## 📊 State Management

### Zustand Stores

#### Auth Store
```typescript
const { user, accessToken, isAuthenticated, logout } = useAuthStore()
```

#### UI Store
```typescript
const { sidebarOpen, theme, toggleSidebar } = useUIStore()
```

#### Organization Store
```typescript
const { currentOrganizationId, setCurrentOrganizationId } = useOrganizationStore()
```

### React Query

Server state management for API calls:
```typescript
// Fetching
const { data, isLoading, error } = useAsyncData(
  ['incidents', orgId],
  () => apiClient.getIncidents(orgId)
)

// Mutations
const mutation = useAsyncMutation(
  (data) => apiClient.createIncident(orgId, data),
  {
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['incidents'])
    }
  }
)
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm run test

# Run with UI
npm run test:ui

# Generate coverage report
npm run coverage
```

### Example Test
```typescript
import { render, screen } from '@testing-library/react'
import LoginPage from '@/pages/LoginPage'

describe('LoginPage', () => {
  it('renders login form', () => {
    render(<LoginPage />)
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })
})
```

## 🚨 Error Handling

### Global Error Handler
- All API errors caught by Axios interceptors
- 401 errors trigger token refresh
- 4xx errors show user-friendly messages
- 5xx errors logged for debugging

### Toast Notifications
```typescript
import { toast } from 'sonner'

toast.success('Action completed!')
toast.error('Something went wrong')
toast.loading('Loading...')
```

## 📈 Performance Optimization

### Code Splitting
- Vite automatically code-splits on route boundaries
- Lazy loading for heavy components

### Caching
- React Query caches API responses (5-minute stale time)
- Axios interceptors manage request deduplication

### Bundle Optimization
```javascript
// vite.config.ts
manualChunks: {
  'vendor': ['react', 'react-dom', 'react-router-dom'],
  'ui': ['@radix-ui/...', 'lucide-react'],
  'charts': ['recharts'],
}
```

## 🔍 Code Quality

### ESLint & Prettier
```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

### Git Hooks (Optional)
```bash
npm install husky lint-staged --save-dev

# Automatically lint and format on commit
```

## 🌐 Environment Variables

Create `.env.local` file:
```bash
VITE_API_URL=http://localhost:8080/api
```

Available in code:
```typescript
import.meta.env.VITE_API_URL
```

## 📱 Responsive Design

Breakpoints (from Tailwind):
- `sm` - 640px
- `md` - 768px
- `lg` - 1024px
- `xl` - 1280px
- `2xl` - 1536px

Example:
```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {/* Grid adjusts based on screen size */}
</div>
```

## 🔄 WebSocket Support (Future)

Connection for real-time updates:
```typescript
import { useEffect } from 'react'

useEffect(() => {
  const ws = new WebSocket('ws://localhost:8080/ws')
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    // Handle real-time updates
  }
}, [])
```

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [React Router Docs](https://reactrouter.com)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Query Docs](https://tanstack.com/query)

## 🐛 Troubleshooting

### Port 5173 already in use
```bash
# Use a different port
npm run dev -- --port 3000
```

### CORS errors
- Ensure backend is running and accessible
- Check `vite.config.ts` proxy configuration
- Verify `VITE_API_URL` environment variable

### TypeScript errors
```bash
# Generate type definitions
npm run type-check

# Check for missing types
npm install @types/your-package --save-dev
```

### ESLint errors
```bash
# Fix auto-fixable issues
npm run lint -- --fix
```

## 📝 Contributing

1. Create feature branches from `main`
2. Follow TypeScript and ESLint rules
3. Write meaningful commit messages
4. Submit PR with description of changes
5. Ensure all tests pass before merging

## 📄 License

Licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues, questions, or contributions:
1. Check existing issues in the repository
2. Create detailed bug reports with reproduction steps
3. Include environment details (Node, npm, OS versions)
4. Add screenshots or error logs when relevant
