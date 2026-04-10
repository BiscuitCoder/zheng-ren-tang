import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/sections/hero-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { ComponentsShowcase } from "@/components/sections/components-showcase"
import { CtaSection } from "@/components/sections/cta-section"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <ComponentsShowcase />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
