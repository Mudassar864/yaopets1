import React from 'react';

type UserLevelBadgeProps = {
  level: string;
  compact?: boolean;
};

const LEVEL_NAME_MAP: Record<string, string> = {
  'Iniciante': 'Beginner',
  'Protetor': 'Protector',
  'Guardião': 'Guardian',
  'Anjo dos Pets': 'Pet Angel',
  'Herói Animal': 'Animal Hero'
};

const LEVEL_COLOR_MAP: Record<string, string> = {
  'Beginner': 'bg-slate-100 text-slate-800',
  'Protector': 'bg-blue-100 text-blue-800',
  'Guardian': 'bg-purple-100 text-purple-800',
  'Pet Angel': 'bg-pink-100 text-pink-800',
  'Animal Hero': 'bg-yellow-100 text-yellow-800'
};

const UserLevelBadge: React.FC<UserLevelBadgeProps> = ({ level, compact = false }) => {
  // Translate level to English if needed
  const translated = LEVEL_NAME_MAP[level] || level;
  const color = LEVEL_COLOR_MAP[translated] || 'bg-gray-100 text-gray-800';

  // CSS class based on size
  const className = compact 
    ? `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`
    : `inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`;

  return (
    <div className={className}>
      <span className="material-icons text-xs mr-1">emoji_events</span>
      {translated}
    </div>
  );
};

export default UserLevelBadge;