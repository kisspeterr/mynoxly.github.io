import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Mi az a NOXLY?",
    answer: "A NOXLY egy mobilalkalmazás, amely összegyűjti Pécs legjobb éjszakai akcióit, kuponjait és eseményeit. Segítünk spórolni és megtalálni a legjobb programokat a városban."
  },
  {
    question: "Hogyan tudok kuponokat beváltani?",
    answer: "A kupon beváltásához be kell jelentkezned az alkalmazásba, kiválasztani a kívánt kupont, és generálni egy egyedi beváltási kódot. Ezt a kódot kell felmutatnod a partner helyszínen a személyzetnek, akik véglegesítik a beváltást."
  },
  {
    question: "Mennyibe kerül a NOXLY használata?",
    answer: "A NOXLY alkalmazás alapvető funkciói ingyenesek. Egyes exkluzív kuponok beváltásához hűségpontok szükségesek, amelyeket más akciók beváltásával vagy eseményeken való részvétellel szerezhetsz."
  },
  {
    question: "Melyik városokban érhető el a NOXLY?",
    answer: "Jelenleg a NOXLY Pécsen indul béta tesztelésen. Terveink szerint hamarosan terjeszkedünk más magyarországi nagyvárosokba is."
  },
  {
    question: "Hogyan lehetek partner?",
    answer: "Ha szeretnél partnerként csatlakozni és kuponokat, eseményeket hirdetni a NOXLY platformon, kérjük, vedd fel velünk a kapcsolatot az info@noxly.hu címen."
  }
];

const FaqSection: React.FC = () => {
  return (
    <section id="faq" className="py-20 px-6">
      <div className="container mx-auto text-center max-w-4xl">
        <Badge className="mb-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0">
          <HelpCircle className="h-4 w-4 mr-2" />
          GYIK
        </Badge>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-pink-300">
          Gyakran Ismételt Kérdések
        </h2>
        
        <p className="text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          Itt találod a leggyakoribb kérdéseket és válaszokat a NOXLY-ról.
        </p>

        <Accordion type="single" collapsible className="w-full text-left">
          {faqItems.map((item, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`} 
              className="border-gray-700/50 bg-black/30 backdrop-blur-sm px-4 rounded-lg mb-4 transition-all duration-300 hover:bg-black/50"
            >
              <AccordionTrigger className="text-lg font-semibold text-white hover:text-pink-300 transition-colors duration-300">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-300 pt-2 pb-4">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FaqSection;