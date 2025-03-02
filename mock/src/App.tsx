import { useState, useEffect, createContext, useContext } from "react";
import { Switch, Route, useLocation, Link } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Moon, Sun, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  FileBox,
  FileText,
  MessageSquare,
  Settings as SettingsIcon,
} from "lucide-react";
import BankStatements from "@/pages/bank-statements";
import BankAccounts from "@/pages/bank-accounts";
import Transactions from "@/pages/transactions";
import Documents from "@/pages/documents";
import Dashboard from "@/pages/dashboard";
import Auth from "@/pages/auth";
import Chat from "@/pages/chat";
import Settings from "@/pages/settings";

// Auth context
type AuthContextType = {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check authentication status on mount
    fetch('/api/user')
      .then(res => {
        if (res.ok) {
          setIsAuthenticated(true);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  const login = () => setIsAuthenticated(true);

  const logout = async () => {
    try {
      await fetch('/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setLocation('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function ProtectedRoute({ component: Component }: { component: () => React.JSX.Element }) {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/auth");
    }
  }, [isAuthenticated, setLocation]);

  return isAuthenticated ? <Component /> : null;
}

function NavLink({
  href,
  children,
  icon,
  collapsed
}: {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  collapsed?: boolean;
}) {
  const [location] = useLocation();
  const isActive = location === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center px-3 py-2 text-sm font-medium rounded-md",
        "text-sidebar-foreground/60 hover:text-sidebar-foreground",
        "hover:bg-sidebar-accent",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        "transition-colors",
        collapsed && "justify-center",
        isActive && "bg-sidebar-accent text-sidebar-foreground"
      )}
      title={collapsed ? children?.toString() : undefined}
    >
      {icon}
      {!collapsed && <span className="ml-2">{children}</span>}
    </Link>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();

  return (
    <div className={cn(
      "min-h-screen grid",
      collapsed ? "grid-cols-[60px_1fr]" : "grid-cols-[240px_1fr]",
      "transition-all duration-300"
    )}>
      {/* Left sidebar */}
      <nav className="bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="h-14 border-b border-sidebar-border px-4 flex items-center justify-between">
          {!collapsed && <h2 className="font-semibold text-sidebar-foreground">EBIZ-Saas</h2>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex-1 py-4">
          <div className="space-y-1 px-2">
            <NavLink href="/" icon={<LayoutDashboard className="h-4 w-4" />} collapsed={collapsed}>
              Dashboard
            </NavLink>
            <NavLink href="/bank-accounts" icon={<Wallet className="h-4 w-4" />} collapsed={collapsed}>
              Bank Accounts
            </NavLink>
            <NavLink href="/bank-statements" icon={<FileBox className="h-4 w-4" />} collapsed={collapsed}>
              Bank Statements
            </NavLink>
            <NavLink href="/transactions" icon={<Receipt className="h-4 w-4" />} collapsed={collapsed}>
              Transactions
            </NavLink>
            <NavLink href="/documents" icon={<FileText className="h-4 w-4" />} collapsed={collapsed}>
              Documents
            </NavLink>
            <NavLink href="/chat" icon={<MessageSquare className="h-4 w-4" />} collapsed={collapsed}>
              Chat Interface
            </NavLink>
            <NavLink href="/settings" icon={<SettingsIcon className="h-4 w-4" />} collapsed={collapsed}>
              Settings
            </NavLink>
          </div>
        </div>

        {/* Logout button */}
        <div className="p-4">
          <Button variant="ghost" className="w-full justify-start" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            {!collapsed && "Logout"}
          </Button>
        </div>
      </nav>

      {/* Main content */}
      <main className="bg-background">
        <div className="h-14 border-b flex items-center justify-between px-6">
          <h1 className="font-medium">Welcome to EBIZ-Saas</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
        <div className="container mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function Router() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/auth" component={Auth} />
        <Route component={Auth} />
      </Switch>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
        <Route path="/bank-accounts" component={() => <ProtectedRoute component={BankAccounts} />} />
        <Route path="/bank-statements" component={() => <ProtectedRoute component={BankStatements} />} />
        <Route path="/transactions" component={() => <ProtectedRoute component={Transactions} />} />
        <Route path="/documents" component={() => <ProtectedRoute component={Documents} />} />
        <Route path="/chat" component={() => <ProtectedRoute component={Chat} />} />
        <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}


export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}