import { Hero } from "@/components/landing/hero";
import { QuickActions } from "@/components/landing/quick-actions";
import { CoreServices } from "@/components/landing/core-services";
import { HowItWorks } from "@/components/landing/how-it-works";
import { TemporaryMobilitySpotlight } from "@/components/landing/temporary-mobility-spotlight";
import { WhoWeServe } from "@/components/landing/who-we-serve";
import { WhyRepairLink } from "@/components/landing/why-repairlink";
import { CtaBanner } from "@/components/landing/cta-banner";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <QuickActions />
      <CoreServices />
      <HowItWorks />
      <TemporaryMobilitySpotlight />
      <WhoWeServe />
      <WhyRepairLink />
      <CtaBanner />
    </div>
  );
}
