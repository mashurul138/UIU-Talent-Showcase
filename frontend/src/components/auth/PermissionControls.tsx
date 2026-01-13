import { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { canUpload, canAccessGarbageBin, canAccessAdminTools } from '../../utils/permissions';

interface UploadButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function UploadButton({ children, onClick, disabled = false, className = '' }: UploadButtonProps) {
  const { user } = useAuth();

  if (!canUpload(user)) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/30 ${className}`}
    >
      {children}
    </button>
  );
}

interface GarbageBinButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function GarbageBinButton({ children, onClick, className = '' }: GarbageBinButtonProps) {
  const { user } = useAuth();

  if (!canAccessGarbageBin(user)) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className={`bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

interface AdminToolsProps {
  children: ReactNode;
}

export function AdminTools({ children }: AdminToolsProps) {
  const { user } = useAuth();

  if (!canAccessAdminTools(user)) {
    return null;
  }

  return <>{children}</>;
}

interface ProfileLinkProps {
  children: ReactNode;
}

export function ProfileLink({ children }: ProfileLinkProps) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
