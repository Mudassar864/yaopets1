interface ProfileStatsProps {
  relationshipCounts: any;
  pets?: any[];
  savedPosts?: any[];
  activeView: string;
  handleViewChange: (view: 'posts' | 'followers' | 'following' | 'friends') => void;
}

export default function ProfileStats({
  relationshipCounts,
  pets,
  savedPosts,
  activeView,
  handleViewChange
}: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-2 bg-neutral-50 p-3 rounded-lg mb-4">
      <div 
        className={`p-2 rounded-lg cursor-pointer transition text-center ${activeView === 'followers' ? 'bg-white shadow-sm' : 'hover:bg-white hover:shadow-sm'}`}
        onClick={() => handleViewChange('followers')}
      >
        <p className="text-lg font-bold text-primary">
          {relationshipCounts?.followerCount || 0}
        </p>
        <p className="text-xs text-neutral-600">Seguidores</p>
      </div>
      <div 
        className={`p-2 rounded-lg cursor-pointer transition text-center ${activeView === 'following' ? 'bg-white shadow-sm' : 'hover:bg-white hover:shadow-sm'}`}
        onClick={() => handleViewChange('following')}
      >
        <p className="text-lg font-bold text-primary">
          {relationshipCounts?.followingCount || 0}
        </p>
        <p className="text-xs text-neutral-600">Seguindo</p>
      </div>
      <div className="p-2 rounded-lg text-center hover:bg-white hover:shadow-sm transition">
        <p className="text-lg font-bold text-primary">
          {pets?.length || 0}
        </p>
        <p className="text-xs text-neutral-600">Pets</p>
      </div>
      <div className="p-2 rounded-lg text-center hover:bg-white hover:shadow-sm transition">
        <p className="text-lg font-bold text-primary">
          {savedPosts?.length || 0}
        </p>
        <p className="text-xs text-neutral-600">Salvos</p>
      </div>
    </div>
  );
}