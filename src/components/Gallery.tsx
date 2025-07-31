import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import makeupImage from "@/assets/Makeup.jpg";
import StylingImage from "@/assets/HairStyling.jpg"; 
import NailImage from "@/assets/NailArt.jpg";
import WigImage from "@/assets/WigInstall.jpg";
import LashImage from "@/assets/Lash.jpg";
import BraidingImage from "@/assets/BraidingWorkshop.jpeg";
export const Gallery = () => {
  const galleryItems = [
    {
      type: "image",
      src: makeupImage,
      alt: "Makeup workshop"
    },
    {
      type: "image", 
      src: StylingImage,
      alt: "Barber workshop"
    },
    {
      type: "image",
      src: NailImage, 
      alt: "Nail art workshop"
    },
    {
      type: "image",
      src: WigImage,
      alt: "Wig installation workshop"
    },
    {
      type: "image",
      src: LashImage,
      alt: "Lash extension training"
    },
    {
      type: "image",
      src: BraidingImage,
      alt: "Braiding workshop demonstration"
    }
  ];

  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
            Event <span className="text-rose-gold">Gallery</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Relive the magic of our previous workshops and events. See the transformation, 
            skill development, and celebration of beauty excellence.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {galleryItems.map((item, index) => (
            <div 
              key={index}
              className="group relative overflow-hidden rounded-2xl shadow-soft hover:shadow-elegant transition-all duration-500 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-primary-foreground text-sm font-medium">
                    {item.alt}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <Link to="/panache-dor">
            <Button variant="rose" size="lg">
              View Panache D'or Winners
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};