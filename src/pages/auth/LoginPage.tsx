import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { FaGoogle, FaFacebook, FaLinkedin } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // Adjust path if needed

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [showVerificationBanner, setShowVerificationBanner] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();

  // Check URL params for special messages
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'true') {
      setShowVerificationBanner(true);
    }
    if (urlParams.get('verified') === 'true') {
      toast({
        title: "Email verified successfully!",
        description: "You can now log in.",
        variant: "default",
      });
    }
  }, [location, toast]);

  // Simulate email verification resend
  const handleResendVerification = async () => {
    if (!email) {
      toast({
        title: "Attention",
        description: "Enter your email to receive a new verification link",
        variant: "destructive"
      });
      return;
    }
    setResendLoading(true);
    setTimeout(() => {
      setVerificationSent(true);
      setShowResendButton(false);
      toast({
        title: "Email sent",
        description: "A new verification link has been sent to your email",
      });
      setResendLoading(false);
    }, 1200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Fill in all fields");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await login(email, password);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      setTimeout(() => setLocation('/home'), 1200);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        if (error.response.data?.message?.toLowerCase().includes("verify")) {
          setShowVerificationBanner(true);
          setShowResendButton(true);
          setError("You must verify your email before logging in.");
        } else {
          setError("Incorrect email or password.");
        }
      } else {
        setError(error?.response?.data?.message || "Incorrect email or password.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Social login: redirect to backend OAuth route
  const handleSocialLogin = (provider: "google" | "facebook" | "linkedin") => {
    const baseUrl = import.meta.env.VITE_API_URL || "https://yaopets.lat";
    window.location.href = `${baseUrl}/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#F5821D]">YaoPets</h1>
          <p className="mt-2 text-gray-600">
            Welcome back! Ready to help more furry friends today? 🐾
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        {showVerificationBanner && (
          <Alert className="bg-amber-50 border-amber-200 text-amber-800 mb-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-amber-600" />
              <div>
                <div className="font-semibold text-amber-800 mb-1">Email verification required</div>
                <AlertDescription className="text-sm">
                  <p className="mb-2">
                    You need to verify your email before accessing your account. For security reasons, login is only allowed for accounts with a verified email.
                  </p>
                  {verificationSent ? (
                    <p className="flex items-center text-emerald-700 font-medium mt-2">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      A new verification link was sent to your email.
                    </p>
                  ) : showResendButton ? (
                    <div className="mt-3">
                      <p className="mb-2 text-amber-700">
                        Didn't receive the email? Check your spam folder or request a new link:
                      </p>
                      <button
                        onClick={handleResendVerification}
                        disabled={resendLoading}
                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                          resendLoading 
                            ? "bg-amber-300 text-amber-800 cursor-not-allowed"
                            : "bg-amber-500 hover:bg-amber-600 text-white"
                        }`}
                      >
                        {resendLoading ? "Sending..." : "Resend verification email"}
                      </button>
                    </div>
                  ) : (
                    <p>Check your inbox and follow the instructions in the email.</p>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-[#CE97E8]/30 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#0BDEC2] focus:border-[#0BDEC2] focus:z-10"
                placeholder="Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-[#CE97E8]/30 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#0BDEC2] focus:border-[#0BDEC2] focus:z-10"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#F5821D] hover:bg-[#F5821D]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F5821D] disabled:opacity-70"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-[#CE97E8]">Or sign in with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {/* Google Login Button */}
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] transition-colors h-11"
            >
              <FaGoogle className="w-5 h-5" style={{ color: '#4285F4' }} />
            </button>
            {/* Facebook Login Button */}
            <button
              type="button"
              onClick={() => handleSocialLogin('facebook')}
              className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2] transition-colors h-11"
            >
              <FaFacebook className="w-5 h-5" style={{ color: '#1877F2' }} />
            </button>
            {/* LinkedIn Login Button */}
            <button
              type="button"
              onClick={() => handleSocialLogin('linkedin')}
              className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A66C2] transition-colors h-11"
            >
              <FaLinkedin className="w-5 h-5" style={{ color: '#0A66C2' }} />
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center">
          <div className="text-sm">
            <Link to="/auth/register" className="font-medium text-[#F5821D] hover:text-[#F5821D]/80">
              Don't have an account? Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}