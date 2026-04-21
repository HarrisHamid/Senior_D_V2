import { Link, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLinks";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <img src="/logo.jpg" alt="Senior Design Marketplace" className="h-10 w-10 rounded object-cover" />
            <span className="hidden sm:block text-lg font-semibold text-foreground">
              Stevens Senior Design
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <NavLink
              to="/dashboard"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              activeClassName="text-primary"
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/marketplace"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              activeClassName="text-primary"
            >
              Marketplace
            </NavLink>
            {user.role === "student" && (
              <NavLink
                to="/group"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                activeClassName="text-primary"
              >
                My Group
              </NavLink>
            )}

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span>{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate("/logout")}
                  className="cursor-pointer text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={toggleMenu}>
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t bg-card">
          <div className="space-y-1 px-4 pb-3 pt-2">
            <NavLink
              to="/dashboard"
              className="block px-3 py-2 text-base font-medium text-foreground hover:bg-muted rounded-md"
              activeClassName="bg-muted text-primary"
              onClick={toggleMenu}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/marketplace"
              className="block px-3 py-2 text-base font-medium text-foreground hover:bg-muted rounded-md"
              activeClassName="bg-muted text-primary"
              onClick={toggleMenu}
            >
              Marketplace
            </NavLink>
            {user.role === "student" && (
              <NavLink
                to="/group"
                className="block px-3 py-2 text-base font-medium text-foreground hover:bg-muted rounded-md"
                activeClassName="bg-muted text-primary"
                onClick={toggleMenu}
              >
                My Group
              </NavLink>
            )}
            <Link
              to="/profile"
              className="block px-3 py-2 text-base font-medium text-foreground hover:bg-muted rounded-md"
              onClick={toggleMenu}
            >
              Profile
            </Link>
            <button
              onClick={() => {
                toggleMenu();
                navigate("/logout");
              }}
              className="block w-full text-left px-3 py-2 text-base font-medium text-destructive hover:bg-muted rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
