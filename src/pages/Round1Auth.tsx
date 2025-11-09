import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Shield, KeyRound, AlertCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";

const Round1Auth = () => {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState("");
  const [teamId, setTeamId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!apiKey.trim()) {
      setError("API Key is required");
      return;
    }

    if (!teamId.trim()) {
      setError("Team ID is required");
      return;
    }

    setIsVerifying(true);

    try {
      // Call backend verification endpoint
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/api/auth/verify`, {
        method: 'POST',
        credentials: 'include', // Important: sends/receives cookies
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ apiKey, teamId })
      });

      const data = await response.json();

      if (response.ok && data.authenticated) {
        // Store JWT token in localStorage for Authorization header
        if (data.token) {
          localStorage.setItem('medusa_token', data.token);
        }
        
        // Store minimal client-side flags for UI state
        sessionStorage.setItem('round1_authenticated', 'true');
        sessionStorage.setItem('round1_team_id', teamId);
        sessionStorage.setItem('round1_team_name', data.teamName); // Store team name for leaderboard identification
        sessionStorage.setItem('round1_auth_time', new Date().toISOString());
        
        // Redirect to Round 1 page
        navigate('/round1');
      } else {
        setError(data.error || "Invalid API Key. Please check and try again.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Failed to verify API Key. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-20 px-4 relative">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-hero opacity-30" />
        <div className="absolute inset-0 cyber-grid opacity-5" />
        
        <div className="max-w-lg mx-auto relative z-10">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-900/20 border-2 border-amber-600/50 mb-6">
              <Shield className="w-10 h-10 text-amber-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-orbitron font-black text-transparent bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 bg-clip-text mb-4">
              Round 1 Access
            </h1>
            <p className="text-lg font-mono text-muted-foreground">
              Enter your credentials to access the challenge
            </p>
          </div>

          {/* Authentication Form */}
          <Card className="holographic-card border-2 border-amber-900/30 animate-slide-up">
            <CardHeader className="border-b border-amber-900/30 bg-gradient-to-r from-amber-950/50 to-transparent">
              <div className="flex items-center gap-3">
                <KeyRound className="w-6 h-6 text-amber-500" />
                <div>
                  <CardTitle className="text-2xl font-serif text-amber-100">
                    Authentication Required
                  </CardTitle>
                  <CardDescription className="font-mono text-amber-200/60">
                    Verify your team's access credentials
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Team ID Input */}
                <div className="space-y-2">
                  <Label htmlFor="teamId" className="font-mono text-foreground">
                    Team ID <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="teamId"
                    type="text"
                    placeholder="Enter your team ID"
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    className="font-mono"
                    disabled={isVerifying}
                    required
                  />
                  <p className="text-xs font-mono text-muted-foreground">
                    Use the Team ID provided during registration
                  </p>
                </div>

                {/* API Key Input */}
                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="font-mono text-foreground">
                    Round 1 API Key <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="apiKey"
                    type="text"
                    placeholder="Enter the Round 1 API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="font-mono text-amber-400"
                    disabled={isVerifying}
                    required
                  />
                  <p className="text-xs font-mono text-muted-foreground">
                    The API key was shared via a WhatsApp channel
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <Alert variant="destructive" className="animate-shake">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-mono">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Info Alert */}
                <Alert className="border-amber-600/30 bg-amber-950/30">
                  <Lock className="h-4 w-4 text-amber-500" />
                  <AlertDescription className="font-mono text-sm text-amber-100/80">
                    This key grants access to Round 1 challenges. Keep it secure and do not share with others.
                  </AlertDescription>
                </Alert>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full py-6 text-lg font-mono font-bold bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black"
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <Lock className="mr-2 h-5 w-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-5 w-5" />
                      Access Round 1
                    </>
                  )}
                </Button>
              </form>

              {/* Additional Info */}
              <div className="mt-8 pt-6 border-t border-border/50">
                <h3 className="font-orbitron font-bold text-sm text-foreground mb-3">
                  Don't have an API key?
                </h3>
                <ul className="space-y-2 text-sm font-mono text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-amber-500 mr-2">•</span>
                    <span>Check WhatsApp channel for the Round 1 API key</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-500 mr-2">•</span>
                    <span>Contact organizers if you haven't received your team id</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Round1Auth;
