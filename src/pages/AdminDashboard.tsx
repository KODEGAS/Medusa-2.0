import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
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
  ChevronUp,
  Edit,
  Send,
  Trophy,
  Lightbulb,
  Target
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
  round: number;
  challengeType?: string;
  attemptNumber: number;
  pointDeduction: number;
  isCorrect: boolean;
  verified: boolean;
  submittedAt: string;
  points?: number;
}

interface TeamInfo {
  teamId: string;
  teamName: string;
  university: string;
  leaderName?: string;
}

interface HintInfo {
  hintNumber: number;
  pointCost: number;
  unlockedAt: string;
}

interface TeamHints {
  android: HintInfo[];
  pwn: HintInfo[];
}

interface TeamSubmissions {
  teamInfo: TeamInfo;
  hints: TeamHints;
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

interface Round2Statistics {
  teams: {
    total: number;
    inRound2: number;
    participationRate: string;
  };
  hints: Array<{
    challengeType: string;
    totalUnlocks: number;
    uniqueTeams: number;
    totalPointsSpent: number;
  }>;
  flags: {
    totalSubmissions: number;
    correctSubmissions: number;
  };
}

interface Settings {
  leaderboard_enabled: {
    value: boolean;
    description: string;
    updatedAt: string;
    updatedBy: string;
  };
  round1_start_time?: {
    value: string;
    description: string;
    updatedAt: string;
    updatedBy: string;
  };
  round2_start_time?: {
    value: string;
    description: string;
    updatedAt: string;
    updatedBy: string;
  };
}

const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState<Record<string, TeamSubmissions>>({});
  const [round2Submissions, setRound2Submissions] = useState<Record<string, TeamSubmissions>>({});
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [round2Statistics, setRound2Statistics] = useState<Round2Statistics | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [editingSubmissionId, setEditingSubmissionId] = useState<string | null>(null);
  const [editingTime, setEditingTime] = useState<string>('');
  const [showManualSubmit, setShowManualSubmit] = useState(false);
  const [manualTeamId, setManualTeamId] = useState('');
  const [manualFlag, setManualFlag] = useState('');
  const [manualSubmitTime, setManualSubmitTime] = useState('');
  const [activeTab, setActiveTab] = useState<'round1' | 'round2' | 'settings'>('round1');
  const navigate = useNavigate();

  // Get obscured paths from environment
  const ADMIN_API_PATH = import.meta.env.VITE_ADMIN_API_PATH;
  const ADMIN_LOGIN_PATH = import.meta.env.VITE_ADMIN_LOGIN_PATH ;
  const ADMIN_BACKEND_URL = import.meta.env.VITE_ADMIN_BACKEND_URL || import.meta.env.VITE_API_URL;

