import { Card } from "@/components/ui/card";
import { CheckCircle, Users, Shield, Upload, User } from "lucide-react";
import { TeamInfo, MemberInfo } from "../RegistrationForm";

interface RegistrationSuccessProps {
  teamInfo: TeamInfo;
  members: MemberInfo[];
  paymentInfo?: any;
}

export const RegistrationSuccess = ({ teamInfo, members, paymentInfo }: RegistrationSuccessProps) => {
  return (
    <section className="py-20 px-4 relative">
      <div className="absolute inset-0 cyber-grid opacity-10" />
      
      <div className="max-w-4xl mx-auto text-center">
        <Card className="holographic-card p-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-accent/20 rounded-full flex items-center justify-center animate-pulse-glow">
            <CheckCircle className="w-12 h-12 text-accent" />
          </div>
          
          <h2 className="text-4xl font-orbitron font-bold text-accent mb-4">
            Registration Complete!
          </h2>
          
          <p className="text-lg font-mono text-muted-foreground mb-8">
            Team <span className="text-primary font-bold">{teamInfo.teamName}</span> has been successfully registered for Medusa 2.0.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Team Summary */}
            <div className="space-y-4">
              <h3 className="text-xl font-orbitron font-bold text-secondary mb-4">Team Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm font-mono">
                  <Shield className="w-4 h-4 mr-3 text-primary" />
                  Leader: {teamInfo.leaderName}
                </div>
                <div className="flex items-center text-sm font-mono">
                  <Upload className="w-4 h-4 mr-3 text-secondary" />
                  University: {teamInfo.university}
                </div>
                <div className="flex items-center text-sm font-mono">
                  <Users className="w-4 h-4 mr-3 text-accent" />
                  Team size: {teamInfo.memberCount} members
                </div>
                <div className="flex items-center text-sm font-mono">
                  <CheckCircle className="w-4 h-4 mr-3 text-primary" />
                  Confirmation sent to {teamInfo.leaderEmail}
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="space-y-4">
              <h3 className="text-xl font-orbitron font-bold text-secondary mb-4">Team Members</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm font-mono">
                  <User className="w-4 h-4 mr-3 text-primary" />
                  <span className="text-primary font-semibold">Leader:</span> {teamInfo.leaderName}
                </div>
                {members.map((member, index) => (
                  <div key={index} className="flex items-center text-sm font-mono">
                    <User className="w-4 h-4 mr-3 text-accent" />
                    <span className="text-accent font-semibold">Member {index + 2}:</span> {member.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Info */}
          {paymentInfo && (
            <div className="mt-8 p-4 bg-accent/10 border border-accent/20 rounded-lg">
              <h3 className="text-lg font-orbitron font-bold text-accent mb-2">Payment Details</h3>
              {paymentInfo.method === "receipt" ? (
                <p className="text-sm font-mono text-muted-foreground">Receipt uploaded: <span className="text-accent font-bold">{paymentInfo.receipt?.name || "(file)"}</span></p>
              ) : (
                <p className="text-sm font-mono text-muted-foreground">Paid via Stripe</p>
              )}
            </div>
          )}
          <div className="mt-8 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm font-mono text-muted-foreground">
              <strong className="text-primary">Next Steps:</strong> Check your email for further instructions and event details. 
              The competition schedule and platform access will be shared closer to the event date.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};