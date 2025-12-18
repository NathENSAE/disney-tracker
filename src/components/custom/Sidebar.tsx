import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Image, Menu, X, Castle } from "lucide-react";
import { cn } from "@/lib/utils";


const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Accueil", path: "/" },
    { icon: Image, label: "Souvenirs", path: "/other" },
  ];

  return (
    <>
      {/* Mobile Toggle Button (Visible only on small screens) */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-secondary/80 backdrop-blur-md text-foreground rounded-full shadow-lg border border-primary/20"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-card/40 backdrop-blur-xl border-r border-border transition-all duration-300 ease-in-out flex flex-col items-center py-8",
          isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64 md:translate-x-0 md:w-20"
        )}
      >
        {/* Logo / Brand */}
        <div className="mb-10 flex flex-col items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Castle className="text-white h-7 w-7" />
          </div>
          {isOpen && <span className="mt-2 font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Disney</span>}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 w-full px-4 space-y-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)} // Close on click for mobile
                className={cn(
                  "flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                )}
                title={item.label}
              >
                <Icon size={24} className={cn("transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />

                {/* Check if we are in 'expanded' mobile mode OR we could add hover expand for desktop if desired. 
                    For this design, let's keep it icon-only on desktop for sleekness, and full text on mobile drawer. */}
                <span className={cn("md:hidden font-medium", isOpen ? "block" : "hidden")}>
                  {item.label}
                </span>

                {/* Desktop Tooltip-ish label on hover could go here if requested, but for now simple icons */}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Profile Placeholder */}
        <div className="mt-auto px-4 w-full">
          <div className="h-10 w-10 rounded-full bg-secondary border border-primary/20 mx-auto flex items-center justify-center text-xs font-bold text-muted-foreground">
            NS
          </div>
        </div>
      </aside>

      {/* Overlay for mobile when menu is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;