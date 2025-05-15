
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EchoLogo } from "@/components/EchoLogo";
import useStore from "@/store/useStore";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Get authentication state and functions from the store
  const { login, register, authLoading, authError } = useStore();

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
       const res =  await login(email, password);
       if(res.success){
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in."
        });
       } else {
        toast({
          title: "Authentication Error",
          description: res.message || "An error occurred during authentication",
          variant: "destructive"
        });
        return;
       }
      } else {
        const res = await register(email, password);
        if(!res.success){
          toast({
            title: "Registration Error",
            description: res.message || "An error occurred during registration",
            variant: "destructive"
          });
          return;
        } else {
          toast({
            title: "Account created!",
            description: "Your account has been created. Welcome to EchoVerse!"
          });
        }
      }
      
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: authError || "An error occurred during authentication",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-[350px] glass-card animate-fade-in">
      <CardHeader className="space-y-2 text-center">
        <div className="flex justify-center mb-2">
          <EchoLogo className="w-12 h-12 text-primary" />
        </div>
        <CardTitle className="text-2xl">
          {isLogin ? "Welcome back" : "Create an account"}
        </CardTitle>
        <CardDescription>
          {isLogin 
            ? "Enter your credentials to access your echoes."
            : "Start capturing reflections for your future self."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="hello@example.com" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button 
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <EyeIcon className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full echo-gradient" disabled={authLoading}>
            {authLoading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" onClick={toggleAuthMode}>
          {isLogin ? "Need an account? Sign up" : "Have an account? Sign in"}
        </Button>
      </CardFooter>
    </Card>
  );
}
