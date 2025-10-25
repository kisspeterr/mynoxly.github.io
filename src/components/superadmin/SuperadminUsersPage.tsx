import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, Profile } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, User, Shield, Building, Mail, RefreshCw, CheckCircle, XCircle, Users } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

// Extended Profile type for Superadmin view
interface SuperadminProfile extends Profile {
    email: string;
}

const SuperadminUsersPage: React.FC = () => {
    const { isSuperadmin, user: currentUser, fetchProfile } = useAuth();
    const [users, setUsers] = useState<SuperadminProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isOrgFormOpen, setIsOrgFormOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<SuperadminProfile | null>(null);
    const [newOrgName, setNewOrgName] = useState('');

    const fetchUsers = useCallback(async () => {
        if (!isSuperadmin) return;

        setIsLoading(true);
        try {
            // Fetch all profiles and join auth.users for email
            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    *,
                    user:id (email)
                `)
                .order('created_at', { ascending: false });

            if (error) {
                showError('Hiba történt a felhasználók betöltésekor.');
                console.error('Fetch users error:', error);
                setUsers([]);
                return;
            }
            
            const processedUsers: SuperadminProfile[] = (data as any[]).map(p => ({
                ...p,
                email: p.user?.email || 'N/A',
            }));
            
            setUsers(processedUsers);

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
    
    const handleSetOrganization = (user: SuperadminProfile) => {
        setSelectedUser(user);
        setNewOrgName(user.organization_name || '');
        setIsOrgFormOpen(true);
    };
    
    const handleUpdateOrganization = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser || isUpdating) return;
        
        const trimmedOrgName = newOrgName.trim() || null;
        const newRole = trimmedOrgName ? 'admin' : 'user';
        
        setIsUpdating(true);
        try {
            // 1. Update profile (role, organization_name)
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ 
                    role: newRole,
                    organization_name: trimmedOrgName,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', selectedUser.id);

            if (profileError) {
                if (profileError.code === '23505' && profileError.message.includes('unique_organization_name')) {
                    showError('Hiba: Ez a szervezet név már foglalt.');
                } else {
                    showError(`Hiba a profil frissítésekor: ${profileError.message}`);
                }
                return;
            }
            
            // 2. Update organization_members table (ensure owner is member)
            if (trimmedOrgName) {
                const ownerRoles = ['coupon_manager', 'event_manager', 'redemption_agent', 'viewer'];
                const { error: memberError } = await supabase
                    .from('organization_members')
                    .upsert({
                        organization_id: selectedUser.id,
                        user_id: selectedUser.id,
                        status: 'accepted',
                        roles: ownerRoles,
                    }, { onConflict: 'organization_id, user_id' });
                    
                if (memberError) {
                    console.error('Error ensuring owner membership:', memberError);
                    showError('Hiba történt a tulajdonosi tagság beállításakor.');
                    return;
                }
            } else {
                // If organization is removed, remove all associated memberships (except the owner's, which is handled by profile update)
                // NOTE: RLS prevents deleting other users' data, but Superadmin RLS should allow this.
                const { error: deleteMembersError } = await supabase
                    .from('organization_members')
                    .delete()
                    .eq('organization_id', selectedUser.id);
                    
                if (deleteMembersError) {
                    console.warn('Warning: Failed to delete organization members:', deleteMembersError);
                }
            }

            showSuccess(`Felhasználó (@${selectedUser.username}) sikeresen frissítve!`);
            setIsOrgFormOpen(false);
            fetchUsers(); // Refresh list
            
            // If the current Superadmin is updating their own profile, force global state refresh
            if (selectedUser.id === currentUser?.id) {
                fetchProfile(selectedUser.id);
            }

        } catch (error) {
            showError('Váratlan hiba történt a mentés során.');
            console.error('Unexpected save error:', error);
        } finally {
            setIsUpdating(false);
        }
    };

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
                                
                                <Button 
                                    onClick={() => handleSetOrganization(user)}
                                    variant="outline"
                                    className="border-red-400 text-red-400 hover:bg-red-400/10 flex-shrink-0"
                                    disabled={isUpdating}
                                >
                                    <Shield className="h-4 w-4 mr-2" />
                                    {user.organization_name ? 'Szervezet szerkesztése' : 'Tulajdonos beállítása'}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            
            {/* Organization Management Modal */}
            {selectedUser && (
                <Dialog open={isOrgFormOpen} onOpenChange={setIsOrgFormOpen}>
                    <DialogContent className="bg-black/80 border-red-500/30 backdrop-blur-sm max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-red-400">Szervezeti Tulajdonos Beállítása</DialogTitle>
                            <DialogDescription className="text-gray-400">
                                Szervezet beállítása/módosítása a(z) @{selectedUser.username} felhasználóhoz.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdateOrganization} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="orgName" className="text-gray-300">Szervezet neve (Tulajdonos)</Label>
                                <Input 
                                    id="orgName"
                                    type="text" 
                                    value={newOrgName}
                                    onChange={(e) => setNewOrgName(e.target.value)}
                                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
                                    placeholder="Pl. Pécsi Kocsma"
                                />
                                <p className="text-xs text-gray-500">Ha üresen hagyod, a felhasználó elveszíti az admin/tulajdonos szerepkört.</p>
                            </div>
                            
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline" className="text-gray-300 border-gray-700 hover:bg-gray-800" disabled={isUpdating}>Mégsem</Button>
                                </DialogClose>
                                <Button 
                                    type="submit" 
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                    Mentés
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default SuperadminUsersPage;