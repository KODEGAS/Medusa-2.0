
import { Mail, Phone, MapPin, User, Shield, Zap, Users, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

//profile images
const anuka = "https://res.cloudinary.com/du5tkpcut/image/upload/w_200,q_auto/v1757483245/anuka_f0fcxu.webp";
const maleesha = "https://res.cloudinary.com/du5tkpcut/image/upload/w_200,q_auto/v1757483272/maleesha_mrb9xs.webp";
const kavindu = "https://res.cloudinary.com/du5tkpcut/image/upload/v1757483268/kavindu_vms68i.webp";
const thivina = "https://res.cloudinary.com/du5tkpcut/image/upload/v1757483274/thivina_eiemsn.webp";
const kavishka = "https://res.cloudinary.com/du5tkpcut/image/upload/v1757483263/kavishka_xru4ev.webp";
const savithi = "https://res.cloudinary.com/du5tkpcut/image/upload/v1757483273/savithi_axapnj.webp";

export const ContactUsSection = () => {
  const navigate = useNavigate();
  const committeeMembers = [
    {
      position: "President (ECSC)",
      name: "Anuka Akshana",
      email: "akshana-ec21053@stu.kln.ac.lk",
      phone: "+94 76 285 5861",
      image: anuka,
      fallback: "AR",
      color: "text-primary"
    },
    {
      position: "Chief Coordinator",
      name: "Maleesha Indunil",
      email: "indunil-ec22042@stu.kln.ac.lk",
      phone: "+94 71 721 8184",
      image: maleesha,
      fallback: "JS",
      color: "text-accent"
    },
    {
      position: "Chief Coordinator",
      name: "Kavindu Sachinthe",
      email: "galkotu-ec22053@stu.kln.ac.lk",
      phone: "+94 72 66 77 555",
      image: kavindu,
      fallback: "CJ",
      color: "text-accent"
    },
    {
      position: "Technical Coordinator",
      name: "Thivina Chandunu",
      email: "chandun-ec22058@stu.kln.ac.lk",
      phone: "+94 76 30 74 621",
      image: thivina,
      fallback: "MC",
      color: "text-accent"
    },
    {
      position: "Public Relation Coordinator",
      name: "Kavishka Gayan",
      email: "wijesur-ec22036@stu.kln.ac.lk",
      phone: "+94 70 260 4306",
      image: kavishka,
      fallback: "TW",     
      color: "text-accent"
    },
    {
      position: "Membership Coordinator",
      name: "Savithi Vihara",
      email: "vihara-ec22063@stu.kln.ac.lk",
      phone: "+94 70 750 2664",
      image: savithi,
      fallback: "AB",
      color: "text-accent"
    },
    
  ];

  return (
    <section className="py-5 bg-card relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 matrix-rain opacity-5" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-orbitron font-black text-transparent bg-gradient-neon bg-clip-text mb-4 glow-text">
            CONTACT US
          </h2>
          <div className="w-32 h-1 bg-gradient-cyber mx-auto rounded-full animate-pulse-glow" />
          <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto font-mono">
            Connect with our organizing committee for any queries or support
          </p>
        </div>

        {/* Contact Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {committeeMembers.map((member, index) => (
            <div
              key={index}
              className="holographic-card p-6 rounded-lg group hover:scale-105 transition-all duration-300"
            >
              <div className="text-center">
                {/* Profile Image */}
                <div className="w-20 h-20 mx-auto mb-4 group-hover:scale-110 transition-all duration-300">
                  <Avatar className="w-full h-full border-2 border-primary/30 group-hover:border-primary/60 transition-all duration-300 shadow-lg group-hover:shadow-primary/20">
                    <AvatarImage 
                      src={member.image} 
                      alt={member.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-cyber text-foreground font-mono font-bold text-lg">
                      {member.fallback}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Position */}
                <h3 className="text-xl font-orbitron font-bold text-foreground mb-2">
                  {member.position}
                </h3>

                {/* Name */}
                <p className={`text-lg font-mono ${member.color} mb-4`}>
                  {member.name}
                </p>

                {/* Contact Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="font-mono">{member.email}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span className="font-mono">{member.phone}</span>
                  </div>
                </div>

                {/* Contact Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 border-primary/50 hover:border-primary hover:bg-primary/10 transition-all duration-300"
                  onClick={() => {
                    const phone = member.phone.replace(/[^\d]/g, "");
                    window.open(`https://wa.me/${phone}`, "_blank");
                  }}
                >
                  Contact
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* General Inquiry */}
          <div className="holographic-card p-6 rounded-lg text-center">
            <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-orbitron font-bold text-foreground mb-2">
              General Inquiry
            </h3>
            <p className="text-sm font-mono text-muted-foreground">
              contact@ecsc-uok.com
            </p>
          </div>

          {/* Emergency Contact */}
          <div className="holographic-card p-6 rounded-lg text-center">
            <Phone className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-orbitron font-bold text-foreground mb-2">
              Emergency Support
            </h3>
            <p className="text-sm font-mono text-muted-foreground">
              +94 76 30 74 621
            </p>
          </div>

          {/* Address */}
          <div className="holographic-card p-6 rounded-lg text-center">
            <MapPin className="w-12 h-12 text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-orbitron font-bold text-foreground mb-2">
              Event Location
            </h3>
            <p className="text-sm font-mono text-muted-foreground">
              University of Kaleniya
            </p>
          </div>
        </div>
 
        {/* Call to Action */}
        <div className="text-center mt-16">
          <p className="text-lg font-mono text-muted-foreground mb-6">
            Ready to join the ultimate cybersecurity challenge?
          </p>
          
          <Button
            variant="cyber"
            size="lg"
            className="text-lg px-8 py-6"
            onClick={() => navigate("/register")}
          >
            Get Started Now
          </Button>
        </div>
      </div>
    </section>
  );
};