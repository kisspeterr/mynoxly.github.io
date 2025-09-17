import { Gift, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const WaitlistSection = () => {
  const [email, setEmail] = useState("");

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert(`Köszönjük az érdeklődést! Hamarosan értesítünk a bemutatóról: ${email}`);
      setEmail("");
    }
  };

  return (
    <section id="waitlist" className="py-20 px-6">
      <div className="container mx-auto text-center">
        <div className="max-w-2xl mx-auto">
          <Badge className="mb-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0 animate-pulse">
            <Gift className="h-4 w-4 mr-2" />
            Korai hozzáférés
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-cyan-300">
            Legyen az elsők között Pécsen!
          </h2>
          
          <p className="text-xl text-gray-300 mb-8">
            Iratkozzon fel a várólistára, és kapjon exkluzív kedvezményt<br className="hidden md:block" /> az alkalmazás megjelenésekor!
          </p>
          
          <Card className="bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border-cyan-500/30 hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-cyan-300">Előregisztráció</CardTitle>
              <CardDescription className="text-gray-300">
                Add meg az email címed, és értesítünk amint elindul a NOXLY Pécsen!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="email"
                  placeholder="Email címed"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800/50 border-cyan-500/30 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
                  required
                />
                <Button type="submit" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white transition-all duration-300 hover:scale-105">
                  <Bell className="h-4 w-4 mr-2" />
                  Feliratkozás
                </Button>
              </form>
              <p className="text-sm text-gray-400 mt-4">
                Az első 100 regisztrált felhasználó 50% kedvezményt kap az első havi prémium szolgáltatásunkra!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default WaitlistSection;