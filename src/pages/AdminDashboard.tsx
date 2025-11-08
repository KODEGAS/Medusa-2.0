import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ShieldCheck,
  LogOut,
  Users,
  Flag,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Submission {
  _id: string;
  flag: string;
  attemptNumber: number;
  pointDeduction: number;
  isCorrect: boolean;
  verified: boolean;
  submittedAt: string;
}

interface TeamInfo {
  teamId: string;
  teamName: string;
  university: string;
  leaderName?: string;
}

interface TeamSubmissions {
  teamInfo: TeamInfo;
  attempts: Submission[];
}

interface Statistics {
  teams: {
    total: number;
    withSubmissions: number;
    withTwoAttempts: number;
    participationRate: string;
  };
  submissions: {
    total: number;
    verified: number;
    correct: number;
    pending: number;
  };
}

const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState<Record<string, TeamSubmissions>>({});
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  // Get obscured paths from environment
  const ADMIN_API_PATH = import.meta.env.VITE_ADMIN_API_PATH || '9c8f7e3a2b1d4c5e6f7a8b9c0d1e2f3a';
  const ADMIN_LOGIN_PATH = import.meta.env.VITE_ADMIN_LOGIN_PATH || '7f3e9a2c1b5d8e4f6a0c7b3d9e1f5a2b';
  const ADMIN_BACKEND_URL = import.meta.env.VITE_ADMIN_BACKEND_URL || import.meta.env.VITE_API_URL;

  const adminToken = localStorage.getItem('adminToken');
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  useEffect(() => {
    if (!adminToken) {
      navigate(`/${ADMIN_LOGIN_PATH}`);
      return;
    }
    fetchData();
  }, [adminToken]);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch submissions using obscured API path
      const submissionsResponse = await fetch(
        `${ADMIN_BACKEND_URL}/api/${ADMIN_API_PATH}/submissions`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          },
        }
      );

      if (!submissionsResponse.ok) {
        if (submissionsResponse.status === 401) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          navigate(`/${ADMIN_LOGIN_PATH}`);
          return;
        }
        throw new Error('Failed to fetch submissions');
      }

      const submissionsData = await submissionsResponse.json();
      setSubmissions(submissionsData.submissions);

      // Fetch statistics using obscured API path
      const statsResponse = await fetch(
        `${ADMIN_BACKEND_URL}/api/${ADMIN_API_PATH}/statistics`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          },
        }
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStatistics(statsData.statistics);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate(`/${ADMIN_LOGIN_PATH}`);
  };

  const handleAutoVerify = async () => {
    if (!confirm('Auto-verify all unverified submissions against the correct flag?')) {
      return;
    }

    try {
      const response = await fetch(
        `${ADMIN_BACKEND_URL}/api/${ADMIN_API_PATH}/submissions/auto-verify`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(`✅ Verified ${data.verified} submissions\n✓ Correct: ${data.correct}\n✗ Incorrect: ${data.incorrect}`);
        fetchData(); // Refresh data
      } else {
        alert('Failed to auto-verify submissions');
      }
    } catch (err) {
      alert('Error auto-verifying submissions');
      console.error(err);
    }
  };

  const handleRecalculatePoints = async () => {
    if (!confirm('Recalculate points for all correct submissions based on submission time?')) {
      return;
    }

    try {
      const response = await fetch(
        `${ADMIN_BACKEND_URL}/api/${ADMIN_API_PATH}/submissions/recalculate-points`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(`✅ Recalculated points for ${data.updated} submissions`);
        fetchData(); // Refresh data
      } else {
        alert('Failed to recalculate points');
      }
    } catch (err) {
      alert('Error recalculating points');
      console.error(err);
    }
  };

  const toggleTeamExpansion = (teamId: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })
    };
  };

  const calculateTimeDifference = (attempt1: Submission, attempt2: Submission) => {
    const diff = new Date(attempt2.submittedAt).getTime() - new Date(attempt1.submittedAt).getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mx-auto mb-4" />
          <p className="text-white">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-purple-500" />
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400">Welcome, {adminUser.username}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleAutoVerify}
            variant="outline"
            className="border-green-500/50 text-green-400 hover:bg-green-500/10"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Auto-Verify All
          </Button>
          <Button
            onClick={handleRecalculatePoints}
            variant="outline"
            className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Recalculate Points
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/50">
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-purple-500/20 bg-slate-800/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{statistics.teams.total}</div>
              <p className="text-xs text-slate-400 mt-1">
                {statistics.teams.withSubmissions} participating ({statistics.teams.participationRate})
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/20 bg-slate-800/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Flag className="h-4 w-4" />
                Total Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{statistics.submissions.total}</div>
              <p className="text-xs text-slate-400 mt-1">
                {statistics.teams.withTwoAttempts} teams used both attempts
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/20 bg-slate-800/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Verified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{statistics.submissions.verified}</div>
              <p className="text-xs text-slate-400 mt-1">
                {statistics.submissions.correct} correct flags
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/20 bg-slate-800/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">{statistics.submissions.pending}</div>
              <p className="text-xs text-slate-400 mt-1">
                Awaiting verification
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Submissions Table */}
      <Card className="border-purple-500/20 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Flag Submissions by Team
          </CardTitle>
          <CardDescription className="text-slate-400">
            Detailed view of all team submissions with attempt times
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-700 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-900/50">
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Team</TableHead>
                  <TableHead className="text-slate-300">University</TableHead>
                  <TableHead className="text-slate-300 text-center">Attempts</TableHead>
                  <TableHead className="text-slate-300 text-center">Status</TableHead>
                  <TableHead className="text-slate-300 text-center">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(submissions).map(([teamId, teamData]) => (
                  <>
                    <TableRow 
                      key={teamId} 
                      className="border-slate-700 hover:bg-slate-900/50 cursor-pointer"
                      onClick={() => toggleTeamExpansion(teamId)}
                    >
                      <TableCell className="font-medium text-white">
                        <div>
                          <div className="font-semibold">{teamData.teamInfo.teamName}</div>
                          <div className="text-xs text-slate-400">{teamData.teamInfo.teamId}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {teamData.teamInfo.university}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={teamData.attempts.length === 2 ? "default" : "secondary"}
                          className={teamData.attempts.length === 2 ? "bg-orange-500" : "bg-blue-500"}
                        >
                          {teamData.attempts.length}/2
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {teamData.attempts.some(a => a.verified && a.isCorrect) ? (
                          <Badge className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Solved
                          </Badge>
                        ) : teamData.attempts.some(a => a.verified) ? (
                          <Badge className="bg-red-500">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Incorrect
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-purple-400 hover:text-purple-300"
                        >
                          {expandedTeams.has(teamId) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Details */}
                    {expandedTeams.has(teamId) && (
                      <TableRow className="border-slate-700 bg-slate-900/80">
                        <TableCell colSpan={5} className="p-6">
                          <div className="space-y-4">
                            {teamData.attempts.map((attempt, index) => {
                              const dt = formatDateTime(attempt.submittedAt);
                              const timeDiff = index === 1 && teamData.attempts.length === 2
                                ? calculateTimeDifference(teamData.attempts[0], teamData.attempts[1])
                                : null;

                              return (
                                <div 
                                  key={attempt._id}
                                  className="border border-slate-700 rounded-lg p-4 bg-slate-800/50"
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <h4 className="text-white font-semibold flex items-center gap-2">
                                        Attempt #{attempt.attemptNumber}
                                        {attempt.pointDeduction > 0 && (
                                          <Badge variant="destructive" className="text-xs">
                                            -{attempt.pointDeduction * 100}% penalty
                                          </Badge>
                                        )}
                                      </h4>
                                      <div className="flex items-center gap-4 mt-2 text-sm">
                                        <span className="text-slate-400 flex items-center gap-1">
                                          <Calendar className="h-3 w-3" />
                                          {dt.date}
                                        </span>
                                        <span className="text-purple-400 font-mono flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {dt.time}
                                        </span>
                                        {timeDiff && (
                                          <span className="text-orange-400 text-xs">
                                            <TrendingUp className="h-3 w-3 inline mr-1" />
                                            {timeDiff} after first attempt
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      {attempt.verified ? (
                                        attempt.isCorrect ? (
                                          <Badge className="bg-green-500">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Correct
                                          </Badge>
                                        ) : (
                                          <Badge className="bg-red-500">
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            Incorrect
                                          </Badge>
                                        )
                                      ) : (
                                        <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                                          <Clock className="h-3 w-3 mr-1" />
                                          Pending Verification
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="bg-slate-900 rounded p-3 border border-slate-700">
                                    <div className="text-xs text-slate-500 mb-1">Submitted Flag:</div>
                                    <code className="text-sm text-purple-300 font-mono break-all">
                                      {attempt.flag}
                                    </code>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>

          {Object.keys(submissions).length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Flag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No submissions yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
