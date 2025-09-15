import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, Shield, Upload, User, MessageCircle } from "lucide-react";
import { TeamInfo, MemberInfo, PaymentInfo } from "../RegistrationForm";

interface RegistrationSuccessProps {
  teamInfo: TeamInfo;
  members: MemberInfo[];
  paymentInfo?: PaymentInfo;
}

export const RegistrationSuccess = ({ teamInfo, members, paymentInfo }: RegistrationSuccessProps) => {
  return (
    <section className="py-20 px-4 relative">

      <div className="max-w-4xl mx-auto text-center">
        <Card className="holographic-card p-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-primary/20 rounded-full flex items-center justify-center animate-pulse-glow">
            <CheckCircle className="w-12 h-12 text-muted-foreground" />
          </div>
          
          <h2 className="text-4xl font-orbitron font-bold text-primary mb-4">
            Registration Complete!
          </h2>
          
          <p className="text-lg font-mono text-muted-foreground mb-8">
            Team <span className="text-primary font-bold">{teamInfo.teamName}</span> has been successfully registered for Medusa 2.0.
          </p>

          {/* WhatsApp Community Invitation */}
          <div className="mb-8 p-6 bg-acent/10 border border-secondary/30 rounded-lg">
            <div className="flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-secondary mr-3" />
              <h3 className="text-xl font-orbitron font-bold text-secondary">Join Our Community!</h3>
            </div>
            <p className="text-sm font-mono text-muted-foreground mb-4">
              Stay connected with fellow participants, get important updates, and prepare for the competition together.
            </p>
            <Button 
              variant="cyber" 
              size="lg" 
              className="mx-auto"
              onClick={() => window.open('https://chat.whatsapp.com/DPHxMpRfcBYB09nCGD0AdN?mode=ems_wa_c', '_blank')}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Join WhatsApp Community
            </Button>
          </div>
          
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
                  <Upload className="w-4 h-4 mr-3 text-primary" />
                  University: {teamInfo.university}
                </div>
                <div className="flex items-center text-sm font-mono">
                  <Users className="w-4 h-4 mr-3 text-primary" />
                  Team size: {teamInfo.memberCount} members
                </div>
          
              </div>
            </div>

            {/* Team Members */}
            <div className="space-y-4 opacity-70">
              <h3 className="text-xl font-orbitron font-bold text-secondary mb-4 opacity-80">Team Members</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm font-mono opacity-90">
                  <User className="w-4 h-4 mr-3 text-primary/80" />
                  <span className="text-primary/80 font-semibold">Leader:</span> {teamInfo.leaderName}
                </div>
                {members.map((member, index) => (
                  <div key={index} className="flex items-center text-sm font-mono opacity-70">
                    <User className="w-4 h-4 mr-3 text-primary/60" />
                    <span className="text-primary/60 font-semibold">Member {index + 2}:</span> {member.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Info */}
          {paymentInfo && (
            <div className="mt-8 p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
              <h3 className="text-lg font-orbitron font-bold text-secondary mb-2">Payment Details</h3>
              {paymentInfo.method === "upload" ? (
                <p className="text-sm font-mono text-muted-foreground">Receipt uploaded: <span className="text-secondary font-bold">{paymentInfo.file?.name || "(file)"}</span></p>
              ) : (
                <p className="text-sm font-mono text-muted-foreground">Paid via Bank Deposit</p>
              )}
            </div>
          )}

        </Card>
      </div>
    </section>
  );
};