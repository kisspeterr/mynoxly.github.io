import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus, Users, Trash2, CheckCircle, Clock, Settings, RefreshCw, AtSign, XCircle } from 'lucide-react';
import { MemberRole, OrganizationMember } from '@/types/organization';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { showError, showSuccess } from '@/utils/toast';

interface SuperadminMemberManagerProps {
    organizationId: string;
    organizationName: string;
}

// --- Role Definitions ---
const ROLE_OPTIONS: { value: MemberRole, label: string, description: string }[] = [
    { value: 'redemption_agent', label: 'Beváltó ügynök', description: 'Beválthat kuponokat a /code oldalon.' },
    { value: 'coupon_manager', label: 'Kupon kezelő', description: 'Létrehozhat, szerkeszthet és archiválhat kuponokat.' },
    { value: 'event_manager', label: 'Esemény kezelő', description: 'Létrehozhat és szerkeszthet eseményeket.' },
    { value: 'viewer', label: 'Statisztika néző', description: 'Rálát a beváltási statisztikákra.' },
];

const ROLE_MAP: Record<MemberRole, string> = {
    coupon_manager: 'Kupon kezelő',
    event_manager: 'Esemény kezelő',
    redemption_agent: 'Beváltó ügynök',
    viewer: 'Statisztika néző',
};

// Helper to fetch user profile by username
const fetchUserIdByUsername = async (username: string): Promise<string | null> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();
        
    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user ID by username:', error);
        return null;
    }
    return data?.id || null;
};

// Helper to fetch user profiles (username, email, first_name, last_name) securely via RPC
const fetchUserProfilesByIds = async (userIds: string[]): Promise<Record<string, { username: string, first_name: string | null, last_name: string | null }>> => {
    if (userIds.length === 0) return {};
    
    // Superadmin has access to this RPC
    const { data: usersData, error } = await supabase.rpc('get_user_profiles_by_ids', { user_ids: userIds });
    
    if (error) {
        console.error('Error fetching user profiles via RPC:', error);
        return {};
    }
    
    return (usersData || []).reduce((acc, user) => {
        acc[user.id] = {
            username: user.username,
            first_name: user.first_name || null,
            last_name: user.last_name || null,
        };
        return acc;
    }, {} as Record<string, { username: string, first_name: string | null, last_name: string | null }>);
};


