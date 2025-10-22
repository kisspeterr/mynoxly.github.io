import { useState } from 'react';
import { Mail, Loader2, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWaitlist } from '@/hooks/use-waitlist';

const WaitlistSection = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const { subscribeToWaitlist, isLoading } = useWaitlist();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    await subscribeToWaitlist({ email, name: name || undefined });
    
    // Clear form on success (handled internally by hook showing toast)
    if (!isLoading) {
        setEmail('');
        setName('');
    }
  };

  return (
    <section id="waitlist" className="py-20 px-6 bg-black/50 border-t border-purple-500/20">
      <div className="container mx-auto text-center max-w-3xl">
        <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 animate-pulse">
          <Mail className="h-4 w-4 mr-2" />
          Csatlakozz a Várólistához
        </Badge>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-purple-300">
          Légy az elsők között!
        </h2>
        
        <p className="text-xl text-gray-300 mb-8">
          Iratkozz fel, hogy értesítést kapj a pécsi indulásról és exkluzív béta hozzáférést nyerj.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-gray-900/50 rounded-xl border border-purple-500/30 shadow-xl">
          <Input
            type="text"
            placeholder="Teljes név (opcionális)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 py-6 text-lg"
          />
          <Input
            type="email"
            placeholder="Email címed *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 py-6 text-lg"
          />
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 text-lg"
            disabled={isLoading || !email}
          >
            {isLoading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Send className="h-5 w-5 mr-2" />}
            Feliratkozom
          </Button>
        </form>
        
        <p className="text-sm text-gray-500 mt-4">
          Ígérem, nem küldünk spamet. Csak a legfontosabb frissítéseket.
        </p>
      </div>
    </section>
  );
};

export default WaitlistSection;