  const adminToken = localStorage.getItem('adminToken');
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  useEffect(() => {
    if (!adminToken) {
      navigate(`/${ADMIN_LOGIN_PATH}`);
      return;
    }
    fetchData();
    fetchRound2Submissions();
    fetchRound2Data();
    fetchSettings();
  }, [adminToken]);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch Round 1 submissions using obscured API path
      const submissionsResponse = await fetch(
        `${ADMIN_BACKEND_URL}/api/${ADMIN_API_PATH}/submissions?round=1`,
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

  const fetchRound2Submissions = async () => {
    try {
      const response = await fetch(
        `${ADMIN_BACKEND_URL}/api/${ADMIN_API_PATH}/submissions?round=2`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRound2Submissions(data.submissions);
      }
    } catch (err: any) {
      console.error('Failed to fetch Round 2 submissions:', err);
    }
  };

  const fetchRound2Data = async () => {
    try {
      const response = await fetch(
        `${ADMIN_BACKEND_URL}/api/${ADMIN_API_PATH}/round2/statistics`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRound2Statistics(data.statistics);
      }
    } catch (err: any) {
      console.error('Failed to fetch Round 2 data:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch(
        `${ADMIN_BACKEND_URL}/api/${ADMIN_API_PATH}/settings`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (err: any) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const handleToggleLeaderboard = async (enabled: boolean) => {
    try {
      const response = await fetch(
        `${ADMIN_BACKEND_URL}/api/${ADMIN_API_PATH}/settings/leaderboard_enabled`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ value: enabled }),
        }
      );

      if (response.ok) {
        alert(`✅ Leaderboard ${enabled ? 'enabled' : 'disabled'} successfully`);
        fetchSettings(); // Refresh settings
      } else {
        alert('Failed to update leaderboard setting');
      }
    } catch (err) {
      alert('Error updating leaderboard setting');
      console.error(err);
    }
  };

  const handleUpdateRoundStartTime = async (round: number, dateTimeValue: string) => {
    if (!dateTimeValue) {
      alert('Please enter a valid date and time');
      return;
    }

    try {
      const localDate = new Date(dateTimeValue);
      const isoString = localDate.toISOString();
      const key = round === 1 ? 'round1_start_time' : 'round2_start_time';

      const response = await fetch(
        `${ADMIN_BACKEND_URL}/api/${ADMIN_API_PATH}/settings/${key}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ value: isoString }),
        }
      );

      if (response.ok) {
        alert(`✅ Round ${round} start time updated successfully\nNew time: ${localDate.toLocaleString()}`);
        fetchSettings(); // Refresh settings
      } else {
        alert(`Failed to update Round ${round} start time`);
      }
    } catch (err) {
      alert(`Error updating Round ${round} start time`);
      console.error(err);
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

  const handleUpdateSubmissionTime = async (submissionId: string, newTime: string) => {
    if (!newTime) {
      alert('Please enter a valid date and time');
      return;
    }

    try {
      // Convert datetime-local string to ISO string with proper timezone
      // datetime-local gives us "2025-11-08T19:30" which is in local time
      // We need to convert it to a full ISO string with timezone
      const localDate = new Date(newTime);
      const isoString = localDate.toISOString();

      const response = await fetch(
        `${ADMIN_BACKEND_URL}/api/${ADMIN_API_PATH}/submissions/${submissionId}/update-time`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ submittedAt: isoString }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(`✅ Submission time updated successfully\nNew time: ${new Date(data.submission.submittedAt).toLocaleString()}`);
        setEditingSubmissionId(null);
        setEditingTime('');
        fetchData(); // Refresh data
      } else {
        alert('Failed to update submission time: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error updating submission time');
      console.error(err);
    }
  };

  const startEditingTime = (submissionId: string, currentTime: string) => {
    setEditingSubmissionId(submissionId);
    // Format for datetime-local input
    // Convert from ISO string to local datetime string (YYYY-MM-DDTHH:mm)
    const date = new Date(currentTime);
    // Get local datetime string by adjusting for timezone offset
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}T${hours}:${minutes}`;
    setEditingTime(formatted);
  };

  const cancelEditingTime = () => {
    setEditingSubmissionId(null);
    setEditingTime('');
  };

  const handleManualSubmit = async () => {
    if (!manualTeamId || !manualFlag) {
      alert('Please enter both Team ID and Flag');
      return;
    }

    try {
      const payload: any = {
        teamId: manualTeamId.trim(),
        flag: manualFlag.trim(),
      };

      // Only include submittedAt if provided
      if (manualSubmitTime) {
        payload.submittedAt = manualSubmitTime;
      }

      const response = await fetch(
        `${ADMIN_BACKEND_URL}/api/${ADMIN_API_PATH}/submissions/manual-submit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(`${data.message}\n\nTeam: ${data.submission.teamName}\nAttempt: ${data.submission.attemptNumber}/2\nPoints: ${data.submission.points}\nRemaining Attempts: ${data.submission.remainingAttempts}`);
        // Reset form
        setManualTeamId('');
        setManualFlag('');
        setManualSubmitTime('');
        setShowManualSubmit(false);
        fetchData(); // Refresh data
      } else {
        alert('Failed to submit flag: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error submitting flag manually');
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

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('round1')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'round1'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Flag className="inline-block h-4 w-4 mr-2" />
          Round 1
        </button>
        <button
          onClick={() => setActiveTab('round2')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'round2'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Target className="inline-block h-4 w-4 mr-2" />
          Round 2
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'settings'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Trophy className="inline-block h-4 w-4 mr-2" />
          Settings
        </button>
      </div>

      {/* Round 1 Content */}
      {activeTab === 'round1' && (<>
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

      {/* Manual Flag Submission */}
      <Card className="border-blue-500/20 bg-slate-800/50 mb-8">
        <CardHeader 
          className="cursor-pointer hover:bg-slate-800/70 transition-colors"
          onClick={() => setShowManualSubmit(!showManualSubmit)}
        >
          <CardTitle className="text-white flex items-center gap-2">
            <Send className="h-5 w-5" />
            Manual Flag Submission
            <ChevronDown className={`h-5 w-5 ml-auto transition-transform ${showManualSubmit ? 'rotate-180' : ''}`} />
          </CardTitle>
          <CardDescription className="text-slate-400">
            Submit flags on behalf of teams (for technical issues)
          </CardDescription>
        </CardHeader>
        {showManualSubmit && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Team ID *</label>
                <input
                  type="text"
                  value={manualTeamId}
                  onChange={(e) => setManualTeamId(e.target.value)}
                  placeholder="e.g., ro1EA15"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Submission Time (optional)</label>
                <input
                  type="datetime-local"
                  value={manualSubmitTime}
                  onChange={(e) => setManualSubmitTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-blue-500 focus:outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">Leave empty to use current time</p>
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Flag *</label>
              <input
                type="text"
                value={manualFlag}
                onChange={(e) => setManualFlag(e.target.value)}
                placeholder="MEDUSA{...}"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleManualSubmit}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="mr-2 h-4 w-4" />
                Submit Flag
              </Button>
              <Button
                onClick={() => {
                  setManualTeamId('');
                  setManualFlag('');
                  setManualSubmitTime('');
                }}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                Clear Form
              </Button>
            </div>
            <Alert className="bg-blue-500/10 border-blue-500/50">
              <AlertDescription className="text-blue-300 text-sm">
                ⚠️ This will create a flag submission as if the team submitted it themselves. The flag will be auto-verified and points calculated automatically.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

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
                                      {editingSubmissionId === attempt._id ? (
                                        <div className="flex items-center gap-2 mt-2">
                                          <input
                                            type="datetime-local"
                                            value={editingTime}
                                            onChange={(e) => setEditingTime(e.target.value)}
                                            className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                                          />
                                          <Button
                                            size="sm"
                                            onClick={() => handleUpdateSubmissionTime(attempt._id, editingTime)}
                                            className="bg-green-600 hover:bg-green-700 text-xs"
                                          >
                                            Save
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={cancelEditingTime}
                                            className="text-xs"
                                          >
                                            Cancel
                                          </Button>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-4 mt-2 text-sm">
                                          <span className="text-slate-400 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {dt.date}
                                          </span>
                                          <span className="text-purple-400 font-mono flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {dt.time}
                                          </span>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => startEditingTime(attempt._id, attempt.submittedAt)}
                                            className="text-blue-400 hover:text-blue-300 text-xs h-6 px-2"
                                          >
                                            <Edit className="h-3 w-3 mr-1" />
                                            Edit Time
                                          </Button>
                                          {timeDiff && (
                                            <span className="text-orange-400 text-xs">
                                              <TrendingUp className="h-3 w-3 inline mr-1" />
                                              {timeDiff} after first attempt
                                            </span>
                                          )}
                                        </div>
                                      )}
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
      </>)}

      {/* Round 2 Content */}
      {activeTab === 'round2' && round2Statistics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-emerald-500/20 bg-slate-800/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Round 2 Participation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-400">{round2Statistics.teams.inRound2}</div>
                <p className="text-xs text-slate-400 mt-1">
                  of {round2Statistics.teams.total} teams ({round2Statistics.teams.participationRate})
                </p>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/20 bg-slate-800/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Hints Unlocked
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-400">
                  {round2Statistics.hints.reduce((sum, h) => sum + h.totalUnlocks, 0)}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {round2Statistics.hints.reduce((sum, h) => sum + h.totalPointsSpent, 0)} points spent
                </p>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/20 bg-slate-800/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  Flag Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-400">
                  {round2Statistics.flags.totalSubmissions}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {round2Statistics.flags.correctSubmissions} correct
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {round2Statistics.hints.map((hintStat) => (
              <Card key={hintStat.challengeType} className="border-emerald-500/20 bg-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 capitalize">
                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                    {hintStat.challengeType} Hints
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total Unlocks:</span>
                    <span className="text-white font-semibold">{hintStat.totalUnlocks}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Unique Teams:</span>
                    <span className="text-white font-semibold">{hintStat.uniqueTeams}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Points Spent:</span>
                    <span className="text-yellow-400 font-semibold">{hintStat.totalPointsSpent}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Round 2 Submissions Table */}
          <Card className="border-emerald-500/20 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Flag className="h-5 w-5" />
                Round 2 Flag Submissions by Team
              </CardTitle>
              <CardDescription className="text-slate-400">
                Detailed view of all Round 2 submissions (Android, PWN-User, PWN-Root)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-slate-700 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-900/50">
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Team</TableHead>
                      <TableHead className="text-slate-300">University</TableHead>
                      <TableHead className="text-slate-300 text-center">Submissions</TableHead>
                      <TableHead className="text-slate-300 text-center">Status</TableHead>
                      <TableHead className="text-slate-300 text-center">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(round2Submissions).map(([teamId, teamData]) => (
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
                              variant="default"
                              className="bg-emerald-500"
                            >
                              {teamData.attempts.length} flags
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {teamData.attempts.some(a => a.verified && a.isCorrect) ? (
                              <Badge className="bg-green-500">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Solved ({teamData.attempts.filter(a => a.isCorrect).length})
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
                              className="text-emerald-400 hover:text-emerald-300"
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
                              {/* Hints Section */}
                              {teamData.hints && (teamData.hints.android.length > 0 || teamData.hints.pwn.length > 0) && (
                                <div className="mb-6 p-4 bg-slate-800/30 border border-yellow-500/20 rounded-lg">
                                  <h4 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4" />
                                    Hints Unlocked
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Android Hints */}
                                    {teamData.hints.android.length > 0 && (
                                      <div>
                                        <div className="text-sm font-semibold text-emerald-400 mb-2">Android Challenge</div>
                                        <div className="space-y-2">
                                          {teamData.hints.android.map((hint) => (
                                            <div key={hint.hintNumber} className="flex items-center justify-between text-sm bg-slate-900/50 p-2 rounded">
                                              <span className="text-slate-300">Hint #{hint.hintNumber}</span>
                                              <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                                                  -{hint.pointCost} pts
                                                </Badge>
                                                <span className="text-xs text-slate-500">
                                                  {new Date(hint.unlockedAt).toLocaleTimeString()}
                                                </span>
                                              </div>
                                            </div>
                                          ))}
                                          <div className="text-xs text-slate-400 mt-2">
                                            Total: -{teamData.hints.android.reduce((sum, h) => sum + h.pointCost, 0)} points
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* PWN Hints */}
                                    {teamData.hints.pwn.length > 0 && (
                                      <div>
                                        <div className="text-sm font-semibold text-red-400 mb-2">PWN Challenge</div>
                                        <div className="space-y-2">
                                          {teamData.hints.pwn.map((hint) => (
                                            <div key={hint.hintNumber} className="flex items-center justify-between text-sm bg-slate-900/50 p-2 rounded">
                                              <span className="text-slate-300">Hint #{hint.hintNumber}</span>
                                              <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                                                  -{hint.pointCost} pts
                                                </Badge>
                                                <span className="text-xs text-slate-500">
                                                  {new Date(hint.unlockedAt).toLocaleTimeString()}
                                                </span>
                                              </div>
                                            </div>
                                          ))}
                                          <div className="text-xs text-slate-400 mt-2">
                                            Total: -{teamData.hints.pwn.reduce((sum, h) => sum + h.pointCost, 0)} points
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Flag Submissions */}
                              <div className="space-y-4">
                                {teamData.attempts.map((attempt) => {
                                  const dt = formatDateTime(attempt.submittedAt);

                                  return (
                                    <div 
                                      key={attempt._id}
                                      className="border border-slate-700 rounded-lg p-4 bg-slate-800/50"
                                    >
                                      <div className="flex items-start justify-between mb-3">
                                        <div>
                                          <h4 className="text-white font-semibold flex items-center gap-2">
                                            {attempt.challengeType && (
                                              <Badge variant="outline" className="capitalize">
                                                {attempt.challengeType}
                                              </Badge>
                                            )}
                                            Attempt #{attempt.attemptNumber}
                                            {attempt.pointDeduction > 0 && (
                                              <Badge variant="destructive" className="text-xs">
                                                -{attempt.pointDeduction * 100}% penalty
                                              </Badge>
                                            )}
                                            {attempt.points !== undefined && (
                                              <Badge className="bg-emerald-600 text-xs">
                                                {attempt.points} points
                                              </Badge>
                                            )}
                                          </h4>
                                          <div className="flex items-center gap-4 mt-2 text-sm">
                                            <span className="text-slate-400 flex items-center gap-1">
                                              <Calendar className="h-3 w-3" />
                                              {dt.date}
                                            </span>
                                            <span className="text-emerald-400 font-mono flex items-center gap-1">
                                              <Clock className="h-3 w-3" />
                                              {dt.time}
                                            </span>
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
                                        <code className="text-sm text-emerald-300 font-mono break-all">
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

              {Object.keys(round2Submissions).length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <Flag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No Round 2 submissions yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Settings Content */}
      {activeTab === 'settings' && settings && (
        <Card className="border-blue-500/20 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Application Settings
            </CardTitle>
            <CardDescription className="text-slate-400">
              Control application features and visibility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">Leaderboard Visibility</h3>
                <p className="text-sm text-slate-400">
                  {settings.leaderboard_enabled.description}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Last updated: {new Date(settings.leaderboard_enabled.updatedAt).toLocaleString()} by {settings.leaderboard_enabled.updatedBy}
                </p>
              </div>
              <Switch
                checked={settings.leaderboard_enabled.value}
                onCheckedChange={handleToggleLeaderboard}
                className="ml-4"
              />
            </div>

            <Alert className={settings.leaderboard_enabled.value ? "bg-green-500/10 border-green-500/50" : "bg-red-500/10 border-red-500/50"}>
              <AlertDescription className={settings.leaderboard_enabled.value ? "text-green-300" : "text-red-300"}>
                {settings.leaderboard_enabled.value 
                  ? "✅ Leaderboard is currently VISIBLE to all users"
                  : "🔒 Leaderboard is currently HIDDEN from users"}
              </AlertDescription>
            </Alert>

            {/* Round 1 Start Time */}
            {settings.round1_start_time && (
              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-3">
                <div>
                  <h3 className="text-white font-semibold mb-1">Round 1 Start Time</h3>
                  <p className="text-sm text-slate-400">
                    {settings.round1_start_time.description}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Current: {new Date(settings.round1_start_time.value).toLocaleString()} (IST)
                  </p>
                  {settings.round1_start_time.updatedAt && (
                    <p className="text-xs text-slate-500">
                      Last updated: {new Date(settings.round1_start_time.updatedAt).toLocaleString()} by {settings.round1_start_time.updatedBy}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-sm text-slate-400 mb-1 block">New Start Time:</label>
                    <input
                      type="datetime-local"
                      id="round1-time-input"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                      defaultValue={new Date(settings.round1_start_time.value).toISOString().slice(0, 16)}
                    />
                  </div>
                  <Button
                    onClick={() => {
                      const input = document.getElementById('round1-time-input') as HTMLInputElement;
                      if (input?.value) {
                        handleUpdateRoundStartTime(1, input.value);
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Update Round 1
                  </Button>
                </div>
              </div>
            )}

            {/* Round 2 Start Time */}
            {settings.round2_start_time && (
              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-3">
                <div>
                  <h3 className="text-white font-semibold mb-1">Round 2 Start Time</h3>
                  <p className="text-sm text-slate-400">
                    {settings.round2_start_time.description}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Current: {new Date(settings.round2_start_time.value).toLocaleString()} (IST)
                  </p>
                  {settings.round2_start_time.updatedAt && (
                    <p className="text-xs text-slate-500">
                      Last updated: {new Date(settings.round2_start_time.updatedAt).toLocaleString()} by {settings.round2_start_time.updatedBy}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-sm text-slate-400 mb-1 block">New Start Time:</label>
                    <input
                      type="datetime-local"
                      id="round2-time-input"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                      defaultValue={new Date(settings.round2_start_time.value).toISOString().slice(0, 16)}
                    />
                  </div>
                  <Button
                    onClick={() => {
                      const input = document.getElementById('round2-time-input') as HTMLInputElement;
                      if (input?.value) {
                        handleUpdateRoundStartTime(2, input.value);
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Update Round 2
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
