import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Trophy, Medal, Award, TrendingUp, Users, Clock, Target, Zap } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  university: string;
  points: number;
  attemptNumber: number;
  solvedAt: string;
  pointDeduction: number;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [myTeamId, setMyTeamId] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_ADMIN_BACKEND_URL|| 'http://localhost:3001';

  useEffect(() => {
    // Get current team ID from session storage
    const teamId = sessionStorage.getItem('round1_team_id');
    setMyTeamId(teamId);

    fetchLeaderboard();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/leaderboard`);
      const data = await response.json();

      if (data.success) {
        setLeaderboard(data.leaderboard);
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-amber-500 border-t-transparent mx-auto mb-4" />
          <p className="text-white text-lg font-serif">Loading Leaderboard...</p>
        </div>
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

      <main className="flex-1 py-12 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 mb-6 shadow-lg">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-black text-transparent bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 bg-clip-text mb-4">
              HALL OF CHAMPIONS
            </h1>
            <p className="text-xl font-serif text-amber-200/80 italic">
              "Glory to those who conquered the Oracle's challenge"
            </p>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="border-amber-600/30 bg-amber-950/20 backdrop-blur">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-amber-500" />
                    <div>
                      <p className="text-3xl font-bold text-white">{stats.totalTeams}</p>
                      <p className="text-sm text-amber-300">Total Teams</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-600/30 bg-green-950/20 backdrop-blur">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Target className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="text-3xl font-bold text-white">{stats.solvedTeams}</p>
                      <p className="text-sm text-green-300">Solved</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-600/30 bg-purple-950/20 backdrop-blur">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                    <div>
                      <p className="text-3xl font-bold text-white">{stats.solveRate}</p>
                      <p className="text-sm text-purple-300">Solve Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-600/30 bg-blue-950/20 backdrop-blur">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Zap className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-3xl font-bold text-white">{stats.totalSubmissions}</p>
                      <p className="text-sm text-blue-300">Submissions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Card className="mb-8 border-red-500/50 bg-red-950/30">
              <CardContent className="pt-6 text-center text-red-400">
                {error}
              </CardContent>
            </Card>
          )}

          {/* Leaderboard */}
          <Card className="border-amber-600/30 bg-card/50 backdrop-blur-sm shadow-2xl">
            <CardHeader className="border-b border-amber-900/30 bg-gradient-to-r from-amber-950/50 to-transparent">
              <CardTitle className="text-2xl font-serif text-amber-100 flex items-center gap-3">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Leaderboard - Round 1
              </CardTitle>
              <CardDescription className="font-serif text-amber-200/60">
                Teams ranked by points and solve time
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
                        <th className="px-6 py-4 text-center text-sm font-semibold text-amber-300">Points</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-amber-300">Attempts</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-amber-300">Solved At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-900/20">
                      {leaderboard.map((entry) => {
                        const isMyTeam = entry.teamId === myTeamId;
                        return (
                          <tr
                            key={entry.teamId}
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
                                <p className="text-xs text-amber-400/60 font-mono">{entry.teamId}</p>
                              </div>
                            </td>

                            {/* University */}
                            <td className="px-6 py-4 text-amber-200">{entry.university}</td>

                            {/* Points */}
                            <td className="px-6 py-4 text-center">
                              <div className="flex flex-col items-center">
                                <p className="text-2xl font-bold text-yellow-400">{entry.points}</p>
                                {entry.pointDeduction > 0 && (
                                  <Badge variant="destructive" className="text-xs mt-1">
                                    -{entry.pointDeduction * 100}% penalty
                                  </Badge>
                                )}
                              </div>
                            </td>

                            {/* Attempts */}
                            <td className="px-6 py-4 text-center">
                              <Badge
                                variant={entry.attemptNumber === 1 ? 'default' : 'secondary'}
                                className={entry.attemptNumber === 1 ? 'bg-green-600' : 'bg-orange-600'}
                              >
                                {entry.attemptNumber === 1 ? '1st try ⚡' : '2nd try'}
                              </Badge>
                            </td>

                            {/* Solved At */}
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2 text-amber-300">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-mono">{formatTime(entry.solvedAt)}</span>
                              </div>
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

          {/* Footer Note */}
          <div className="mt-8 text-center">
            <p className="text-sm text-amber-400/60 font-serif italic">
              🏆 Leaderboard updates automatically every 30 seconds
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Leaderboard;
