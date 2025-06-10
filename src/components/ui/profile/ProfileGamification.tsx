import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ProfileGamificationProps {
  points: number;
  level: string;
  badges?: string[];
}

const LEVELS = {
  'Iniciante': { min: 0, max: 99, next: 'Protetor' },
  'Protetor': { min: 100, max: 299, next: 'Guardião' },
  'Guardião': { min: 300, max: 599, next: 'Anjo dos Pets' },
  'Anjo dos Pets': { min: 600, max: 999, next: 'Herói Animal' },
  'Herói Animal': { min: 1000, max: Number.MAX_SAFE_INTEGER, next: null }
};

export default function ProfileGamification({ points, level, badges = [] }: ProfileGamificationProps) {
  // Calcular progresso para o próximo nível
  const currentLevelInfo = LEVELS[level as keyof typeof LEVELS] || LEVELS.Iniciante;
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
    progressPercent = 100; // Nível máximo
  }
  
  const getBadgeColor = (badge: string) => {
    const colors: Record<string, string> = {
      'Resgatador': 'bg-blue-100 text-blue-800',
      'Doador Generoso': 'bg-green-100 text-green-800',
      'Anjo de Patas': 'bg-purple-100 text-purple-800',
      'Voluntário Dedicado': 'bg-orange-100 text-orange-800',
      'Protetor Iniciante': 'bg-pink-100 text-pink-800',
    };
    
    return colors[badge] || 'bg-neutral-100 text-neutral-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-neutral-900">Progresso</h3>
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-secondary to-primary text-white text-sm font-medium">
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15L8.5 10H15.5L12 15Z" fill="currentColor"/>
            <path d="M17 4H7L3 8L12 20L21 8L17 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {level}
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-3">
        <div className="space-y-0.5">
          <div className="text-2xl font-bold text-primary">{points}</div>
          <div className="text-xs text-neutral-500">pontos acumulados</div>
        </div>
      </div>
      
      {nextLevel && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-neutral-600 mb-1">
            <span>{level}</span>
            <span>{nextLevel}</span>
          </div>
          <div className="space-y-1.5">
            <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-secondary to-primary rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-xs text-neutral-500 text-right">
              Faltam <span className="font-medium">{pointsToNextLevel}</span> pontos para o próximo nível
            </div>
          </div>
        </div>
      )}
      
      {badges.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-2 text-neutral-800">Suas conquistas</h4>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <Badge key={index} className={`${getBadgeColor(badge)} px-2 py-1`}>{badge}</Badge>
            ))}
          </div>
        </div>
      )}
      
      <div className="pt-3 border-t border-neutral-100">
        <h4 className="text-sm font-medium mb-2 text-neutral-800">Como ganhar pontos</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600">
          <div className="flex items-center">
            <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-1.5">+5</span>
            <span>Compartilhar posts</span>
          </div>
          <div className="flex items-center">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-1.5">+10</span>
            <span>Criar publicações</span>
          </div>
          <div className="flex items-center">
            <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-1.5">+15</span>
            <span>Doar itens</span>
          </div>
          <div className="flex items-center">
            <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mr-1.5">+3</span>
            <span>Comentar</span>
          </div>
          <div className="flex items-center">
            <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-1.5">+50</span>
            <span>Adotar pets</span>
          </div>
          <div className="flex items-center">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-1.5">+10</span>
            <span>Contribuir</span>
          </div>
        </div>
      </div>
    </div>
  );
}