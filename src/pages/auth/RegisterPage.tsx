import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel, FormDescription } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Check, X, AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { FaGoogle, FaFacebook, FaLinkedin } from "react-icons/fa";
import api from "@/lib/api";

const passwordSchema = z.string()
  .min(8, { message: "Password must be at least 8 characters" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" })
  .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" });

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string()
    .email({ message: "Please enter a valid email" })
    .refine(email => {
      const validDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'uol.com.br', 'live.com', 'bol.com.br', 'protonmail.com', 'edu.br', 'gov.br', 'org.br'];
      const domain = email.split('@')[1];
      return domain && (validDomains.includes(domain) || domain.includes('.'));
    }, { message: "Please use a valid email address" }),
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers and underscores" }),
  password: passwordSchema,
  confirmPassword: z.string(),
  city: z.string().min(2, { message: "Please enter your city" }),
  userType: z.string().default("tutor"),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms of use",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  });
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      city: "",
      userType: "tutor",
      termsAccepted: false,
    },
    mode: "onChange"
  });

  useEffect(() => {
    const password = form.watch("password");
    if (!password) {
      setPasswordStrength(0);
      setPasswordRequirements({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false
      });
      return;
    }

    const reqs = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password)
    };

    setPasswordRequirements(reqs);

    const meetsReqs = Object.values(reqs).filter(Boolean).length;
    setPasswordStrength(meetsReqs * 20);
  }, [form.watch("password")]);

  useEffect(() => {
    const email = form.watch("email");
    const checkEmail = async () => {
      if (!email || !email.includes('@') || !email.includes('.')) {
        setEmailVerified(false);
        return;
      }
      try {
        setEmailVerifying(true);
        const domain = email.split('@')[1];
        if (!domain || !domain.includes('.')) {
          setEmailVerified(false);
          setEmailVerifying(false);
          return;
        }
        setTimeout(() => {
          setEmailVerified(true);
          setEmailVerifying(false);
        }, 1000);
      } catch (error) {
        setEmailVerified(false);
        setEmailVerifying(false);
      }
    };

    const debounce = setTimeout(checkEmail, 800);
    return () => clearTimeout(debounce);
  }, [form.watch("email")]);

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      // Register user with backend API
      await api.auth.register({
        name: values.name,
        email: values.email,
        username: values.username,
        password: values.password,
        city: values.city,
        userType: values.userType,
      });
      toast({
        title: "Account created successfully!",
        description: "You can now login with your email and password.",
        duration: 5000,
      });

      setIsLoading(false);

      setTimeout(() => {
        setLocation("/auth/login?registered=true");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error creating account",
        description: error?.response?.data?.message || error.message || "Please check your data and try again",
        variant: "destructive",
      });
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Social registration: redirect to backend OAuth route
  const handleSocialLogin = (provider: "google" | "facebook" | "linkedin") => {
    const baseUrl = import.meta.env.VITE_API_URL || "https://yaopets.lat";
    window.location.href = `${baseUrl}/api/auth/${provider}`;
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-2 text-muted-foreground">
            Join our community to help our furry friends! 🐾
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Full name"
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Email
                    {emailVerifying && (
                      <span className="ml-2 text-xs text-amber-500 inline-flex items-center">
                        <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Checking
                      </span>
                    )}
                    {emailVerified && !emailVerifying && (
                      <span className="ml-2 text-xs text-green-500 inline-flex items-center">
                        <Check className="h-3 w-3 mr-1" />
                        Valid email
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Email"
                      type="email"
                      autoComplete="email"
                      className={`h-11 ${emailVerified ? "border-green-500 focus-visible:ring-green-300" : ""}`}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    A confirmation email will be sent after registration.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Username"
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className="h-11 pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  
                  {field.value && (
                    <>
                      <div className="mt-2">
                        <Progress value={passwordStrength} className={`h-2 ${
                          passwordStrength < 40 ? "bg-red-500" : 
                          passwordStrength < 80 ? "bg-yellow-500" : 
                          "bg-green-500"
                        }`} />
                      </div>
                      <Card className="mt-2 p-3 bg-slate-50">
                        <div className="text-xs text-slate-700 mb-1 font-semibold">
                          Password requirements:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                          <div className="flex items-center text-xs">
                            {passwordRequirements.minLength ? 
                              <Check className="h-3 w-3 text-green-500 mr-1" /> : 
                              <X className="h-3 w-3 text-red-500 mr-1" />}
                            At least 8 characters
                          </div>
                          <div className="flex items-center text-xs">
                            {passwordRequirements.hasUppercase ? 
                              <Check className="h-3 w-3 text-green-500 mr-1" /> : 
                              <X className="h-3 w-3 text-red-500 mr-1" />}
                            One uppercase letter
                          </div>
                          <div className="flex items-center text-xs">
                            {passwordRequirements.hasLowercase ? 
                              <Check className="h-3 w-3 text-green-500 mr-1" /> : 
                              <X className="h-3 w-3 text-red-500 mr-1" />}
                            One lowercase letter
                          </div>
                          <div className="flex items-center text-xs">
                            {passwordRequirements.hasNumber ? 
                              <Check className="h-3 w-3 text-green-500 mr-1" /> : 
                              <X className="h-3 w-3 text-red-500 mr-1" />}
                            A number
                          </div>
                          <div className="flex items-center text-xs">
                            {passwordRequirements.hasSpecial ? 
                              <Check className="h-3 w-3 text-green-500 mr-1" /> : 
                              <X className="h-3 w-3 text-red-500 mr-1" />}
                            A special character
                          </div>
                        </div>
                      </Card>
                    </>
                  )}
                  
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Confirm your password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className="h-11 pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="City"
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-2 space-y-0 mb-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <div className="text-sm leading-tight">
                    <FormLabel className="font-normal text-sm">
                      I accept the <Link href="/terms" className="text-primary hover:underline">Terms of Use</Link> and{" "}
                      <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-11" 
              disabled={isLoading || !emailVerified || passwordStrength < 60}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
            
            {(passwordStrength < 60 && form.watch("password")) && (
              <div className="text-center text-xs text-amber-600 flex items-center justify-center mt-2">
                <AlertCircle className="h-3 w-3 mr-1 inline" />
                Your password must be stronger to continue
              </div>
            )}
            
            {(!emailVerified && form.watch("email") && !emailVerifying) && (
              <div className="text-center text-xs text-amber-600 flex items-center justify-center mt-2">
                <AlertCircle className="h-3 w-3 mr-1 inline" />
                Invalid or unverified email
              </div>
            )}
          </form>
        </Form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-2 text-muted-foreground">
              or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Google Register Button */}
          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            className="inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] transition-colors h-11"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </button>
          
          {/* Facebook Register Button */}
          <button
            type="button"
            onClick={() => handleSocialLogin("facebook")}
            className="inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2] transition-colors h-11"
          >
            <FaFacebook className="w-5 h-5" style={{ color: '#1877F2' }} />
          </button>
          
          {/* LinkedIn Register Button */}
          <button
            type="button"
            onClick={() => handleSocialLogin("linkedin")}
            className="inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A66C2] transition-colors h-11"
          >
            <FaLinkedin className="w-5 h-5" style={{ color: '#0A66C2' }} />
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}