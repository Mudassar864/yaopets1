import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Donor badge levels (English)
export enum DonorBadgeLevel {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond'
}

// Info for each donor badge level (English)
export const DONOR_BADGE_INFO = {
  [DonorBadgeLevel.BRONZE]: {
    label: 'Bronze Donor',
    description: 'Made at least 1 donation to help animals',
    icon: '🥉',
    color: 'bg-amber-600 hover:bg-amber-700'
  },
  [DonorBadgeLevel.SILVER]: {
    label: 'Silver Donor',
    description: 'Made at least 3 donations to help animals',
    icon: '🥈',
    color: 'bg-slate-400 hover:bg-slate-500'
  },
  [DonorBadgeLevel.GOLD]: {
    label: 'Gold Donor',
    description: 'Made at least 5 donations to help animals',
    icon: '🥇',
    color: 'bg-yellow-500 hover:bg-yellow-600'
  },
  [DonorBadgeLevel.PLATINUM]: {
    label: 'Platinum Donor',
    description: 'Made at least 10 donations to help animals',
    icon: '💎',
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  [DonorBadgeLevel.DIAMOND]: {
    label: 'Diamond Donor',
    description: 'Made at least 20 donations to help animals',
    icon: '💖',
    color: 'bg-pink-500 hover:bg-pink-600'
  }
};

type DonorBadgeProps = {
  level: DonorBadgeLevel;
  size?: 'sm' | 'md' | 'lg';
};

export const DonorBadge: React.FC<DonorBadgeProps> = ({ level, size = 'md' }) => {
  const badgeInfo = DONOR_BADGE_INFO[level];
  
  if (!badgeInfo) return null;
  
  const sizeClasses = {
    sm: 'text-xs py-0 px-2',
    md: 'text-sm py-1 px-2.5',
    lg: 'text-base py-1.5 px-3'
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`${badgeInfo.color} ${sizeClasses[size]} font-medium cursor-help`}>
            <span className="mr-1">{badgeInfo.icon}</span>
            {badgeInfo.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{badgeInfo.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Component to display all badges for a user
type DonorBadgesCollectionProps = {
  badges: DonorBadgeLevel[];
  size?: 'sm' | 'md' | 'lg';
};

export const DonorBadgesCollection: React.FC<DonorBadgesCollectionProps> = ({ 
  badges, 
  size = 'md' 
}) => {
  if (!badges || badges.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge, index) => (
        <DonorBadge key={index} level={badge} size={size} />
      ))}
    </div>
  );
};

export default DonorBadge;