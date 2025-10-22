import { Sparkles, Moon, Bell, Play, Gift, Calendar, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const HeroSection = () => {
  // Stats array is no longer needed but kept for reference if needed later

  const scrollToCoupons = () => {
    const couponsSection = document.getElementById('coupons-section');
    if (couponsSection) {
      couponsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToEvents = () => {
    const eventsSection = document.getElementById('events-section');
    if (eventsSection) {
      eventsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const scrollToOrganizers = () => {
    const organizersSection = document.getElementById('organizers-section');
    if (organizersSection) {
      organizersSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="pt-32 pb-20 px-6">
      <div className="container mx-auto text-center">
        <Badge className="mb-6 bg-cyan-500/20 text-cyan-300 border-cyan-400/30 animate-bounce">
          <Sparkles className="h-4 w-4 mr-2" />
          Pécs Éjszakai Élete
        </Badge>
        
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full animate-pulse"></div>
            <div className="relative z-10">
              <Moon className="h-20 w-20 text-cyan-400 mx-auto animate-float" />
              <div className="absolute -inset-4 bg-cyan-400/10 rounded-full animate-ping"></div>
            </div>
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
          NOXLY
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
          Fedezd fel Pécs legizgalmasabb eseményeit és exkluzív kuponjait!
        </p>
        
        <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
          Gyűjts hűségpontokat, élvezd a kedvezményeket, és találd meg a legjobb helyeket a városban.
        </p>
        
        {/* Responsive Button Group: Stacks on mobile, horizontal on larger screens */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button 
            onClick={scrollToCoupons}
            className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8 py-6 text-lg border-0 rounded-2xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105 animate-pulse"
          >
            <Gift className="mr-2 h-5 w-5" />
            Kuponok
          </Button>
          <Button 
            onClick={scrollToEvents}
            variant="outline" 
            className="w-full sm:w-auto border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 px-8 py-6 text-lg rounded-2xl group transition-all duration-300 hover:scale-105"
          >
            <Calendar className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Események
          </Button>
          <Button 
            onClick={scrollToOrganizers}
            variant="outline" 
            className="w-full sm:w-auto border-purple-400 text-purple-400 hover:bg-purple-400/10 px-8 py-6 text-lg rounded-2xl group transition-all duration-300 hover:scale-105"
          >
            <Building className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Partnerek
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;