import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Calendar, Target, Award, Zap } from "lucide-react";

import championImg from "@/assets/highlights/champion.jpg";
import runnerUpImg from "@/assets/highlights/runnerup.jpg";
import secondRunnerUpImg from "@/assets/highlights/secondrunnerup.jpg";

const highlights = [
  {
    id: 1,
    year: "2025",
    title: "Champion",
    name: "Team YAKUZA",
    winner: "University of Sri Jayewardenepura",
    stats: [
      { label: "Prize", value: "LKR 40,000", icon: Trophy },
    ],
    image: championImg,
    color: "from-yellow-400 to-orange-500"
  },
  {
    id: 2,
    year: "2025",
    title: "1st Runner-Up",
    name: "Team CHILL GUYS",
    winner: "SLIIT",
    stats: [
      { label: "Prize", value: "LKR 30,000", icon: Trophy },
    ],
    image: runnerUpImg,
    color: "from-blue-400 to-purple-500"
  },
  {
    id: 3,
    year: "2025",
    title: "2nd Runner-Up",
    name: "Team CIPHERTECH",
    winner: "NSBM Green University",
    stats: [
      { label: "Prize", value: "LKR 20,000", icon: Trophy },
    ],
    image: secondRunnerUpImg,
    color: "from-green-400 to-cyan-500"
  }
];

const overallStats = [
  { label: "Challenges", value: "20+", icon: Calendar, description: "Total challenges organized" },
  { label: "Participants", value: "400+", icon: Users, description: "Cybersecurity enthusiasts engaged" },
  { label: "Prize Money Distributed", value: "LKR 80,000", icon: Trophy, description: "Rewarded to talented participants" },
  { label: "Universities Represented", value: "15+", icon: Target, description: "Institutions showcasing talent" }
];
      export const PreviousEventsSection = () => {
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-background via-background/95 to-cyber-green/5 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-green/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-orbitron font-black text-transparent bg-gradient-neon bg-clip-text mb-6 glow-text">
            Medusa 1.0
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Celebrating our journey of empowering cybersecurity professionals and fostering innovation through competitive programming.
          </p>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {overallStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="group hover:scale-105 transition-all duration-300 border-border/50 hover:border-cyber-green/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyber-green to-primary flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="text-3xl font-bold text-cyber-green mb-2">{stat.value}</div>
                  <div className="font-semibold text-foreground mb-1">{stat.label}</div>
                  <div className="text-sm text-muted-foreground">{stat.description}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Event Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {highlights.map((event, index) => (
            <Card 
              key={event.id}
              className={`group cursor-pointer hover:scale-105 transition-all duration-500 border-border/50 hover:border-cyber-green/50 bg-card/50 backdrop-blur-sm ${
                selectedEvent === event.id ? 'ring-2 ring-cyber-green/50 scale-105' : ''
              }`}
              onClick={() => setSelectedEvent(selectedEvent === event.id ? null : event.id)}
            >
              <CardContent className="p-0">
                {/* Event Header */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Bottom gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="relative z-10 p-6 h-full flex flex-col justify-end text-white">
                    <Badge variant="secondary" className="mb-2 bg-white/20 text-white border-white/30 w-fit">
                      {event.year}
                    </Badge>
                    <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                  </div>
                </div>

                {/* Event Stats */}
                <div className="p-6">
                  
                  <div className="space-y-3 mb-4">
                    {event.stats.map((stat, statIndex) => {
                      const IconComponent = stat.icon;
                      return (
                        <div key={statIndex} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-cyber-green/10 flex items-center justify-center">
                            <IconComponent className="w-4 h-4 text-cyber-green" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">{stat.label}</span>
                              <span className="font-semibold text-cyber-green">{stat.value}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* University Badge */}
                  <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-cyber-green/10 to-primary/10 rounded-lg">
                    <Award className="w-5 h-5 text-cyber-green" />
                    <div>
                      <div className="text-sm font-semibold">University</div>
                      <div className="text-sm text-muted-foreground">{event.winner}</div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedEvent === event.id && (
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg animate-fade-in">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-cyber-green" />
                        <span className="font-semibold text-sm">Event Impact</span>
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div>• Enhanced cybersecurity awareness globally</div>
                        <div>• Fostered international collaboration</div>
                        <div>• Discovered and nurtured new talent</div>
                        <div>• Advanced industry best practices</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
};