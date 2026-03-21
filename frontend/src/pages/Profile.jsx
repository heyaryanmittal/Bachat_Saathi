import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card, Button, Input } from '../components/ui';
import {
  User, Settings, Shield, Bell, Key, Edit3, 
  Save, X, Camera, TrendingUp, Calendar, Mail, 
  ChevronLeft, Smartphone, Globe, Lock, Star, CheckCircle
} from 'lucide-react';
const TABS = [
  { id: 'overview', label: 'Identity', icon: User },
  { id: 'settings', label: 'Preferences', icon: Settings },
  { id: 'security', label: 'Vault', icon: Shield },
];
const Profile = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editedUser, setEditedUser] = useState({});
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        if (user) {
            setEditedUser({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                location: user.location || '',
                bio: user.bio || ''
            });
        }
    }, [user]);
    useEffect(() => {
        const fetch2FA = async () => {
            try {
                const res = await api.get('/auth/2fa/status');
                setIs2FAEnabled(res.data.is2FAEnabled);
            } catch (e) {  }
        };
        fetch2FA();
    }, []);
    const handleSave = async () => {
        try {
            setIsSaving(true);
            await updateUser(editedUser);
            toast.success('Identity synchronized.');
            setIsEditing(false);
        } catch (e) { toast.error('Sync failed.'); }
        finally { setIsSaving(false); }
    };
    const handleEnable2FA = async () => {
        try {
            setIsLoading(true);
            await api.post('/auth/2fa/send-otp');
            setShow2FAModal(true);
            toast.success('Transmission code sent.');
        } catch (e) { toast.error('Stream error.'); }
        finally { setIsLoading(false); }
    };
    const handleVerifyOtp = async () => {
        try {
            setIsLoading(true);
            await api.post('/auth/2fa/verify-otp', { otp });
            setIs2FAEnabled(true);
            setShow2FAModal(false);
            toast.success('Vault secured.');
        } catch (e) { toast.error('Integrity failure.'); }
        finally { setIsLoading(false); }
    };
    return (
        <div className="space-y-6 animate-entrance pb-12 overflow-x-hidden pt-2">
            {}
            <div className="flex flex-col md:flex-row items-center justify-end gap-6 px-2">
                <Button variant="secondary" onClick={() => navigate('/dashboard')} size="lg"><ChevronLeft className="mr-2 w-5 h-5" />Back to Matrix</Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {}
                <Card variant="glass" className="lg:col-span-1 h-fit sticky top-24 p-2">
                    <div className="space-y-1">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-muted/50'}`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </Card>
                {}
                <div className="lg:col-span-3 space-y-8">
                    {activeTab === 'overview' && (
                        <>
                            <Card variant="glass" className="saas-card p-8">
                                <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                                    <div className="relative group">
                                        <div className="w-32 h-32 gradient-primary rounded-full flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-primary/30 group-hover:scale-105 transition-transform duration-500">
                                            {(user?.name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <button className="absolute bottom-1 right-1 w-10 h-10 bg-background border-2 border-border rounded-full flex items-center justify-center shadow-xl hover:text-primary transition-colors">
                                            <Camera className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="flex-1 text-center md:text-left space-y-4">
                                        <div>
                                            <h2 className="text-3xl font-black tracking-tighter mb-1">{user?.name}</h2>
                                            <p className="text-sm font-black text-muted-foreground uppercase tracking-widest flex items-center justify-center md:justify-start">
                                                <Mail className="w-3.5 h-3.5 mr-2 text-primary" />
                                                {user?.email}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                            <div className="bg-muted/30 px-3 py-1.5 rounded-xl border border-border/50 flex items-center">
                                                <Calendar className="w-3.5 h-3.5 mr-2 text-primary" />
                                                <span className="text-[10px] font-black uppercase">Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20 flex items-center">
                                                <Star className="w-3.5 h-3.5 mr-2 text-primary" />
                                                <span className="text-[10px] font-black uppercase text-primary">Premium User</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant={isEditing ? 'danger' : 'secondary'} size="lg" onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}>
                                        {isEditing ? <><X className="mr-2 w-4 h-4" /> Cancel</> : <><Edit3 className="mr-2 w-4 h-4" /> Modify</>}
                                    </Button>
                                </div>
                            </Card>
                            <Card variant="glass" className="saas-card p-8 space-y-8">
                                <div className="flex items-center space-x-2 text-primary">
                                    <Smartphone className="w-5 h-5" />
                                    <h3 className="font-black text-xs uppercase tracking-widest">Temporal Records</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Input label="Full Name" value={editedUser.name} onChange={e => setEditedUser({...editedUser, name: e.target.value})} readOnly={!isEditing} />
                                    <Input label="Email" value={editedUser.email} readOnly={true} className="opacity-50" />
                                    <Input label="Phone" value={editedUser.phone} onChange={e => setEditedUser({...editedUser, phone: e.target.value})} readOnly={!isEditing} />
                                    <Input label="Location" value={editedUser.location} onChange={e => setEditedUser({...editedUser, location: e.target.value})} readOnly={!isEditing} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Bio</label>
                                    <textarea 
                                        rows={4} 
                                        value={editedUser.bio} 
                                        onChange={e => setEditedUser({...editedUser, bio: e.target.value})} 
                                        readOnly={!isEditing}
                                        className="input-saas w-full resize-none min-h-[120px]"
                                        placeholder="No bio sequence defined..."
                                    />
                                </div>
                                {isEditing && (
                                    <Button variant="primary" size="xl" className="w-full btn-saas-primary" onClick={handleSave} loading={isSaving}>Save Changes</Button>
                                )}
                            </Card>
                        </>
                    )}
                    {activeTab === 'settings' && (
                        <Card variant="glass" className="saas-card p-8 space-y-8">
                             <div className="flex items-center space-x-2 text-primary">
                                <Globe className="w-5 h-5" />
                                <h3 className="font-black text-xs uppercase tracking-widest">Interface Logic</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-6 bg-muted/20 border border-border/50 rounded-2xl hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-3 bg-primary/10 rounded-xl"><Bell className="w-6 h-6 text-primary" /></div>
                                        <div>
                                            <p className="font-black text-lg tracking-tight">Email Notifications</p>
                                            <p className="text-xs text-muted-foreground font-medium">Receive monthly financial reports via email.</p>
                                        </div>
                                    </div>
                                    <input type="checkbox" className="w-6 h-6 border-2 border-primary rounded accent-primary bg-transparent focus:ring-primary" checked={user?.emailNotificationsEnabled} readOnly />
                                </div>
                                <div className="flex items-center justify-between p-6 bg-muted/20 border border-border/50 rounded-2xl hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-3 bg-amber-500/10 rounded-xl"><Lock className="w-6 h-6 text-amber-500" /></div>
                                        <div>
                                            <p className="font-black text-lg tracking-tight">Constraint Alerts</p>
                                            <p className="text-xs text-muted-foreground italic font-medium">Get notified when proxies reach 90% consumption.</p>
                                        </div>
                                    </div>
                                    <input type="checkbox" className="w-6 h-6 border-2 border-amber-500 rounded accent-amber-500 bg-transparent" checked={user?.budgetAlertEnabled} readOnly />
                                </div>
                            </div>
                        </Card>
                    )}
                    {activeTab === 'security' && (
                        <Card variant="glass" className="saas-card p-8 space-y-8">
                             <div className="flex items-center space-x-2 text-rose-500">
                                <Shield className="w-5 h-5" />
                                <h3 className="font-black text-xs uppercase tracking-widest">Vault Security</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="p-6 bg-muted/20 border border-border/50 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                         <div className="p-3 bg-rose-500/10 rounded-xl"><Key className="w-6 h-6 text-rose-500" /></div>
                                         <div>
                                            <p className="font-black text-lg tracking-tight">Password</p>
                                            <p className="text-xs text-muted-foreground font-medium">Change your account password.</p>
                                         </div>
                                    </div>
                                    <Button variant="secondary" onClick={() => setShowPasswordModal(true)}>Change Password</Button>
                                </div>
                                <div className="p-6 bg-muted/20 border border-border/50 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                         <div className={`p-3 rounded-xl ${is2FAEnabled ? 'bg-emerald-500/10' : 'bg-muted'}`}><Smartphone className={`w-6 h-6 ${is2FAEnabled ? 'text-emerald-500' : 'text-muted-foreground'}`} /></div>
                                         <div>
                                            <p className="font-black text-lg tracking-tight">Two-Factor Authentication</p>
                                            <p className="text-xs text-muted-foreground font-medium">Add an extra layer of security to your account.</p>
                                         </div>
                                    </div>
                                    {is2FAEnabled ? (
                                        <span className="font-black text-[10px] uppercase tracking-widest text-emerald-500 flex items-center"><CheckCircle className="w-4 h-4 mr-2" /> Enabled</span>
                                    ) : (
                                        <Button variant="secondary" onClick={handleEnable2FA} loading={isLoading}>Activate</Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
            {}
            {show2FAModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                    <Card variant="glass" className="max-w-sm w-full animate-entrance text-center" size="xl">
                        <Smartphone className="w-12 h-12 text-primary mx-auto mb-6 animate-pulse" />
                        <h3 className="text-2xl font-black mb-2 tracking-tighter uppercase tracking-widest">Verify Signal</h3>
                        <p className="text-sm text-muted-foreground mb-8 italic">Enter the 6-digit binary sequence sent to <span className="text-foreground font-black">{user.email}</span>.</p>
                        <form onSubmit={e => { e.preventDefault(); handleVerifyOtp(); }}>
                            <Input label="Sequence Key" value={otp} onChange={e => setOtp(e.target.value)} placeholder="000000" maxLength={6} required autoFocus />
                            <Button type="submit" size="xl" className="w-full btn-saas-primary mt-8" loading={isLoading}>Enable 2FA</Button>
                            <Button variant="ghost" className="w-full mt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground" onClick={() => setShow2FAModal(false)}>Cancel</Button>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};
export default Profile;