import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Flag, CheckCircle2, Loader2, Trophy } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const FlagSubmissionPage = () => {
  const [flag, setFlag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState("");

  const validateInputs = () => {
    if (!flag.trim()) {
      setError("Flag is required");
      return false;
    }
    if (flag.length < 5) {
      setError("Flag seems too short. Please check and try again.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!validateInputs()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the backend API with JWT authentication
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/api/flag/submit`, {
        method: 'POST',
        credentials: 'include', // Send JWT cookie for authentication
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ flag }) // teamId comes from JWT token
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          setError("Authentication expired. Please go to Round 1 Auth page and log in again.");
        } else if (response.status === 409) {
          setError(data.error || "This flag has already been submitted by your team");
        } else if (response.status === 429) {
          setError("Too many submissions. Please wait a few minutes and try again.");
        } else {
          setError(data.error || "Failed to submit flag. Please try again.");
        }
        return;
      }
      
      // Success!
      setSubmitSuccess(true);
      setFlag("");
    } catch (err) {
      console.error("Flag submission error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitSuccess(false);
    setError("");
    setFlag("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-20 px-4 relative">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-hero opacity-30" />
        <div className="absolute inset-0 cyber-grid opacity-5" />
        
        <div className="max-w-2xl mx-auto relative z-10">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 border-2 border-primary mb-6">
              <Flag className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-orbitron font-black text-transparent bg-gradient-neon bg-clip-text mb-4 glow-text">
              Submit Your Flag
            </h1>
            <p className="text-lg font-mono text-muted-foreground">
              Capture the flag and submit it here to score points
            </p>
          </div>

          {/* Success Message */}
          {submitSuccess ? (
            <Card className="holographic-card border-2 border-accent animate-slide-up">
              <CardContent className="pt-12 pb-8 text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-accent/20 border-2 border-accent mb-6 animate-bounce-subtle">
                  <CheckCircle2 className="w-12 h-12 text-accent" />
                </div>
                <h2 className="text-3xl font-orbitron font-bold text-accent mb-4">
                  Flag Submitted Successfully!
                </h2>
                <p className="text-lg font-mono text-muted-foreground mb-3">
                  Your flag has been recorded and is being verified.
                </p>
                <div className="inline-flex items-center gap-2 text-sm font-mono text-primary bg-primary/10 px-4 py-2 rounded-lg mb-8">
                  <Trophy className="w-4 h-4" />
                  <span>Results will be released soon</span>
                </div>
                <p className="text-sm font-mono text-muted-foreground/70 mb-8">
                  Keep track of the leaderboard for live updates on your standing.
                </p>
                <Button 
                  onClick={handleReset}
                  className="px-8 py-6 text-lg font-mono"
                  variant="outline"
                >
                  Submit Another Flag
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="holographic-card animate-slide-up">
              <CardHeader>
                <CardTitle className="text-2xl font-orbitron text-foreground">
                  Flag Submission Form
                </CardTitle>
                <CardDescription className="font-mono">
                  Enter the captured flag to earn points for your team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Info Alert - Team ID from JWT */}
                  <Alert className="border-primary/30 bg-primary/10">
                    <Flag className="h-4 w-4 text-primary" />
                    <AlertDescription className="font-mono text-sm">
                      Your team ID is automatically detected from your authenticated session.
                    </AlertDescription>
                  </Alert>

                  {/* Flag Input */}
                  <div className="space-y-2">
                    <Label htmlFor="flag" className="font-mono text-foreground">
                      Flag <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="flag"
                      type="text"
                      placeholder="medusa{...}"
                      value={flag}
                      onChange={(e) => setFlag(e.target.value)}
                      className="font-mono text-accent"
                      disabled={isSubmitting}
                      required
                    />
                    <p className="text-xs font-mono text-muted-foreground">
                      Enter the exact flag you captured (case-sensitive)
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <Alert variant="destructive" className="animate-shake">
                      <AlertDescription className="font-mono">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Info Alert */}
                  <Alert className="border-primary/50 bg-primary/5">
                    <Flag className="h-4 w-4 text-primary" />
                    <AlertDescription className="font-mono text-sm">
                      Flags are validated in real-time. Duplicate submissions will be ignored.
                    </AlertDescription>
                  </Alert>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full py-6 text-lg font-mono font-bold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Submitting Flag...
                      </>
                    ) : (
                      <>
                        <Flag className="mr-2 h-5 w-5" />
                        Submit Flag
                      </>
                    )}
                  </Button>
                </form>

                {/* Additional Info */}
                <div className="mt-8 pt-6 border-t border-border/50">
                  <h3 className="font-orbitron font-bold text-sm text-foreground mb-3">
                    Submission Guidelines:
                  </h3>
                  <ul className="space-y-2 text-sm font-mono text-muted-foreground">
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Each flag can only be submitted once per team</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Flags are case-sensitive and must match exactly</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Points will be awarded after verification</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Check the leaderboard for real-time rankings</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Links */}
          <div className="mt-8 text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-4 font-mono text-sm">
              <a href="/#timeline-section" className="text-primary hover:underline">
                View Event Timeline
              </a>
              <span className="text-muted-foreground">|</span>
              <a href="/registration" className="text-primary hover:underline">
                Register Your Team
              </a>
              <span className="text-muted-foreground">|</span>
              <a href="/#contact-section" className="text-primary hover:underline">
                Need Help?
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FlagSubmissionPage;
