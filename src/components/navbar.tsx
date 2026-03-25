"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Menu, X, Home, FileText, BarChart3, Trophy, LogIn, LogOut, User, Shield, Truck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const citizenLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/report", label: "Report Waste", icon: FileText },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/tracking", label: "Track Reports", icon: FileText },
  { href: "/rewards", label: "Rewards", icon: Trophy },
];

// Admin links are intentionally minimal — admin accesses via /admin-login
const adminLinks = [
  { href: "/admin", label: "Admin Portal", icon: Shield },
];

const driverLinks = [
  { href: "/driver", label: "My Tasks", icon: Truck },
  { href: "/", label: "Home", icon: Home },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => { logout(); router.push("/"); setIsOpen(false); };

  const navLinks = user?.role === "admin" ? adminLinks : user?.role === "driver" ? driverLinks : citizenLinks;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gradient">EcoTrack</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  {user.role === "driver"
                    ? <Truck className="w-4 h-4 text-blue-500" />
                    : <User className="w-4 h-4" />}
                  {user.name}
                  {/* Only show role badge for citizen/driver — admin is hidden */}
                  {user.role !== "admin" && (
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded capitalize">{user.role}</span>
                  )}
                </span>
                <Button variant="outline" size="sm" className="gap-2" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm" className="gap-2">
                    <LogIn className="w-4 h-4" />
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border"
          >
            <div className="px-4 py-4 space-y-2 bg-background/95 backdrop-blur-lg">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Button>
                </Link>
              ))}
              <div className="pt-2 border-t border-border space-y-2">
                {user ? (
                  <>
                    <p className="text-sm text-muted-foreground px-2 flex items-center gap-2">
                      <User className="w-4 h-4" /> {user.name}
                    </p>
                    <Button variant="outline" className="w-full gap-2" onClick={handleLogout}>
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full gap-2">
                        <LogIn className="w-4 h-4" />
                        Login
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
