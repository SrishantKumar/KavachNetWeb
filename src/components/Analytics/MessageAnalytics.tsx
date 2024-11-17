import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { usePermissions } from '../../hooks/usePermissions';
import { BarChart, PieChart, Calendar, TrendingUp, Filter } from 'lucide-react';
import { Message } from '../../hooks/useFirestore';

interface AnalyticsData {
  totalMessages: number;
  threatLevels: {
    low: number;
    medium: number;
    high: number;
  };
  algorithmUsage: {
    [key: string]: number;
  };
  patternFrequency: {
    [key: string]: number;
  };
  dailyActivity: {
    [key: string]: number;
  };
}

interface MessageAnalyticsProps {
  workspaceId: string;
}

const MessageAnalytics: React.FC<MessageAnalyticsProps> = ({ workspaceId }) => {
  const { checkPermission } = usePermissions(workspaceId);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!checkPermission('canViewAnalytics')) return;

      try {
        setLoading(true);
        const startDate = new Date();
        startDate.setDate(
          startDate.getDate() -
            (timeRange === 'day' ? 1 : timeRange === 'week' ? 7 : 30)
        );

        const q = query(
          collection(db, `workspaces/${workspaceId}/messages`),
          where('timestamp', '>=', startDate.getTime()),
          orderBy('timestamp', 'desc')
        );

        const snapshot = await getDocs(q);
        const messages = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Message)
        );

        // Calculate analytics
        const analyticsData: AnalyticsData = {
          totalMessages: messages.length,
          threatLevels: {
            low: 0,
            medium: 0,
            high: 0,
          },
          algorithmUsage: {},
          patternFrequency: {},
          dailyActivity: {},
        };

        messages.forEach((message) => {
          // Threat levels
          analyticsData.threatLevels[message.threatLevel]++;

          // Algorithm usage
          if (message.algorithm) {
            analyticsData.algorithmUsage[message.algorithm] =
              (analyticsData.algorithmUsage[message.algorithm] || 0) + 1;
          }

          // Pattern frequency
          message.patterns?.forEach((pattern) => {
            analyticsData.patternFrequency[pattern] =
              (analyticsData.patternFrequency[pattern] || 0) + 1;
          });

          // Daily activity
          const date = new Date(message.timestamp).toLocaleDateString();
          analyticsData.dailyActivity[date] =
            (analyticsData.dailyActivity[date] || 0) + 1;
        });

        setAnalytics(analyticsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [workspaceId, timeRange]);

  if (!checkPermission('canViewAnalytics')) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-8">
        Failed to load analytics: {error}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-gray-400 text-center p-8">No data available</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Message Analytics</h2>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={timeRange}
            onChange={(e) =>
              setTimeRange(e.target.value as 'day' | 'week' | 'month')
            }
            className="bg-gray-800 border border-gray-700 rounded text-white px-3 py-1"
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Threat Level Distribution */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-red-500/10">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-medium text-white">Threat Levels</h3>
          </div>
          <div className="space-y-2">
            {Object.entries(analytics.threatLevels).map(([level, count]) => (
              <div key={level} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      level === 'high'
                        ? 'bg-red-500'
                        : level === 'medium'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                  />
                  <span className="text-gray-400 capitalize">{level}</span>
                </div>
                <span className="text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Algorithm Usage */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-red-500/10">
          <div className="flex items-center gap-2 mb-4">
            <BarChart className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-medium text-white">Algorithm Usage</h3>
          </div>
          <div className="space-y-2">
            {Object.entries(analytics.algorithmUsage).map(([algo, count]) => (
              <div key={algo} className="flex justify-between items-center">
                <span className="text-gray-400">{algo}</span>
                <span className="text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Activity */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-red-500/10">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-medium text-white">Daily Activity</h3>
          </div>
          <div className="space-y-2">
            {Object.entries(analytics.dailyActivity)
              .slice(-5)
              .map(([date, count]) => (
                <div key={date} className="flex justify-between items-center">
                  <span className="text-gray-400">{date}</span>
                  <span className="text-white">{count} messages</span>
                </div>
              ))}
          </div>
        </div>

        {/* Pattern Analysis */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-red-500/10 lg:col-span-3">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-medium text-white">Common Patterns</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(analytics.patternFrequency)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 6)
              .map(([pattern, count]) => (
                <div
                  key={pattern}
                  className="bg-gray-800 rounded p-3 flex justify-between items-center"
                >
                  <span className="text-gray-400">{pattern}</span>
                  <span className="text-white font-medium">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageAnalytics;
