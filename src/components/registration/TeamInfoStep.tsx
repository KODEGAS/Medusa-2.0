import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Shield } from "lucide-react";
import { TeamInfo } from "../RegistrationForm";

interface TeamInfoStepProps {
  onComplete: (data: TeamInfo) => void;
}

export const TeamInfoStep = ({ onComplete }: TeamInfoStepProps) => {
  const [formData, setFormData] = useState<TeamInfo>({
    teamName: "",
    university: "",
    leaderName: "",
    leaderEmail: "",
    leaderPhone: "",
    memberCount: 3,
    experience: "",
    expectations: ""
  });
  
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleInputChange = (field: keyof TeamInfo, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <Card className="holographic-card backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-3xl font-orbitron text-center text-primary glow-text">
          Team Information
        </CardTitle>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="outline" className="text-primary border-primary bg-primary/10">
            Step 1 of 2
          </Badge>
          <Badge variant="outline" className="text-accent border-accent">
            Team Details
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Team Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="teamName" className="text-foreground font-mono">
                Team Name *
              </Label>
              <Input
                id="teamName"
                type="text"
                required
                value={formData.teamName}
                onChange={(e) => handleInputChange("teamName", e.target.value)}
                onFocus={() => setFocusedField("teamName")}
                onBlur={() => setFocusedField(null)}
                className={`font-mono transition-all duration-300 ${
                  focusedField === "teamName" ? "neon-border" : ""
                }`}
                placeholder="Enter your team name"
              />
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
                onFocus={() => setFocusedField("university")}
                onBlur={() => setFocusedField(null)}
                className={`font-mono transition-all duration-300 ${
                  focusedField === "university" ? "neon-border" : ""
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
                  onFocus={() => setFocusedField("leaderName")}
                  onBlur={() => setFocusedField(null)}
                  className={`font-mono transition-all duration-300 ${
                    focusedField === "leaderName" ? "neon-border" : ""
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
                  onFocus={() => setFocusedField("leaderEmail")}
                  onBlur={() => setFocusedField(null)}
                  className={`font-mono transition-all duration-300 ${
                    focusedField === "leaderEmail" ? "neon-border" : ""
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
                  onFocus={() => setFocusedField("leaderPhone")}
                  onBlur={() => setFocusedField(null)}
                  className={`font-mono transition-all duration-300 ${
                    focusedField === "leaderPhone" ? "neon-border" : ""
                  }`}
                  placeholder="+91 9876543210"
                />
              </div>
            </div>
          </div>

          {/* Team Size */}
          <div className="space-y-6">
            <h3 className="text-2xl font-orbitron font-bold text-accent glow-text">
              Team Configuration
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="memberCount" className="text-foreground font-mono">
                Team Size (including leader) *
              </Label>
              <select
                id="memberCount"
                required
                value={formData.memberCount}
                onChange={(e) => handleInputChange("memberCount", parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-input border border-border rounded-md font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={2}>2 Members</option>
                <option value={3}>3 Members</option>
                <option value={4}>4 Members</option>
              </select>
              <p className="text-sm text-muted-foreground font-mono">
                You will provide details for {formData.memberCount - 1} additional team member{formData.memberCount !== 2 ? 's' : ''} in the next step.
              </p>
            </div>
          </div>

          {/* Experience & Expectations */}
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
                  onFocus={() => setFocusedField("experience")}
                  onBlur={() => setFocusedField(null)}
                  className={`font-mono transition-all duration-300 ${
                    focusedField === "experience" ? "neon-border" : ""
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
                  onFocus={() => setFocusedField("expectations")}
                  onBlur={() => setFocusedField(null)}
                  className={`font-mono transition-all duration-300 ${
                    focusedField === "expectations" ? "neon-border" : ""
                  }`}
                  placeholder="Your goals and expectations from Medusa 2.0..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="text-center pt-8">
            <Button
              type="submit"
              variant="cyber"
              size="lg"
              className="text-xl px-12 py-6"
            >
              Continue to Member Details
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};