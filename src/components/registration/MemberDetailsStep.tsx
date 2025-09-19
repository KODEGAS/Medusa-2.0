import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Shield, User } from "lucide-react";
import { TeamInfo, MemberInfo } from "../RegistrationForm";
import {
  sanitizeMemberInfo,
  validateEmail,
  validatePhone,
  validateName,
  checkRateLimit,
  getSecurityHeaders
} from "@/lib/sanitization";

interface MemberDetailsStepProps {
  teamInfo: TeamInfo;
  onComplete: (members: MemberInfo[]) => void;
  onBack: () => void;
}

export const MemberDetailsStep = ({ teamInfo, onComplete, onBack }: MemberDetailsStepProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const [members, setMembers] = useState<MemberInfo[]>(
    Array.from({ length: teamInfo.memberCount - 1 }, () => ({
      name: "",
      email: "",
      phone: "",
      year: ""
    }))
  );

  const handleMemberChange = (index: number, field: keyof MemberInfo, value: string) => {
    setMembers(prev => 
      prev.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    );
    
    // Clear validation error when user starts typing
    const errorKey = `${field}-${index}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const validateMembers = (): boolean => {
    const errors: Record<string, string> = {};

    members.forEach((member, index) => {
      if (!validateName(member.name)) {
        errors[`name-${index}`] = 'Name must be 2-100 characters with only letters, spaces, hyphens, periods, and apostrophes';
      }
      if (!validateEmail(member.email)) {
        errors[`email-${index}`] = 'Please enter a valid email address';
      }
      if (!validatePhone(member.phone)) {
        errors[`phone-${index}`] = 'Please enter a valid phone number (8-15 digits)';
      }
      if (!member.year || member.year.trim().length === 0) {
        errors[`year-${index}`] = 'Please select a year of study';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    const clientId = navigator.userAgent + teamInfo.leaderEmail;
    if (!checkRateLimit(clientId, 3, 300000)) { // 5 minute window for member details
      toast({
        title: "Too Many Attempts",
        description: "Please wait 5 minutes before submitting again.",
        variant: "destructive"
      });
      return;
    }

    // Sanitize member data
    const sanitizedMembers = members.map(member => sanitizeMemberInfo(member));
    
    // Validate sanitized data
    if (!validateMembers()) {
      toast({
        title: "Validation Error",
        description: "Please correct the highlighted fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // Prepare team data for API with sanitized inputs
    const teamData = {
      teamName: teamInfo.teamName,
      university: teamInfo.university,
      leaderName: teamInfo.leaderName,
      leaderEmail: teamInfo.leaderEmail,
      leaderPhone: teamInfo.leaderPhone,
      members: sanitizedMembers.map(m => ({
        name: m.name,
        email: m.email,
        phone: m.phone,
        year: m.year
      }))
    };

    try {
      const response = await fetch("https://medusa-backend-1081502718638.us-central1.run.app/api/team", {
        method: "POST",
        headers: getSecurityHeaders(),
        body: JSON.stringify(teamData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to register team");
      }
      
      const result = await response.json();

      toast({
        title: "Registration Successful!",
        description: "Welcome to Medusa 2.0.",
      });
      
      // Redirect to WhatsApp channel after successful registration
      setTimeout(() => {
        window.open("https://whatsapp.com/channel/0029Vb6vhSBKrWQv83bWfR3q/94726677555", "_blank");
      }, 2000); // 2-second delay to allow user to see the success message
      
      onComplete(sanitizedMembers);
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="holographic-card backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-3xl font-orbitron text-center text-primary glow-text">
          Member Details
        </CardTitle>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="outline" className="text-primary border-primary bg-primary/10">
            Step 2 of 2
          </Badge>
          <Badge variant="outline" className="text-accent border-accent">
            Team: {teamInfo.teamName}
          </Badge>
        </div>
        <div className="text-center mt-4">
          <p className="text-sm font-mono text-muted-foreground">
            Provide details for {teamInfo.memberCount - 1} additional team member{teamInfo.memberCount !== 2 ? 's' : ''}
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {members.map((member, index) => (
            <div key={index} className="space-y-6 p-6 border border-border/50 rounded-lg bg-background/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-orbitron font-bold text-secondary glow-text">
                  Member {index + 2}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor={`name-${index}`} className="text-foreground font-mono">
                    Full Name *
                  </Label>
                  <Input
                    id={`name-${index}`}
                    type="text"
                    required
                    value={member.name}
                    onChange={(e) => handleMemberChange(index, "name", e.target.value)}
                    onFocus={() => setFocusedField(`name-${index}`)}
                    onBlur={() => setFocusedField(null)}
                    className={`font-mono transition-all duration-300 ${
                      focusedField === `name-${index}` ? "neon-border" : ""
                    } ${validationErrors[`name-${index}`] ? "border-destructive" : ""}`}
                    placeholder="Member's full name"
                  />
                  {validationErrors[`name-${index}`] && (
                    <p className="text-sm text-destructive font-mono">{validationErrors[`name-${index}`]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`email-${index}`} className="text-foreground font-mono">
                    Email Address *
                  </Label>
                  <Input
                    id={`email-${index}`}
                    type="email"
                    required
                    value={member.email}
                    onChange={(e) => handleMemberChange(index, "email", e.target.value)}
                    onFocus={() => setFocusedField(`email-${index}`)}
                    onBlur={() => setFocusedField(null)}
                    className={`font-mono transition-all duration-300 ${
                      focusedField === `email-${index}` ? "neon-border" : ""
                    } ${validationErrors[`email-${index}`] ? "border-destructive" : ""}`}
                    placeholder="member@university.edu"
                  />
                  {validationErrors[`email-${index}`] && (
                    <p className="text-sm text-destructive font-mono">{validationErrors[`email-${index}`]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`phone-${index}`} className="text-foreground font-mono">
                    Phone Number *
                  </Label>
                  <Input
                    id={`phone-${index}`}
                    type="tel"
                    required
                    value={member.phone}
                    onChange={(e) => handleMemberChange(index, "phone", e.target.value)}
                    onFocus={() => setFocusedField(`phone-${index}`)}
                    onBlur={() => setFocusedField(null)}
                    className={`font-mono transition-all duration-300 ${
                      focusedField === `phone-${index}` ? "neon-border" : ""
                    } ${validationErrors[`phone-${index}`] ? "border-destructive" : ""}`}
                    placeholder="+94 71 765 4324"
                  />
                  {validationErrors[`phone-${index}`] && (
                    <p className="text-sm text-destructive font-mono">{validationErrors[`phone-${index}`]}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`year-${index}`} className="text-foreground font-mono">
                    Year of Study *
                  </Label>
                  <select
                    id={`year-${index}`}
                    required
                    value={member.year}
                    onChange={(e) => handleMemberChange(index, "year", e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-border rounded-md font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onBack}
              className="text-lg px-8 py-4"
            >
              <ArrowLeft className="w-5 h-5 mr-3" />
              Back to Team Info
            </Button>
            
            <Button
              type="submit"
              variant="cyber"
              size="lg"
              disabled={isSubmitting}
              className="text-lg px-12 py-4"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin mr-3" />
                  Registering Team...
                </>
              ) : (
                <>
                  Complete Registration
                  <Shield className="w-5 h-5 ml-3" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};