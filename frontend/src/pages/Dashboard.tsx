import { useQuery } from 'react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function Dashboard() {
  const { currentOrganization } = useAuthStore();

  const { data: analytics } = useQuery(
    ['analytics', currentOrganization?.id],
    () => api.getAnalytics(currentOrganization!.id),
    { enabled: !!currentOrganization }
  );

  const stats = [
    { name: 'Total Posts', value: analytics?.data?.totalPosts || 0, icon: '📝' },
    { name: 'Total Impressions', value: analytics?.data?.totalImpressions || 0, icon: '👁️' },
    { name: 'Total Engagements', value: analytics?.data?.totalEngagements || 0, icon: '❤️' },
    { name: 'Engagement Rate', value: `${(analytics?.data?.averageEngagementRate || 0).toFixed(1)}%`, icon: '📊' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back! Here's your LinkedIn performance overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Posts</h2>
          <div className="space-y-3">
            <p className="text-gray-500 text-center py-8">No recent posts yet. Create your first post!</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Scheduled Posts</h2>
          <div className="space-y-3">
            <p className="text-gray-500 text-center py-8">No scheduled posts. Schedule your next post!</p>
          </div>
        </div>
      </div>

      <div className="mt-8 card bg-gradient-to-r from-linkedin-500 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Ready to automate your LinkedIn?</h3>
            <p className="text-linkedin-50">Generate AI-powered content and schedule your first post today.</p>
          </div>
          <button className="bg-white text-linkedin-600 px-6 py-3 rounded-lg font-medium hover:bg-linkedin-50 transition-colors">
            Create Post
          </button>
        </div>
      </div>
    </div>
  );
}
