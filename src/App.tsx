import { Switch, Route } from "wouter";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";

import EnhancedProfilePage from "@/pages/EnhancedProfilePage";
import PetFeed from "@/pages/PetFeed";
import PostCreationPage from "@/pages/CreatePostPage";
import PetsPage from "@/pages/PetsPage";
import PetDetailsPage from "@/pages/PetDetailsPage";
import DonationsPage from "@/pages/DonationsPage";
import NewPetPageReplacement from "@/pages/NewPetPageReplacement";
import VetHelpPage from "@/pages/VetHelpPage";
import VetProfilePage from "@/pages/VetProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import ChatsListPage from "@/pages/ChatsListPage";
import ChatPage from "@/pages/ChatPage";
import StorePage from "@/pages/StorePage";
import CheckoutPage from "@/pages/CheckoutPage";
import PaymentSuccessPage from "@/pages/PaymentSuccessPage";

import MobileStatusBar from "@/components/mobile/MobileStatusBar";
import NativePushNotifications from "@/components/mobile/PushNotifications";
import NativeBottomNavigation from "@/components/mobile/NativeBottomNavigation";
import { useAuthMiddleware } from "@/middleware/auth-middleware";
import { Capacitor } from '@capacitor/core';
import CreatePostModal from "@/components/modals/CreatePostModal";
import { useLocation } from "wouter";

// Componente de redirecionamento de /chats para /chat
function RedirectToChat() {
  const [, setLocation] = useLocation();
  
  // Usar useEffect para fazer o redirecionamento
  useEffect(() => {
    setLocation('/chat');
  }, [setLocation]);
  
  return null;
}

// Página de criação de publicação
function CreatePostPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [, navigate] = useLocation();
  
  // Redirecionar para a página inicial quando o modal for fechado
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      navigate('/');
    }
  };
  
  return (
    <div className="h-screen flex items-center justify-center">
      <CreatePostModal open={isOpen} onOpenChange={handleOpenChange} />
    </div>
  );
}



function AppRoutes() {
  return (
    <Switch>
      {/* Login */}
      <Route path="/">
        <LoginPage />
      </Route>
      <Route path="/auth/login">
        <LoginPage />
      </Route>
      <Route path="/auth/register">
        <RegisterPage />
      </Route>
      
      {/* Páginas principais */}
      <Route path="/home">
        <ProtectedRoute>
          <div className="pb-16">
            <PetFeed />
            <NativeBottomNavigation />
          </div>
        </ProtectedRoute>
      </Route>
      
      <Route path="/pets">
        <ProtectedRoute>
          <div className="pb-16">
            <PetsPage />
            <NativeBottomNavigation />
          </div>
        </ProtectedRoute>
      </Route>
      
      <Route path="/donations">
        <ProtectedRoute>
          <div className="pb-16">
            <DonationsPage />
            <NativeBottomNavigation />
          </div>
        </ProtectedRoute>
      </Route>
      
      <Route path="/vet-help">
        <ProtectedRoute>
          <div className="pb-16">
            <VetHelpPage />
            <NativeBottomNavigation />
          </div>
        </ProtectedRoute>
      </Route>
      
      <Route path="/vet-profile/:id">
        <ProtectedRoute>
          <VetProfilePage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/store">
        <ProtectedRoute>
          <div className="pb-16">
            <StorePage />
            <NativeBottomNavigation />
          </div>
        </ProtectedRoute>
      </Route>
      
      {/* Redirect /chats to /chat */}
      <Route path="/chats">
        <RedirectToChat />
      </Route>
      
      <Route path="/chat">
        <ProtectedRoute>
          <div className="pb-16">
            <ChatsListPage />
            <NativeBottomNavigation />
          </div>
        </ProtectedRoute>
      </Route>
      
      <Route path="/chat/:id">
        <ProtectedRoute>
          <div className="pb-16">
            <ChatPage />
            <NativeBottomNavigation />
          </div>
        </ProtectedRoute>
      </Route>
      
      <Route path="/profile">
        <div className="pb-16">
          <EnhancedProfilePage />
          <NativeBottomNavigation />
        </div>
      </Route>
      
      <Route path="/profile/:id">
        <div className="pb-16">
          <EnhancedProfilePage />
          <NativeBottomNavigation />
        </div>
      </Route>
      
      <Route path="/settings">
        <ProtectedRoute>
          <div className="pb-16">
            <SettingsPage />
            <NativeBottomNavigation />
          </div>
        </ProtectedRoute>
      </Route>
      
      {/* Páginas auxiliares */}
      <Route path="/create-post">
        <ProtectedRoute>
          <div className="pb-16">
            <PostCreationPage />
            <NativeBottomNavigation />
          </div>
        </ProtectedRoute>
      </Route>
      
      <Route path="/new-pet">
        <ProtectedRoute>
          <NewPetPageReplacement />
        </ProtectedRoute>
      </Route>
      
      <Route path="/pet-details/:id">
        <ProtectedRoute>
          <PetDetailsPage />
        </ProtectedRoute>
      </Route>
      
      {/* Páginas de pagamento */}
      <Route path="/checkout">
        <CheckoutPage />
      </Route>
      
      <Route path="/payment-success">
        <PaymentSuccessPage />
      </Route>

      {/* Fallback */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  // Adicionar classe para identificar se é um aplicativo nativo
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Adiciona classes para identificar o tipo de plataforma
      document.body.classList.add('native-app');
      
      if (Capacitor.getPlatform() === 'ios') {
        document.body.classList.add('ios-app');
      } else if (Capacitor.getPlatform() === 'android') {
        document.body.classList.add('android-app');
      }
    }
  }, []);
  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <MobileStatusBar />
        <NativePushNotifications />
        <AuthMiddleware />
        <AppRoutes />
      </TooltipProvider>
    </AuthProvider>
  );
}

/**
 * Componente que aplica o middleware de autenticação em toda a aplicação
 * Gerencia redirecionamentos e verificações de autenticação
 */
function AuthMiddleware() {
  // Aplicar o middleware - ele só precisa ser montado para funcionar através dos efeitos
  useAuthMiddleware();
  
  // Este componente não renderiza nada visualmente
  return null;
}

export default App;
