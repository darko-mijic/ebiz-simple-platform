import { useState } from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';

interface UserAvatarProps {
  profilePictureUrl?: string | null;
  firstName?: string;
  lastName?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UserAvatar({ 
  profilePictureUrl, 
  firstName = '', 
  lastName = '', 
  size = 'md',
  className = '',
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  
  // Determine size dimensions
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };
  
  // Determine font size for initials
  const fontSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  
  // Get user initials for fallback
  const getInitials = () => {
    const firstInitial = firstName?.charAt(0) || '';
    const lastInitial = lastName?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase();
  };
  
  // Render profile picture if available and no error loading it
  if (profilePictureUrl && !imageError) {
    return (
      <div className={`${sizeClasses[size]} ${className} relative rounded-full overflow-hidden`}>
        <Image
          src={profilePictureUrl}
          alt={`${firstName} ${lastName}`}
          fill
          sizes={size === 'sm' ? '32px' : size === 'md' ? '40px' : '48px'}
          className="object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }
  
  // Fallback: render initials or generic user icon
  return (
    <div className={`${sizeClasses[size]} ${className} bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center`}>
      {getInitials() ? (
        <span className={`${fontSizeClasses[size]} text-gray-600 dark:text-white font-medium`}>
          {getInitials()}
        </span>
      ) : (
        <User className="h-4 w-4 text-gray-600 dark:text-white" />
      )}
    </div>
  );
} 