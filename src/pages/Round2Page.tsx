import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Download,
  Flag,
  Lock,
  Scroll,
  Shield,
  Smartphone,
  Server,
  CheckCircle,
  AlertCircle,
  Users,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";

// Types for remaining attempts data
interface ChallengeAttempts {
  used: number;
  remaining: number;
  maxAttempts: number;
  completed: boolean;
  completedAt: string | null;
  points: number;
}

interface RemainingAttemptsData {
  teamId: string;
  attempts: {
    round1: ChallengeAttempts;
    round2: {
      android: ChallengeAttempts;
      pwn: ChallengeAttempts;
    };
  };
}

const Round2Page = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [downloadedFiles, setDownloadedFiles] = useState<string[]>([]);
  const [remainingAttempts, setRemainingAttempts] = useState<RemainingAttemptsData | null>(null);
  const [loadingAttempts, setLoadingAttempts] = useState(true);
  
  // Flag submission states
  const [androidFlag, setAndroidFlag] = useState("");
  const [pwnUserFlag, setPwnUserFlag] = useState("");
  const [pwnRootFlag, setPwnRootFlag] = useState("");
  const [androidSubmitting, setAndroidSubmitting] = useState(false);
  const [pwnUserSubmitting, setPwnUserSubmitting] = useState(false);
  const [pwnRootSubmitting, setPwnRootSubmitting] = useState(false);
  const [androidResult, setAndroidResult] = useState<{ success: boolean; message: string } | null>(null);
  const [pwnUserResult, setPwnUserResult] = useState<{ success: boolean; message: string } | null>(null);
  const [pwnRootResult, setPwnRootResult] = useState<{ success: boolean; message: string } | null>(null);

  // Hint unlock states
  const [unlockedHints, setUnlockedHints] = useState<{[key: string]: number[]}>({
    android: [],
    pwn: []
  });
  const [unlockingHint, setUnlockingHint] = useState<string | null>(null);
  const [hintPenalty, setHintPenalty] = useState(0);
  const [hintContents, setHintContents] = useState<{[key: string]: {title: string; hint: string}}>({});

  // Fetch hint content from backend (only returns if unlocked)
  const fetchHintContent = async (challengeType: string, hintNumber: number) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('medusa_token');

      const response = await fetch(
        `${apiUrl}/api/hints/content?round=2&challengeType=${challengeType}&hintNumber=${hintNumber}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const key = `${challengeType}-${hintNumber}`;
        setHintContents(prev => ({
          ...prev,
          [key]: {
            title: data.title,
            hint: data.hint
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching hint content:', error);
    }
  };

  // Check authentication on mount
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('round2_authenticated');
    if (!isAuthenticated) {
      // Redirect to authentication page if not authenticated
      navigate('/round2-auth');
    } else {
      // Fetch remaining attempts and hints
      fetchRemainingAttempts();
      fetchUnlockedHints();
    }
  }, [navigate]);

  // Poll for hint updates every 10 seconds to sync with team members
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchUnlockedHints();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, []);

  // Fetch remaining attempts for the team
  const fetchRemainingAttempts = async () => {
    try {
      setLoadingAttempts(true);
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('medusa_token');

      const response = await fetch(`${apiUrl}/api/flag/remaining-attempts`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRemainingAttempts(data);
      } else {
        console.error('Failed to fetch remaining attempts');
      }
    } catch (error) {
      console.error('Error fetching remaining attempts:', error);
    } finally {
      setLoadingAttempts(false);
    }
  };

  // Fetch unlocked hints
  const fetchUnlockedHints = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('medusa_token');

      const response = await fetch(`${apiUrl}/api/hints/unlocked?round=2`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Organize hints by challenge type
        const organized: {[key: string]: number[]} = {
          android: [],
          pwn: []
        };
        data.hints.forEach((hint: any) => {
          if (organized[hint.challengeType]) {
            organized[hint.challengeType].push(hint.hintNumber);
          }
        });
        setUnlockedHints(organized);
        setHintPenalty(data.totalPenalty || 0);

        // Fetch content for all unlocked hints
        data.hints.forEach((hint: any) => {
          fetchHintContent(hint.challengeType, hint.hintNumber);
        });
      } else {
        console.error('Failed to fetch unlocked hints');
      }
    } catch (error) {
      console.error('Error fetching unlocked hints:', error);
    }
  };

  // Unlock a hint
  const unlockHint = async (challengeType: string, hintNumber: number) => {
    const hintKey = `${challengeType}-${hintNumber}`;
    setUnlockingHint(hintKey);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('medusa_token');

      const response = await fetch(`${apiUrl}/api/hints/unlock`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          round: 2,
          challengeType,
          hintNumber
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh hints
        await fetchUnlockedHints();
        // Fetch the newly unlocked hint content
        await fetchHintContent(challengeType, hintNumber);
        toast({
          title: "Hint Unlocked!",
          description: `${data.pointCost} points will be deducted from your final score.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Failed to unlock hint",
          description: data.error || 'Please try again.',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error unlocking hint:', error);
      toast({
        title: "Error",
        description: 'Failed to unlock hint. Please try again.',
        variant: "destructive",
      });
    } finally {
      setUnlockingHint(null);
    }
  };

  // Challenge files for both challenges
  const androidChallenge = {
    id: "android",
    name: "Android Exploitation Challenge",
    description: "Reverse engineer the Android application to find the flag",
    url: "https://medusa-ecsc.s3.ap-south-1.amazonaws.com/app-release.apk", 
    filename: "Perseus.apk",
    icon: Smartphone,
    color: "emerald"
  };

  const pwnChallenge = {
    id: "pwn",
    name: "PWN Container Challenge",
    description: "Break into the containerized environment and capture both flags",
    url: "http://138.68.4.31",
    filename: "Access via 138.68.4.31",
    icon: Server,
    color: "red"
  };

  const handleDownload = async (fileUrl: string, filename: string, fileId: string) => {
    try {
      // Fetch the file with CORS
      const response = await fetch(fileUrl, {
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'download';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      setTimeout(() => window.URL.revokeObjectURL(url), 100);

      // Mark as downloaded
      if (!downloadedFiles.includes(fileId)) {
        setDownloadedFiles([...downloadedFiles, fileId]);
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file. Please check your internet connection or try again.');
    }
  };

  const handleFlagSubmit = async (challengeType: 'android' | 'pwn-user' | 'pwn-root') => {
    let flag = '';
    let setSubmitting: (val: boolean) => void;
    let setResult: (val: { success: boolean; message: string } | null) => void;
    let displayName = '';

    if (challengeType === 'android') {
      flag = androidFlag;
      setSubmitting = setAndroidSubmitting;
      setResult = setAndroidResult;
      displayName = 'Android';
    } else if (challengeType === 'pwn-user') {
      flag = pwnUserFlag;
      setSubmitting = setPwnUserSubmitting;
      setResult = setPwnUserResult;
      displayName = 'PWN User';
    } else {
      flag = pwnRootFlag;
      setSubmitting = setPwnRootSubmitting;
      setResult = setPwnRootResult;
      displayName = 'PWN Root';
    }

    if (!flag.trim()) {
      setResult({ success: false, message: "Please enter a flag" });
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('medusa_token');

      const response = await fetch(`${apiUrl}/api/flag/submit`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          flag: flag.trim(),
          round: 2,
          challengeType: challengeType // Send exact challengeType: 'android', 'pwn-user', or 'pwn-root'
        })
      });

      const data = await response.json();

      if (response.ok && data.correct) {
        setResult({
        success: true,
        message: `Correct flag! ${displayName} challenge completed.`
        });
        // Refresh remaining attempts after successful submission
        fetchRemainingAttempts();
      } else {
        setResult({
          success: false,
          message: data.error || "Incorrect flag. Try again!"
        });
        // Refresh remaining attempts after any submission
        fetchRemainingAttempts();
      }
    } catch (error) {
      console.error('Flag submission error:', error);
      setResult({
        success: false,
        message: "Failed to submit flag. Please try again."
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background Effects with Purple Theme */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-background to-background" />
      <div className="absolute inset-0 opacity-5" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239333ea' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
             backgroundSize: '60px 60px'
           }} 
      />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-10 w-1 h-64 bg-gradient-to-b from-purple-600/30 to-transparent" />
      <div className="absolute top-0 right-10 w-1 h-64 bg-gradient-to-b from-purple-600/30 to-transparent" />
      
      <Header />
      
      <main className="flex-1 py-20 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-16 relative">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-purple-900/20 border-4 border-purple-600/50 mb-6 relative">
              <Shield className="w-12 h-12 text-purple-500" />
              <div className="absolute inset-0 rounded-full border-4 border-purple-400/20 animate-ping" />
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-black text-transparent bg-gradient-to-r from-purple-500 via-violet-400 to-purple-600 bg-clip-text mb-4 tracking-tight">
              ROUND II: THE ADVANCED TRIAL
            </h1>
            <p className="text-xl font-serif text-purple-200/80 italic mb-2">
              "Beyond the veil, greater challenges await"
            </p>
            <div className="flex items-center justify-center gap-4 text-sm font-mono text-muted-foreground">
              <div className="flex items-center gap-2">
                <Scroll className="w-4 h-4 text-purple-500" />
                <span>Phase 2: Finals</span>
              </div>
              <span className="text-purple-500">•</span>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-500" />
                <span>Difficulty: Hard</span>
              </div>
            </div>
          </div>

          {/* Team Attempts Status Card */}
          {!loadingAttempts && remainingAttempts && (
            <Card className="mb-12 bg-gradient-to-br from-purple-950/30 to-card/50 backdrop-blur-sm border-2 border-purple-600/30 shadow-2xl">
              <CardHeader className="border-b border-purple-600/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center border border-purple-500/30">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-serif text-purple-100">
                      Team Submission Status
                    </CardTitle>
                    <CardDescription className="font-serif text-purple-200/60">
                      Remaining attempts for your team
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Android Challenge Status */}
                  <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-950/40 to-transparent border border-emerald-600/30">
                    <div className="flex items-center gap-3 mb-3">
                      <Smartphone className="w-5 h-5 text-emerald-400" />
                      <h3 className="font-serif font-bold text-emerald-100">Android Challenge</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-200/70">Attempts Used:</span>
                        <span className="font-mono font-bold text-emerald-300">
                          {remainingAttempts.attempts.round2.android.used} / {remainingAttempts.attempts.round2.android.maxAttempts}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-200/70">Remaining:</span>
                        <span className={`font-mono font-bold ${
                          remainingAttempts.attempts.round2.android.remaining > 0 
                            ? 'text-emerald-400' 
                            : 'text-red-400'
                        }`}>
                          {remainingAttempts.attempts.round2.android.remaining}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-200/70">Status:</span>
                        {remainingAttempts.attempts.round2.android.completed ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-bold">
                            <CheckCircle className="w-4 h-4" />
                            Completed
                          </span>
                        ) : (
                          <span className="text-yellow-400 font-bold">In Progress</span>
                        )}
                      </div>
                      {remainingAttempts.attempts.round2.android.completed && (
                        <div className="flex justify-between items-center pt-2 border-t border-emerald-600/30">
                          <span className="text-emerald-200/70">Points:</span>
                          <span className="font-mono font-bold text-emerald-300">
                            {remainingAttempts.attempts.round2.android.points}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PWN Challenge Status */}
                  <div className="p-4 rounded-lg bg-gradient-to-br from-red-950/40 to-transparent border border-red-600/30">
                    <div className="flex items-center gap-3 mb-3">
                      <Server className="w-5 h-5 text-red-400" />
                      <h3 className="font-serif font-bold text-red-100">PWN Challenge (2 Flags)</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-red-200/70">Total Attempts:</span>
                        <span className="font-mono font-bold text-red-300">
                          {remainingAttempts.attempts.round2.pwn.used} / {remainingAttempts.attempts.round2.pwn.maxAttempts}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-red-200/70">Remaining:</span>
                        <span className={`font-mono font-bold ${
                          remainingAttempts.attempts.round2.pwn.remaining > 0 
                            ? 'text-red-400' 
                            : 'text-red-600'
                        }`}>
                          {remainingAttempts.attempts.round2.pwn.remaining}
                        </span>
                      </div>
                      <div className="text-xs text-red-200/50 italic pt-1">
                        Combined attempts for both User & Root flags
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-red-200/70">Status:</span>
                        {remainingAttempts.attempts.round2.pwn.completed ? (
                          <span className="flex items-center gap-1 text-red-400 font-bold">
                            <CheckCircle className="w-4 h-4" />
                            Completed
                          </span>
                        ) : (
                          <span className="text-yellow-400 font-bold">In Progress</span>
                        )}
                      </div>
                      {remainingAttempts.attempts.round2.pwn.completed && (
                        <div className="flex justify-between items-center pt-2 border-t border-red-600/30">
                          <span className="text-red-200/70">Points:</span>
                          <span className="font-mono font-bold text-red-300">
                            {remainingAttempts.attempts.round2.pwn.points}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Warning if no attempts remaining */}
                {(remainingAttempts.attempts.round2.android.remaining === 0 && !remainingAttempts.attempts.round2.android.completed) && (
                  <Alert className="mt-4 border-red-600/50 bg-red-950/30">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-200">
                      <strong>Android Challenge:</strong> No attempts remaining. You've used all your submissions.
                    </AlertDescription>
                  </Alert>
                )}
                
                {(remainingAttempts.attempts.round2.pwn.remaining === 0 && !remainingAttempts.attempts.round2.pwn.completed) && (
                  <Alert className="mt-4 border-red-600/50 bg-red-950/30">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-200">
                      <strong>PWN Challenge:</strong> No attempts remaining. You've used all your submissions.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Two Challenges Section */}
          <div className="mb-12 space-y-8">
            {/* Android Exploitation Challenge */}
            <Card className="bg-card/50 backdrop-blur-sm border-2 border-emerald-900/30 shadow-2xl">
              <CardHeader className="border-b border-emerald-900/30 bg-gradient-to-r from-emerald-950/50 to-transparent">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-8 h-8 text-emerald-500" />
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-serif text-emerald-100">
                      Challenge 1: Perseus Android 
                    </CardTitle>
                    
                  </div>
                  {downloadedFiles.includes(androidChallenge.id) && (
                    <div className="px-3 py-1 bg-emerald-600/20 border border-emerald-600/30 rounded text-sm text-emerald-400 font-mono">
                      ✓ Downloaded
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                {/* Download Section */}
                <div className="p-6 bg-gradient-to-br from-emerald-950/30 to-transparent border border-emerald-900/30 rounded-lg">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-900/30 flex items-center justify-center border border-emerald-600/30">
                      <Download className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-serif font-bold text-emerald-100 mb-2">
                        Download APK File
                      </h3>
                      <p className="text-sm text-emerald-200/70 mb-4">
                        {androidChallenge.description}
                      </p>
                      <Button
                        onClick={() => handleDownload(androidChallenge.url, androidChallenge.filename, androidChallenge.id)}
                        variant="outline"
                        className="border-emerald-600/50 text-emerald-400 hover:bg-emerald-950/50 font-serif"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download {androidChallenge.filename}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Flag Submission Section */}
                <div className="p-6 bg-gradient-to-br from-emerald-950/20 to-transparent border border-emerald-900/30 rounded-lg">
                  <h3 className="text-lg font-serif font-bold text-emerald-100 mb-4 flex items-center gap-2">
                    <Flag className="w-5 h-5 text-emerald-500" />
                    Submit Android Flag
                    {remainingAttempts && (
                      <span className="ml-auto text-sm font-mono text-emerald-400">
                        {remainingAttempts.attempts.round2.android.remaining} attempts left
                      </span>
                    )}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="MEDUSA{...}"
                        value={androidFlag}
                        onChange={(e) => setAndroidFlag(e.target.value)}
                        className="font-mono bg-background/50 border-emerald-600/30 focus:border-emerald-500"
                        disabled={androidSubmitting || (remainingAttempts?.attempts.round2.android.remaining === 0)}
                      />
                      <Button
                        onClick={() => handleFlagSubmit('android')}
                        disabled={androidSubmitting || (remainingAttempts?.attempts.round2.android.remaining === 0)}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-serif disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {androidSubmitting ? 'Submitting...' : remainingAttempts?.attempts.round2.android.remaining === 0 ? 'No Attempts' : 'Submit'}
                      </Button>
                    </div>
                    {androidResult && (
                      <Alert variant={androidResult.success ? "default" : "destructive"} className={androidResult.success ? "border-emerald-600/50 bg-emerald-950/30" : ""}>
                        {androidResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        <AlertDescription className="font-mono">
                          {androidResult.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PWN Box Challenge */}
            <Card className="bg-card/50 backdrop-blur-sm border-2 border-red-900/30 shadow-2xl">
              <CardHeader className="border-b border-red-900/30 bg-gradient-to-r from-red-950/50 to-transparent">
                <div className="flex items-center gap-3">
                  <Server className="w-8 h-8 text-red-500" />
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-serif text-red-100">
                      Challenge 2: Container Escape
                    </CardTitle>
                
                  </div>
                  {downloadedFiles.includes(pwnChallenge.id) && (
                    <div className="px-3 py-1 bg-red-600/20 border border-red-600/30 rounded text-sm text-red-400 font-mono">
                      ✓ Downloaded
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                {/* Download Section */}
                <div className="p-6 bg-gradient-to-br from-red-950/30 to-transparent border border-red-900/30 rounded-lg">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center border border-red-600/30">
                      <Server className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-serif font-bold text-red-100 mb-2">
                        Challenge Access
                      </h3>
                      <p className="text-sm text-red-200/70 mb-3">
                        This challenge is hosted at <code className="px-2 py-1 bg-red-950/50 rounded text-red-300 font-mono">138.68.4.31</code>
                      </p>
                      <p className="text-sm text-red-200/70 mb-4">
                        Exploit the weakly protected web service to gain container access, then escalate privileges to capture both the <strong>user flag</strong> and <strong>root flag</strong>.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => window.open('http://138.68.4.31', '_blank')}
                          variant="outline"
                          className="border-red-600/50 text-red-400 hover:bg-red-950/50 font-serif"
                        >
                          <Server className="w-4 h-4 mr-2" />
                          Access Challenge
                        </Button>
                    
                      </div>
                    </div>
                  </div>
                </div>

                {/* Flag Submission Section */}
                <div className="p-6 bg-gradient-to-br from-red-950/20 to-transparent border border-red-900/30 rounded-lg">
                  <h3 className="text-lg font-serif font-bold text-red-100 mb-4 flex items-center gap-2">
                    <Flag className="w-5 h-5 text-red-500" />
                    Submit PWN Flags
                    {remainingAttempts && (
                      <span className="ml-auto text-sm font-mono text-red-400">
                        {remainingAttempts.attempts.round2.pwn.remaining} attempts left
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-red-200/60 mb-6">
                    This challenge has TWO flags: User Flag (inside container) and Root Flag (after breakout). Submit each flag separately below.
                  </p>

                  {/* User Flag Submission */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <h4 className="text-sm font-serif font-bold text-yellow-100">User Flag (Stage 1)</h4>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="HashX{user_flag...}"
                        value={pwnUserFlag}
                        onChange={(e) => setPwnUserFlag(e.target.value)}
                        className="font-mono bg-background/50 border-yellow-600/30 focus:border-yellow-500 focus-visible:ring-yellow-500 focus-visible:ring-offset-0"
                        disabled={pwnUserSubmitting || (remainingAttempts?.attempts.round2.pwn.remaining === 0)}
                      />
                      <Button
                        onClick={() => handleFlagSubmit('pwn-user')}
                        disabled={pwnUserSubmitting || (remainingAttempts?.attempts.round2.pwn.remaining === 0)}
                        className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white font-serif disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {pwnUserSubmitting ? 'Submitting...' : remainingAttempts?.attempts.round2.pwn.remaining === 0 ? 'No Attempts' : 'Submit'}
                      </Button>
                    </div>
                    {pwnUserResult && (
                      <Alert variant={pwnUserResult.success ? "default" : "destructive"} className={pwnUserResult.success ? "border-green-600/50 bg-green-950/30" : ""}>
                        {pwnUserResult.success ? <CheckCircle className="h-4 w-4 text-green-400" /> : <AlertCircle className="h-4 w-4" />}
                        <AlertDescription className="font-mono">
                          {pwnUserResult.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Root Flag Submission */}
                  <div className="space-y-4 pt-6 border-t border-red-600/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <h4 className="text-sm font-serif font-bold text-red-100">Root Flag (Stage 2)</h4>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="HashX{root_flag...}"
                        value={pwnRootFlag}
                        onChange={(e) => setPwnRootFlag(e.target.value)}
                        className="font-mono bg-background/50 border-red-600/30 focus:border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-0"
                        disabled={pwnRootSubmitting || (remainingAttempts?.attempts.round2.pwn.remaining === 0)}
                      />
                      <Button
                        onClick={() => handleFlagSubmit('pwn-root')}
                        disabled={pwnRootSubmitting || (remainingAttempts?.attempts.round2.pwn.remaining === 0)}
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-serif disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {pwnRootSubmitting ? 'Submitting...' : remainingAttempts?.attempts.round2.pwn.remaining === 0 ? 'No Attempts' : 'Submit'}
                      </Button>
                    </div>
                    {pwnRootResult && (
                      <Alert variant={pwnRootResult.success ? "default" : "destructive"} className={pwnRootResult.success ? "border-green-600/50 bg-green-950/30" : ""}>
                        {pwnRootResult.success ? <CheckCircle className="h-4 w-4 text-green-400" /> : <AlertCircle className="h-4 w-4" />}
                        <AlertDescription className="font-mono">
                          {pwnRootResult.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <Alert className="mb-12 border-purple-600/30 bg-purple-950/30">
            <Scroll className="h-5 w-5 text-purple-500" />
            <AlertDescription className="font-serif text-purple-100/80">
              <p className="font-bold text-purple-400 mb-3">Round 2 Instructions:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>This round contains <strong>TWO separate challenges</strong> - each has its own flag</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span><strong>Android Exploitation:</strong> Reverse engineer the APK to find the hidden flag</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span><strong>Container Escape:</strong> Access 138.68.4.31, exploit the web service, escalate privileges, and capture TWO flags (user + root)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>Flag formats: Android uses <code className="px-2 py-1 bg-black/40 rounded text-purple-400">MEDUSA&#123;...&#125;</code>, PWN uses <code className="px-2 py-1 bg-black/40 rounded text-purple-400">HashX&#123;...&#125;</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>Total: <strong>THREE flags</strong> in Round 2 (1 Android + 2 PWN)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>Submit each flag separately in their respective sections above</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span><strong>Scoring:</strong> 1500 points distributed as 50% Android (750), 30% PWN-User (450), 20% PWN-Root (300) with time-based decay</span>
                </li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Hint Unlock System */}
          <Card className="bg-card/30 backdrop-blur-sm border-2 border-yellow-900/30 mb-12">
            <CardHeader className="border-b border-yellow-900/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-6 h-6 text-yellow-500" />
                  <div>
                    <CardTitle className="text-xl font-serif text-yellow-100">
                      Hint System
                    </CardTitle>
                    <CardDescription className="font-serif italic text-yellow-200/60">
                      Unlock hints to guide your path (costs points)
                    </CardDescription>
                  </div>
                </div>
                {hintPenalty > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-yellow-400 font-serif">Total Penalty</p>
                    <p className="text-2xl font-bold text-red-400">-{hintPenalty} pts</p>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Android Hints */}
                <div className="space-y-3">
                  <h3 className="font-serif font-bold text-emerald-300 text-center mb-4">Android Challenge</h3>
                  {[1, 2, 3].map(hintNum => {
                    const cost = hintNum === 1 ? 50 : hintNum === 2 ? 100 : 150;
                    const isUnlocked = unlockedHints.android.includes(hintNum);
                    const canUnlock = hintNum === 1 || unlockedHints.android.includes(hintNum - 1);
                    const isUnlocking = unlockingHint === `android-${hintNum}`;
                    const contentKey = `android-${hintNum}`;
                    const content = hintContents[contentKey];
                    
                    return (
                      <div key={hintNum} className={`p-4 rounded-lg border ${isUnlocked ? 'bg-emerald-950/30 border-emerald-600/50' : 'bg-gray-900/30 border-gray-700/50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-serif font-bold text-sm">{isUnlocked && content ? content.title : `Hint ${hintNum}`}</span>
                          <span className="text-xs font-mono text-yellow-400">{cost} pts</span>
                        </div>
                        
                        {isUnlocked && content ? (
                          <div className="mt-3 p-3 bg-emerald-900/20 rounded border border-emerald-600/30">
                            <p className="text-sm text-emerald-100 leading-relaxed">{content.hint}</p>
                          </div>
                        ) : (
                          <Button
                            onClick={() => unlockHint('android', hintNum)}
                            disabled={!canUnlock || isUnlocked || isUnlocking}
                            size="sm"
                            className={`w-full mt-2 ${isUnlocked ? 'bg-emerald-600 hover:bg-emerald-600' : 'bg-yellow-600 hover:bg-yellow-500'}`}
                          >
                            {isUnlocking ? 'Unlocking...' : isUnlocked ? '✓ Unlocked' : !canUnlock ? '🔒 Locked' : 'Unlock Hint'}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* PWN Challenge Hints (shared for both user and root flags) */}
                <div className="space-y-3">
                  <h3 className="font-serif font-bold text-red-300 text-center mb-4">PWN Challenge (User + Root)</h3>
                  {[1, 2, 3].map(hintNum => {
                    const cost = hintNum === 1 ? 50 : hintNum === 2 ? 100 : 150;
                    const isUnlocked = unlockedHints.pwn.includes(hintNum);
                    const canUnlock = hintNum === 1 || unlockedHints.pwn.includes(hintNum - 1);
                    const isUnlocking = unlockingHint === `pwn-${hintNum}`;
                    const contentKey = `pwn-${hintNum}`;
                    const content = hintContents[contentKey];
                    
                    return (
                      <div key={hintNum} className={`p-4 rounded-lg border ${isUnlocked ? 'bg-red-950/30 border-red-600/50' : 'bg-gray-900/30 border-gray-700/50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-serif font-bold text-sm">{isUnlocked && content ? content.title : `Hint ${hintNum}`}</span>
                          <span className="text-xs font-mono text-yellow-400">{cost} pts</span>
                        </div>
                        
                        {isUnlocked && content ? (
                          <div className="mt-3 p-3 bg-red-900/20 rounded border border-red-600/30">
                            <p className="text-sm text-red-100 leading-relaxed">{content.hint}</p>
                          </div>
                        ) : (
                          <Button
                            onClick={() => unlockHint('pwn', hintNum)}
                            disabled={!canUnlock || isUnlocked || isUnlocking}
                            size="sm"
                            className={`w-full mt-2 ${isUnlocked ? 'bg-red-600 hover:bg-red-600' : 'bg-red-600 hover:bg-red-500'}`}
                          >
                            {isUnlocking ? 'Unlocking...' : isUnlocked ? '✓ Unlocked' : !canUnlock ? '🔒 Locked' : 'Unlock Hint'}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <Alert className="mt-6 border-yellow-600/30 bg-yellow-950/20">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-sm text-yellow-100/80">
                  Hints must be unlocked sequentially (Hint 1 → Hint 2 → Hint 3). Points are deducted from your final score. Once unlocked, hint content will be displayed above.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Round2Page;
