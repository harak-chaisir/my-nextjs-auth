import Image from 'next/image';
import { User } from '@/types/admin';
import { getRoleBadgeStyle, getStatusBadgeStyle, formatDate } from '@/lib/utils/admin-utils';

export interface UserRowProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}

export function UserRow({ user, onEdit, onDelete }: UserRowProps) {
  const handleEdit = () => {
    if (onEdit) {
      onEdit(user);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(user);
    }
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="relative h-10 w-10 rounded-full overflow-hidden">
            <Image
              src={user.avatar}
              alt={`${user.name}'s avatar`}
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {user.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeStyle(user.role)}`}>
          {user.role}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeStyle(user.status)}`}>
          {user.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {formatDate(user.lastLogin)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button 
          onClick={handleEdit}
          disabled={!onEdit}
          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Edit ${user.name}`}
        >
          Edit
        </button>
        <button 
          onClick={handleDelete}
          disabled={!onDelete}
          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Delete ${user.name}`}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
