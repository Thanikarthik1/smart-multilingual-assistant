import { ThemeToggle } from "@/components/common/ThemeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export const Navbar = () => {
  const handleGithub = () => {
    window.open("https://github.com/mrmendoza-dev/offline-chatbot", "_blank");
  };

  return (
    <nav className="flex-none h-16 border-b bg-background backdrop-blur-sm z-50">
      <div className="flex justify-between h-full items-center px-4 gap-4">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center justify-between mr-4">
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white text-black">
              Offline Chatbot
            </span>
          </Link>
        </div>

        {/* Center: Optional (leave empty or add title) */}
        <div className="text-sm text-muted-foreground hidden sm:block">
          Multilingual LLM Assistant
        </div>

        {/* Right: GitHub + Theme */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleGithub}>
            <Github />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};
