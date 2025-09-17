import { Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  isScrolled: boolean;
}

const Navigation = ({ isScrolled }: NavigationProps) => {
  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-black/80 backdrop-blur-md" : "bg-transparent"}`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Moon className="h-8 w-8 text-cyan-400 animate-pulse" />
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              NOXLY
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="hover:text-cyan-300 transition-colors duration-300">Funkciók</a>
            <a href="#map" className="hover:text-cyan-300 transition-colors duration-300">Térkép</a>
            <a href="#testimonials" className="hover:text-cyan-300 transition-colors duration-300">Vélemények</a>
            <a href="#waitlist" className="hover:text-cyan-300 transition-colors duration-300">Várólista</a>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 transition-all duration-300 hover:scale-105">
              Partnerként
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;