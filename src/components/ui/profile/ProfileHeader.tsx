import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateInitials } from "@/lib/utils";
import { Edit2, Check, X, UserPlus, UserMinus, MessageCircle, ExternalLink } from "lucide-react";

interface ProfileHeaderProps {
  profileData: any;
  isOwnProfile: boolean;
  isEditingName: boolean;
  isEditingCity: boolean;
  isEditingBio: boolean;
  isEditingWebsite: boolean;
  newName: string;
  newCity: string;
  newBio: string;
  newWebsite: string;
  isPhotoDialogOpen: boolean;
  setIsPhotoDialogOpen: (value: boolean) => void;
  handleEditName: () => void;
  handleEditCity: () => void;
  handleEditBio: () => void;
  handleEditWebsite: () => void;
  handleSaveName: () => void;
  handleSaveCity: () => void;
  handleSaveBio: () => void;
  handleSaveWebsite: () => void;
  setNewName: (value: string) => void;
  setNewCity: (value: string) => void;
  setNewBio: (value: string) => void;
  setNewWebsite: (value: string) => void;
  setIsEditingName: (value: boolean) => void;
  setIsEditingCity: (value: boolean) => void;
  setIsEditingBio: (value: boolean) => void;
  setIsEditingWebsite: (value: boolean) => void;
  followingStatus?: { isFollowing: boolean };
  handleFollowToggle: () => void;
  handleMessageUser: () => void;
  handleLogout: () => void;
  followUser: any;
  unfollowUser: any;
  updateProfile: any;
  getUserTypeLabel: (type: string) => string;
}

