import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Flag, Video, Lock, Key, Scroll, Shield, Swords } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";

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
      url: "https://storage.googleapis.com/YOUR_BUCKET/pwout.png", // Replace with actual URL
      filename: "pwout.png"
    },
    {
      id: "img2",
      name: "The Hidden Archive",
      description: "What appears as one thing may contain another entirely",
      url: "https://storage.googleapis.com/YOUR_BUCKET/zipimage.jpg", // Replace with actual URL
      filename: "zipimage.jpg"
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

          {/* Additional Cryptic Hints */}
          <Card className="mb-12 bg-card/30 backdrop-blur-sm border-2 border-amber-900/30">
            <CardHeader className="border-b border-amber-900/30">
              <div className="flex items-center gap-3">
                <Scroll className="w-6 h-6 text-amber-500" />
                <div>
                  <CardTitle className="text-xl font-serif text-amber-100">
                    Whispers from the Oracle
                  </CardTitle>
                  <CardDescription className="font-serif italic text-amber-200/60">
                    Ancient wisdom to guide your quest
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="p-4 bg-amber-950/20 rounded-lg border border-amber-900/30">
                  <p className="font-serif text-amber-200/90 italic mb-2">
                    💭 <strong className="text-amber-400">"What lies within the image?"</strong>
                  </p>
                  <p className="text-sm text-amber-300/70 font-mono">
                    Files can carry more than their name suggests. Analyze the structure to find what's embedded within.
                  </p>
                </div>
                
                <div className="p-4 bg-amber-950/20 rounded-lg border border-amber-900/30">
                  <p className="font-serif text-amber-200/90 italic mb-2">
                    🗝️ <strong className="text-amber-400">"When you find a lock, seek the winged one..."</strong>
                  </p>
                  <p className="text-sm text-amber-300/70 font-mono">
                    In Greek tales, when Medusa fell, something magnificent took flight. That creature's name may unlock what you seek.
                  </p>
                </div>
                
                <div className="p-4 bg-amber-950/20 rounded-lg border border-amber-900/30">
                  <p className="font-serif text-amber-200/90 italic mb-2">
                    📜 <strong className="text-amber-400">"Not all that is written is plainly read..."</strong>
                  </p>
                  <p className="text-sm text-amber-300/70 font-mono">
                    Ancient scribes encoded their secrets. If text appears as mystical symbols, decode it. And remember: sometimes the path is reversed.
                  </p>
                </div>
                
                <div className="p-4 bg-amber-950/20 rounded-lg border border-amber-900/30">
                  <p className="font-serif text-amber-200/90 italic mb-2">
                    🔄 <strong className="text-amber-400">"Mirror, mirror..."</strong>
                  </p>
                  <p className="text-sm text-amber-300/70 font-mono">
                    The final message may be backwards.
                  </p>
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-amber-900/30 to-transparent rounded-lg border-l-4 border-amber-500">
                  <p className="font-serif text-amber-100 text-sm">
                    <strong>Suggested Approach:</strong> Examine → Extract → Unlock → Decode → ?
                  </p>
                </div>
              </div>
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
