import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { PlatformProvider } from "@/context/platform-context";
import { AuthProvider } from "@/context/auth-context";
import { RepairProvider } from "@/context/repair-context";
import { TemporarySupportProvider } from "@/context/temporary-support-context";
import { NotificationProvider } from "@/context/notification-context";
import { MotionProvider } from "@/components/motion/motion-primitives";
import { APP_CONFIG } from "@/lib/constants";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} — When Mobility Stops, Support Shouldn't`,
  description: APP_CONFIG.description,
  keywords: [
    "wheelchair repair",
    "mobility support",
    "temporary wheelchair loan",
    "assistive technology",
    "rehabilitation",
    "disability support",
    "SBI Young Innovators",
  ],
  authors: [{ name: "RepairLink Team" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-background text-foreground flex flex-col min-h-screen selection:bg-primary/20 selection:text-primary">
        <MotionProvider>
          <PlatformProvider>
            <AuthProvider>
              <RepairProvider>
                <TemporarySupportProvider>
                  <NotificationProvider>
                    <a
                      href="#main-content"
                      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2.5 focus:rounded-lg focus:bg-secondary focus:text-white focus:text-xs focus:font-bold focus:shadow-elevated"
                    >
                      Skip to main content
                    </a>
                    <Navbar />
                    <main id="main-content" tabIndex={-1} className="flex-1 pb-20 md:pb-0 focus:outline-none">
                      {children}
                    </main>
                    <Footer />
                    <MobileNav />
                  </NotificationProvider>
                </TemporarySupportProvider>
                <Toaster
                  position="top-right"
                  richColors
                  closeButton
                  toastOptions={{
                    style: {
                      borderRadius: "0.75rem",
                      fontFamily: "var(--font-sans)",
                    },
                  }}
                />
              </RepairProvider>
            </AuthProvider>
          </PlatformProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
