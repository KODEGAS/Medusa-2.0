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
  {
    id: 1,
    src: medusaLogo,
    title: "",
    description: ""
  },
  {
    id: 2,
    src: medusaLogo, 
    title: "",
    description: ""
  },
  {
    id: 3,
    src: medusaLogo,
    title: "",
    description: ""
  },
  {
    id: 4,
    src: medusaLogo,
    title: "",
    description: ""
  },
  {
    id: 5,
    src: medusaLogo,
    title: "",
    description: ""
  }
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
          Highlights of Medusa 1.0
        </h3>
        {/* Image Gallery */}
        <div className="mb-16">
          <div className="max-w-4xl mx-auto">
            <Carousel className="w-full">
              <CarouselContent>
                {galleryImages.map((image, index) => (
                  <CarouselItem key={image.id}>
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                      <CardContent className="p-0">
                        <div className="relative group">
                          <img
                            src={image.src}
                            alt={image.title}
                            className="w-full h-96 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-t-lg"></div>
                          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <h3 className="text-xl font-bold mb-2">{image.title}</h3>
                            <p className="text-sm text-white/90">{image.description}</p>
                          </div>
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
              {galleryImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                    selectedImage === index 
                      ? 'border-cyber-green shadow-lg shadow-cyber-green/25' 
                      : 'border-border/50 hover:border-cyber-green/50'
                  }`}
                >
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-full object-cover"
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
                <Button size="lg" className="bg-gradient-to-r from-cyber-green to-primary text-background font-semibold hover:shadow-lg hover:shadow-cyber-green/25">
                  Medusa 1.0 Album
                <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="border-cyber-green/30 text-cyber-green hover:bg-cyber-green/10">
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