import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, Wallet, History, User, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/loans", label: "Loan", icon: Wallet },
  { to: "/history", label: "History", icon: History },
  { to: "/profile", label: "Profile", icon: User },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [user, loading, nav]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20 pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-6">
          <Link to="/dashboard" className="font-display text-lg font-bold">
            Daily<span className="text-accent">Chitta</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active = loc.pathname.startsWith(l.to);
              return (
                <Link key={l.to} to={l.to}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                  }`}>
                  <l.icon className="size-4" /> {l.label}
                </Link>
              );
            })}
          </nav>
          <Button variant="ghost" size="sm" onClick={async () => { await signOut(); nav({ to: "/" }); }}>
            <LogOut className="size-4 md:mr-2" /> <span className="hidden md:inline">Logout</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {links.map((l) => {
            const active = loc.pathname.startsWith(l.to);
            return (
              <Link key={l.to} to={l.to}
                className={`flex flex-col items-center gap-1 py-3 text-xs font-medium ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}>
                <l.icon className="size-5" /> {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
