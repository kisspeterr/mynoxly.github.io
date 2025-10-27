import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, Profile } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Users, Building, RefreshCw, PlusCircle, Pencil, Mail, AtSign, Shield, CheckCircle, XCircle } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MemberRole } from '@/types/organization';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import SuperadminMemberManager from './SuperadminMemberManager'; // NEW IMPORT

// Extended Profile type for Superadmin view
interface SuperadminProfile extends Profile {
    email: string;
}

// --- Organization Creation/Owner Change Form ---

interface UserOption {
    id: string;
    username: string;
    email: string;
    role: string;
}

interface OrganizationFormProps {
    initialOrg: SuperadminProfile | null; // Null for creation, data for editing
    onSave: (userId: string, orgName: string | null, newRole: 'user' | 'admin' | 'superadmin', oldOwnerId?: string) => Promise<boolean>;
    onClose: () => void;
    isSaving: boolean;
}

const OrganizationForm: React.FC<OrganizationFormProps> = ({ initialOrg, onSave, onClose, isSaving }) => {
    const [orgName, setOrgName] = useState(initialOrg?.organization_name || '');
    const [ownerId, setOwnerId] = useState(initialOrg?.id || '');
    const [availableUsers, setAvailableUsers] = useState<UserOption[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    
    const isEditing = !!initialOrg;
    
    const fetchAvailableUsers = useCallback(async () => {
        setIsLoadingUsers(true);
        try {
            // Fetch all users and filter for non-admin/non-superadmin users, OR the current owner
            const { data: usersData, error } = await supabase.rpc('get_all_user_profiles_for_superadmin');
            
            if (error) {
                showError('Hiba történt a felhasználók betöltésekor.');
                console.error('Fetch users error:', error);
                return;
            }
            
            const options: UserOption[] = (usersData as SuperadminProfile[])
                // Filter: Only show users (role='user') or the current owner (for editing)
                // NOTE: We now allow selecting existing admins/superadmins as new owners, 
                // as the logic below will handle demoting the old owner if necessary.
                .map(u => ({
                    id: u.id,
                    username: u.username,
                    email: u.email,
                    role: u.role,
                }));
                
            setAvailableUsers(options);
        } finally {
            setIsLoadingUsers(false);
        }
    }, [initialOrg?.id]);
    
    useEffect(() => {
        fetchAvailableUsers();
    }, [fetchAvailableUsers]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedOrgName = orgName.trim();
        
        if (!trimmedOrgName) {
            showError('A szervezet neve kötelező.');
            return;
        }
        if (!ownerId) {
            showError('A tulajdonos kiválasztása kötelező.');
            return;
        }
        
        // When creating/editing an organization, the owner's role MUST be 'admin'
        const success = await onSave(ownerId, trimmedOrgName, 'admin', initialOrg?.id);
        if (success) {
            onClose();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="orgName" className="text-gray-300">Szervezet neve *</Label>
                <Input 
                    id="orgName"
                    type="text" 
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
                    disabled={isSaving}
                />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="owner" className="text-gray-300">Tulajdonos kiválasztása *</Label>
                <Select 
                    value={ownerId} 
                    onValueChange={setOwnerId}
                    disabled={isSaving || isLoadingUsers}
                >
                    <SelectTrigger className="w-full bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700/50">
                        <SelectValue placeholder={isLoadingUsers ? "Felhasználók betöltése..." : "Válassz tulajdonost"} />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-red-500/30 text-white">
                        {availableUsers.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                                <div className="flex items-center">
                                    <AtSign className="h-4 w-4 mr-2 text-gray-400" />
                                    @{user.username} ({user.email})
                                    {user.role === 'admin' && user.id !== initialOrg?.id && <Badge className="ml-2 bg-yellow-600/50 text-yellow-300">Már Admin</Badge>}
                                    {user.role === 'superadmin' && <Badge className="ml-2 bg-red-600/50 text-red-300">Superadmin</Badge>}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {isEditing && ownerId !== initialOrg?.id && (
                    <p className="text-sm text-yellow-400">Figyelem: A tulajdonos megváltoztatása átruházza a szervezet adminisztrációs jogait.</p>
                )}
            </div>

            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline" className="text-gray-300 border-gray-700 hover:bg-gray-800" disabled={isSaving}>Mégsem</Button>
                </DialogClose>
                <Button 
                    type="submit" 
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isSaving || !orgName.trim() || !ownerId}
                >
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                    {isEditing ? 'Frissítés' : 'Létrehozás'}
                </Button>
            </DialogFooter>
        </form>
    );
};

// --- Organization Details Modal ---

interface OrganizationDetailsModalProps {
    organization: SuperadminProfile;
    onClose: () => void;
    onUpdate: (userId: string, orgName: string | null, newRole: 'user' | 'admin' | 'superadmin', oldOwnerId?: string) => Promise<boolean>;
    isSaving: boolean;
    fetchOrganizations: () => void;
}

const OrganizationDetailsModal: React.FC<OrganizationDetailsModalProps> = ({ organization, onClose, onUpdate, isSaving, fetchOrganizations }) => {
    const [activeTab, setActiveTab] = useState('details');
    
    // Function to handle owner change (uses the same logic as creation/update)
    const handleOwnerUpdate = async (userId: string, orgName: string | null, newRole: 'user' | 'admin' | 'superadmin', oldOwnerId?: string) => {
        // 1. Update the new owner's profile (set role='admin', org_name)
        const success = await onUpdate(userId, orgName, newRole, oldOwnerId);
        
        if (success) {
            // 2. If the owner changed, we must demote the old owner
            if (userId !== organization.id) {
                // Demote old owner back to 'user' and clear their organization_name
                // CRITICAL CHANGE: Only demote if the old owner is NOT a superadmin.
                if (organization.role !== 'superadmin') {
                    const { error } = await supabase
                        .from('profiles')
                        .update({ 
                            role: 'user', 
                            organization_name: null, 
                            logo_url: null,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', organization.id); // organization.id is the old owner's ID
                        
                    if (error) {
                        console.error('Error demoting old owner:', error);
                        showError('Hiba történt a régi tulajdonos jogosultságának visszavonásakor.');
                        return false;
                    }
                }
                
                // 3. Remove old owner's membership record (if it exists)
                const { error: deleteMemberError } = await supabase
                    .from('organization_members')
                    .delete()
                    .eq('organization_id', organization.id)
                    .eq('user_id', organization.id);
                    
                if (deleteMemberError) {
                    console.warn('Warning: Failed to delete old owner membership:', deleteMemberError);
                }
                
                showSuccess(`Tulajdonos sikeresen átruházva ${orgName} szervezetre.`);
            } else {
                // If the owner is the same, just update the organization name/details
                showSuccess(`Szervezet adatai sikeresen frissítve.`);
            }
            
            fetchOrganizations(); // Refresh list
            return true;
        }
        return false;
    };
    
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="bg-black/80 border-red-500/30 backdrop-blur-sm max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-3xl text-red-400 flex items-center gap-2">
                        <Building className="h-7 w-7" />
                        {organization.organization_name} Kezelése
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Tulajdonos: @{organization.username} ({organization.email})
                    </DialogDescription>
                </DialogHeader>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border border-gray-700/50 h-auto p-1">
                        <TabsTrigger value="details" className="data-[state=active]:bg-red-600/50 data-[state=active]:text-white py-2 text-sm">
                            <Pencil className="h-4 w-4 mr-2" /> Szervezet adatai
                        </TabsTrigger>
                        <TabsTrigger value="members" className="data-[state=active]:bg-red-600/50 data-[state=active]:text-white py-2 text-sm">
                            <Users className="h-4 w-4 mr-2" /> Tagok & Jogosultságok
                        </TabsTrigger>
                    </TabsList>
                    
                    <div className="mt-6">
                        <TabsContent value="details">
                            <h3 className="text-xl font-bold text-white mb-4">Tulajdonos és Név Módosítása</h3>
                            <OrganizationForm 
                                initialOrg={organization}
                                onSave={handleOwnerUpdate}
                                onClose={onClose}
                                isSaving={isSaving}
                            />
                        </TabsContent>
                        
                        <TabsContent value="members">
                            <SuperadminMemberManager 
                                organizationId={organization.id}
                                organizationName={organization.organization_name || 'Ismeretlen Szervezet'}
                            />
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

// --- Main Component ---

const SuperadminOrganizationsPage: React.FC = () => {
    const { isSuperadmin, user } = useAuth();
    const [organizations, setOrganizations] = useState<SuperadminProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<SuperadminProfile | null>(null);

    const fetchOrganizations = useCallback(async () => {
        if (!isSuperadmin) return;

        setIsLoading(true);
        try {
            // Fetch all users and filter for admins (organization owners)
            const { data, error } = await supabase.rpc('get_all_user_profiles_for_superadmin');

            if (error) {
                showError('Hiba történt a szervezetek betöltésekor.');
                console.error('Fetch organizations error:', error);
                setOrganizations([]);
                return;
            }
            
            const orgs = (data as SuperadminProfile[])
                .filter(p => p.role === 'admin' && p.organization_name);
                
            setOrganizations(orgs);

        } finally {
            setIsLoading(false);
        }
    }, [isSuperadmin]);

    useEffect(() => {
        fetchOrganizations();
    }, [fetchOrganizations]);
    
    // Handles both creation and owner change/update
    const handleSaveOrganization = async (userId: string, orgName: string | null, newRole: 'user' | 'admin' | 'superadmin', oldOwnerId?: string): Promise<boolean> => {
        if (!user || !isSuperadmin) return false;
        
        setIsSaving(true);
        try {
            const updates: Partial<Profile> = {
                role: newRole,
                organization_name: orgName,
                updated_at: new Date().toISOString(),
            };
            
            // 1. Update the target user's profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId);

            if (profileError) {
                if (profileError.code === '23505' && profileError.message.includes('unique_organization_name')) {
                    showError('Hiba: Ez a szervezet név már foglalt.');
                } else {
                    showError(`Hiba a profil frissítésekor: ${profileError.message}`);
                    console.error('Organization profile update error:', profileError);
                }
                return false;
            }
            
            // 2. Ensure owner membership is set (if organization name is present)
            if (orgName) {
                const ownerRoles: MemberRole[] = ['coupon_manager', 'event_manager', 'redemption_agent', 'viewer'];
                const { error: memberError } = await supabase
                    .from('organization_members')
                    .upsert({
                        organization_id: userId, // Owner's profile ID is the organization ID
                        user_id: userId,
                        status: 'accepted',
                        roles: ownerRoles,
                    }, { onConflict: 'organization_id, user_id' });
                    
                if (memberError) {
                    console.error('Error ensuring owner membership:', memberError);
                    showError('Hiba történt a tulajdonosi tagság beállításakor.');
                    return false;
                }
            }
            
            showSuccess(`Szervezet sikeresen ${oldOwnerId ? 'frissítve' : 'létrehozva'}!`);
            fetchOrganizations();
            return true;

        } catch (error) {
            showError('Váratlan hiba történt a mentés során.');
            console.error('Unexpected save error:', error);
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-red-300 flex items-center gap-2">
                    <Building className="h-6 w-6" />
                    Szervezetek Kezelése ({organizations.length})
                </h2>
                <div className="flex space-x-3">
                    <Button 
                        onClick={fetchOrganizations} 
                        variant="outline" 
                        size="icon"
                        className="border-gray-700 text-gray-400 hover:bg-gray-800"
                        disabled={isLoading}
                    >
                        <RefreshCw className={isLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                    </Button>
                    <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-red-600 hover:bg-red-700">
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Szervezet létrehozása
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-black/80 border-red-500/30 backdrop-blur-sm max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-red-400">Új Szervezet Létrehozása</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                    Válassz egy felhasználót, aki a szervezet tulajdonosa lesz.
                                </DialogDescription>
                            </DialogHeader>
                            <OrganizationForm 
                                initialOrg={null}
                                onSave={handleSaveOrganization}
                                onClose={() => setIsCreateFormOpen(false)}
                                isSaving={isSaving}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-red-400" />
                    <p className="ml-3 text-gray-300">Szervezetek betöltése...</p>
                </div>
            ) : organizations.length === 0 ? (
                <p className="text-gray-400 text-center mt-10">Nincs aktív szervezet.</p>
            ) : (
                <div className="space-y-4">
                    {organizations.map(org => (
                        <Card key={org.id} className="bg-black/50 border-gray-700/50 backdrop-blur-sm text-white">
                            <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-center">
                                <div className="space-y-1 mb-2 sm:mb-0 text-left flex-grow min-w-0">
                                    <p className="text-lg font-semibold text-cyan-300 flex items-center">
                                        <Building className="h-4 w-4 mr-2 text-purple-400" />
                                        {org.organization_name}
                                    </p>
                                    <p className="text-sm text-gray-400 flex items-center">
                                        <Shield className="h-4 w-4 mr-2 text-purple-400" />
                                        Tulajdonos: <span className="ml-1 font-medium text-white">@{org.username}</span>
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center">
                                        <Mail className="h-3 w-3 mr-2" />
                                        {org.email}
                                    </p>
                                </div>
                                
                                <Button 
                                    onClick={() => setSelectedOrg(org)}
                                    variant="outline"
                                    className="border-red-400 text-red-400 hover:bg-red-400/10 flex-shrink-0"
                                    disabled={isSaving}
                                >
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Kezelés
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            
            {/* Organization Details/Management Modal */}
            {selectedOrg && (
                <OrganizationDetailsModal 
                    organization={selectedOrg}
                    onClose={() => setSelectedOrg(null)}
                    onUpdate={handleSaveOrganization}
                    isSaving={isSaving}
                    fetchOrganizations={fetchOrganizations}
                />
            )}
        </div>
    );
};

export default SuperadminOrganizationsPage;