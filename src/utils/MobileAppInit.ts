import { Capacitor, CapacitorException } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * Função para inicializar o aplicativo móvel com o Capacitor
 * Esta função deve ser chamada uma vez no início do aplicativo
 */
export async function initMobileApp() {
  if (Capacitor.isNativePlatform()) {
    try {
      // Configurar barra de status
      await StatusBar.setStyle({ style: Style.Light });
      
      // Em dispositivos Android, fazemos a barra de status transparente
      if (Capacitor.getPlatform() === 'android') {
        await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
      }
      
      // Esconder a tela de splash após o carregamento inicial
      await SplashScreen.hide();
      
      // Lidar com o botão voltar nativo em Android
      App.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          // Se não puder voltar (estamos na tela inicial), pergunte se quer sair
          confirmAppExit();
        } else {
          // Caso contrário, volte na navegação
          window.history.back();
        }
      });
      
      console.log('Aplicativo móvel inicializado com sucesso');
    } catch (error) {
      if (error instanceof CapacitorException) {
        console.error('Erro ao inicializar aplicativo móvel:', error.message);
      } else {
        console.error('Erro inesperado ao inicializar aplicativo móvel:', error);
      }
    }
  } else {
    console.log('Executando em ambiente web, sem inicialização de recursos nativos');
  }
}

// Função para confirmar saída do aplicativo
function confirmAppExit() {
  const shouldExit = window.confirm('Deseja sair do aplicativo?');
  if (shouldExit) {
    App.exitApp();
  }
}

// Função para verificar se está rodando como aplicativo nativo
export function isNativeApp() {
  return Capacitor.isNativePlatform();
}

// Função para verificar a plataforma
export function getPlatform() {
  return Capacitor.getPlatform(); // 'web', 'android', 'ios'
}