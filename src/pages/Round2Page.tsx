import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Download,
  Flag,
  Lock,
  Scroll,
  Shield,
  Zap,
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
  const [downloadedFiles, setDownloadedFiles] = useState<string[]>([]);
  const [remainingAttempts, setRemainingAttempts] = useState<RemainingAttemptsData | null>(null);
  const [loadingAttempts, setLoadingAttempts] = useState(true);
  
  // Flag submission states
  const [androidFlag, setAndroidFlag] = useState("");
  const [pwnFlag, setPwnFlag] = useState("");
  const [androidSubmitting, setAndroidSubmitting] = useState(false);
  const [pwnSubmitting, setPwnSubmitting] = useState(false);
  const [androidResult, setAndroidResult] = useState<{ success: boolean; message: string } | null>(null);
  const [pwnResult, setPwnResult] = useState<{ success: boolean; message: string } | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('round2_authenticated');
    if (!isAuthenticated) {
      // Redirect to authentication page if not authenticated
      navigate('/round2-auth');
    } else {
      // Fetch remaining attempts
      fetchRemainingAttempts();
    }
  }, [navigate]);

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

  // Challenge files for both challenges
  const androidChallenge = {
    id: "android",
    name: "Android Exploitation Challenge",
    description: "Reverse engineer the Android application to find the flag",
    url: "https://your-storage-url.com/android-challenge.apk", 
    filename: "medusa_android.apk",
    icon: Smartphone,
    color: "emerald"
  };

  const pwnChallenge = {
    id: "pwn",
    name: "PWN Box Challenge",
    description: "Exploit the vulnerable binary and gain shell access",
    url: "https://your-storage-url.com/pwn-challenge.zip",
    filename: "pwn_box.zip",
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

  const handleFlagSubmit = async (challengeType: 'android' | 'pwn') => {
    const flag = challengeType === 'android' ? androidFlag : pwnFlag;
    const setSubmitting = challengeType === 'android' ? setAndroidSubmitting : setPwnSubmitting;
    const setResult = challengeType === 'android' ? setAndroidResult : setPwnResult;

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
          challengeType: challengeType // Send challenge type to backend
        })
      });

      const data = await response.json();

      if (response.ok && data.correct) {
        setResult({
        success: true,
        message: `✅ Correct! ${challengeType === 'android' ? 'Android' : 'PWN'} flag accepted!`
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
                      <h3 className="font-serif font-bold text-red-100">PWN Challenge</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-red-200/70">Attempts Used:</span>
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
                      Challenge 1: Android Exploitation
                    </CardTitle>
                    <CardDescription className="font-serif italic text-emerald-200/60">
                      Reverse engineer the Android application to uncover the hidden flag
                    </CardDescription>
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
                      Challenge 2: PWN Box
                    </CardTitle>
                    <CardDescription className="font-serif italic text-red-200/60">
                      Exploit the vulnerable binary and capture the flag
                    </CardDescription>
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
                      <Download className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-serif font-bold text-red-100 mb-2">
                        Download Challenge Files
                      </h3>
                      <p className="text-sm text-red-200/70 mb-4">
                        {pwnChallenge.description}
                      </p>
                      <Button
                        onClick={() => handleDownload(pwnChallenge.url, pwnChallenge.filename, pwnChallenge.id)}
                        variant="outline"
                        className="border-red-600/50 text-red-400 hover:bg-red-950/50 font-serif"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download {pwnChallenge.filename}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Flag Submission Section */}
                <div className="p-6 bg-gradient-to-br from-red-950/20 to-transparent border border-red-900/30 rounded-lg">
                  <h3 className="text-lg font-serif font-bold text-red-100 mb-4 flex items-center gap-2">
                    <Flag className="w-5 h-5 text-red-500" />
                    Submit PWN Flag
                    {remainingAttempts && (
                      <span className="ml-auto text-sm font-mono text-red-400">
                        {remainingAttempts.attempts.round2.pwn.remaining} attempts left
                      </span>
                    )}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="MEDUSA{...}"
                        value={pwnFlag}
                        onChange={(e) => setPwnFlag(e.target.value)}
                        className="font-mono bg-background/50 border-red-600/30 focus:border-red-500"
                        disabled={pwnSubmitting || (remainingAttempts?.attempts.round2.pwn.remaining === 0)}
                      />
                      <Button
                        onClick={() => handleFlagSubmit('pwn')}
                        disabled={pwnSubmitting || (remainingAttempts?.attempts.round2.pwn.remaining === 0)}
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-serif disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {pwnSubmitting ? 'Submitting...' : remainingAttempts?.attempts.round2.pwn.remaining === 0 ? 'No Attempts' : 'Submit'}
                      </Button>
                    </div>
                    {pwnResult && (
                      <Alert variant={pwnResult.success ? "default" : "destructive"} className={pwnResult.success ? "border-red-600/50 bg-red-950/30" : ""}>
                        {pwnResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        <AlertDescription className="font-mono">
                          {pwnResult.message}
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
                  <span><strong>PWN Box:</strong> Exploit the vulnerable binary to capture the flag</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>Both flags follow the format: <code className="px-2 py-1 bg-black/40 rounded text-purple-400">MEDUSA&#123;...&#125;</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>Submit each flag separately in their respective sections above</span>
                </li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Hints Section */}
          <Card className="bg-card/30 backdrop-blur-sm border-2 border-purple-900/30">
            <CardHeader className="border-b border-purple-900/30">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-purple-500" />
                <div>
                  <CardTitle className="text-xl font-serif text-purple-100">
                    Guidance from the Masters
                  </CardTitle>
                  <CardDescription className="font-serif italic text-purple-200/60">
                    Hints to illuminate your path
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="p-4 rounded-lg border bg-emerald-950/10 border-emerald-600/30">
                  <div className="mb-3 bg-gradient-to-r from-emerald-900/40 to-transparent p-2 rounded border-l-4 border-emerald-400">
                    <p className="font-serif text-lg font-bold">
                      <span className="mr-2">�</span>
                      <span className="text-emerald-200">Android Challenge Hint</span>
                    </p>
                  </div>
                  <p className="text-sm text-white font-mono leading-relaxed bg-emerald-900/20 p-3 rounded border border-emerald-600/30">
                    APK files are just ZIP archives. Decompile, analyze, and look for hidden strings or obfuscated code.
                  </p>
                </div>

                <div className="p-4 rounded-lg border bg-red-950/10 border-red-600/30">
                  <div className="mb-3 bg-gradient-to-r from-red-900/40 to-transparent p-2 rounded border-l-4 border-red-400">
                    <p className="font-serif text-lg font-bold">
                      <span className="mr-2">�</span>
                      <span className="text-red-200">PWN Challenge Hint</span>
                    </p>
                  </div>
                  <p className="text-sm text-white font-mono leading-relaxed bg-red-900/20 p-3 rounded border border-red-600/30">
                    Buffer overflows are your friend. Understand the binary, find the vulnerability, and craft your exploit.
                  </p>
                </div>

                <div className="p-4 rounded-lg border bg-purple-950/10 border-purple-600/30">
                  <div className="mb-3 bg-gradient-to-r from-purple-900/40 to-transparent p-2 rounded border-l-4 border-purple-400">
                    <p className="font-serif text-lg font-bold">
                      <span className="mr-2">🔍</span>
                      <span className="text-purple-200">General Hint</span>
                    </p>
                  </div>
                  <p className="text-sm text-white font-mono leading-relaxed bg-purple-900/20 p-3 rounded border border-purple-600/30">
                    The right tools make all the difference. Use debuggers, disassemblers, and network analysis tools effectively.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Round2Page;
