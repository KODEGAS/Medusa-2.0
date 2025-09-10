import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle } from "lucide-react";

export const RegistrationCountdown = () => {
  const registrationDeadline = new Date("2025-10-12T23:59:59");
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const deadline = registrationDeadline.getTime();
      const difference = deadline - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [registrationDeadline]);

  if (timeLeft.isExpired) {
    return (
      <Card className="holographic-card border-destructive/50 mb-8">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
            <Badge variant="destructive" className="text-lg px-4 py-2">
              Registration Closed
            </Badge>
          </div>
          <p className="text-muted-foreground font-mono">
            Registration deadline has passed. Please contact organizers for special consideration.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 24;

  return (
    <Card className={`holographic-card mb-8 ${isUrgent ? 'border-destructive/50 animate-pulse-glow' : ''}`}>
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Clock className={`w-6 h-6 ${isUrgent ? 'text-destructive' : 'text-primary'}`} />
            <Badge 
              variant={isUrgent ? "destructive" : "outline"} 
              className={`text-lg px-4 py-2 ${isUrgent ? '' : 'border-primary text-primary'}`}
            >
              {isUrgent ? 'Last Call!' : 'Registration Closes In'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="text-center">
              <div className={`text-4xl md:text-6xl font-orbitron font-black ${isUrgent ? 'text-destructive' : 'text-primary'} glow-text`}>
                {timeLeft.days.toString().padStart(2, '0')}
              </div>
              <div className="text-sm font-mono text-muted-foreground mt-2">
                DAYS
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-4xl md:text-6xl font-orbitron font-black ${isUrgent ? 'text-destructive' : 'text-secondary'} glow-text`}>
                {timeLeft.hours.toString().padStart(2, '0')}
              </div>
              <div className="text-sm font-mono text-muted-foreground mt-2">
                HOURS
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-4xl md:text-6xl font-orbitron font-black ${isUrgent ? 'text-destructive' : 'text-accent'} glow-text`}>
                {timeLeft.minutes.toString().padStart(2, '0')}
              </div>
              <div className="text-sm font-mono text-muted-foreground mt-2">
                MINUTES
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-4xl md:text-6xl font-orbitron font-black ${isUrgent ? 'text-destructive animate-pulse' : 'text-primary'} glow-text`}>
                {timeLeft.seconds.toString().padStart(2, '0')}
              </div>
              <div className="text-sm font-mono text-muted-foreground mt-2">
                SECONDS
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-muted-foreground font-mono text-sm">
            Registration deadline: {registrationDeadline.toLocaleDateString()} at {registrationDeadline.toLocaleTimeString()}
          </p>
          {isUrgent && (
            <p className="text-destructive font-mono text-sm mt-2 font-bold">
              ⚡ Don't miss your chance to compete in Medusa 2.0!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};