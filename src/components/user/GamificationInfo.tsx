import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface GamificationInfoProps {
  points: number;
  level: string;
  badges?: string[];
}

const LEVELS = {
  'Beginner': { min: 0, max: 99, next: 'Protector' },
  'Protector': { min: 100, max: 299, next: 'Guardian' },
  'Guardian': { min: 300, max: 599, next: 'Pet Angel' },
  'Pet Angel': { min: 600, max: 999, next: 'Animal Hero' },
  'Animal Hero': { min: 1000, max: Number.MAX_SAFE_INTEGER, next: null }
};

export default function GamificationInfo({ points, level, badges = [] }: GamificationInfoProps) {
  // Calculate progress to next level
  const currentLevelInfo = LEVELS[level as keyof typeof LEVELS] || LEVELS.Beginner;
  const nextLevel = currentLevelInfo.next;

  let progressPercent = 0;
  let pointsToNextLevel = 0;

  if (nextLevel) {
    const nextLevelInfo = LEVELS[nextLevel as keyof typeof LEVELS];
    const totalPointsInLevel = currentLevelInfo.max - currentLevelInfo.min;
    const pointsInCurrentLevel = points - currentLevelInfo.min;

    progressPercent = Math.min(100, Math.floor((pointsInCurrentLevel / totalPointsInLevel) * 100));
    pointsToNextLevel = currentLevelInfo.max - points + 1;
  } else {
    progressPercent = 100; // Max level
  }

  const getBadgeColor = (badge: string) => {
    const colors: Record<string, string> = {
      'Rescuer': 'bg-blue-100 text-blue-800',
      'Generous Donor': 'bg-green-100 text-green-800',
      'Paw Angel': 'bg-purple-100 text-purple-800',
      'Dedicated Volunteer': 'bg-orange-100 text-orange-800',
      'Starter Protector': 'bg-pink-100 text-pink-800',
    };

    return colors[badge] || 'bg-neutral-100 text-neutral-800';
  };

  // Optional: Map legacy badge names (Portuguese) to English for color support
  const badgeNameMap: Record<string, string> = {
    'Resgatador': 'Rescuer',
    'Doador Generoso': 'Generous Donor',
    'Anjo de Patas': 'Paw Angel',
    'Voluntário Dedicado': 'Dedicated Volunteer',
    'Protetor Iniciante': 'Starter Protector',
  };

  const translateBadge = (badge: string) => badgeNameMap[badge] || badge;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Your Progress</CardTitle>
        <CardDescription>
          Keep helping the community to earn more points
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-2">
          <div className="space-y-1">
            <div className="text-2xl font-bold">{points}</div>
            <div className="text-xs text-neutral-500">accumulated points</div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
              <span className="material-icons text-sm mr-1">emoji_events</span>
              {level}
            </div>
          </div>
        </div>

        {nextLevel && (
          <div className="mb-5">
            <div className="flex justify-between text-xs mb-1">
              <span>{level}</span>
              <span>{nextLevel}</span>
            </div>
            <div className="space-y-1">
              <Progress value={progressPercent} className="h-2" />
              <div className="text-xs text-neutral-500 text-right">
                {pointsToNextLevel} points to reach the next level
              </div>
            </div>
          </div>
        )}

        {badges.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Achievements</h4>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, index) => (
                <Badge key={index} className={getBadgeColor(translateBadge(badge))}>{translateBadge(badge)}</Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 border-t pt-4">
          <h4 className="text-sm font-medium mb-2">How to earn points</h4>
          <ul className="text-xs text-neutral-600 space-y-2">
            <li className="flex items-start">
              <span className="material-icons text-primary text-sm mr-1">add_circle</span>
              <span>Share posts: <span className="font-medium">+5 points</span></span>
            </li>
            <li className="flex items-start">
              <span className="material-icons text-primary text-sm mr-1">add_circle</span>
              <span>Make donations: <span className="font-medium">+10 to +100 points</span></span>
            </li>
            <li className="flex items-start">
              <span className="material-icons text-primary text-sm mr-1">add_circle</span>
              <span>Donate items: <span className="font-medium">+15 points</span></span>
            </li>
            <li className="flex items-start">
              <span className="material-icons text-primary text-sm mr-1">add_circle</span>
              <span>Adopt pets: <span className="font-medium">+50 points</span></span>
            </li>
            <li className="flex items-start">
              <span className="material-icons text-primary text-sm mr-1">add_circle</span>
              <span>Create posts: <span className="font-medium">+10 points</span></span>
            </li>
            <li className="flex items-start">
              <span className="material-icons text-primary text-sm mr-1">add_circle</span>
              <span>Comment: <span className="font-medium">+3 points</span></span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}