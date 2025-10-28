import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, Profile } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, User, Shield, Building, Mail, RefreshCw, Users, AtSign } from 'lucide-react';
import { showError } from '@/utils/toast';
import { Badge } from '@/components/ui/badge';

// Extended Profile type for Superadmin view
interface SuperadminProfile extends Profile {
    email: string;
}

const SuperadminUsersPage: React.FC = () => {
    const { isSuperadmin } = useAuth();
    const [users, setUsers] = useState<SuperadminProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = useCallback(async () => {
        if (!isSuperadmin) return;

        setIsLoading(true);
        try {
            // Fetch all user profiles including email and organization data
            const { data, error } = await supabase.rpc('get_all_user_profiles_for_superadmin');

            if (error) {
                showError('Hiba történt a felhasználók betöltésekor.');
                console.error('Fetch users error:', error);
                setUsers([]);
                return;
            }
            
            setUsers(data as SuperadminProfile[]);

        } finally {
            setIsLoading(false);
        }
    }, [isSuperadmin]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.organization_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Removed: handleSetOrganization, handleUpdateOrganization, isUpdating, isOrgFormOpen, selectedUser, newOrgName, newRole states and functions.

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-red-300 flex items-center gap-2">
                    <Users className="h-6 w-6" />
                    Felhasználók & Szervezetek
                </h2>
                <Button 
                    onClick={fetchUsers} 
                    variant="outline" 
                    size="icon"
                    className="border-gray-700 text-gray-400 hover:bg-gray-800"
                    disabled={isLoading}
                >
                    <RefreshCw className={isLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                </Button>
            </div>
            
            {/* Search Input */}
            <div className="max-w-lg mb-8 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input 
                    type="text"
                    placeholder="Keresés felhasználónévre, emailre vagy szervezetre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 text-lg py-6 rounded-xl"
                />
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-red-400" />
                    <p className="ml-3 text-gray-300">Felhasználók betöltése...</p>
                </div>
            ) : filteredUsers.length === 0 ? (
                <p className="text-gray-400 text-center mt-10">Nincs találat.</p>
            ) : (
                <div className="space-y-4">
                    {filteredUsers.map(user => (
                        <Card key={user.id} className="bg-black/50 border-gray-700/50 backdrop-blur-sm text-white">
                            <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-center">
                                <div className="space-y-1 mb-2 sm:mb-0 text-left flex-grow min-w-0">
                                    <p className="text-lg font-semibold text-cyan-300 flex items-center">
                                        <User className="h-4 w-4 mr-2 text-purple-400" />
                                        @{user.username}
                                        {user.role === 'superadmin' && <Badge className="ml-2 bg-red-600/50 text-red-300">SUPERADMIN</Badge>}
                                        {user.role === 'admin' && <Badge className="ml-2 bg-purple-600/50 text-purple-300">ADMIN</Badge>}
                                    </p>
                                    <p className="text-sm text-gray-400 flex items-center">
                                        <Mail className="h-4 w-4 mr-2 text-purple-400" />
                                        {user.email}
                                    </p>
                                    <p className="text-sm text-gray-400 flex items-center">
                                        <Building className="h-4 w-4 mr-2 text-purple-400" />
                                        Szervezet: <span className={`ml-1 font-medium ${user.organization_name ? 'text-white' : 'text-gray-500'}`}>
                                            {user.organization_name || 'Nincs'}
                                        </span>
                                    </p>
                                </div>
                                
                                {/* Removed: Button to modify organization/role */}
                                <div className="flex-shrink-0">
                                    <Shield className="h-6 w-6 text-gray-600" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            
            {/* Removed: Organization and Role Management Modal */}
        </div>
    );
};

export default SuperadminUsersPage;