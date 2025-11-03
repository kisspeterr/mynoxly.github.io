import { Sparkles, MessageCircle, Share, Heart, Gift, Calendar, Building, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const FooterSection = () => {
  return (
    <footer className="py-12 px-6 bg-black/50 border-t border-cyan-500/20">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-5 gap-8">
          
          {/* Column 1: Logo and Description */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="h-8 w-8 text-cyan-400 animate-pulse" />
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                NOXLY
              </span>
            </div>
            <p className="text-gray-400">
              Városod éjszakai élete egy modern alkalmazásban.
            </p>
          </div>
          
          {/* Column 2: Navigation Links */}
          <div>
            <h3 className="text-cyan-300 font-semibold mb-4">Navigáció</h3>
            <ul className="space-y-2">
              <li>
                <a href="/#coupons-section" className="text-gray-400 hover:text-cyan-300 transition-colors duration-300 flex items-center">
                  <Gift className="h-4 w-4 mr-2" /> Kuponok
                </a>
              </li>
              <li>
                <a href="/#events-section" className="text-gray-400 hover:text-cyan-300 transition-colors duration-300 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" /> Események
                </a>
              </li>
              <li>
                <a href="/#organizers-section" className="text-gray-400 hover:text-cyan-300 transition-colors duration-300 flex items-center">
                  <Building className="h-4 w-4 mr-2" /> Partnerek
                </a>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Contact */}
          <div>
            <h3 className="text-cyan-300 font-semibold mb-4">Kapcsolat</h3>
            <ul className="space-y-2">
              <li><a href="mailto:noxlynightlife@gmail.com" className="text-gray-400 hover:text-cyan-300 transition-colors duration-300">noxlynightlife@gmail.com</a></li>
              <li><a href="tel:+36702829406" className="text-gray-400 hover:text-cyan-300 transition-colors duration-300">+36 70 282 9406</a></li>
            </ul>
          </div>
          
          {/* Column 4: Partners & Legal */}
          <div>
            <h3 className="text-cyan-300 font-semibold mb-4">Partnereknek</h3>
            <ul className="space-y-2">
              <li>
                <a href="/#partner-section" className="text-gray-400 hover:text-cyan-300 transition-colors duration-300 flex items-center">
                  <Handshake className="h-4 w-4 mr-2" /> Partner leszek
                </a>
              </li>
            </ul>
          </div>
          
          {/* Column 5: Social Media */}
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
            © 2025 NOXLY - Városod éjszakai élete. Minden jog fenntartva. | Indulás: Pécs
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;