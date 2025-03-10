# EBIZ-Saas Frontend

This is the Next.js frontend for the EBIZ-Saas platform.

## Features

- Modern UI with shadcn/ui components
- Data fetching with SWR
- Dark and light mode support
- Responsive design
- Form handling with react-hook-form and zod
- Proper Next.js client/server component architecture
- Chart visualizations with Recharts
- Multi-step onboarding flow with form validation
- Dashboard with financial visualization
- Toast notifications for user feedback
- Clean, standardized directory structure

## Important Setup Notes

### Icon Configuration

For proper icon display, the application requires the following icon files in the public directory:

- `/favicon.ico` - Main favicon (16x16, 32x32)
- `/apple-icon.png` - Apple touch icon (180x180)
- `/icon/dark/16.png` - Dark mode small icon
- `/icon/dark/32.png` - Dark mode large icon
- `/icon/light/16.png` - Light mode small icon
- `/icon/light/32.png` - Light mode large icon

These files must be properly formatted binary image files in their respective formats (ico, png).

### Troubleshooting Icon Errors

If you encounter errors like "Failed to fetch" in browser extensions:

1. Make sure all icon files exist in the proper locations
2. Try using the `extension-manifest.json` file for browser extensions
3. Use absolute URLs for icon paths in your extension configuration
4. Access icons from the `/icon-fixed/` directory for extensions
5. Clear browser caches and reload the extension

### Chrome Extension Specific Issues

If you encounter the error `Cannot read properties of undefined (reading 'setIcon')` in Chrome extensions:

1. Make sure you're using the `extension-manifest.json` file as your manifest
2. Verify that the included `background.js` script is being properly loaded
3. Use relative paths (without leading slashes) for all icon references in the manifest
4. Add the following permissions to your manifest:
   ```json
   "permissions": [
     "activeTab",
     "storage"
   ]
   ```
5. Ensure your manifest includes a properly configured background script section:
   ```json
   "background": {
     "scripts": ["background.js"],
     "persistent": false
   }
   ```
6. If the issue persists, you can implement a fallback icon in your extension's background script like this:
   ```javascript
   chrome.runtime.onInstalled.addListener(function() {
     try {
       chrome.browserAction.setIcon({
         path: {
           "16": "icon-fixed/dark/16.png",
           "32": "icon-fixed/dark/32.png"
         }
       });
     } catch (error) {
       console.error('Error setting icon:', error);
     }
   });
   ```

When developing Chrome extensions that integrate with your Next.js app:

1. Use the extension-specific manifest at `public/extension-manifest.json`
2. Copy this file to your extension directory as `manifest.json`
3. Include the `background.js` file from the public directory
4. Ensure all icons are in the proper format and accessible to the extension

## Recent Improvements

### Directory Structure Refactoring
- Cleaned up nested frontend directories for a standardized structure
- Removed duplicate assets from multiple locations
- Simplified icon references with absolute paths
- Fixed type errors related to toast notifications
- Improved build process by resolving configuration issues
- Enhanced maintainability with a clean, standard Next.js structure

### Dashboard Component Refactoring
- Extracted monolithic dashboard into smaller, focused components
- Created separate components for AccountSummary, RecentTransactions, RecentDocuments, and Alerts
- Implemented proper TypeScript interfaces for all data models
- Organized mock data into a dedicated file for better maintainability
- Enhanced chart visualizations with:
  - Proper axes and grid formatting
  - Custom tooltips showing detailed information
  - Improved colors and styling for better readability
  - Donut chart for account distribution
  - Custom legends and labels
  - Responsive containers for all screen sizes
  - Increased chart heights for better data representation

### Layout Improvements
- Refactored the LayoutWrapper to use SidebarWrapper and HeaderWrapper components
- Implemented proper sidebar collapsing functionality
- Added theme toggling in the header
- Improved the overall structure and maintainability of the layout components

### Onboarding Flow Implementation
- Created a comprehensive onboarding page with a multi-step form
- Implemented UserOnboardingForm and CompanyOnboardingForm components
- Added validation using Zod for form fields
- Implemented VAT ID validation simulation
- Added proper navigation between steps and form submission handling

### UI Component Library Enhancement
- Created reusable UI components using Radix UI primitives
- Implemented form components with proper validation
- Added toast notifications for better user feedback
- Created tabs, select, checkbox, and other UI components

## Getting Started

