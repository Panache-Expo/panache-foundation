import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Gallery } from "@/components/Gallery";
import { AwardsDropdown } from "@/components/AwardsDropdown";
import { SponsorsMarquee } from "@/components/SponsorsMarquee";
import { Founder } from "@/components/Founder";
import { Footer } from "@/components/Footer";

const PanacheExpoPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <About />
      <AwardsDropdown />
      <Gallery />
      <SponsorsMarquee />
      <Founder />
      <Footer />
    </div>
  );
};

export default PanacheExpoPage;
