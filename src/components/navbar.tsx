import { Github, Menu, XIcon } from "lucide-react";
import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Button } from "~/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/src/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "~/src/components/ui/navigation-menu";
import { Logo } from "./logo";

const navLinks = [
  { to: "/", label: "Trang chủ" },
  { to: "/tai-lieu", label: "Tài liệu" },
  { to: "/trac-nghiem", label: "Trắc nghiệm" },
  { to: "/dong-gop", label: "Đóng góp" },
];

const githubLink = {
  to: "https://github.com/betothewizard/hocvnu",
  label: "GitHub",
};

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string) => {
    if (to === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(to);
  };

  const navLinkClass = (to: string) => {
    return isActive(to)
      ? "underline underline-offset-4"
      : "opacity-70 transition-opacity hover:opacity-100";
  };

  return (
    <nav className="flex items-center justify-between w-full py-10">
      <Link
        to="/"
        className="flex items-center space-x-4"
        aria-label="Trang chủ HocVNU"
      >
        <Logo size={64} role="img" aria-label="Logo HocVNU" />
      </Link>

      {/* Desktop Navigation */}
      <NavigationMenu className="hidden sm:flex justify-end flex-1">
        <NavigationMenuList className="gap-5 font-bold text-lg">
          {navLinks.map((link) => (
            <NavigationMenuItem key={link.to}>
              <Link
                to={link.to}
                className={navLinkClass(link.to)}
                viewTransition
              >
                {link.label}
              </Link>
            </NavigationMenuItem>
          ))}
          <NavigationMenuItem>
            <a
              href={githubLink.to}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-70 transition-opacity hover:opacity-100"
              aria-label={githubLink.label}
            >
              <Github />
            </a>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Mobile Navigation */}
      <div className="flex items-center justify-end sm:hidden">
        <DropdownMenu onOpenChange={setIsMobileMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="transition-transform duration-200 ease-in-out hover:scale-110"
            >
              {isMobileMenuOpen ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[150px]">
            {navLinks.map((link) => (
              <DropdownMenuItem
                key={link.to}
                asChild
                className="text-base py-2 px-3"
              >
                <Link to={link.to} className="w-full" viewTransition>
                  {link.label}
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem asChild className="text-base py-2 px-3">
              <a
                href={githubLink.to}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between"
              >
                GitHub
                <Github className="h-5 w-5" />
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export { Navbar };
