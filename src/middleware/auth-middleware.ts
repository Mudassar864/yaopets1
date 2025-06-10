import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Middleware to ensure correct redirect after authentication.
 * Acts as an extra layer to ensure the user is routed properly.
 */
export function useAuthMiddleware() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // If still loading, do nothing
    if (isLoading) {
      console.log("[Middleware] Auth state still loading - waiting...");
      return;
    }

    console.log("[Middleware] Current state:", { isAuthenticated, location, isLoading });

    // Avoid redirects on login/register pages to prevent flashes
    if (location === "/auth/login" || location === "/auth/register") {
      return;
    }

    // Check if we are in the middle of a login process
    const loginProcessActive = localStorage.getItem("yaopets_login_in_progress");

    if (loginProcessActive === "true") {
      console.log("[Middleware] Login process in progress - skipping middleware checks");
      // Clear this flag after some time
      setTimeout(() => {
        localStorage.removeItem("yaopets_login_in_progress");
      }, 10000);
      return;
    }

    // If the user is authenticated and not on an auth page
    if (isAuthenticated && user) {
      const authPages = ["/auth/login", "/auth/register"];
      if (authPages.includes(location)) {
        console.log("[Middleware] Authenticated user trying to access auth page, redirecting");
        setLocation("/home"); // Use setLocation to avoid page refresh
        return;
      }
    }

    // Ensure protected pages are not accessed by unauthenticated users
    // Profile pages are public, so are not included in protected pages
    if (!isAuthenticated && !user) {
      const protectedPages = [
        "/pets",
        "/donations",
        "/vet-help",
        "/chats"
      ];

      if (protectedPages.some(page => location.startsWith(page))) {
        console.log("[Middleware] Unauthorized access to protected page, redirecting");
        // Save the attempted page for redirect after login
        localStorage.setItem("yaopets_redirect_after_login", location);
        setLocation("/auth/login");
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, location, setLocation]);

  // Function to get redirect URL after login
  const getRedirectUrl = (): string => {
    const savedRedirect = localStorage.getItem("yaopets_redirect_after_login");
    if (savedRedirect) {
      localStorage.removeItem("yaopets_redirect_after_login");
      return savedRedirect;
    }
    return "/home";
  };

  return { getRedirectUrl };
}