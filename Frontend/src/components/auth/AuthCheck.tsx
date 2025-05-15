
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "@/store/useStore";

interface AuthCheckProps {
  children: ReactNode;
}

export function AuthCheck({ children }: AuthCheckProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useStore();
  
  useEffect(() => {
    if (!isAuthenticated) {  
        navigate("/login", { replace: true });
    }
    
  }, [navigate]);
  
  return <>{children}</>;
}
