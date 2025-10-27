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

// Interface to hold user and their organizations
interface UserWithOrgs extends SuperadminProfile {
    organizations: { id: string, organization_name: string }[];
}

const SuperadminUsersPage: React.FC = () => {
    const { isSuperadmin } = useAuth();
    const [users, setUsers] = useState<UserWithOrgs[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = useCallback(async () => {
        if (!isSuperadmin) return;

        setIsLoading(true);
        try {
            // 1. Fetch all user profiles including email (via RPC)
            const { data: profilesData, error: profilesError } = await supabase.rpc('get_all_user_profiles_for_superadmin');
            
            if (profilesError) {
                showError('Hiba történt a felhasználók betöltésekor.');
                console.error('Fetch users error:', profilesError);
                setUsers([]);
                return;
            }
            
            const rawUsers = profilesData as SuperadminProfile[];

            // 2. Fetch all accepted organization memberships
            const { data: membersData, error: membersError } = await supabase
                .from('organization_members')
                .select(`
                    user_id,
                    organization:organization_id (id, organization_name)
                `)
                .eq('status', 'accepted');
                
            if (membersError) {
                console.error('Error fetching organization members:', membersError);
            }
            
            const memberships = membersData || [];
            
            // 3. Map organizations to users
            const usersMap: Record<string, UserWithOrgs> = rawUsers.reduce((acc, user) => {
                acc[user.id] = {
                    ...user,
                    organizations: [],
                };
                return acc;
            }, {} as Record<string, UserWithOrgs>);
            
            memberships.forEach(member => {
                const orgProfile = member.organization as { id: string, organization_name: string } | null;
                if (orgProfile && usersMap[member.user_id]) {
                    usersMap[member.user_id].organizations.push(orgProfile);
                }
            });
            
            setUsers(Object.values(usersMap));

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
        u.organizations.some(org => org.organization_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
                                    <p className="text-sm text-gray-400 flex items-start">
                                        <Building className="h-4 w-4 mr-2 mt-1 text-purple-400 flex-shrink-0" />
                                        Szervezetek: 
                                        <span className="ml-1 font-medium text-white flex flex-wrap gap-1">
                                            {user.organizations.length > 0 ? (
                                                user.organizations.map(org => (
                                                    <Badge key={org.id} className="bg-cyan-600/50 text-cyan-300">{org.organization_name}</Badge>
                                                ))
                                            ) : (
                                                <span className="text-gray-500">Nincs</span>
                                            )}
                                        </span>
                                    </p>
                                </div>
                                
                                <div className="flex-shrink-0">
                                    <Shield className="h-6 w-6 text-gray-600" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SuperadminUsersPage;