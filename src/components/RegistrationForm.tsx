import { useState } from "react";
import { TeamInfoStep } from "./registration/TeamInfoStep";
import { MemberDetailsStep } from "./registration/MemberDetailsStep";
import { RegistrationSuccess } from "./registration/RegistrationSuccess";
import { PaymentStep } from "./registration/PaymentStep";
import { RegistrationCountdown } from "./RegistrationCountdown";

export interface TeamInfo {
  teamName: string;
  university: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  memberCount: number;
  experience: string;
  expectations: string;
}

export interface MemberInfo {
  name: string;
  email: string;
  phone: string;
  year: string;
}

export const RegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleTeamInfoComplete = (data: TeamInfo) => {
    setTeamInfo(data);
    setCurrentStep(2);
  };

  const handleMembersComplete = (memberData: MemberInfo[]) => {
    setMembers(memberData);
    setCurrentStep(3);
  };

  const handlePaymentComplete = (paymentData: any) => {
    setPaymentInfo(paymentData);
    setIsSubmitted(true);
  };

  const handleBackToTeamInfo = () => {
    setCurrentStep(1);
  };

  if (isSubmitted && teamInfo) {
    return <RegistrationSuccess teamInfo={teamInfo} members={members} paymentInfo={paymentInfo} />;
  }

  return (
    <section className="py-2 px-4 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-30" />
  {/* <div className="absolute inset-0 matrix-rain opacity-5" /> */}
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-orbitron font-black text-transparent bg-gradient-neon bg-clip-text mb-6 glow-text">
            Join the Battle
          </h2>
          <p className="text-xl font-mono text-muted-foreground max-w-3xl mx-auto">
            Register your team for Medusa 2.0 and prepare for the ultimate cybersecurity challenge.
          </p>
        </div>
        {/* Registration Countdown */}
        <RegistrationCountdown />
        {currentStep === 1 && (
          <TeamInfoStep onComplete={handleTeamInfoComplete} />
        )}

        {currentStep === 2 && teamInfo && (
          <MemberDetailsStep 
            teamInfo={teamInfo}
            onComplete={handleMembersComplete}
            onBack={handleBackToTeamInfo}
          />
        )}

        {currentStep === 3 && teamInfo && members.length > 0 && (
          <PaymentStep 
            teamInfo={teamInfo} 
            members={members} 
            onComplete={handlePaymentComplete}
            onBack={() => setCurrentStep(2)}
          />
        )}
      </div>
    </section>
  );
};