"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  User,
  Wrench,
  Building2,
  Shield,
} from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/brand/logo";
import { useAuth, DEMO_ACCOUNTS } from "@/context/auth-context";
import { UserRole } from "@/lib/supabase/types";
import { validateEmail } from "@/lib/auth/validation";

const ROLE_OPTIONS: { role: UserRole; label: string; icon: React.ElementType; description: string }[] = [
  {
    role: "user",
    label: "Wheelchair User",
    icon: User,
    description: "Book repairs, track requests, and request temporary loaners",
  },
  {
    role: "provider",
    label: "Repair Provider",
    icon: Wrench,
    description: "Receive service tickets, send quotes, and manage jobs",
  },
  {
    role: "institution",
    label: "Hospital / NGO",
    icon: Building2,
    description: "Manage wheelchair loaner inventory and approve requests",
  },
  {
    role: "admin",
    label: "Administrator",
    icon: Shield,
    description: "Platform moderation, provider verification, and analytics",
  },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get("redirect");
  const roleParam = searchParams?.get("role") as UserRole | null;

  const { signIn } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(roleParam || "user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showDemoHelper, setShowDemoHelper] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    const success = await signIn(email, password, selectedRole);
    setIsLoading(false);

    if (success) {
      const destination = redirectPath || `/dashboard/${selectedRole}`;
      router.push(destination);
    } else {
      setErrorMessage("Authentication failed. Please verify credentials or create a new account.");
    }
  };

  const fillDemoAccount = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(DEMO_ACCOUNTS[role].email);
    setPassword("Demo123456!");
    setErrorMessage("");
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-3">
          <Logo size="lg" showTagline={true} taglineVariant="possibilities" />
        </div>
        <h1 className="text-2xl font-black text-secondary tracking-tight">
          Sign In to RepairLink
        </h1>
        <p className="text-xs text-muted-foreground">
          Enter your email and password to access your dashboard
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
          Select Your Portal
        </label>
        <div className="bg-slate-100 p-1 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-1 text-[11px] font-semibold border border-slate-200">
          {ROLE_OPTIONS.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedRole === item.role;
            return (
              <button
                key={item.role}
                type="button"
                onClick={() => setSelectedRole(item.role)}
                className={`py-2 px-1 rounded-lg transition-all flex flex-col items-center gap-1 text-center ${
                  isSelected
                    ? "bg-white text-primary shadow-xs font-bold border border-slate-200"
                    : "text-muted-foreground hover:text-secondary"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                <span className="truncate w-full text-[10px] sm:text-[11px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Login Card */}
      <Card className="border-slate-200 shadow-elevated bg-white">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              Logging in as: <span className="text-primary">{ROLE_OPTIONS.find((r) => r.role === selectedRole)?.label}</span>
            </span>
            <span className="text-[11px] text-muted-foreground">Secure Login</span>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
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
              placeholder="you@example.com"
              startIcon={<Mail className="w-4 h-4 text-muted-foreground" />}
              autoComplete="email"
            />

            <div className="space-y-1">
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  startIcon={<Lock className="w-4 h-4 text-muted-foreground" />}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] text-muted-foreground hover:text-secondary"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                isLoading={isLoading}
                className="w-full font-bold shadow-card bg-primary hover:bg-primary-600 text-white h-11"
              >
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="pt-0 flex flex-col items-center justify-center border-t border-slate-100 mt-2 text-xs text-muted-foreground gap-2">
          <p>
            Don&apos;t have an account?{" "}
            <Link href={`/register?role=${selectedRole}`} className="text-primary font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </CardFooter>
      </Card>

      {/* Discreet Demo Helper for Testing */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => setShowDemoHelper(!showDemoHelper)}
          className="text-[11px] text-muted-foreground hover:text-secondary underline transition-colors"
        >
          {showDemoHelper ? "Hide testing shortcuts" : "Quick test credentials"}
        </button>

        {showDemoHelper && (
          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-2 animate-in fade-in duration-150">
            <p className="text-[11px] font-bold text-secondary">Click to auto-fill sample credentials for testing:</p>
            <div className="grid grid-cols-2 gap-1.5">
              {ROLE_OPTIONS.map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => fillDemoAccount(item.role)}
                  className="p-1.5 bg-white border border-slate-200 rounded-md text-[11px] text-left hover:border-primary transition-colors flex items-center justify-between"
                >
                  <span className="font-semibold text-secondary">{item.label}</span>
                  <span className="text-[10px] text-primary">Fill →</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="text-center text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-1.5 text-secondary font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Protected with Role-Based Access & End-to-End Encryption</span>
        </div>
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