export default function ProfileHeader({
  profileData,
  isOwnProfile,
  isEditingName,
  isEditingCity,
  isEditingBio,
  isEditingWebsite,
  newName,
  newCity,
  newBio,
  newWebsite,
  isPhotoDialogOpen,
  setIsPhotoDialogOpen,
  handleEditName,
  handleEditCity,
  handleEditBio,
  handleEditWebsite,
  handleSaveName,
  handleSaveCity,
  handleSaveBio,
  handleSaveWebsite,
  setNewName,
  setNewCity,
  setNewBio,
  setNewWebsite,
  setIsEditingName,
  setIsEditingCity,
  setIsEditingBio,
  setIsEditingWebsite,
  followingStatus,
  handleFollowToggle,
  handleMessageUser,
  handleLogout,
  followUser,
  unfollowUser,
  updateProfile,
  getUserTypeLabel
}: ProfileHeaderProps) {
  return (
    <>
      {/* Header com background gradiente YaoPets */}
      <div className="relative bg-gradient-to-r from-secondary to-primary h-36 rounded-b-3xl shadow-md">
        {/* Padrão decorativo */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0,rgba(255,255,255,0)_70%)]"></div>
      </div>

      {/* Card de perfil sobrepondo o background */}
      <div className="relative -mt-20 mx-4">
        <div className="bg-white rounded-xl shadow-lg p-5">
          {/* Avatar e informações do usuário */}
          <div className="flex flex-col items-center pb-4 relative">
            {/* Avatar com tamanho maior */}
            <div className={`${isOwnProfile ? 'cursor-pointer' : ''} mb-4`} onClick={isOwnProfile ? () => setIsPhotoDialogOpen(true) : undefined}>
              <Avatar className="h-24 w-24 ring-4 ring-white shadow-md">
                {profileData?.profileImage ? (
                  <AvatarImage 
                    src={profileData.profileImage}
                    alt={profileData?.name || 'User'} 
                    className="h-full w-full object-cover" 
                  />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-secondary to-primary text-white text-3xl">
                    {generateInitials(profileData?.name || 'User')}
                  </AvatarFallback>
                )}
              </Avatar>
              {isOwnProfile && (
                <div className="absolute bottom-3 right-1/2 translate-x-8 bg-primary text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md">
                  <Edit2 size={14} />
                </div>
              )}
            </div>
            
            {/* Informações do usuário - centralizadas */}
            <div className="text-center w-full">
              {/* Nome editável */}
              <div className="mb-1">
                {isEditingName ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="h-9 py-1 text-lg font-semibold max-w-[220px]"
                      placeholder="Nome"
                    />
                    <Button 
                      size="icon" 
                      className="h-7 w-7" 
                      onClick={handleSaveName}
                      disabled={updateProfile?.isPending}
                    >
                      <Check size={14} />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="h-7 w-7" 
                      onClick={() => setIsEditingName(false)}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <h2 className="text-xl font-semibold text-neutral-900">{profileData?.name || 'Usuário'}</h2>
                    {isOwnProfile && (
                      <button 
                        className="text-neutral-500 hover:text-primary ml-2"
                        onClick={handleEditName}
                        aria-label="Editar nome"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {/* Badge de tipo de usuário */}
              {profileData?.userType && (
                <Badge variant="outline" className="mb-2 bg-neutral-100 text-neutral-800 font-medium">
                  {getUserTypeLabel(profileData.userType)}
                </Badge>
              )}
              
              {/* Cidade editável */}
              <div className="mb-3">
                {isEditingCity ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Input
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="h-7 py-1 text-sm max-w-[180px]"
                      placeholder="Cidade"
                    />
                    <Button 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={handleSaveCity}
                      disabled={updateProfile?.isPending}
                    >
                      <Check size={14} />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="h-6 w-6" 
                      onClick={() => setIsEditingCity(false)}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-neutral-600">
                    <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p className="text-sm">
                      {profileData?.city || 'Localização não disponível'}
                    </p>
                    {isOwnProfile && (
                      <button 
                        className="text-neutral-500 hover:text-primary ml-2"
                        onClick={handleEditCity}
                        aria-label="Editar cidade"
                      >
                        <Edit2 size={12} />
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {/* Bio editável */}
              <div className="mb-3 px-4">
                {isEditingBio ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      value={newBio}
                      onChange={(e) => setNewBio(e.target.value)}
                      className="h-8 py-1 text-sm w-full"
                      placeholder="Uma breve descrição sobre você..."
                    />
                    <Button 
                      size="icon" 
                      className="h-6 w-6 flex-shrink-0" 
                      onClick={handleSaveBio}
                      disabled={updateProfile?.isPending}
                    >
                      <Check size={14} />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="h-6 w-6 flex-shrink-0" 
                      onClick={() => setIsEditingBio(false)}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <p className="text-sm text-neutral-600 text-center max-w-md">
                      {profileData?.bio || (isOwnProfile ? "Adicione uma descrição sobre você..." : "Sem descrição")}
                    </p>
                    {isOwnProfile && (
                      <button 
                        className="text-neutral-500 hover:text-primary ml-2 flex-shrink-0"
                        onClick={handleEditBio}
                        aria-label="Editar bio"
                      >
                        <Edit2 size={12} />
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {/* Website */}
              <div className="mb-4">
                {isEditingWebsite ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Input
                      value={newWebsite}
                      onChange={(e) => setNewWebsite(e.target.value)}
                      className="h-8 py-1 text-sm max-w-[250px]"
                      placeholder="https://seusite.com"
                    />
                    <Button 
                      size="icon" 
                      className="h-6 w-6 flex-shrink-0" 
                      onClick={handleSaveWebsite}
                      disabled={updateProfile?.isPending}
                    >
                      <Check size={14} />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="h-6 w-6 flex-shrink-0" 
                      onClick={() => setIsEditingWebsite(false)}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ) : profileData?.website ? (
                  <div className="flex items-center justify-center">
                    <a 
                      href={profileData.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink size={12} />
                      <span className="truncate max-w-[250px]">{profileData.website.replace(/^https?:\/\//, '')}</span>
                    </a>
                    {isOwnProfile && (
                      <button 
                        className="text-neutral-500 hover:text-primary ml-2 flex-shrink-0"
                        onClick={handleEditWebsite}
                        aria-label="Editar website"
                      >
                        <Edit2 size={12} />
                      </button>
                    )}
                  </div>
                ) : isOwnProfile ? (
                  <button 
                    onClick={handleEditWebsite}
                    className="text-sm text-neutral-500 flex items-center gap-1 hover:text-primary mx-auto"
                  >
                    <ExternalLink size={12} />
                    <span>Adicionar website</span>
                  </button>
                ) : null}
              </div>
              
              {/* Botões de ação */}
              <div className="flex justify-center gap-2 mb-2">
                {!isOwnProfile && (
                  <>
                    <Button 
                      size="sm" 
                      variant={followingStatus?.isFollowing ? "outline" : "default"}
                      className={`text-xs h-9 px-4 rounded-full ${followingStatus?.isFollowing ? 'border-neutral-300' : ''}`}
                      onClick={handleFollowToggle}
                      disabled={followUser?.isPending || unfollowUser?.isPending}
                    >
                      {followingStatus?.isFollowing ? (
                        <UserMinus className="mr-1 h-3 w-3" />
                      ) : (
                        <UserPlus className="mr-1 h-3 w-3" />
                      )}
                      {followingStatus?.isFollowing ? 'Deixar de Seguir' : 'Seguir'}
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-xs h-9 px-4 rounded-full border-neutral-300"
                      onClick={handleMessageUser}
                    >
                      <MessageCircle className="mr-1 h-3 w-3" />
                      Mensagem
                    </Button>
                  </>
                )}
                
                {isOwnProfile && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-9 px-4 rounded-full border-neutral-300 text-neutral-700"
                    onClick={handleLogout}
                  >
                    Sair
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}