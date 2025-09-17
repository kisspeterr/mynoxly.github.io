import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const TestimonialsSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      name: "Anna",
      role: "Egyetemista",
      text: "Alig várom, hogy kipróbálhassam! Pontosan ez hiányzott városunk éjszakai életéből.",
      rating: 5
    },
    {
      name: "Bence",
      role: "Helyi bár tulajdonos",
      text: "Remek ötlet! Már most jeleztem érdeklődésemet, hogy partner lehessek.",
      rating: 5
    },
    {
      name: "Csilla",
      role: "Rendezvényszervező",
      text: "Végre egy modern platform, ami tényleg összehozza a közösséget!",
      rating: 5
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-20 px-6 bg-black/30">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-cyan-300">
          Mit mondanak az érdeklődők?
        </h2>
        
        <div className="max-w-4xl mx-auto relative">
          <div className="relative bg-slate-900/50 rounded-3xl p-8 border border-cyan-500/20 backdrop-blur-sm hover:scale-102 transition-transform duration-300">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                {[...Array(testimonials[currentSlide].rating)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-400 fill-yellow-400 mx-1 animate-bounce" style={{ animationDelay: `${i * 100}ms` }} />
                ))}
              </div>
              
              <p className="text-xl text-gray-200 mb-6 italic animate-fade-in">
                "{testimonials[currentSlide].text}"
              </p>
              
              <div className="text-cyan-300 font-semibold animate-fade-in">
                {testimonials[currentSlide].name}
              </div>
              <div className="text-gray-400 text-sm animate-fade-in">
                {testimonials[currentSlide].role}
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-8 space-x-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 transition-all duration-300 hover:scale-110"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'bg-cyan-400 scale-125' : 'bg-gray-600'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 transition-all duration-300 hover:scale-110"
              onClick={nextSlide}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;