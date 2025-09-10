import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Shield,
  Zap,
  Eye,
  Lock,
  Cpu,
  Network,
  ChevronRight,
  Star,
  Download,
  Play
} from "lucide-react";
import medusaLogo from "@/assets/medusa-logo.jpg";

const galleryImages = [
  "https://res.cloudinary.com/du5tkpcut/image/upload/IMG_1365_xvwnum.jpg",
  "https://res.cloudinary.com/du5tkpcut/image/upload/v1757484399/3_kh0t0k.jpg",

  "https://res.cloudinary.com/du5tkpcut/image/upload/IMG_1366_hjfzkc.jpg",
  "https://res.cloudinary.com/du5tkpcut/image/upload/v1757484399/1_qg4ion.jpg",
    "https://res.cloudinary.com/du5tkpcut/image/upload/v1757484403/2_kvxjpf.jpg",

  "https://res.cloudinary.com/du5tkpcut/image/upload/IMG_1368_xnnnbk.jpg",
  "https://res.cloudinary.com/du5tkpcut/image/upload/v1757484400/4_ziyikj.jpg",

];

export const MedusaShowcase = () => {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <section className="px-4 bg-gradient-to-br from-background via-muted/20 to-cyber-green/5 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-cyber-green/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <h3 className="text-3xl font-bold mb-4 text-foreground text-center">
          Highlights of MEDUSA 1.0
        </h3>
        {/* Image Gallery */}
        <div className="mb-16">
          <div className="max-w-4xl mx-auto">
            <Carousel className="w-full">
              <CarouselContent>
                {galleryImages.map((url, index) => (
                  <CarouselItem key={index}>
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                      <CardContent className="p-0">
                        <div className="relative group">
                          <img
                            src={url}
                            alt={`Gallery Image ${index + 1}`}
                            className="w-full h-96 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-t-lg"></div>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>

            {/* Gallery Thumbnails */}
            <div className="flex justify-center gap-2 mt-6">
              {galleryImages.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${selectedImage === index
                      ? 'border-cyber-green shadow-lg shadow-cyber-green/25'
                      : 'border-border/50 hover:border-cyber-green/50'
                    }`}
                >
                  <img
                    src={url}
                    alt={`Gallery Image ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-4xl mx-auto border-cyber-green/20 bg-gradient-to-r from-cyber-green/5 via-primary/5 to-cyber-green/5 backdrop-blur-sm">
            <CardContent className="p-8">
              <h3 className="text-3xl font-bold mb-4 text-foreground">
                Previous Event Photo & Video Gallery
              </h3>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Explore memorable moments from our previous event, including photos and videos of competitions, workshops, and celebrations.
                Relive the excitement and achievements of our cybersecurity community.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">

                <Button size="lg" className="bg-gradient-to-r from-cyber-green to-primary text-background font-semibold hover:shadow-lg hover:shadow-cyber-green/25"
                 onClick={() =>
                  window.open(
                              "https://www.facebook.com/story.php?story_fbid=540689512302924&id=100090856394738&mibextid=wwXIfr&rdid=iOpgcpdVlesCnHvJ#",
                              "_blank"
                )
              }
                >
                  Medusa 1.0 Album
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="border-cyber-green/30 text-cyber-green hover:bg-cyber-green/10"
                 onClick={() =>
                  window.open(
                              "https://www.facebook.com/watch/?mibextid=wwXIfr&v=1806505730109125&rdid=sjSEaFCjyglqMBQz",
                              "_blank"
                )
              }
                >
                  View Documentation
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
export default MedusaShowcase;