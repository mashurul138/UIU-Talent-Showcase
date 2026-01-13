import { UserRole } from '../../utils/permissions';
import { getRoleTextColor, getRoleLabel } from '../../utils/permissions';

interface RoleBadgeProps {
  role: UserRole;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function RoleBadge({ role, showLabel = true, size = 'md' }: RoleBadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-bold ${sizeClasses[size]} ${getRoleTextColor(role)}`}
    >
      {role === 'admin' && <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />}
      {showLabel && getRoleLabel(role)}
    </div>
  );
}
