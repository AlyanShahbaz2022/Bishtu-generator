"use client";

import {
  ChevronRight,
  Menu,
  MessageCircle,
  Phone,
  Search,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { CartIcon } from "@/features/cart/cart-icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { servicesMenu } from "@/constants/navigation";
import { siteConfig } from "@/constants/site";
import type { StorefrontNavDepartment } from "@/services/navigation";
import { cn } from "@/lib/utils";

const PRIMARY_LINKS = [
  { title: "Home", href: "/" },
  { title: "About", href: "/about" },
  { title: "Industries", href: "/industries" },
  { title: "Projects", href: "/projects" },
  { title: "Blog", href: "/blog" },
  { title: "Contact", href: "/contact" },
];

const waLink = `https://wa.me/${siteConfig.contact.whatsapp.replace(/\D/g, "")}`;
const telLink = `tel:${siteConfig.contact.phone.replace(/\s/g, "")}`;

export function Navbar({ nav }: { nav: StorefrontNavDepartment[] }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border bg-background/80 shadow-sm backdrop-blur-lg"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="size-5" />
          </span>
          <span className="font-heading text-lg font-extrabold tracking-tight">
            {siteConfig.name}
          </span>
        </Link>

        <DesktopNav nav={nav} />

        <div className="flex items-center gap-1">
          <SearchButton />
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Call us"
            className="hidden sm:inline-flex"
          >
            <a href={telLink}>
              <Phone className="size-4" />
            </a>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Chat on WhatsApp"
            className="hidden sm:inline-flex"
          >
            <a href={waLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-4" />
            </a>
          </Button>
          <ThemeToggle className="hidden sm:inline-flex" />
          <CartIcon />
          <Button asChild size="sm" className="ml-1 hidden lg:inline-flex">
            <Link href="/quote">Request Quote</Link>
          </Button>
          <MobileNav nav={nav} />
        </div>
      </div>
    </header>
  );
}

function DesktopNav({ nav }: { nav: StorefrontNavDepartment[] }) {
  const pathname = usePathname();

  return (
    <NavigationMenu className="hidden lg:flex">
      <NavigationMenuList>
        <NavLink href="/" active={pathname === "/"}>
          Home
        </NavLink>
        <NavLink href="/about" active={pathname.startsWith("/about")}>
          About
        </NavLink>

        {nav.length > 0 && (
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-[640px] grid-cols-3 gap-3 p-4">
                {nav.map((dept) => (
                  <div key={dept.id}>
                    <p className="mb-2 px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      {dept.label}
                    </p>
                    <ul className="space-y-1">
                      {dept.children.map((cat) => (
                        <li key={cat.id}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={cat.href ?? "/products"}
                              className="block rounded-md px-2 py-1.5 text-sm font-medium hover:bg-muted"
                            >
                              {cat.label}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}

        <NavigationMenuItem>
          <NavigationMenuTrigger>Services</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[320px] gap-1 p-3">
              {servicesMenu.map((link) => (
                <li key={link.title}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={link.href}
                      className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                    >
                      {link.title}
                    </Link>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavLink href="/industries" active={pathname.startsWith("/industries")}>
          Industries
        </NavLink>
        <NavLink href="/projects" active={pathname.startsWith("/projects")}>
          Projects
        </NavLink>
        <NavLink href="/blog" active={pathname.startsWith("/blog")}>
          Blog
        </NavLink>
        <NavLink href="/contact" active={pathname.startsWith("/contact")}>
          Contact
        </NavLink>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <NavigationMenuItem>
      <NavigationMenuLink
        asChild
        className={cn(navigationMenuTriggerStyle(), active && "text-primary")}
      >
        <Link href={href}>{children}</Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
}

function SearchButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = String(
      new FormData(event.currentTarget).get("q") ?? "",
    ).trim();
    setOpen(false);
    router.push(
      query ? `/products?q=${encodeURIComponent(query)}` : "/products",
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Search"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
      </Button>
      <DialogContent className="top-24 translate-y-0 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Search products</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            name="q"
            autoFocus
            placeholder="Search generators, brands, KVA…"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MobileNav({ nav }: { nav: StorefrontNavDepartment[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          className="lg:hidden"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Zap className="size-5 text-primary" />
            {siteConfig.name}
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-1 px-4">
          {PRIMARY_LINKS.map((link) => (
            <SheetClose asChild key={link.href}>
              <Link
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                {link.title}
              </Link>
            </SheetClose>
          ))}

          {nav.map((dept) => (
            <div key={dept.id}>
              <p className="mt-4 px-3 text-xs font-semibold text-muted-foreground uppercase">
                {dept.label}
              </p>
              {dept.children.map((cat) => (
                <SheetClose asChild key={cat.id}>
                  <Link
                    href={cat.href ?? "/products"}
                    className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted"
                  >
                    {cat.label}
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </Link>
                </SheetClose>
              ))}
            </div>
          ))}
        </nav>

        <div className="mt-6 flex flex-col gap-2 px-4">
          <SheetClose asChild>
            <Button asChild className="w-full">
              <Link href="/quote">Request Quote</Link>
            </Button>
          </SheetClose>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1">
              <a href={telLink}>
                <Phone className="size-4" /> Call
              </a>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <a href={waLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            </Button>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
