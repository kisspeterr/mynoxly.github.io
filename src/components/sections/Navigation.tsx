"use client";

import { useState, useEffect } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/components/auth/AuthProvider";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToWaitlist = () => {
    const waitlistSection = document.getElementById("waitlist");
    if (waitlistSection) {
      waitlistSection.scrollIntoView({ 
        behavior: "smooth",
        block: "start"
      });
    }
    setIsOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-black/80 backdrop-blur-md border-b border-cyan-500/20"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              NOXLY
            </div>
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-300 hover:text-cyan-400 transition-colors duration-300"
              >
                Funkciók
              </a>
              <a
                href="#demo-section"
                className="text-gray-300 hover:text-cyan-400 transition-colors duration-300"
              >
                Demo
              </a>
              <a
                href="#coming-soon"
                className="text-gray-300 hover:text-cyan-400 transition-colors duration-300"
              >
                Hamarosan
              </a>
              <a
                href="#testimonials"
                className="text-gray-300 hover:text-cyan-400 transition-colors duration-300"
              >
                Vélemények
              </a>
            </div>
          )}

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Button 
                  asChild
                  variant="outline"
                  className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
                >
                  <a href="/profile">
                    <User className="h-4 w-4 mr-2" />
                    Profil
                  </a>
                </Button>
                <Button 
                  onClick={signOut}
                  variant="ghost"
                  className="text-gray-300 hover:text-red-400 hover:bg-red-400/10"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button 
                asChild
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
              >
                <a href="/auth">Bejelentkezés</a>
              </Button>
            )}
            
            <Button 
              onClick={scrollToWaitlist}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white transition-all duration-300 hover:scale-105"
            >
              Csatlakozom
            </Button>
          </div>

          {/* Mobile Menu Button */}
          {isMobile && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-300 hover:text-cyan-400 transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobile && isOpen && (
          <div className="mt-4 pb-4 border-t border-cyan-500/20 pt-4">
            <div className="flex flex-col space-y-4">
              <a
                href="#features"
                className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 py-2"
                onClick={() => setIsOpen(false)}
              >
                Funkciók
              </a>
              <a
                href="#demo-section"
                className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 py-2"
                onClick={() => setIsOpen(false)}
              >
                Demo
              </a>
              <a
                href="#coming-soon"
                className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 py-2"
                onClick={() => setIsOpen(false)}
              >
                Hamarosan
              </a>
              <a
                href="#testimonials"
                className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 py-2"
                onClick={() => setIsOpen(false)}
              >
                Vélemények
              </a>
              
              {user ? (
                <>
                  <a
                    href="/profile"
                    className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Profil
                  </a>
                  <button
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                    className="text-gray-300 hover:text-red-400 transition-colors duration-300 py-2 text-left"
                  >
                    Kijelentkezés
                  </button>
                </>
              ) : (
                <a
                  href="/auth"
                  className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Bejelentkezés
                </a>
              )}
              
              <button
                onClick={scrollToWaitlist}
                className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 py-2 text-left"
              >
                Csatlakozom
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;