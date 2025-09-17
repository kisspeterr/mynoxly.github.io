import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const TestimonialsSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Kovács Anna",
      role: "Egyetemi hallgató",
      content: "Végre egy olyan app, ami tényleg megérti az éjszakai életet! A NOXLY teljesen megváltoztatta, hogyan szervezem a programjaimat.",
      avatar: "/api/placeholder/80/80"
    },
    {
      name: "Nagy Bence",
      role: "Szórakozóhely tulajdonos",
      content: "Az ügyfeleink imádják! A foglalási rendszer csökkentette a várakozási időt és növelte az elégedettséget.",
      avatar: "/api/placeholder/80/80"
    },
    {
      name: "Tóth Eszter",
      role: "Turista",
      content: "Hihetetlen, hogy mennyire egyszerű lett megtalálni a legjobb helyeket és időpontokat. Mindenkinek ajánlom!",
      avatar: "/api/placeholder/80/80"
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-20 px-6">
      <div className="container mx-auto text-center">
        <Badge className="mb-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0">
          <Quote className="h-4 w-4 mr-2" />
          Vélemények
        </Badge>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-cyan-300">
          Mit mondanak a felhasználók?
        </h2>
        
        <p className="text-xl text-gray-300 mb-16 max-w-2xl mx-auto">
          Olvasd el, hogyan változtatta meg a NOXLY az éjszakai életüket<br className="hidden md:block" /> az első felhasználóinknak.
        </p>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-500/30 rounded-3xl p-8 md:p-12 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 p-1 mb-6">
                <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                  <img 
                    src={testimonials[currentTestimonial].avatar} 
                    alt={testimonials[currentTestimonial].name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                </div>
              </div>
              
              <div className="text-center mb-8">
                <p className="text-2xl text-white italic mb-6 leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </p>
                <div>
                  <h4 className="text-xl font-bold text-cyan-300 mb-2">
                    {testimonials[currentTestimonial].name}
                  </h4>
                  <p className="text-gray-400">
                    {testimonials[currentTestimonial].role}
                  </p>
                </div>
              </div>
              
              {/* Navigation dots */}
              <div className="flex justify-center space-x-2 mb-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentTestimonial 
                        ? "bg-cyan-400 scale-110" 
                        : "bg-gray-600 hover:bg-gray-500"
                    }`}
                  />
                ))}
              </div>
              
              {/* Navigation arrows */}
              <div className="flex justify-center space-x-4">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={prevTestimonial}
                  className="w-12 h-12 rounded-full bg-cyan-600/20 border-cyan-500/50 hover:bg-cyan-600/40 hover:border-cyan-500/70 transition-all duration-300"
                >
                  <ChevronLeft className="h-6 w-6 text-cyan-300" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={nextTestimonial}
                  className="w-12 h-12 rounded-full bg-cyan-600/20 border-cyan-500/50 hover:bg-cyan-600/40 hover:border-cyan-500/70 transition-all duration-300"
                >
                  <ChevronRight className="h-6 w-6 text-cyan-300" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;