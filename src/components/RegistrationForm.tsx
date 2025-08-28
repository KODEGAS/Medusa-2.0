import { useState, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Upload, Users, Shield } from "lucide-react";

interface FormData {
  teamName: string;
  university: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  memberCount: string;
  members: string;
  experience: string;
  expectations: string;
}

export const RegistrationForm = memo(() => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    teamName: "",
    university: "",
    leaderName: "",
    leaderEmail: "",
    leaderPhone: "",
    memberCount: "3",
    members: "",
    experience: "",
    expectations: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);

    toast({
      title: "Registration Successful!",
      description: "Welcome to Medusa 2.0. Check your email for confirmation.",
    });
  }, [toast]);

  const handleFocus = useCallback((field: string) => {
    setFocusedField(field);
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedField(null);
  }, []);

  if (isSubmitted) {
    return (
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 cyber-grid opacity-10" />

        <div className="max-w-2xl mx-auto text-center">
          <Card className="holographic-card p-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-accent/20 rounded-full flex items-center justify-center animate-pulse-glow">
              <CheckCircle className="w-12 h-12 text-accent" />
            </div>
            <h2 className="text-4xl font-orbitron font-bold text-accent mb-4 glow-text">
              Registration Complete!
            </h2>
            <p className="text-lg font-mono text-muted-foreground mb-8">
              Team <span className="text-primary font-bold">{formData.teamName}</span> has been successfully registered for Medusa 2.0.
            </p>
            <div className="space-y-4 text-left">
              <div className="flex items-center text-sm font-mono">
                <Shield className="w-4 h-4 mr-3 text-primary" />
                Confirmation email sent to {formData.leaderEmail}
              </div>
              <div className="flex items-center text-sm font-mono">
                <Users className="w-4 h-4 mr-3 text-accent" />
                Team size: {formData.memberCount} members
              </div>
              <div className="flex items-center text-sm font-mono">
                <Upload className="w-4 h-4 mr-3 text-secondary" />
                University: {formData.university}
              </div>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-30" />
      <div className="absolute inset-0 matrix-rain opacity-5" />

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

        <Card className="holographic-card backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-orbitron text-center text-primary glow-text">
              Team Registration
            </CardTitle>
            <div className="flex justify-center gap-2 mt-4">
              <Badge variant="outline" className="text-primary border-primary">
                Step 1 of 1
              </Badge>
              <Badge variant="outline" className="text-accent border-accent">
                Required Fields
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Team Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="teamName" className="text-foreground font-mono">
                    Team Name *
                  </Label>
                  <div className="relative">
                    <Input
                      id="teamName"
                      type="text"
                      required
                      value={formData.teamName}
                      onChange={(e) => handleInputChange("teamName", e.target.value)}
                      onFocus={() => handleFocus("teamName")}
                      onBlur={handleBlur}
                      className={`font-mono transition-all duration-300 ${focusedField === "teamName" ? "neon-border" : ""
                        }`}
                      placeholder="Enter your team name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="university" className="text-foreground font-mono">
                    University *
                  </Label>
                  <Input
                    id="university"
                    type="text"
                    required
                    value={formData.university}
                    onChange={(e) => handleInputChange("university", e.target.value)}
                    onFocus={() => handleFocus("university")}
                    onBlur={handleBlur}
                    className={`font-mono transition-all duration-300 ${focusedField === "university" ? "neon-border" : ""
                      }`}
                    placeholder="Your university name"
                  />
                </div>
              </div>

              {/* Team Leader Information */}
              <div className="space-y-6">
                <h3 className="text-2xl font-orbitron font-bold text-secondary glow-text">
                  Team Leader Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="leaderName" className="text-foreground font-mono">
                      Full Name *
                    </Label>
                    <Input
                      id="leaderName"
                      type="text"
                      required
                      value={formData.leaderName}
                      onChange={(e) => handleInputChange("leaderName", e.target.value)}
                      onFocus={() => handleFocus("leaderName")}
                      onBlur={handleBlur}
                      className={`font-mono transition-all duration-300 ${focusedField === "leaderName" ? "neon-border" : ""
                        }`}
                      placeholder="Leader's full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leaderEmail" className="text-foreground font-mono">
                      Email Address *
                    </Label>
                    <Input
                      id="leaderEmail"
                      type="email"
                      required
                      value={formData.leaderEmail}
                      onChange={(e) => handleInputChange("leaderEmail", e.target.value)}
                      onFocus={() => handleFocus("leaderEmail")}
                      onBlur={handleBlur}
                      className={`font-mono transition-all duration-300 ${focusedField === "leaderEmail" ? "neon-border" : ""
                        }`}
                      placeholder="leader@university.edu"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leaderPhone" className="text-foreground font-mono">
                      Phone Number *
                    </Label>
                    <Input
                      id="leaderPhone"
                      type="tel"
                      required
                      value={formData.leaderPhone}
                      onChange={(e) => handleInputChange("leaderPhone", e.target.value)}
                      onFocus={() => handleFocus("leaderPhone")}
                      onBlur={handleBlur}
                      className={`font-mono transition-all duration-300 ${focusedField === "leaderPhone" ? "neon-border" : ""
                        }`}
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div className="space-y-6">
                <h3 className="text-2xl font-orbitron font-bold text-accent glow-text">
                  Team Members
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="memberCount" className="text-foreground font-mono">
                      Team Size *
                    </Label>
                    <select
                      id="memberCount"
                      required
                      value={formData.memberCount}
                      onChange={(e) => handleInputChange("memberCount", e.target.value)}
                      className="w-full px-3 py-2 bg-input border border-border rounded-md font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="2">2 Members</option>
                      <option value="3">3 Members</option>
                      <option value="4">4 Members</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="members" className="text-foreground font-mono">
                      Member Details *
                    </Label>
                    <Textarea
                      id="members"
                      required
                      value={formData.members}
                      onChange={(e) => handleInputChange("members", e.target.value)}
                      onFocus={() => handleFocus("members")}
                      onBlur={handleBlur}
                      className={`font-mono transition-all duration-300 ${focusedField === "members" ? "neon-border" : ""
                        }`}
                      placeholder="List all team members with their names and emails"
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-6">
                <h3 className="text-2xl font-orbitron font-bold text-primary glow-text">
                  Experience & Expectations
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-foreground font-mono">
                      Previous CTF Experience
                    </Label>
                    <Textarea
                      id="experience"
                      value={formData.experience}
                      onChange={(e) => handleInputChange("experience", e.target.value)}
                      onFocus={() => handleFocus("experience")}
                      onBlur={handleBlur}
                      className={`font-mono transition-all duration-300 ${focusedField === "experience" ? "neon-border" : ""
                        }`}
                      placeholder="Describe your team's cybersecurity background..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expectations" className="text-foreground font-mono">
                      What You Hope to Learn
                    </Label>
                    <Textarea
                      id="expectations"
                      value={formData.expectations}
                      onChange={(e) => handleInputChange("expectations", e.target.value)}
                      onFocus={() => handleFocus("expectations")}
                      onBlur={handleBlur}
                      className={`font-mono transition-all duration-300 ${focusedField === "expectations" ? "neon-border" : ""
                        }`}
                      placeholder="Your goals and expectations from Medusa 2.0..."
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center pt-8">
                <Button
                  type="submit"
                  variant="cyber"
                  size="lg"
                  disabled={isSubmitting}
                  className="text-xl px-12 py-6"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-6 h-6 border-2 border-background/30 border-t-background rounded-full animate-spin mr-3" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Register Team
                      <Shield className="w-6 h-6 ml-3" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
});