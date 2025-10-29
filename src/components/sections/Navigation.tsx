"use client";

import { useState, useEffect } from "react";
import { Menu, X, LogIn, LogOut, Shield, User, Gift, Calendar, QrCode, Building, Loader2, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "react-router-dom";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useIsMobile();
  const { isAuthenticated, isAdmin, isSuperadmin, signOut, isLoading, profile } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Helper function to navigate to the home page with a hash anchor
  const navigateToSection = (id: string) => {
    // Use window.location.href to force a full navigation/reload if needed, 
    // ensuring the browser handles the hash scrolling correctly, even if we are on a different route.
    window.location.href = `/#${id}`;
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    await signOut(); // Await the asynchronous signOut call
    setIsOpen(false);
  };

  const AuthButtons = () => {
    // 1. Session betöltése
    if (isLoading) {
      return (
        <div className="flex items-center space-x-3">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
          <div className="w-24 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      );
    }
    
    // 2. Hitelesített és profil betöltve
    if (isAuthenticated) {
      if (isSuperadmin) {
        // Superadmin: Dedicated Dashboard button
        return (
          <div className="flex space-x-3">
            <Button 
              asChild
              variant="outline"
              size="icon"
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 transition-all duration-300 hover:scale-105"
            >
              <Link to="/profile">
                <User className="h-5 w-5" />
              </Link>
            </Button>
            <Button 
              asChild
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white transition-all duration-300 hover:scale-105"
            >
              <Link to="/superadmin/dashboard">
                <Shield className="mr-2 h-4 w-4" />
                Superadmin
              </Link>
            </Button>
          </div>
        );
      } else if (isAdmin) {
        // Admin: Dashboard, Redemption, Profile buttons
        return (
          <div className="flex space-x-3">
            <Button 
              asChild
              variant="outline"
              size="icon"
              className="border-green-400 text-green-400 hover:bg-green-400/10 transition-all duration-300 hover:scale-105"
            >
              <Link to="/code">
                <QrCode className="h-5 w-5" />
              </Link>
            </Button>
            <Button 
              asChild
              variant="outline"
              size="icon"
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 transition-all duration-300 hover:scale-105"
            >
              <Link to="/profile">
                <User className="h-5 w-5" />
              </Link>
            </Button>
            <Button 
              asChild
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-300 hover:scale-105"
            >
              <Link to="/admin/dashboard">
                <Shield className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        );
      } else {
        // Regular User: Profile icon button
        return (
          <Button 
            asChild
            variant="outline"
            size="icon"
            className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 transition-all duration-300 hover:scale-110 rounded-full"
          >
            <Link to="/profile">
              <User className="h-5 w-5" />
            </Link>
          </Button>
        );
      }
    }

    // 3. Nem hitelesített: Login button
    return (
      <Button 
        asChild
        className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white transition-all duration-300 hover:scale-105"
      >
        <Link to="/login">
          <LogIn className="mr-2 h-4 w-4" />
          Bejelentkezés
        </Link>
      </Button>
    );
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
          {/* Logo (Left) */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              NOXLY
            </Link>
          </div>

          {/* Desktop Navigation (Center) */}
          {!isMobile && (
            <div className="flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
              <button
                onClick={() => navigateToSection('coupons-section')}
                className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 flex items-center gap-1"
              >
                <Gift className="h-4 w-4" /> Kuponok
              </button>
              <button
                onClick={() => navigateToSection('events-section')}
                className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 flex items-center gap-1"
              >
                <Calendar className="h-4 w-4" /> Események
              </button>
              <button
                onClick={() => navigateToSection('organizers-section')}
                className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 flex items-center gap-1"
              >
                <Building className="h-4 w-4" /> Partnerek
              </button>
              <button
                onClick={() => navigateToSection('challenges-section')}
                className="text-gray-300 hover:text-purple-400 transition-colors duration-300 flex items-center gap-1"
              >
                <ListChecks className="h-4 w-4" /> Küldetések
              </button>
            </div>
          )}

          {/* CTA Button / Auth Button (Right) */}
          <div className="flex items-center space-x-4">
            <AuthButtons />
            
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
        </div>

        {/* Mobile Menu */}
        {isMobile && isOpen && (
          <div className="mt-4 pb-4 border-t border-cyan-500/20 pt-4">
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => navigateToSection('coupons-section')}
                className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 py-2 flex items-center gap-1"
              >
                <Gift className="h-4 w-4 mr-2" /> Kuponok
              </button>
              <button
                onClick={() => navigateToSection('events-section')}
                className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 py-2 flex items-center gap-1"
                
              >
                <Calendar className="h-4 w-4 mr-2" /> Események
              </button>
              <button
                onClick={() => navigateToSection('organizers-section')}
                className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 py-2 flex items-center gap-1"
              >
                <Building className="h-4 w-4 mr-2" /> Partnerek
              </button>
              <button
                onClick={() => navigateToSection('challenges-section')}
                className="text-gray-300 hover:text-purple-400 transition-colors duration-300 py-2 flex items-center gap-1"
              >
                <ListChecks className="h-4 w-4 mr-2" /> Küldetések
              </button>
              
              {/* Add Profile/Dashboard links to mobile menu if authenticated */}
              {!isLoading && isAuthenticated && (
                <Link
                  to={isSuperadmin ? "/superadmin/dashboard" : (isAdmin ? "/admin/dashboard" : "/profile")}
                  className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 py-2 flex items-center gap-1"
                  onClick={() => setIsOpen(false)}
                >
                  {isSuperadmin ? <Shield className="h-4 w-4 mr-2 text-red-300" /> : (isAdmin ? <Shield className="h-4 w-4 mr-2 text-purple-300" /> : <User className="h-4 w-4 mr-2 text-cyan-300" />)}
                  {isSuperadmin ? "Superadmin Dashboard" : (isAdmin ? "Admin Dashboard" : "Profil")}
                </Link>
              )}
              {!isLoading && isAuthenticated && (isAdmin || isSuperadmin) && (
                <Link
                  to="/code"
                  className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 py-2 text-left flex items-center gap-1"
                  onClick={() => setIsOpen(false)}
                >
                  <QrCode className="h-4 w-4 mr-2 text-green-300" />
                  Beváltás
                </Link>
              )}
              {!isLoading && isAuthenticated && (
                <button
                  onClick={handleSignOut}
                  className="text-red-400 hover:text-red-500 transition-colors duration-300 py-2 text-left flex items-center gap-1"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Kijelentkezés
                </button>
              )}
              {!isLoading && !isAuthenticated && (
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 py-2 text-left flex items-center gap-1"
                  onClick={() => setIsOpen(false)}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Bejelentkezés
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>