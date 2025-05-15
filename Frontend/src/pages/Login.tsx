
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import useStore from "@/store/useStore";

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useStore();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [navigate, isAuthenticated]);
  
  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10"
    >
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(120,120,255,0.1),transparent_40%)]"></div>
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_bottom_left,rgba(120,255,220,0.1),transparent_40%)]"></div>
      
      <div className="z-10 text-center">
        <h1 className="text-4xl font-bold mb-2">EchoVerse</h1>
        <p className="text-lg text-muted-foreground mb-8">Audio diaries for the future you</p>
        <AuthForm />
      </div>
    </div>
  );
};

export default Login;
