
import { cn } from "@/lib/utils";

interface EchoLogoProps {
  className?: string;
}

export function EchoLogo({ className }: EchoLogoProps) {
  return (
    <div className={cn("relative", className)}>
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="w-full h-full animate-pulse-soft"
      >
        <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
        <path d="M12 12 2 12" />
        <path d="M12 12v10" />
        <path d="M12 2a5 5 0 0 1 0 10" />
      </svg>
    </div>
  );
}
