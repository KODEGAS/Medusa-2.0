import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Trophy, Medal, Award, Clock } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  // teamId removed for security
  teamName: string;
  university: string;
  points: number; // Total points (Round 1 + Round 2)
  submissionCount: number;
  firstSolvedAt: string;
  lastSolvedAt: string;
  leaderName: string | null;
}

interface LeaderboardStats {
  totalTeams: number;
  solvedTeams: number;
  totalSubmissions: number;
  solveRate: string;
}

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading state
  const [error, setError] = useState('');
  const [myTeamName, setMyTeamName] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL|| 'http://localhost:3001';

  // Temporarily disable leaderboard fetching during Round 2
  const isLeaderboardBlocked = false; // Changed to false to show combined scores

  useEffect(() => {
    if (isLeaderboardBlocked) {
      // Don't fetch leaderboard during Round 2
      setLoading(false);
      return;
    }

    // Get current team name from session storage instead of ID
    const teamName = sessionStorage.getItem('round1_team_name');
    setMyTeamName(teamName);

    fetchLeaderboard();
    // Manual refresh only - no auto-refresh
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/leaderboard`);
      const data = await response.json();

      console.log('Leaderboard response:', data); // Debug log

      if (response.status === 403) {
        // Leaderboard is blocked
        setLoading(false);
        return;
      }

      if (data.success) {
        console.log('Leaderboard data:', data.leaderboard); // Debug log
        setLeaderboard(data.leaderboard || []);
        setStats(data.statistics);
      } else {
        setError('Failed to load leaderboard');
      }
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <Award className="w-5 h-5 text-amber-500/50" />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-black';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white';
    return 'bg-amber-900/30 text-amber-300';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-950/30 via-amber-900/20 to-background">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-amber-500 border-t-transparent mx-auto mb-4" />
          <p className="text-amber-100 text-lg font-serif">Loading Leaderboard...</p>
        </div>
      </div>
    );
  }

  // Show blocked message during Round 2
  if (isLeaderboardBlocked) {
    return (
      <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 via-background to-background" />
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />

        <Header />

        <main className="flex-1 pt-24 pb-12 px-4 relative z-10 flex items-center justify-center">
          <Card className="max-w-2xl w-full border-amber-600/30 bg-card/50 backdrop-blur-sm shadow-2xl">
            <CardHeader className="text-center border-b border-amber-900/30 bg-gradient-to-r from-amber-950/50 to-transparent">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 mb-6 shadow-lg mx-auto">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-serif font-black text-transparent bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 bg-clip-text mb-2">
                Leaderboard Temporarily Unavailable
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12 px-6">
              <div className="space-y-6">
                <div className="p-6 bg-amber-950/30 border border-amber-600/30 rounded-lg">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-amber-400" />
                  <p className="text-xl font-serif text-amber-100 mb-2">
                    Round 2 is Currently Active
                  </p>
                  <p className="text-amber-200/80 leading-relaxed">
                    The leaderboard is temporarily hidden to maintain fair competition during Round 2. 
                  </p>
                </div>
                
                <div className="text-left space-y-3 text-amber-200/70">
                  <p className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span>Focus on solving the challenges without external pressure</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span>Rankings will be revealed after Round 2 concludes</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span>All submissions are being tracked and scored</span>
                  </p>
                </div>

                <div className="pt-6 border-t border-amber-900/30">
                  <p className="text-2xl font-serif italic text-amber-300/90">
                    "The true champion emerges when the dust settles"
                  </p>
                  <p className="text-sm text-amber-200/60 mt-4">
                    Leaderboard will open after Round 2 ends
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 via-background to-background" />
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}
      />

      <Header />

      <main className="flex-1 pt-24 pb-12 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 mb-6 shadow-lg">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-black text-transparent bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 bg-clip-text mb-4">
              GRAND FINALS QUALIFIERS
            </h1>
            <p className="text-xl font-serif text-amber-200/80 italic">
              "The Elite 25 - Legends Forged in Code and Cipher"
            </p>
            <p className="text-sm text-amber-300/60 mt-2">
              Top 25 teams - Combined scores from Round 1 + Round 2
            </p>
          </div>

          {/* Leaderboard */}
          <Card className="border-amber-600/30 bg-card/50 backdrop-blur-sm shadow-2xl">
            <CardHeader className="border-b border-amber-900/30 bg-gradient-to-r from-amber-950/50 to-transparent">
              <CardTitle className="text-2xl font-serif text-amber-100 flex items-center gap-3">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Grand Finals - Qualified Teams
              </CardTitle>
              <CardDescription className="font-serif text-amber-200/60">
                Top 25 teams qualified for the Grand Finals of MEDUSA 2.0
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {leaderboard.length === 0 ? (
                <div className="text-center py-16 text-amber-300/60">
                  <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-serif">No teams have solved the challenge yet.</p>
                  <p className="text-sm">Be the first to claim victory!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-amber-950/50 border-b-2 border-amber-600/30">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-amber-300">Rank</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-amber-300">Team</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-amber-300">University</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-amber-300">Total Points</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-amber-300">Challenges</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-900/20">
                      {leaderboard.slice(0, 25).map((entry) => {
                        const isMyTeam = entry.teamName === myTeamName;
                        return (
                          <tr
                            key={entry.rank}
                            className={`transition-colors ${isMyTeam
                              ? 'bg-purple-900/30 border-l-4 border-purple-500'
                              : entry.rank <= 3
                                ? 'bg-amber-950/20 hover:bg-amber-950/30'
                                : 'hover:bg-amber-950/10'
                              }`}
                          >
                            {/* Rank */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {getRankIcon(entry.rank)}
                                <Badge className={`${getRankBadgeColor(entry.rank)} px-3 py-1 font-bold`}>
                                  #{entry.rank}
                                </Badge>
                              </div>
                            </td>

                            {/* Team Name */}
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-semibold text-white text-lg">
                                  {entry.teamName}
                                  {isMyTeam && (
                                    <Badge className="ml-2 bg-purple-600 text-white">You</Badge>
                                  )}
                                </p>
                              </div>
                            </td>

                            {/* University */}
                            <td className="px-6 py-4 text-amber-200">{entry.university}</td>

                            {/* Total Points */}
                            <td className="px-6 py-4 text-center">
                              <div className="flex flex-col items-center">
                                <p className="text-2xl font-bold text-yellow-400">{entry.points}</p>
                                <p className="text-xs text-amber-300/60 mt-1">total points</p>
                              </div>
                            </td>

                            {/* Challenges Solved */}
                            <td className="px-6 py-4 text-center">
                              <Badge
                                variant="default"
                                className="bg-green-600 text-white px-3 py-1"
                              >
                                {entry.submissionCount} solved
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Leaderboard;
