import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Flag, Video, Lock, Key, Scroll, Shield, Swords } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";

// Timed hints configuration and component
const HINTS: Array<{ id: string; title: string; body: string; unlockOffsetMs: number }> = [
  {
    id: "h1",
    title: '"What lies within the image?"',
    body: "Files can carry more than their name suggests. Analyze the structure to find what's embedded within.",
    unlockOffsetMs: 1 * 60 * 60 * 1000, // 1 hour
  },
  {
    id: "h2",
    title: '"When you find a lock, seek the winged one..."',
    body: "In Greek tales, when Medusa fell, something magnificent took flight. That creature's name may unlock what you seek.",
    unlockOffsetMs: 2 * 60 * 60 * 1000, // 2 hours
  },
  {
    id: "h3",
    title: '"Not all that is written is plainly read..."',
    body: "Ancient scribes encoded their secrets. If text appears as mystical symbols (base64), decode it. And remember: sometimes the path is reversed.",
    unlockOffsetMs: 3 * 60 * 60 * 1000, // 3 hours
  },
  {
    id: "h4",
    title: '"Mirror, mirror..."',
    body: "The final message may be backwards. Look at your findings through a different lens—sometimes reversing your perspective reveals the truth.",
    unlockOffsetMs: 4 * 60 * 60 * 1000, // 4 hours
  },
];

