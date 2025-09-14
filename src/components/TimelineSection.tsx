import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Trophy } from "lucide-react";
import { useStaggeredAnimation } from "@/hooks/useScrollAnimation";

const events = [

  {
    id: 2,
    title: "Close Registration",
    date: "October 12, 2025",
    time: "12:00 AM",
    description: "Team registration and verification process ends",
    status: "upcoming",
    details: "Final deadline for team registration. No late entries will be accepted. Ensure all documents are submitted and verified before this date.",
    icon: Calendar
  },
   {
    id: 3,
    title: "Awareness Session",
    date: "October 17, 2024",
    time: "7:00 PM",
    description: "Introduction to CTF challenges and Compition Rules",
    icon: Users,
    status: "upcoming",
    details: "Interactive session covering CTF basics, team formation, and competition rules. Participants will learn about the event structure, rules, and get tips from previous winners."
  },
  {
    id: 4,
    title: "Round 1: Qualifiers",
    date: "October 25, 2024",
    time: "6 Hours",
    description: "Online qualifying round for top university teams",
    icon: Clock,
    status: "Online",
    details: "6-hour online CTF with challenges across multiple categories including web, crypto, and reverse engineering. Top scoring teams will advance to the semi-finals."
  },
  {
    id: 5,
    title: "Round 2: Semi-Finals",
    date: "November 08, 2025",
    time: "8 Hours",
    description: "Advanced challenges for qualified teams to secure a spot",
    icon: Trophy,
    status: "Online",
    details: "On-site competition with advanced web exploitation and crypto challenges. Teams will face real-world scenarios and compete for a spot in the grand finale."
  },
  {
    id: 6,
    title: "Grand Finale",
    date: "November 22, 2025",
    time: "10 Hours",
    description: "Final showdown with live challenges and prize distribution ceremony",
    icon: Trophy,
    status: "Physical",
    details: "Live hacking competition with real-time scoring and audience engagement. Winners will be announced and prizes awarded during the closing ceremony."
  }
];

const TimelineSection = () => {
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const { setRef: eventRef, visibleItems: eventsVisible } = useStaggeredAnimation(events.length, 200);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-accent border-accent";
      case "active": return "text-primary border-primary";
      case "upcoming": return "text-secondary border-secondary";
      default: return "text-muted-foreground border-border";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "completed": return "bg-accent/20";
      case "active": return "bg-primary/20";
      case "upcoming": return "bg-secondary/20";
      default: return "bg-muted/20";
    }
  };

  return (
  <section id="timeline-section" className="py-5 px-4 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-50" />
  {/* <div className="absolute inset-0 cyber-grid opacity-5" /> */}
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
          <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-orbitron font-black text-transparent bg-gradient-neon bg-clip-text mb-6 glow-text">
            Event Timeline
          </h2>
          <p className="text-xl font-mono text-muted-foreground max-w-3xl mx-auto">
            Follow the journey from registration to victory. Each phase brings new challenges and opportunities.
          </p>
        </div>

        {/* Horizontal Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-neon opacity-50 transform -translate-y-1/2 hidden lg:block" />
          
          {/* Timeline Events */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-4">
            {events.map((event, index) => {
              const Icon = event.icon;
              const isSelected = selectedEvent === event.id;
              
              return (
                <div 
                  key={event.id} 
                  ref={eventRef(index)}
                  className={`relative flex flex-col items-center transition-all duration-800 ${
                    eventsVisible[index] ? 'animate-slide-up' : 'scroll-hidden'
                  }`}
                >
                  {/* Timeline Node */}
                  <div 
                    className={`w-16 h-16 rounded-full border-4 ${getStatusColor(event.status)} ${getStatusBg(event.status)} 
                      flex items-center justify-center mb-4 cursor-pointer transition-all duration-300 hover:scale-110 
                      ${isSelected ? 'animate-pulse-glow scale-110' : ''} relative z-10 backdrop-blur-sm`}
                    onClick={() => setSelectedEvent(isSelected ? null : event.id)}
                  >
                    <Icon className="w-8 h-8" />
                  </div>

                  {/* Event Card */}
                  <Card className={`holographic-card w-full max-w-sm transition-all duration-500 cursor-pointer
                    ${isSelected ? 'scale-105 shadow-neon' : 'hover:scale-102'}`}
                    onClick={() => setSelectedEvent(isSelected ? null : event.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(event.status)} font-mono text-xs`}
                        >
                          {event.status.toUpperCase()}
                        </Badge>
                        <span className="text-xs font-mono text-muted-foreground">
                          #{event.id}
                        </span>
                      </div>
                      
                      <h3 className="font-orbitron font-bold text-lg mb-2 text-foreground">
                        {event.title}
                      </h3>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2" />
                          {event.date}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-2" />
                          {event.time}
                        </div>
                      </div>
                      
                      <p className="text-sm font-mono text-muted-foreground mb-4">
                        {event.description}
                      </p>
                      {/* Expanded Details */}
                      <div className={`overflow-hidden transition-all duration-500 ${
                        isSelected ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        <div className="border-t border-border/50 pt-4">
                          <p className="text-sm font-mono text-foreground">
                            {event.details}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Connection Line for Mobile */}
                  {index < events.length - 1 && (
                    <div className="w-1 h-8 bg-gradient-to-b from-primary to-secondary opacity-50 lg:hidden" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
          <div className="text-center mt-16">
          <div className="bg-card/20 backdrop-blur-sm rounded-2xl p-8 border border-border/50 max-w-2xl mx-auto">
            <h3 className="text-2xl font-orbitron font-bold mb-4 text-primary">
              Ready to Join the Battle?
            </h3>
            <p className="font-mono text-muted-foreground mb-6">
              Registration is now open! Form your team and prepare for the ultimate cybersecurity challenge.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
           
              <button 
                onClick={() => {
                  window.open('https://drive.google.com/file/d/12u17zxZLJWaSpoP5RT8oGxiogWgBUhwl/view', '_blank');
                }}
                className="px-8 py-3 border-2 border-accent text-accent font-mono rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-300"
              >
                Download Rules
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default TimelineSection;