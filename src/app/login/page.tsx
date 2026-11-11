"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  User,
  Wrench,
  Building2,
  ShieldAlert,
  Sparkles,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/brand/logo";
import { useAuth, DEMO_ACCOUNTS } from "@/context/auth-context";
import { UserRole } from "@/lib/supabase/types";
import { validateEmail } from "@/lib/auth/validation";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get("redirect");

  const { signIn, switchDemoRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");
  const [email, setEmail] = useState(DEMO_ACCOUNTS.user.email);
  const [password, setPassword] = useState("Demo123456!");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(DEMO_ACCOUNTS[role].email);
    setPassword("Demo123456!");
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    const success = await signIn(email, password);
    setIsLoading(false);

    if (success) {
      const destination = redirectPath || `/dashboard/${selectedRole}`;
      router.push(destination);
    } else {
      setErrorMessage("Authentication failed. Please verify credentials or choose a demo profile.");
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Top Header with Official Logo */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <Logo size="lg" showTagline={true} taglineVariant="possibilities" />
        </div>
        <h1 className="text-2xl font-extrabold text-secondary tracking-tight">
          Sign In to RepairLink
        </h1>
        <p className="text-xs text-muted-foreground">
          Access your wheelchair records, provider dispatch, or institutional inventory
        </p>
      </div>

      {/* Role Selector Tabs for Quick Ideathon Evaluation */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-secondary uppercase tracking-wider">
            1-Click Evaluation Presets
          </span>
          <span className="text-muted-foreground">Auto-fills credentials</span>
        </div>
        <div className="bg-slate-100 p-1 rounded-xl grid grid-cols-4 gap-1 text-[11px] font-semibold border border-slate-200">
          {(["user", "provider", "institution", "admin"] as UserRole[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRoleSelect(r)}
              className={`py-2 px-1 rounded-lg transition-all capitalize ${
                selectedRole === r
                  ? "bg-white text-primary shadow-sm font-bold border border-slate-200/60"
                  : "text-muted-foreground hover:text-secondary"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Login Card */}
      <Card className="border-slate-200 shadow-elevated bg-white">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              Role: <span className="text-primary">{selectedRole.toUpperCase()}</span>
            </span>
            <Badge variant="accent" className="text-[10px] flex items-center gap-1 font-bold">
              <Sparkles className="w-3 h-3 text-emerald-700" />
              Demo Verified
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              startIcon={<Mail className="w-4 h-4" />}
            />

            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                startIcon={<Lock className="w-4 h-4" />}
              />
              <div className="flex justify-end pt-1">
                <span className="text-xs text-primary font-medium cursor-pointer hover:underline">
                  Password reset secured via Supabase
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                isLoading={isLoading}
                className="w-full font-bold shadow-card bg-primary hover:bg-primary-600 h-11"
              >
                <span>Sign In as {selectedRole.toUpperCase()}</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="pt-0 flex flex-col items-center justify-center border-t border-slate-100 mt-2 text-xs text-muted-foreground gap-2">
          <p>
            Need a new account?{" "}
            <Link href={`/register?role=${selectedRole}`} className="text-primary font-bold hover:underline">
              Register as {selectedRole}
            </Link>
          </p>
        </CardFooter>
      </Card>

      {/* Security & Prototype Badge */}
      <div className="text-center text-xs text-muted-foreground space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-secondary font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Protected with Supabase Row Level Security (RLS)</span>
        </div>
        <p className="text-[11px]">
          SBI Young Innovators Ideathon Prototype • Phase 2 Auth Engine
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-surface to-background">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </div>
  );
}
