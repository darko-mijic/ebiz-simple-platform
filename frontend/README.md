# EBIZ-Saas Frontend

This is the Next.js frontend for the EBIZ-Saas platform.

## Features

- Modern UI with shadcn/ui components
- Data fetching with SWR
- Dark and light mode support
- Responsive design
- Form handling with react-hook-form and zod

## Getting Started

1. Copy `.env.local.example` to `.env.local` and update the values
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open [http://localhost:3001](http://localhost:3001) in your browser

## Folder Structure

- `src/app`: Next.js App Router pages and layouts
- `src/components`: Reusable UI components
- `src/lib`: Utility functions and configurations
- `src/hooks`: Custom React hooks 

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
        });
      }}
    >
      Show Notification
    </Button>
  );
}
``` 