import { useState } from "react";
import { CtfChallenge } from "@/components/CTFChallenge";
import { RegistrationForm } from "@/components/RegistrationForm";

const RegistrationPage = () => {
  const [isChallengeSolved, setIsChallengeSolved] = useState(false);

  const handleChallengeSuccess = () => {
    setIsChallengeSolved(true);
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      {
        <RegistrationForm />
      }
    </div>
  );
};

export default RegistrationPage;