1. Copy `.env.local.example` to `.env.local` and update the values
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open [http://localhost:3001](http://localhost:3001) in your browser

## Folder Structure

- `src/app`: Next.js App Router pages and layouts
  - `(protected)`: Routes requiring authentication
  - `(auth)`: Authentication routes
- `src/components`: Reusable UI components
  - `layout`: Layout components like Header and Sidebar
  - `ui`: UI components from shadcn/ui
  - `dashboard`: Dashboard-specific components
  - `auth`: Authentication and onboarding components
- `src/lib`: Utility functions and configurations
- `src/hooks`: Custom React hooks
- `src/data`: Data models, types, and mock data
- `public`: Static assets and icons
  - `icon`: Theme-specific icons
  - `icon-fixed`: Icons for browser extensions

## Next.js Component Structure

This project follows Next.js 14 best practices for client/server components:

### Server Components (Default)
- Used for: Layouts, data fetching, and static elements
- Benefits: Smaller bundle size, SEO friendly, secure data handling
- Example: Layout files that define metadata

### Client Components
- Used for: Interactive UI elements, state management
- Benefits: User interactivity, client-side state
- Must use: The `"use client"` directive at the top of the file
- Example: Sidebar with collapsible features, interactive forms

### Component Architecture Pattern

For components that need to be used in server components but contain client-side functionality:

1. Create a client wrapper component with the `"use client"` directive:

```tsx
// SidebarWrapper.tsx
"use client";

import { Sidebar } from './Sidebar';

export default function SidebarWrapper() {
  return <Sidebar />;
}
```

2. Use the wrapper in server components:

```tsx
// layout.tsx (server component)
import SidebarWrapper from '../../components/layout/SidebarWrapper';

export default function Layout({ children }) {
  return (
    <div>
      <SidebarWrapper />
      <main>{children}</main>
    </div>
  );
}
```

### Important Rules

- **Metadata Exports**: Export metadata objects only from server components (not from components with the `"use client"` directive)
- **Component Nesting**: Client components can be imported in server components, but not vice versa
- **Data Fetching**: Keep data fetching in server components when possible for better performance

## shadcn/ui Components

This project uses [shadcn/ui](https://ui.shadcn.com) for UI components. The setup is already configured with:

- Tailwind CSS configuration
- component.json configuration
- Base UI components in `src/components/ui`
- Utility functions in `src/lib/utils.ts`

### Adding New Components

To add more shadcn/ui components, use the CLI:

```bash
# Navigate to the frontend directory
cd frontend

# Add a component (example: adding a dialog component)
npx shadcn-ui@latest add dialog
```

### Using Components

Import components from the `@/components/ui` directory:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Use them in your components
export default function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Example Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Enter something..." />
        <Button>Submit</Button>
      </CardContent>
    </Card>
  );
}
```

## Data Visualization with Recharts

The project uses Recharts (v2.15.1) for data visualization with enhanced charts:

```tsx
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Example usage with enhanced styling
export default function EnhancedAreaChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke="#8884d8" 
          fillOpacity={1} 
          fill="url(#colorValue)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-sm text-primary">
        {`Value: ${payload[0].value.toLocaleString()}`}
      </p>
    </div>
  );
};
```

### Notifications

For showing notifications, use the Toast component:

```tsx
import { useToast } from "@/hooks/use-toast";

export default function MyComponent() {
  const { toast } = useToast();
  
  return (
    <Button 
      onClick={() => {
        toast({
          title: "Success",
          description: "Operation completed successfully!",
          type: "success", // Use type instead of variant
        });
      }}
    >
      Show Notification
    </Button>
  );
}
```

## Routes

The application uses Next.js App Router for routing with the following structure:

### Authentication Routes
- `/auth`: Login page with Google authentication

### Protected Routes (requires authentication)
- `/`: Dashboard with financial overview
- `/bank-accounts`: Manage bank accounts
- `/transactions`: View and filter transactions
- `/documents`: Upload and manage documents
- `/chat`: Access chat interface
- `/settings`: User and app settings
- `/bank-statements`: View bank statements

All protected routes are inside the app/(protected) directory and share a common layout with sidebar navigation and header.

## Navigation

The sidebar provides navigation to all main sections of the app:

1. Dashboard - Overview of financial data
2. Bank Accounts - List and manage connected bank accounts
3. Transactions - View and filter all transactions
4. Documents - Upload and manage financial documents
5. Chat - Interact with financial assistant
6. Settings - Configure user settings and preferences

# Development Tools and Libraries

## Core Technologies

### Next.js 14
This project uses Next.js 14 with App Router for routing and server/client component architecture.

**Key Features**:
- **App Router**: File-system based routing with special directories like `(protected)` and `(auth)`
- **Server Components**: Default components that run on the server for better performance
- **Client Components**: Interactive components marked with `"use client"` directive
- **Built-in TypeScript Validation**: Validates proper component architecture

**Usage Example**:
- Create server components (default):
```tsx
// app/page.tsx (server component)
export default function Page() {
  return <div>Server Component</div>;
}
```

- Create client components:
```tsx
// components/Counter.tsx
"use client";

