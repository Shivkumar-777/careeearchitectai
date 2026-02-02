import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Compass, Mail, Lock, ArrowRight, Loader2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [userType, setUserType] = useState<string>("job_seeker");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Sign in failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          navigate("/dashboard");
        }
      } else {
        const { error, data } = await signUp(email, password);
        if (error) {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          // Update profile with display name and user type
          if (data?.user) {
            await supabase
              .from("profiles")
              .update({ 
                display_name: displayName.trim() || null,
                user_type: userType 
              })
              .eq("user_id", data.user.id);
          }
          toast({
            title: "Account created!",
            description: "You're now signed in.",
          });
          navigate("/dashboard");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div 
          className="flex items-center justify-center gap-2 mb-8 cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Compass className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-foreground">
            Career<span className="gradient-text">Architect</span>
          </span>
        </div>

        {/* Auth Card */}
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-muted-foreground">
              {isLogin 
                ? "Sign in to continue your career journey" 
                : "Start architecting your dream career"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  minLength={6}
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-3">
                <Label>I am a...</Label>
                <ToggleGroup
                  type="single"
                  value={userType}
                  onValueChange={(value) => value && setUserType(value)}
                  className="flex flex-wrap gap-2 justify-start"
                >
                  <ToggleGroupItem
                    value="student"
                    className="flex-1 min-w-[100px] data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    Student
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="job_seeker"
                    className="flex-1 min-w-[100px] data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    Job Seeker
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="professional"
                    className="flex-1 min-w-[100px] data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    Professional
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            )}

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? (
                <>Don't have an account? <span className="text-primary font-medium">Sign up</span></>
              ) : (
                <>Already have an account? <span className="text-primary font-medium">Sign in</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
