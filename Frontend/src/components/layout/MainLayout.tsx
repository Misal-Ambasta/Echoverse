
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EchoLogo } from "@/components/EchoLogo";
import { MicIcon, CalendarIcon, SettingsIcon, LogOutIcon } from "lucide-react";
import useStore from "@/store/useStore";

interface MainLayoutProps {
  children: ReactNode;
  currentPage: string;
}

export function MainLayout({ children, currentPage }: MainLayoutProps) {
  const navigate = useNavigate();
  
  // Import useStore to access the logout function
  const { logout } = useStore();
  
  const handleLogout = () => {
    // Call the logout function from the store
    logout();
    // Navigate to login page after logout
    navigate("/login");
  };
  
  const navItems = [
    { name: "Record", icon: <MicIcon className="h-5 w-5" />, path: "/dashboard" },
    { name: "Timeline", icon: <CalendarIcon className="h-5 w-5" />, path: "/timeline" },
    { name: "Settings", icon: <SettingsIcon className="h-5 w-5" />, path: "/settings" },
  ];
  
  return (
      <div className="min-h-screen flex flex-col md:flex-row">
        <aside className="bg-secondary md:w-64 p-4 md:p-6">
          <div className="flex items-center gap-2 mb-8">
            <EchoLogo className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold">EchoVerse</h1>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant={currentPage === item.name.toLowerCase() ? "default" : "ghost"}
                className={`w-full justify-start ${currentPage === item.name.toLowerCase() ? "echo-gradient" : ""}`}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </Button>
            ))}
            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive hover:text-destructive" 
              onClick={handleLogout}
            >
              <LogOutIcon className="h-5 w-5" />
              <span className="ml-2">Logout</span>
            </Button>
          </nav>
          <div className="mt-auto pt-8">
            <p className="text-xs text-muted-foreground">
              Record today, reflect tomorrow.
            </p>
          </div>
        </aside>
        
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
  );
}