// --- Invite Form ---
const inviteSchema = z.object({
    username: z.string().min(3, 'A felhasználónév kötelező.'),
    roles: z.array(z.string()).min(1, 'Legalább egy jogosultság kötelező.'),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteFormProps {
    onInvite: (username: string, roles: MemberRole[]) => Promise<{ success: boolean }>;
    onClose: () => void;
    isLoading: boolean;
}

const InviteForm: React.FC<InviteFormProps> = ({ onInvite, onClose, isLoading }) => {
    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<InviteFormData>({
        resolver: zodResolver(inviteSchema),
        defaultValues: { username: '', roles: [] },
    });
    
    const selectedRoles = watch('roles');

    const onSubmit = async (data: InviteFormData) => {
        const result = await onInvite(data.username, data.roles as MemberRole[]);
        if (result.success) {
            onClose();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300">Felhasználónév (@)</Label>
                <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input 
                        id="username"
                        {...register('username')}
                        className="pl-8 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
                        placeholder="felhasznalo_nev"
                    />
                </div>
                {errors.username && <p className="text-red-400 text-sm">{errors.username.message}</p>}
            </div>
            
            <div className="space-y-3">
                <Label className="text-gray-300">Jogosultságok *</Label>
                <div className="space-y-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 max-h-40 overflow-y-auto">
                    {ROLE_OPTIONS.map(role => (
                        <div key={role.value} className="flex items-start space-x-3">
                            <Checkbox
                                id={role.value}
                                checked={selectedRoles.includes(role.value)}
                                onCheckedChange={(checked) => {
                                    const currentRoles = selectedRoles;
                                    if (checked) {
                                        setValue('roles', [...currentRoles, role.value], { shouldValidate: true });
                                    } else {
                                        setValue('roles', currentRoles.filter(r => r !== role.value), { shouldValidate: true });
                                    }
                                }}
                                className="mt-1 border-cyan-400 data-[state=checked]:bg-cyan-600"
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label htmlFor={role.value} className="text-white font-medium cursor-pointer">
                                    {role.label}
                                </Label>
                                <p className="text-sm text-gray-400">{role.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
                {errors.roles && <p className="text-red-400 text-sm">{errors.roles.message}</p>}
            </div>

            <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white"
                disabled={isLoading || selectedRoles.length === 0}
            >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                Meghívás küldése
            </Button>
        </form>
    );
};

// --- Member Card ---
interface MemberCardProps {
    member: OrganizationMember;
    onUpdateRoles: (memberId: string, roles: MemberRole[]) => Promise<{ success: boolean }>;
    onRemove: (memberId: string) => Promise<{ success: boolean }>;
    isLoading: boolean;
    isOwner: boolean;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, onUpdateRoles, onRemove, isLoading, isOwner }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentRoles, setCurrentRoles] = useState<MemberRole[]>(member.roles);
    const [isSaving, setIsSaving] = useState(false);
    
    const handleSaveRoles = async () => {
        if (currentRoles.length === 0) {
            showError('Legalább egy jogosultság kötelező.');
            return;
        }
        setIsSaving(true);
        const result = await onUpdateRoles(member.id, currentRoles);
        setIsSaving(false);
        if (result.success) {
            setIsEditing(false);
        }
    };
    
    const handleCheckboxChange = (role: MemberRole, checked: boolean) => {
        setCurrentRoles(prev => 
            checked ? [...prev, role] : prev.filter(r => r !== role)
        );
    };
    
    const getRoleBadge = (role: MemberRole) => {
        const roleMap: Record<MemberRole, string> = {
            coupon_manager: 'bg-cyan-600/50 text-cyan-300',
            event_manager: 'bg-purple-600/50 text-purple-300',
            redemption_agent: 'bg-green-600/50 text-green-300',
            viewer: 'bg-gray-600/50 text-gray-300',
        };
        return <Badge key={role} className={roleMap[role]}>{ROLE_OPTIONS.find(o => o.value === role)?.label || role}</Badge>;
    };

    return (
        <Card className={`bg-black/50 backdrop-blur-sm text-white transition-shadow duration-300 ${member.status === 'pending' ? 'border-yellow-500/30 opacity-80' : 'border-cyan-500/30'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl text-white flex items-center gap-2">
                    <AtSign className="h-5 w-5 text-cyan-400" />
                    {member.profile?.username || 'Ismeretlen felhasználó'}
                    {isOwner && <Badge className="ml-2 bg-red-600/50 text-red-300 flex items-center gap-1"><Shield className="h-3 w-3" /> Tulajdonos</Badge>}
                </CardTitle>
                {member.status === 'pending' ? (
                    <Badge className="bg-yellow-600/50 text-yellow-300 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Függőben
                    </Badge>
                ) : (
                    <Badge className="bg-green-600/50 text-green-300 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Aktív
                    </Badge>
                )}
            </CardHeader>
            <CardContent className="space-y-3 text-left text-sm">
                <CardDescription className="text-gray-400">
                    {member.profile?.first_name || ''} {member.profile?.last_name || ''}
                </CardDescription>
                
                <div className="pt-2 border-t border-gray-700/50 space-y-2">
                    <h4 className="font-semibold text-gray-300 flex items-center gap-2">
                        <Settings className="h-4 w-4" /> Jogosultságok:
                    </h4>
                    
                    {isEditing ? (
                        <div className="space-y-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                            {ROLE_OPTIONS.map(role => (
                                <div key={role.value} className="flex items-center space-x-3">
                                    <Checkbox
                                        id={`edit-${member.id}-${role.value}`}
                                        checked={currentRoles.includes(role.value)}
                                        onCheckedChange={(checked) => handleCheckboxChange(role.value, checked as boolean)}
                                        className="border-cyan-400 data-[state=checked]:bg-cyan-600"
                                        disabled={isSaving}
                                    />
                                    <Label htmlFor={`edit-${member.id}-${role.value}`} className="text-white font-medium cursor-pointer">
                                        {role.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {member.roles.map(getRoleBadge)}
                        </div>
                    )}
                </div>
                
                {member.status === 'accepted' && (
                    <div className="flex space-x-2 pt-4">
                        {isEditing ? (
                            <Button 
                                onClick={handleSaveRoles}
                                className="flex-grow bg-green-600 hover:bg-green-700"
                                disabled={isSaving || isLoading}
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                Mentés
                            </Button>
                        ) : (
                            <Button 
                                onClick={() => { setCurrentRoles(member.roles); setIsEditing(true); }}
                                variant="outline"
                                className="flex-grow border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                                disabled={isLoading}
                            >
                                <Settings className="h-4 w-4 mr-2" />
                                Jogosultságok szerkesztése
                            </Button>
                        )}
                        
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="destructive" size="icon" className="h-10 w-10 flex-shrink-0" disabled={isLoading}>
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-black/80 border-red-500/30 backdrop-blur-sm max-w-sm">
                                <DialogHeader>
                                    <DialogTitle className="text-red-400">Tag eltávolítása</DialogTitle>
                                    <DialogDescription className="text-gray-300">
                                        Biztosan el szeretnéd távolítani a(z) @{member.profile?.username || 'ismeretlen'} felhasználót a szervezetből?
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline" className="text-gray-300 border-gray-700 hover:bg-gray-800">Mégsem</Button>
                                    </DialogClose>
                                    <Button 
                                        variant="destructive" 
                                        onClick={() => onRemove(member.id)}
                                        disabled={isLoading}
                                    >
                                        Eltávolítás megerősítése
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};


const SuperadminMemberManager: React.FC<SuperadminMemberManagerProps> = ({ organizationId, organizationName }) => {
    const [members, setMembers] = useState<OrganizationMember[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // The owner's ID is the organizationId itself in the profiles table
    const ownerId = organizationId;

    const fetchMembers = useCallback(async () => {
        setIsLoading(true);
        try {
            // 1. Fetch raw members data (Superadmin RLS allows this)
            const { data: rawMembers, error } = await supabase
                .from('organization_members')
                .select(`
                    id, organization_id, user_id, status, roles, created_at
                `)
                .eq('organization_id', organizationId)
                .order('status', { ascending: true })
                .order('created_at', { ascending: true });

            if (error) {
                showError('Hiba történt a tagok betöltésekor.');
                console.error('Fetch members error:', error);
                setMembers([]);
                return;
            }
            
            if (!rawMembers) {
                setMembers([]);
                return;
            }
            
            // 2. Collect user IDs and fetch profiles securely
            const userIds = rawMembers.map(m => m.user_id);
            const profileMap = await fetchUserProfilesByIds(userIds);
            
            // 3. Combine data
            const processedMembers: OrganizationMember[] = rawMembers
                .map(m => {
                    const userProfile = profileMap[m.user_id];
                    return {
                        ...m,
                        profile: userProfile ? {
                            username: userProfile.username,
                            first_name: userProfile.first_name,
                            last_name: userProfile.last_name,
                        } : null,
                    } as OrganizationMember;
                });
                
            setMembers(processedMembers);

        } finally {
            setIsLoading(false);
        }
    }, [organizationId]);
    
    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);
    
    // --- CRUD Operations ---
    
    const inviteMember = async (username: string, roles: MemberRole[]) => {
        setIsLoading(true);
        try {
            const userId = await fetchUserIdByUsername(username);
            
            if (!userId) {
                showError(`A felhasználó (@${username}) nem található.`);
                return { success: false };
            }
            
            if (userId === ownerId) {
                showError('A tulajdonos már tagja a szervezetnek.');
                return { success: false };
            }

            const { error } = await supabase
                .from('organization_members')
                .insert({
                    organization_id: organizationId,
                    user_id: userId,
                    status: 'pending',
                    roles: roles,
                });

            if (error) {
                if (error.code === '23505') { // Unique constraint violation
                    showError(`A felhasználó (@${username}) már tagja vagy meghívottja a szervezetnek.`);
                } else {
                    showError(`Hiba történt a meghíváskor: ${error.message}`);
                    console.error('Invite member error:', error);
                }
                return { success: false };
            }

            showSuccess(`Meghívó elküldve @${username} felhasználónak!`);
            fetchMembers(); // Refresh list
            return { success: true };
            
        } finally {
            setIsLoading(false);
        }
    };
    
    const updateMemberRoles = async (memberId: string, roles: MemberRole[]) => {
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('organization_members')
                .update({ roles: roles })
                .eq('id', memberId)
                .eq('organization_id', organizationId); // Security check

            if (error) {
                showError(`Hiba történt a jogosultságok frissítésekor: ${error.message}`);
                return { success: false };
            }

            showSuccess('Jogosultságok sikeresen frissítve!');
            fetchMembers(); // Refresh list
            return { success: true };
            
        } finally {
            setIsLoading(false);
        }
    };
    
    const removeMember = async (memberId: string) => {
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('organization_members')
                .delete()
                .eq('id', memberId)
                .eq('organization_id', organizationId); // Security check

            if (error) {
                showError(`Hiba történt a tag eltávolításakor: ${error.message}`);
                return { success: false };
            }

            showSuccess('Tag sikeresen eltávolítva!');
            fetchMembers(); // Refresh list
            return { success: true };
            
        } finally {
            setIsLoading(false);
        }
    };
    
    const ownerMember = members.find(m => m.user_id === ownerId);
    const delegatedMembers = members.filter(m => m.user_id !== ownerId);
    
    const activeMembers = delegatedMembers.filter(m => m.status === 'accepted');
    const pendingMembers = delegatedMembers.filter(m => m.status === 'pending');

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-cyan-300 flex items-center gap-2">
                    <Users className="h-6 w-6" />
                    Tagok Kezelése ({members.length})
                </h3>
                <div className="flex space-x-3">
                    <Button 
                        onClick={fetchMembers} 
                        variant="outline" 
                        size="icon"
                        className="border-gray-700 text-gray-400 hover:bg-gray-800"
                        disabled={isLoading}
                    >
                        <RefreshCw className={isLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="bg-cyan-600 hover:bg-cyan-700" disabled={isLoading}>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Tag meghívása
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-black/80 border-cyan-500/30 backdrop-blur-sm max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-cyan-300">Tag meghívása</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                    Hívj meg egy felhasználót a {organizationName} adminisztrációs csapatába.
                                </DialogDescription>
                            </DialogHeader>
                            <InviteForm 
                                onInvite={inviteMember} 
                                onClose={() => {}} // Handled by DialogClose in form footer
                                isLoading={isLoading}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            
            {isLoading ? (
                <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                    <p className="ml-3 text-gray-300">Tagok betöltése...</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Owner Card */}
                    {ownerMember && (
                        <>
                            <h4 className="text-xl font-bold text-red-300 mb-4">Tulajdonos</h4>
                            <MemberCard 
                                key={ownerMember.id} 
                                member={ownerMember} 
                                onUpdateRoles={updateMemberRoles}
                                onRemove={removeMember}
                                isLoading={isLoading}
                                isOwner={true}
                            />
                        </>
                    )}
                    
                    {/* Active Members */}
                    <h4 className="text-xl font-bold text-white mb-4 pt-4 border-t border-gray-700/50">Aktív tagok ({activeMembers.length})</h4>
                    {activeMembers.length === 0 ? (
                        <p className="text-gray-400 mb-8">Nincsenek aktív delegált tagok.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {activeMembers.map(member => (
                                <MemberCard 
                                    key={member.id} 
                                    member={member} 
                                    onUpdateRoles={updateMemberRoles}
                                    onRemove={removeMember}
                                    isLoading={isLoading}
                                    isOwner={false}
                                />
                            ))}
                        </div>
                    )}
                    
                    {/* Pending Invitations */}
                    <h4 className="text-xl font-bold text-yellow-300 mb-4 pt-4 border-t border-gray-700/50">Függőben lévő meghívások ({pendingMembers.length})</h4>
                    {pendingMembers.length === 0 ? (
                        <p className="text-gray-400">Nincsenek függőben lévő meghívások.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {pendingMembers.map(member => (
                                <MemberCard 
                                    key={member.id} 
                                    member={member} 
                                    onUpdateRoles={updateMemberRoles}
                                    onRemove={removeMember}
                                    isLoading={isLoading}
                                    isOwner={false}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SuperadminMemberManager;