import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, HardHat, ShieldCheck, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { login } from "@/server/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — Naushik Construction Cloud" },
      { name: "description", content: "Enterprise project & site management for construction teams. Sign in to your Naushik Cloud workspace." },
      { property: "og:title", content: "Naushik Construction Cloud" },
      { property: "og:description", content: "Enterprise project & site management for construction teams." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"admin" | "site">("admin");
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try { 
      await login({ data: { email, password } });
      try { localStorage.setItem("naushik.role", role); } catch {}
      navigate({ to: role === "admin" ? "/admin/dashboard" : "/site/dashboard" });
    } catch (err: any) {
      setError(err.message || "Failed to login");
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-sidebar text-sidebar-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(var(--sidebar-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--sidebar-foreground) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
          aria-hidden
        />
        <div className="relative z-10 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-gold text-gold-foreground text-lg font-black shadow-md">N</div>
          <div>
            <div className="text-base font-bold tracking-tight">Naushik</div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-sidebar-foreground/60">Associates · Calicut</div>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold">
            <ShieldCheck className="h-3.5 w-3.5" /> Construction Cloud · v4.2
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Run every project, site and rupee from one disciplined cockpit.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-sidebar-foreground/70">
            Daily progress, workforce, procurement, inventory and finance — synchronised across HQ, site office and the foreman's phone. Built for builders who refuse to lose a day.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { v: "1,240+", k: "Projects shipped" },
              { v: "₹4,820 Cr", k: "Budget under management" },
              { v: "99.95%", k: "Daily report uptime" },
            ].map((s) => (
              <div key={s.k}>
                <div className="text-xl font-bold text-gold">{s.v}</div>
                <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">{s.k}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-sidebar-foreground/50">
          © 2026 Naushik Associates · ISO 9001:2015 · SOC 2 Type II
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-gold text-gold-foreground text-base font-black">N</div>
            <div>
              <div className="text-sm font-bold tracking-tight">Naushik</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Construction Cloud</div>
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your Naushik workspace.</p>

          <div className="mt-6 grid grid-cols-2 gap-2">
            {([
              { v: "admin", label: "Admin", desc: "HQ / Portfolio", icon: Building2 },
              { v: "site", label: "Site Manager", desc: "Field operations", icon: HardHat },
            ] as const).map((r) => {
              const active = role === r.v;
              const Icon = r.icon;
              return (
                <button
                  key={r.v}
                  type="button"
                  onClick={() => setRole(r.v)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-all",
                    active
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/40 hover:bg-muted/50",
                  )}
                >
                  <Icon className={cn("h-4 w-4 mb-2", active ? "text-primary" : "text-muted-foreground")} />
                  <div className="text-sm font-semibold">{r.label}</div>
                  <div className="text-[11px] text-muted-foreground">{r.desc}</div>
                </button>
              );
            })}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {error && <div className="text-sm font-medium text-destructive">{error}</div>}
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={role === "admin" ? "admin@naushik.co" : "rajesh@naushik.co"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                key={role}
                required
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-xs font-medium text-primary hover:underline">Forgot?</button>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPw ? "text" : "password"} 
                  placeholder="••••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="pr-10" 
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Show password"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="h-11 w-full text-sm font-semibold">
              Sign in as {role === "admin" ? "Administrator" : "Site Manager"}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>

            <div className="text-center text-[11px] text-muted-foreground">
              Protected by JWT · MFA enforced · RBAC enabled
            </div>
          </form>

          <Card className="mt-6 border-dashed bg-muted/30 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Demo shortcuts</div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <Link to="/admin/dashboard" className="rounded-md border border-border bg-background px-2.5 py-1 font-medium hover:border-primary/40">Admin →</Link>
              <Link to="/site/dashboard" className="rounded-md border border-border bg-background px-2.5 py-1 font-medium hover:border-primary/40">Site Manager →</Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
