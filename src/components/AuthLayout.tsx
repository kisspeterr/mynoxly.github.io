import React from 'react';
import { Moon } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Moon className="h-10 w-10 text-cyan-400 animate-pulse" />
            <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              NOXLY Auth
            </span>
          </div>
          <p className="text-gray-400">Jelentkezz be a Pécsi éjszakai élethez!</p>
        </div>
        <div className="bg-black/30 border border-cyan-500/30 rounded-xl p-6 shadow-2xl backdrop-blur-sm">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;