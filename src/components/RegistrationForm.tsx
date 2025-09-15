import { useState, useEffect } from "react";
import { TeamInfoStep } from "./registration/TeamInfoStep";
import { MemberDetailsStep } from "./registration/MemberDetailsStep";
import { RegistrationSuccess } from "./registration/RegistrationSuccess";
import { PaymentStep } from "./registration/PaymentStep";
import { RegistrationCountdown } from "./RegistrationCountdown";
import { CtfHandler } from "./CtfHandler";
import { saveRegistrationData, loadRegistrationData, clearRegistrationData } from "@/lib/registrationStorage";
import { useToast } from "@/hooks/use-toast";

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

export interface PaymentInfo {
  method: "upload" | "stripe";
  file?: File;
  amount?: number;
}

export const RegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load saved registration data on component mount
  useEffect(() => {
    const savedData = loadRegistrationData();
    if (savedData) {
      setTeamInfo(savedData.teamInfo);
      setMembers(savedData.members);
      setCurrentStep(savedData.currentStep);
      
      // Show notification that data was restored
      toast({
        title: "Registration Data Restored",
        description: `Welcome back! Your progress has been saved. You're currently on step ${savedData.currentStep} of 3.`,
        duration: 5000,
      });
    }
    setIsLoading(false);
  }, [toast]);

  // Save data whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveRegistrationData(teamInfo, members, currentStep);
    }
  }, [teamInfo, members, currentStep, isLoading]);

  const handleTeamInfoComplete = (data: TeamInfo) => {
    setTeamInfo(data);
    setCurrentStep(2);
  };

  const handleMembersComplete = (memberData: MemberInfo[]) => {
    setMembers(memberData);
    setCurrentStep(3);
  };

  const handlePaymentComplete = (paymentData: PaymentInfo) => {
    setPaymentInfo(paymentData);
    setIsSubmitted(true);
    // Clear localStorage data after successful completion
    clearRegistrationData();
  };

  const handleBackToTeamInfo = () => {
    setCurrentStep(1);
  };

  const handleStartOver = () => {
    clearRegistrationData();
    setTeamInfo(null);
    setMembers([]);
    setCurrentStep(1);
    toast({
      title: "Registration Reset",
      description: "Your registration data has been cleared. Starting fresh!",
    });
  };

  const handleCtfCompleted = () => {
    toast({
      title: "CTF Challenge Completed!",
      description: "Welcome back! You can now proceed with your registration.",
      duration: 5000,
    });
  };

  // Show loading state while checking localStorage
  if (isLoading) {
    return (
      <section className="py-2 px-4 relative">
        <div className="absolute inset-0 bg-gradient-hero opacity-30" />
        <div className="max-w-4xl mx-auto relative z-10 text-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground font-mono">Checking for saved registration data...</p>
        </div>
      </section>
    );
  }

  if (isSubmitted && teamInfo) {
    return <RegistrationSuccess teamInfo={teamInfo} members={members} paymentInfo={paymentInfo} />;
  }

  return (
    <section className="py-2 px-4 relative">
      {/* CTF Handler - tracks when user completes CTF challenge */}
      <CtfHandler onCtfCompleted={handleCtfCompleted} />
      
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
          {/* Show start over button if there's saved data */}
          {(teamInfo || members.length > 0) && (
            <div className="mt-6">
              <button
                onClick={handleStartOver}
                className="px-4 py-2 text-sm font-mono text-muted-foreground hover:text-destructive border border-muted-foreground/30 hover:border-destructive rounded-lg transition-colors duration-300"
              >
                Start Over (Clear Saved Data)
              </button>
            </div>
          )}
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