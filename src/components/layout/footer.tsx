import React from "react";
import Link from "next/link";
import {
  Wrench,
  HeartHandshake,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { APP_CONFIG, ROLE_PORTALS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-secondary text-slate-200 pt-16 pb-24 md:pb-12">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-700/60">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/10 inline-block p-3 rounded-2xl backdrop-blur-sm border border-white/10">
              <Logo size="md" href="/" inverted={true} showTagline={true} taglineVariant="possibilities" />
            </div>
            <p className="text-sm text-slate-300 font-medium italic">
              &ldquo;{APP_CONFIG.tagline}&rdquo;
            </p>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              RepairLink is India’s dedicated digital wheelchair repair and mobility-continuity
              platform. Connecting wheelchair users with vetted technicians, hospitals, and NGOs
              to guarantee uninterrupted daily life.
            </p>

            <div className="pt-2">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-300">
                <Sparkles className="w-4 h-4 text-accent" />
                <span>Prototype developed for <strong>SBI Young Innovators Ideathon</strong></span>
              </div>
            </div>
          </div>

          {/* Core Pillars */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-accent">
              Core Capabilities
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link href="/#services" className="hover:text-white transition-colors">
                  Smart Repair Discovery
                </Link>
              </li>
              <li>
                <Link href="/temporary-support" className="hover:text-white transition-colors">
                  Temporary Mobility Support
                </Link>
              </li>
              <li>
                <Link href="/dashboard/user" className="hover:text-white transition-colors">
                  Centralised Management
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition-colors">
                  How Workflow Operates
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Help Center &amp; FAQs
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="hover:text-white transition-colors">
                  Accessibility Standards
                </Link>
              </li>
            </ul>
          </div>

          {/* Role Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-accent">
              Platform Portals
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              {ROLE_PORTALS.map((portal) => (
                <li key={portal.role}>
                  <Link
                    href={portal.href}
                    className="hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>{portal.title}</span>
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  href="/register"
                  className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1"
                >
                  Create New Account <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-accent">
              Support & Emergency
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-white">24/7 Breakdown Hotline</p>
                  <p className="text-slate-400">{APP_CONFIG.supportPhone}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-white">Institutional Desk</p>
                  <p className="text-slate-400">{APP_CONFIG.supportEmail}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-white">Accessibility Certified</p>
                  <p className="text-slate-400">WCAG 2.1 AA Compliant Design</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} RepairLink. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link href="/privacy" className="hover:text-slate-200 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-200 transition-colors">
              Terms of Service
            </Link>
            <Link href="/accessibility" className="hover:text-slate-200 transition-colors">
              Accessibility Statement
            </Link>
            <Link href="/faq" className="hover:text-slate-200 transition-colors">
              FAQs &amp; Emergency Help
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
