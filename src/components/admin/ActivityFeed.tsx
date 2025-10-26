import { ActivityItem } from '@/types/admin';
import { getActivityDotColor } from '@/lib/utils/admin-utils';

export interface ActivityFeedProps {
  activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Recent Activity
      </h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start">
            <div className={`mt-1 w-2 h-2 rounded-full ${getActivityDotColor(activity.type)}`} />
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {activity.user}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {activity.action}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {activity.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
