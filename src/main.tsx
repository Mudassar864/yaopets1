import { createRoot } from "react-dom/client";
import React, { useEffect } from "react";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./context/AuthContext";
import { initMobileApp } from "./utils/MobileAppInit";
import { initializeDemoData } from "./utils/localStorageManager";

// Create a debug function to help with debugging
const debug = (message: string) => {
  console.log(`[DEBUG] ${message}`);
};

// Componente wrapper para inicialização de recursos nativos
const AppWithNativeInit: React.FC = () => {
  useEffect(() => {
    // Initialize demo data
    initializeDemoData();
    
    // Inicializa recursos nativos para Android e iOS
    initMobileApp().catch(error => {
      console.error("Erro ao inicializar recursos nativos:", error);
    });
    
    // Ajusta altura da tela para dispositivos móveis (fix para iOS)
    const setAppHeight = () => {
      document.documentElement.style.setProperty(
        '--app-height', 
        `${window.innerHeight}px`
      );
    };
    
    window.addEventListener('resize', setAppHeight);
    setAppHeight();
    
    return () => window.removeEventListener('resize', setAppHeight);
  }, []);
  
  return <App />;
};

// Log when the app starts rendering
debug("Starting application render");

try {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    throw new Error("Root element not found!");
  }
  
  const root = createRoot(rootElement);
  
  // Aplicativo com inicialização de recursos nativos
  root.render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppWithNativeInit />
      </AuthProvider>
    </QueryClientProvider>
  );
  
  debug("Application rendered successfully");
} catch (error) {
  console.error("Error rendering application:", error);
}