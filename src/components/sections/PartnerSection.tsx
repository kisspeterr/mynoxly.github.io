import React from 'react';
import { Handshake, Mail, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const PartnerSection: React.FC = () => {
  return (
    <section id="partner-section" className="py-20 px-6">
      <div className="container mx-auto text-center max-w-4xl">
        <Badge className="mb-4 bg-gradient-to-r from-green-500 to-teal-500 text-white border-0">
          <Handshake className="h-4 w-4 mr-2" />
          Partner leszek
        </Badge>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-green-300">
          Növeld a forgalmadat a NOXLY-val!
        </h2>
        
        <p className="text-xl text-gray-300 text-center mb-10 max-w-2xl mx-auto">
          Csatlakozz Pécs legdinamikusabban növekvő éjszakai közösségéhez. Hirdess kuponokat és eseményeket, és érd el az egyetemistákat közvetlenül.
        </p>

        <div className="bg-black/50 border border-green-500/30 rounded-2xl p-8 md:p-12 shadow-2xl shadow-green-500/10">
          <h3 className="text-2xl font-semibold text-white mb-4">Kezdd el még ma!</h3>
          <p className="text-gray-400 mb-6">
            Lépj velünk kapcsolatba, hogy megbeszéljük a lehetőségeket.
          </p>
          
          <Button 
            asChild
            className="w-full md:w-auto bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-6 text-lg rounded-xl transition-all duration-300 hover:scale-105"
          >
            <a href="mailto:hello@noxly.hu?subject=Partneri%20érdeklődés%20-%20NOXLY">
              <Mail className="mr-2 h-5 w-5" />
              Kapcsolatfelvétel
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PartnerSection;