import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Plus, 
  List, 
  TrendingUp, 
  Settings,
  PieChart
} from "lucide-react";
import { useLocation } from "wouter";

const navItems = [
  { path: "/", icon: PieChart, label: "Dashboard", testId: "nav-dashboard" },
  { path: "/add-transaction", icon: Plus, label: "Add Transaction", testId: "nav-add-transaction" },
  { path: "/transactions", icon: List, label: "Transactions", testId: "nav-transactions" },
  { path: "/reports", icon: TrendingUp, label: "Reports", testId: "nav-reports" },
  { path: "/settings", icon: Settings, label: "Settings", testId: "nav-settings" },
];

export function Navigation() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={cn(
                  "flex items-center space-x-2 py-4 px-2 border-b-2 font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
                data-testid={item.testId}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