function formatDuration(ms: number) {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

const TimedHints = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const teamId = typeof window !== 'undefined' ? sessionStorage.getItem('round1_team_id') : null;

  const [startTime, setStartTime] = useState<number | null>(null);
  const [serverHints, setServerHints] = useState<any[] | null>(null);
  const [started, setStarted] = useState<boolean | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [error, setError] = useState<string | null>(null);

  // Poll clock for UI updates
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Initialize by asking server for status, and start session if needed
  useEffect(() => {
    let mounted = true;
    async function init() {
      if (!teamId) {
        if (mounted) setError('No team ID found. Please authenticate to start the round.');
        return;
      }

      // Get token from localStorage
      const token = localStorage.getItem('medusa_token');
      if (!token) {
        if (mounted) setError('Authentication token not found. Please log in again at /round1-auth');
        return;
      }

      try {
        // Send JWT via Authorization header (more reliable for cross-domain)
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const statusRes = await fetch(`${apiUrl}/api/rounds/1/status`, {
          credentials: 'include', // Still include for cookie fallback
          headers: headers
        });

        // Check for authentication errors
        if (statusRes.status === 401) {
          if (mounted) {
            setError('Authentication expired. Please log in again at /round1-auth');
            // Clear invalid token
            localStorage.removeItem('medusa_token');
          }
          return;
        }

        const statusJson = await statusRes.json();

        if (!statusJson.started) {
          // start session
          const startRes = await fetch(`${apiUrl}/api/rounds/1/start`, {
            method: 'POST',
            credentials: 'include',
            headers: headers
          });
          const startJson = await startRes.json();
          if (mounted) {
            setStarted(true);
            setStartTime(new Date(startJson.startTime).getTime());
            setServerHints(HINTS);
          }
        } else {
          if (mounted) {
            setStarted(true);
            setStartTime(new Date(statusJson.startTime).getTime());
            // prefer server-provided hint metadata if available
            setServerHints(statusJson.hints && statusJson.hints.length ? statusJson.hints : HINTS);
          }
        }
      } catch (err) {
        console.error('Failed to initialize round status:', err);
        if (mounted) setError('Failed to contact server for round status.');
      }
    }

    init();
    return () => { mounted = false; };
  }, [apiUrl, teamId]);

  if (error) {
    return <div className="p-4 text-sm text-destructive font-mono">{error}</div>;
  }

  if (started === null || startTime === null || serverHints === null) {
    return (
      <div className="p-4 text-sm text-amber-300/80 font-mono">
        Initializing round status...
      </div>
    );
  }

  const elapsed = now - startTime;

  return (
    <div className="space-y-4">
      {/* Progress indicator for the entire hint set */}
      {(() => {
        const total = serverHints.length;
        const unlockedCount = serverHints.filter((h: any) => ('unlocked' in h) ? h.unlocked : (elapsed >= h.unlockOffsetMs)).length;
        const progressPercent = Math.round((unlockedCount / total) * 100);
        return (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-mono text-amber-300">{unlockedCount} / {total} hints unlocked</div>
              <div className="text-xs text-amber-400">{progressPercent}%</div>
            </div>
            <div className="w-full bg-amber-900/20 h-2 rounded overflow-hidden">
              <div
                className="h-2 bg-amber-500 transition-all"
                style={{ width: `${progressPercent}%` }}
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        );
      })()}
      {serverHints.map((hint: any, idx: number) => {
        const unlockOffsetMs = hint.unlockOffsetMs ?? hint.unlockOffsetMs;
        const unlocked = ('unlocked' in hint) ? hint.unlocked : (elapsed >= unlockOffsetMs);
        const timeLeft = ('timeLeftMs' in hint) ? hint.timeLeftMs : Math.max(0, unlockOffsetMs - elapsed);
        return (
          <div
            key={hint.id}
            className={`p-4 rounded-lg border ${unlocked ? 'bg-amber-950/10 border-amber-600/30' : 'bg-amber-950/20 border-amber-900/30'} flex items-start justify-between`}
          >
            <div className="max-w-[85%]">
              <p className="font-serif text-amber-200/90 italic mb-2">
                {idx === 0 ? '💭 ' : idx === 1 ? '🗝️ ' : idx === 2 ? '📜 ' : '🔄 '}
                <strong className="text-amber-400">{hint.title}</strong>
              </p>
              {unlocked ? (
                <p className="text-sm text-amber-300/70 font-mono">{hint.body}</p>
              ) : (
                <p className="text-sm text-amber-300/50 font-mono">This hint will unlock after <strong>{formatDuration(hint.unlockOffsetMs)}</strong>. Time until unlock: <strong>{formatDuration(timeLeft)}</strong></p>
              )}
            </div>
            <div className="text-right">
              {!unlocked ? (
                <div className="inline-flex flex-col items-end">
                  <Lock className="w-6 h-6 text-amber-500 mb-1" />
                  <div className="text-xs text-amber-400 font-mono">{formatDuration(timeLeft)}</div>
                </div>
              ) : (
                <div className="inline-flex flex-col items-end text-amber-300">
                  <div className="text-sm font-mono">Unlocked</div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div className="mt-2 text-xs text-amber-400 font-mono">
        Timer started at: {new Date(startTime).toLocaleString()} (local time). Hints unlock relative to this time.
      </div>
    </div>
  );
};

const Round1Page = () => {
  const navigate = useNavigate();
  const [downloadedImages, setDownloadedImages] = useState<string[]>([]);

  // Check authentication on mount
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('round1_authenticated');
    if (!isAuthenticated) {
      // Redirect to authentication page if not authenticated
      navigate('/round1-auth');
    }
  }, [navigate]);

  // Challenge images - replace these URLs with your actual image URLs from Google Cloud Storage
  const challengeImages = [
    {
      id: "img1",
      name: "The Prophecy Written",
      description: "A cryptic image holding secrets within - examine carefully",
      url: "https://medusa-ecsc.s3.ap-south-1.amazonaws.com/pw_out.png", 
      filename: "pwout.png"
    },
    
    {
      id: "img2",
      name: "The Hidden Archive",
      description: "What appears as one thing may contain another entirely",
      url: "https://medusa-ecsc.s3.ap-south-1.amazonaws.com/medzip.jpg", 
    },
  ];

  const handleDownload = async (imageUrl: string, filename: string, imageId: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Mark as downloaded
      if (!downloadedImages.includes(imageId)) {
        setDownloadedImages([...downloadedImages, imageId]);
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  const handleDownloadAll = () => {
    challengeImages.forEach(img => {
      handleDownload(img.url, img.filename, img.id);
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Ancient Greek Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 via-background to-background" />
      <div className="absolute inset-0 opacity-5" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
             backgroundSize: '60px 60px'
           }} 
      />
      
      {/* Greek column decorative elements */}
      <div className="absolute top-0 left-10 w-1 h-64 bg-gradient-to-b from-amber-600/30 to-transparent" />
      <div className="absolute top-0 right-10 w-1 h-64 bg-gradient-to-b from-amber-600/30 to-transparent" />
      
      <Header />
      
      <main className="flex-1 py-20 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Page Header with Greek Theme */}
          <div className="text-center mb-16 relative">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-900/20 border-4 border-amber-600/50 mb-6 relative">
              <Shield className="w-12 h-12 text-amber-500" />
              <div className="absolute inset-0 rounded-full border-4 border-amber-400/20 animate-ping" />
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-black text-transparent bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 bg-clip-text mb-4 tracking-tight">
              ROUND I: THE ORACLE'S CHALLENGE
            </h1>
            <p className="text-xl font-serif text-amber-200/80 italic mb-2">
              "In the halls of ancient wisdom, the answers lie hidden"
            </p>
            <div className="flex items-center justify-center gap-4 text-sm font-mono text-muted-foreground">
              <div className="flex items-center gap-2">
                <Scroll className="w-4 h-4 text-amber-500" />
                <span>Phase 1: Qualifiers</span>
              </div>
              <span className="text-amber-500">•</span>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" />
                <span>Difficulty: Medium</span>
              </div>
            </div>
          </div>

          {/* Video Section */}
          <Card className="mb-12 bg-card/50 backdrop-blur-sm border-2 border-amber-900/30 shadow-2xl">
            <CardHeader className="border-b border-amber-900/30 bg-gradient-to-r from-amber-950/50 to-transparent">
              <div className="flex items-center gap-3">
                <Video className="w-6 h-6 text-amber-500" />
                <div>
                  <CardTitle className="text-2xl font-serif text-amber-100">
                    The Oracle Speaks
                  </CardTitle>
                  <CardDescription className="font-serif italic text-amber-200/60">
                    Listen carefully to the riddles and hints within
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="aspect-video bg-black/50 rounded-lg overflow-hidden border-2 border-amber-900/30 shadow-inner">
                {/* Replace with your actual video URL */}
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Round 1 Challenge Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <Alert className="mt-6 border-amber-600/30 bg-amber-950/30">
                <Key className="h-4 w-4 text-amber-500" />
                <AlertDescription className="font-serif text-amber-100/80">
                  <strong>Hint:</strong> Not all is as it appears on the surface. 
                  What seems like a simple image may contain hidden depths. 
                  The ancient Greeks often concealed their secrets within secrets, 
                  and sometimes the key to unlocking them lies in their own mythology.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Challenge Images Section */}
          <Card className="mb-12 bg-card/50 backdrop-blur-sm border-2 border-amber-900/30 shadow-2xl">
            <CardHeader className="border-b border-amber-900/30 bg-gradient-to-r from-amber-950/50 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Download className="w-6 h-6 text-amber-500" />
                  <div>
                    <CardTitle className="text-2xl font-serif text-amber-100">
                      Sacred Artifacts
                    </CardTitle>
                    <CardDescription className="font-serif italic text-amber-200/60">
                      Download these ancient images to uncover their secrets
                    </CardDescription>
                  </div>
                </div>
                <Button 
                  onClick={handleDownloadAll}
                  variant="outline"
                  className="border-amber-600/50 text-amber-500 hover:bg-amber-950/50 font-serif"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {challengeImages.map((image, index) => (
                  <Card 
                    key={image.id}
                    className="bg-gradient-to-b from-amber-950/30 to-transparent border-amber-900/30 hover:border-amber-600/50 transition-all duration-300 group"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-full bg-amber-900/30 flex items-center justify-center border border-amber-600/30">
                          <span className="text-amber-500 font-serif font-bold">{index + 1}</span>
                        </div>
                        {downloadedImages.includes(image.id) && (
                          <div className="px-2 py-1 bg-amber-600/20 border border-amber-600/30 rounded text-xs text-amber-400 font-mono">
                            ✓ Downloaded
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-lg font-serif text-amber-100 group-hover:text-amber-400 transition-colors">
                        {image.name}
                      </CardTitle>
                      <CardDescription className="font-serif text-amber-200/60">
                        {image.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-black/30 rounded-lg mb-4 border border-amber-900/30 overflow-hidden">
                        <img 
                          src={image.url} 
                          alt={image.name}
                          className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <Button
                        onClick={() => handleDownload(image.url, image.filename, image.id)}
                        variant="outline"
                        className="w-full border-amber-600/30 text-amber-400 hover:bg-amber-950/50 hover:text-amber-300 font-serif"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Image
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Instructions */}
              <Alert className="mt-8 border-amber-600/30 bg-amber-950/30">
                <Scroll className="h-5 w-5 text-amber-500" />
                <AlertDescription className="font-serif text-amber-100/80">
                  <p className="font-bold text-amber-400 mb-3">Instructions:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      <span>Download all sacred artifacts (images) to your device for analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      <span>Look beneath the surface - images may contain more than meets the eye</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      <span>Consider using forensic tools to reveal hidden data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      <span>If you find something locked, remember: Greek mythology may hold the key</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      <span>Sometimes messages are encoded - you may need to decode and perhaps even reverse your thinking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      <span>The flag format is: <code className="px-2 py-1 bg-black/40 rounded text-amber-400">MEDUSA&#123;...&#125;</code></span>
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Additional Cryptic Hints - timed unlocks */}
          <Card className="mb-12 bg-card/30 backdrop-blur-sm border-2 border-amber-900/30">
            <CardHeader className="border-b border-amber-900/30">
              <div className="flex items-center gap-3">
                <Scroll className="w-6 h-6 text-amber-500" />
                <div>
                  <CardTitle className="text-xl font-serif text-amber-100">
                    Whispers from the Oracle
                  </CardTitle>
                  <CardDescription className="font-serif italic text-amber-200/60">
                    Ancient wisdom to guide your quest — hints unlock over time
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <TimedHints />
            </CardContent>
          </Card>

          {/* Submit Flag CTA */}
          <Card className="bg-gradient-to-br from-amber-900/30 via-card/50 to-amber-950/30 backdrop-blur-sm border-2 border-amber-600/50 shadow-2xl">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-900/40 border-3 border-amber-500/50 mb-6 animate-pulse">
                <Swords className="w-10 h-10 text-amber-400" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-amber-100 mb-4">
                Ready to Prove Your Worth?
              </h2>
              <p className="text-lg font-serif text-amber-200/70 mb-8 max-w-2xl mx-auto">
                Once you've decrypted the sacred artifacts and discovered the hidden flag, 
                submit your answer to the Oracle's challenge.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  onClick={() => navigate('/submit-flag')}
                  size="lg"
                  className="px-10 py-6 text-lg font-serif font-bold bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black border-2 border-amber-400 shadow-lg hover:shadow-amber-500/50 transition-all duration-300"
                >
                  <Flag className="mr-3 h-6 w-6" />
                  Submit Your Flag
                </Button>
                <Button 
                  onClick={() => navigate('/#timeline-section')}
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-lg font-serif border-2 border-amber-600/50 text-amber-400 hover:bg-amber-950/50"
                >
                  <Scroll className="mr-2 h-5 w-5" />
                  View Timeline
                </Button>
              </div>
              
              {/* Greek-style divider */}
              <div className="mt-12 flex items-center justify-center gap-4">
                <div className="h-px w-24 bg-gradient-to-r from-transparent to-amber-600/50" />
                <div className="text-amber-500 text-2xl font-serif">⚔</div>
                <div className="h-px w-24 bg-gradient-to-l from-transparent to-amber-600/50" />
              </div>
              
              <p className="mt-6 text-sm font-serif italic text-amber-200/50">
                "The path to victory is paved with wisdom and courage"
              </p>
            </CardContent>
          </Card>

          {/* Additional Help Section */}
          <div className="mt-8 text-center">
            <div className="inline-flex flex-wrap justify-center gap-6 font-mono text-sm text-amber-300/60">
              <a href="/#contact-section" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                <span>Need Help?</span>
              </a>
              <span className="text-amber-600">|</span>
              <a href="/delegate-book" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                <span>Competition Rules</span>
              </a>
              <span className="text-amber-600">|</span>
              <a href="/#about" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                <span>About MEDUSA</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Round1Page;
