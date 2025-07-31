import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

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
                <p className="text-muted-foreground text-lg">
                  Miss Panache Image will be added here
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-display text-2xl font-semibold text-primary mb-2">
                  Current Miss Panache
                </h3>
                <p className="text-muted-foreground">
                  Details about the current Miss Panache will be displayed here
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
                <p className="text-muted-foreground text-lg">
                  List of Winners Image will be added here
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-display text-2xl font-semibold text-primary mb-4">
                  Past Winners & Recipients
                </h3>
                <p className="text-muted-foreground mb-6">
                  A comprehensive list of all our distinguished winners will be displayed here
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-left">
                  <div className="p-4 bg-background rounded-lg">
                    <h4 className="font-semibold text-primary mb-2">2024 Winners</h4>
                    <p className="text-sm text-muted-foreground">Winners will be listed here</p>
                  </div>
                  <div className="p-4 bg-background rounded-lg">
                    <h4 className="font-semibold text-primary mb-2">2023 Winners</h4>
                    <p className="text-sm text-muted-foreground">Winners will be listed here</p>
                  </div>
                </div>
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