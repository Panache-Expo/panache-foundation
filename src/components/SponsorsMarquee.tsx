import sponsor1 from "@/assets/sponsors/sponsor1.jpeg";
import sponsor2 from "@/assets/sponsors/sponsor2.jpeg";
import sponsor3 from "@/assets/sponsors/sponsor3.jpeg";
import sponsor4 from "@/assets/sponsors/sponsor4.jpeg";
import sponsor5 from "@/assets/sponsors/sponsor5.jpeg";
import sponsor6 from "@/assets/sponsors/sponsor6.jpeg";
import sponsor7 from "@/assets/sponsors/sponsor7.jpeg";
import sponsor8 from "@/assets/sponsors/sponsor8.jpeg";
import sponsor9 from "@/assets/sponsors/sponsor9.jpeg";
import sponsor10 from "@/assets/sponsors/sponsor10.jpeg";
import sponsor11 from "@/assets/sponsors/sponsor11.jpeg";
import sponsor12 from "@/assets/sponsors/sponsor12.jpeg";
import sponsor13 from "@/assets/sponsors/sponsor13.jpeg";
import sponsor14 from "@/assets/sponsors/sponsor14.jpeg";
import sponsor15 from "@/assets/sponsors/sponsor15.jpeg";

const sponsors = [
  { name: "Sponsor 1", logo: sponsor1 },
  { name: "Sponsor 2", logo: sponsor2 },
  { name: "Sponsor 3", logo: sponsor3 },
  { name: "Sponsor 4", logo: sponsor4 },
  { name: "Sponsor 5", logo: sponsor5 },
  { name: "Sponsor 6", logo: sponsor6 },
  { name: "Sponsor 7", logo: sponsor7 },
  { name: "Sponsor 8", logo: sponsor8 },
  { name: "Sponsor 9", logo: sponsor9 },
  { name: "Sponsor 10", logo: sponsor10 },
  { name: "Sponsor 11", logo: sponsor11 },
  { name: "Sponsor 12", logo: sponsor12 },
  { name: "Sponsor 13", logo: sponsor13 },
  { name: "Sponsor 14", logo: sponsor14 },
  { name: "Sponsor 15", logo: sponsor15 },
];

export const SponsorsMarquee = () => {
  return (
    <section className="py-16 bg-muted/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-10 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-3">
          Our <span className="text-rose-gold">Sponsors</span> & Partners
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Proudly supported by leading organizations championing beauty, fashion, and youth empowerment.
        </p>
      </div>

      <div className="relative">
        {/* Gradient fades on edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-muted/30 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-muted/30 to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee">
          {[...sponsors, ...sponsors].map((sponsor, index) => (
            <div
              key={index}
              className="flex-shrink-0 mx-6 w-36 h-24 rounded-xl bg-card border border-border/50 shadow-soft flex items-center justify-center p-4 grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-150"
            >
              <img
                src={sponsor.logo}
                alt={sponsor.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
