import { Moon, MessageCircle, Share, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const FooterSection = () => {
  return (
    <footer className="py-12 px-6 bg-black/50 border-t border-cyan-500/20">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Moon className="h-8 w-8 text-cyan-400 animate-pulse" />
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                NOXLY
              </span>
            </div>
            <p className="text-gray-400">
              Városod éjszakai élete egy modern alkalmazásban. Hamarosan!
            </p>
          </div>
          
          <div>
            <h3 className="text-cyan-300 font-semibold mb-4">Kapcsolat</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-cyan-300 transition-colors duration-300">info@noxly.hu</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-300 transition-colors duration-300">+36 70 123 4567</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-cyan-300 font-semibold mb-4">Partnereknek</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-cyan-300 transition-colors duration-300">Partneri program</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-300 transition-colors duration-300">Árak</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-300 transition-colors duration-300">Demo igénylés</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-cyan-300 font-semibold mb-4">Kövess minket</h3>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-cyan-400 hover:bg-cyan-400/10 hover:scale-110 transition-all duration-300">
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-purple-400 hover:bg-purple-400/10 hover:scale-110 transition-all duration-300">
                <Share className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-pink-400 hover:bg-pink-400/10 hover:scale-110 transition-all duration-300">
                <Heart className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700/50 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 NOXLY - Városod éjszakai élete. Minden jog fenntartva. | Hamarosan Pécsen!
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;