import { useState } from 'react';

export function Counter() {
  const [count, useState] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### TypeScript
The project uses TypeScript for type safety and better developer experience.

**Setup**:
- `tsconfig.json` is already configured
- Types for all libraries are installed

**Validation**:
- Next.js provides built-in validation for:
  - Component architecture (server vs client)
  - Metadata exports
  - Page and layout structure

**Common Issues and Solutions**:
- Error: "You are attempting to export metadata from a component marked with use client"
  - Solution: Remove the "use client" directive from layout files with metadata exports
  - Alternative: Create a wrapper pattern (see architecture section)

## UI and Styling

### shadcn/ui
A collection of reusable UI components built with Radix UI and Tailwind CSS.

**Installation**: All necessary components are pre-installed in `src/components/ui`

**Adding New Components**:
```bash
npx shadcn-ui@latest add [component-name]
```

**Usage**:
```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MyForm() {
  return (
    <div>
      <Input placeholder="Enter your name" />
      <Button>Submit</Button>
    </div>
  );
}
```

### Tailwind CSS
Utility-first CSS framework used throughout the application.

**Configuration**: 
- Already set up in `tailwind.config.js`
- Dark mode configured to use class strategy

**Dark Mode Usage**:
```tsx
<div className="bg-white text-black dark:bg-gray-800 dark:text-white">
  Dark mode compatible component
</div>
```

**Theme Customization**:
The project uses a customized theme with extended colors in `tailwind.config.js`

## State Management and Data Fetching

### SWR
React Hooks for data fetching with built-in cache and revalidation.

**Basic Usage**:
```tsx
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

function ProfileComponent() {
  const { data, error, isLoading } = useSWR('/api/user', fetcher);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  
  return <div>Hello {data.name}!</div>;
}
```

**Mutation Example**:
```tsx
import useSWR, { mutate } from 'swr';

function ProfileEditor() {
  // Use SWR to get the current user data
  const { data } = useSWR('/api/user', fetcher);
  
  async function updateUser(newData) {
    // Send request to update the user
    await fetch('/api/user', {
      method: 'POST',
      body: JSON.stringify(newData)
    });
    
    // Revalidate the cache
    mutate('/api/user');
  }
  
  return (
    <button onClick={() => updateUser({ name: 'New Name' })}>
      Update Name
    </button>
  );
}
```

## Form Handling

### React Hook Form
Library for flexible form validation with minimal re-renders.

**Basic Usage**:
```tsx
import { useForm } from "react-hook-form";

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const onSubmit = (data) => console.log(data);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email", { required: true })} />
      {errors.email && <span>Email is required</span>}
      
      <input type="password" {...register("password", { required: true })} />
      {errors.password && <span>Password is required</span>}
      
      <button type="submit">Login</button>
    </form>
  );
}
```

### Zod
TypeScript-first schema validation with static type inference.

**With React Hook Form**:
```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Define schema
const formSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

type FormValues = z.infer<typeof formSchema>;

export default function ValidatedForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema)
  });
  
  const onSubmit = (data: FormValues) => console.log(data);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input type="password" {...register("password")} />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Data Visualization

### Recharts
A composable charting library built with React components.

**Line Chart Example**:
```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  // ... more data
];

export default function SimpleLineChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

**Bar Chart Example**:
```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RevenueBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="revenue" fill="#8884d8" />
        <Bar dataKey="expenses" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

## User Feedback

### Toast Notifications
The application uses a custom toast system for user notifications.

**Usage**:
```tsx
import { useToast } from "@/hooks/use-toast";

export default function SubmitButton() {
  const { toast } = useToast();
  
  const handleSubmit = async () => {
    try {
      // Submit form or perform action
      toast({
        title: "Success!",
        description: "Your changes have been saved.",
        type: "success", // Use type instead of variant
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes.",
        type: "error", // Use type instead of variant
      });
    }
  };
  
  return <button onClick={handleSubmit}>Save Changes</button>;
}
```

## Theme Support

### next-themes
Library for Next.js theme management with dark mode support.

**Usage Example**:
```tsx
"use client";

import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
}
```

**Implementation Notes**:
- The ThemeProvider is already set up in the root layout
- Use `useTheme()` hook in client components to access/change theme
- Use Tailwind's `dark:` prefix classes for dark mode styling

## Development Tools

### ESLint
Static code analysis tool for identifying problematic patterns.

**Running Linting**:
```bash
npm run lint
```

**Configuration**:
ESLint is configured in `.eslintrc.json` with Next.js recommended settings.

### TypeScript Type Checking
Next.js provides built-in TypeScript validation. 

**Running Type Check**:
```bash
npm run type-check
```

This checks for TypeScript errors including Next.js specific architecture issues. 