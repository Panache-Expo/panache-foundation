import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import MissPanacheImage from "@/assets/misspanache-2.jpg";
import WinnersListImage from "@/assets/PanacheDorWinners.jpeg";

const PanacheDorPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary/20 to-secondary/20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-primary mb-6">
            Panache <span className="text-rose-gold">D'or</span> Winners
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Celebrating excellence in beauty, fashion, and skincare through our prestigious awards program
          </p>
        </div>
      </section>

      {/* Miss Panache Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
              Miss Panache
            </h2>
            <p className="text-muted-foreground text-lg">
              Our crowned beauty representing elegance and grace
            </p>
          </div>
          
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-6">
                <img src={MissPanacheImage} alt = "Miss Panache" />
              </div>
              <div className="text-center">
                <h3 className="font-display text-2xl font-semibold text-primary mb-2">
                  Current Miss Panache
                </h3>
                <p className="text-muted-foreground mb-4">
                  Introducing the remarkable Miss Djoulhida Soule, our shining star as Miss Panache D’Or 2025 and the proud Ambassador of Panache Expo!
                  As the CEO of Charisma Beauty Skincare, Miss Soule is not just a certified chemist in cosmetic production; she is a visionary hair stylist and an incredible makeup artist. Her passion for beauty, skincare, and style radiates in everything she does.
                  
                  At Charisma Beauty, she inspires confidence by merging glamour with self-care, showing that every individual deserves to shine!
                  With her elegance and intelligence, Miss Soule is truly a beacon of empowerment and sophistication.

                  As the representative of Panache Expo 2025, she perfectly embodies the fusion of beauty and intelligence.
                  Let’s give a warm welcome to @misspanachedor as she joins the vibrant Panache family!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Winners List Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
              List of Winners
            </h2>
            <p className="text-muted-foreground text-lg">
              Our hall of fame celebrating all Panache D'or recipients
            </p>
          </div>
          
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-6">
                <img src={WinnersListImage} alt="Panache D'or Winners" />
              </div>
              <div className="text-center">
                <h3 className="font-display text-2xl font-semibold text-primary mb-4">
                  Past Winners & Recipients
                </h3>
                <p className="text-muted-foreground mb-6">
                  A comprehensive list of all our distinguished winners will be displayed here
                </p>
                </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PanacheDorPage;