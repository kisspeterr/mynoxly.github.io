import { useState, useEffect } from "react";
import { Menu, X, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const closeUserMenus = () => {
      setUserMenuOpen(false);
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("close-user-menus", closeUserMenus);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("close-user-menus", closeUserMenus);
    };
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

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    navigate("/");
  };

  const handleAdminClick = () => {
    if (profile?.role === 'admin') {
      navigate("/admin");
    }
    setUserMenuOpen(false);
  };

  if (loading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-cyan-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              NOXLY
            </div>
            <div className="animate-pulse bg-gray-700/50 rounded-full px-4 py-2">
              <div className="h-5 w-20"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

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
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              NOXLY
            </Link>
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
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 bg-gray-800/50 hover:bg-gray-700/50 px-4 py-2 rounded-full transition-colors"
                >
                  <User className="h-5 w-5 text-cyan-400" />
                  <span className="text-gray-300">
                    {profile?.first_name || user.email?.split('@')[0]}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800/90 backdrop-blur-md border border-cyan-500/30 rounded-lg shadow-lg py-2 z-50">
                    {profile?.role === 'admin' && (
                      <button
                        onClick={handleAdminClick}
                        className="flex items-center w-full px-4 py-2 text-left text-gray-300 hover:bg-cyan-500/10 transition-colors"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Admin
                      </button>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-left text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Kijelentkezés
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button 
                onClick={() => navigate("/login")}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white transition-all duration-300 hover:scale-105"
              >
                Bejelentkezés
              </Button>
            )}
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
                  {profile?.role === 'admin' && (
                    <button
                      onClick={() => {
                        handleAdminClick();
                        setIsOpen(false);
                      }}
                      className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 py-2 text-left"
                    >
                      Admin
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    className="text-gray-300 hover:text-red-400 transition-colors duration-300 py-2 text-left"
                  >
                    Kijelentkezés
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    navigate("/login");
                    setIsOpen(false);
                  }}
                  className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 py-2 text-left"
                >
                  Bejelentkezés
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;