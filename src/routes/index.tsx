import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, HardHat, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { login, loginWithPin } from "@/server/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — Naushik Construction Cloud" },
      { name: "description", content: "Sign in to your Naushik Cloud workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"admin" | "site">("admin");
  const [loginMethod, setLoginMethod] = useState<"password" | "pin">("pin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || (loginMethod === "password" ? !password : !pin)) return;
    setError("");
    setLoading(true);
    try { 
      if (loginMethod === "password") {
        await login({ data: { email, password } });
      } else {
        await loginWithPin({ data: { email, pin } });
      }
      try { localStorage.setItem("naushik.role", role); } catch {}
      navigate({ to: role === "admin" ? "/admin/dashboard" : "/site/dashboard" });
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden font-sans text-foreground">
      
      {/* --- REDESIGNED CSS BACKGROUND --- */}
      {/* 1. Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted pointer-events-none" />
      
      {/* 2. Technical Blueprint Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      <div 
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 2px, transparent 2px), linear-gradient(to bottom, currentColor 2px, transparent 2px)`,
          backgroundSize: '200px 200px'
        }}
      />
      
      {/* 3. Ambient Brand Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gold/10 blur-[120px] pointer-events-none" />
      
      {/* 4. Vignette Depth Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.05)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
      {/* --------------------------------- */}

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Glassmorphic Card */}
        <div className="bg-card/70 backdrop-blur-xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-[32px] p-8 sm:p-10">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-primary-foreground shadow-lg mb-4">
              <span className="text-xl font-black">N</span>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold tracking-tight text-foreground">Naushik</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Construction Cloud</div>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground mt-8">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {/* Role Segmented Control (Pill style) */}
            <div className="flex p-1 rounded-full bg-muted/60 border border-border/50 mb-6">
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-full transition-all",
                  role === "admin" 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Building2 className="h-3.5 w-3.5" /> Admin
              </button>
              <button
                type="button"
                onClick={() => setRole("site")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-full transition-all",
                  role === "site" 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <HardHat className="h-3.5 w-3.5" /> Site Manager
              </button>
            </div>

            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-2xl text-center">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div className="relative flex items-center bg-background/80 backdrop-blur-sm border border-border/50 focus-within:border-brand/50 focus-within:ring-1 focus-within:ring-brand/50 rounded-2xl transition-all shadow-sm">
              <span className="text-xs font-medium text-muted-foreground pl-4 pr-2 select-none">Email:</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === "admin" ? "admin@naushik.co" : "manager@naushik.co"}
                className="flex-1 bg-transparent py-4 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                required
              />
            </div>

            {/* Password or PIN Input with Embedded Button */}
            {loginMethod === "password" ? (
              <div className="relative flex items-center bg-background/80 backdrop-blur-sm border border-border/50 focus-within:border-brand/50 focus-within:ring-1 focus-within:ring-brand/50 rounded-2xl transition-all shadow-sm p-1">
                <span className="text-xs font-medium text-muted-foreground pl-3 pr-2 select-none">Password:</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent py-3 pr-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="h-10 w-10 shrink-0 rounded-full bg-brand hover:bg-brand/90 text-primary-foreground flex items-center justify-center shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />}
                </button>
              </div>
            ) : (
              <div className="relative flex items-center bg-background/80 backdrop-blur-sm border border-border/50 focus-within:border-brand/50 focus-within:ring-1 focus-within:ring-brand/50 rounded-2xl transition-all shadow-sm p-1">
                <span className="text-xs font-medium text-muted-foreground pl-3 pr-2 select-none">Enter PIN:</span>
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="flex-1 bg-transparent py-3 pr-2 text-xl tracking-[0.5em] font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="h-10 w-10 shrink-0 rounded-full bg-brand hover:bg-brand/90 text-primary-foreground flex items-center justify-center shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />}
                </button>
              </div>
            )}

            <div className="flex justify-between items-center pt-1 px-1">
              <button
                type="button"
                onClick={() => setLoginMethod(prev => prev === "password" ? "pin" : "password")}
                className="text-xs font-medium text-brand hover:text-brand/80 transition-colors"
              >
                {loginMethod === "password" ? "Use 4-Digit PIN instead" : "Use Password instead"}
              </button>
              <a href="#" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                Forgot Password?
              </a>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4 py-2">
              <div className="h-[1px] flex-1 bg-border/60" />
              <span className="text-[10px] font-medium uppercase text-muted-foreground tracking-widest">OR</span>
              <div className="h-[1px] flex-1 bg-border/60" />
            </div>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              Don't have an account yet?{" "}
              <Link to="/signup" className="font-semibold text-brand hover:text-brand/80 transition-colors">
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
