import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Mail, Eye, EyeOff, Facebook } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cleanupAuthState } from '@/utils/authCleanup';

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'signup' | 'signin'>('signup');
  const [showPassword, setShowPassword] = useState(false);

  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ email: '', phoneNumber: '', password: '' });
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Attempting sign in with:', signInData.email);
      
      // Clean up existing state
      cleanupAuthState();
      
      const { error } = await signIn(signInData.email, signInData.password);
      
      if (error) {
        console.error('Sign in error:', error);
        
        // Check if it's an email not confirmed error
        if (error.message.includes('Email not confirmed')) {
          toast({
            title: "Email not verified",
            description: "Please check your email and click the verification link before signing in.",
            variant: "destructive"
          });
          setShowEmailVerification(true);
          setVerificationEmail(signInData.email);
        } else {
          toast({
            title: "Sign in failed",
            description: error.message || "Invalid email or password. Please check your credentials and try again.",
            variant: "destructive"
          });
        }
      } else {
        console.log('Sign in successful, redirecting to dashboard');
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in."
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password length
    if (signUpData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Attempting sign up with:', signUpData.email);
      
      // Clean up existing state
      cleanupAuthState();
      
      const { error } = await signUp(signUpData.email, signUpData.password, { phoneNumber: signUpData.phoneNumber });
      
      if (error) {
        console.error('Sign up error:', error);
        let errorMessage = error.message;
        
        // Provide more user-friendly error messages
        if (error.message.includes('already registered')) {
          errorMessage = "An account with this email already exists. Please try signing in instead.";
        } else if (error.message.includes('invalid email')) {
          errorMessage = "Please enter a valid email address.";
        } else if (error.message.includes('weak password')) {
          errorMessage = "Password is too weak. Please choose a stronger password.";
        } else if (error.message.includes('phone number')) { // For phone number specific errors
            errorMessage = "Please enter a valid phone number.";
        }
        
        toast({
          title: "Sign up failed",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        console.log('Sign up successful');
        toast({
          title: "Account created successfully!",
          description: "Please check your email to verify your account before signing in.",
        });
        // Show email verification message
        setShowEmailVerification(true);
        setVerificationEmail(signUpData.email);
        // Clear the form
        setSignUpData({ email: '', password: '', phoneNumber: '' });
      }
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    
    try {
      console.log('Starting Google authentication...');
      
      // Clean up any existing auth state first
      cleanupAuthState();
      
      // Try to sign out globally first to ensure clean state
      try {
        await supabase.auth.signOut({ scope: 'global' });
        console.log('Cleaned up existing auth state');
      } catch (cleanupError) {
        console.log('No existing session to clean up');
      }

      const redirectUrl = `${window.location.origin}/dashboard`;
      console.log('Redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      console.log('Google auth response:', { data, error });
      
      if (error) {
        console.error('Google sign in error:', error);
        toast({
          title: "Google sign in failed",
          description: error.message || "Unable to connect to Google. Please try again.",
          variant: "destructive"
        });
      } else {
        console.log('Google auth initiated successfully');
        // Don't show success toast here as the redirect will happen
      }
    } catch (error) {
      console.error('Unexpected Google auth error:', error);
      toast({
        title: "Google sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showEmailVerification) {
    return (
      <div className="min-h-screen cosmic-bg floating-particles flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Card className="bg-white bg-opacity-90 border border-gray-200 rounded-2xl shadow-none p-6">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="gradient-text font-playfair">
                Check Your Email
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                We've sent a verification link to
              </p>
              <p className="font-semibold text-gray-800">
                {verificationEmail}
              </p>
              <p className="text-gray-600 text-sm">
                Please click the link in your email to verify your account before signing in.
              </p>
              <div className="pt-4">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowEmailVerification(false);
                    setVerificationEmail('');
                  }}
                  className="w-full"
                >
                  Back to Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cosmic-bg floating-particles flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="bg-white bg-opacity-95 border-gray-200 rounded-2xl shadow-lg p-6 sm:p-8">
            <CardHeader className="text-left p-0 mb-6">
              <CardTitle className="text-3xl font-bold text-gray-900">
                {view === 'signup' ? 'Create Account' : 'Sign In'}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {view === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button 
                  onClick={() => setView(view === 'signin' ? 'signup' : 'signin')} 
                  className="font-semibold text-green-700 hover:text-green-600"
                >
                  {view === 'signin' ? 'Create account' : 'Sign in'}
                </button>
              </p>
            </CardHeader>
            <CardContent className="p-0">
              {view === 'signup' ? (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email" className="font-medium text-gray-700">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Email"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-gray-50 border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-phone" className="font-medium text-gray-700">Phone Number</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="Phone number"
                      value={signUpData.phoneNumber}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="bg-gray-50 border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password" className="font-medium text-gray-700">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                        className="bg-gray-50 border-gray-300 rounded-lg pr-10"
                        required
                        minLength={6}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-green-800 hover:bg-green-900 text-white mt-6 rounded-full py-3 text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Sign Up"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="signin-email" className="font-medium text-gray-700">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Email"
                      value={signInData.email}
                      onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-gray-50 border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signin-password" className="font-medium text-gray-700">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={signInData.password}
                        onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                        className="bg-gray-50 border-gray-300 rounded-lg pr-10"
                        required
                      />
                       <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-green-800 hover:bg-green-900 text-white mt-6 rounded-full py-3 text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              )}

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">OR</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleGoogleAuth}
                  variant="outline"
                  className="w-full bg-white border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-full py-3 text-base"
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
};

export default Auth;
