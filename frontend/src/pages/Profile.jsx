import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import ProfileHero from '../components/profile/ProfileHero';
import ProfileSidebar from '../components/profile/ProfileSidebar';
import ProfileDashboard from '../components/profile/ProfileDashboard';
import ProfileOrders from '../components/profile/ProfileOrders';
import ProfileAddresses from '../components/profile/ProfileAddresses';
import ProfileDetails from '../components/profile/ProfileDetails';
import SecuritySettings from '../components/profile/SecuritySettings';

/**
 * User Profile Page
 * Main container that acts as the layout controller
 * Uses the luxury "crown-hour" aesthetic with cream backgrounds
 */
const Profile = () => {
    const {
        user,
        loading,
        profileData,
        passwordData,
        handleProfileChange,
        handlePasswordChange,
        updateProfile,
        changePassword,
        handleAvatarUpdate,
        orders,
        ordersLoading,
        orderStats
    } = useProfile();

    // UI State for tabs
    // 'dashboard' | 'orders' | 'addresses' | 'details' | 'wishlist'
    const [activeTab, setActiveTab] = useState('dashboard');

    if (!user) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-crown-gold animate-spin" />
            </div>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'orders':
                return <ProfileOrders orders={orders} loading={ordersLoading} />;
            case 'addresses':
                return (
                    <ProfileAddresses
                        user={user}
                        profileData={profileData}
                        onTabChange={setActiveTab}
                    />
                );
            case 'details':
                return (
                    <ProfileDetails
                        profileData={profileData}
                        passwordData={passwordData}
                        loading={loading}
                        handleProfileChange={handleProfileChange}
                        handlePasswordChange={handlePasswordChange}
                        updateProfile={updateProfile}
                        changePassword={changePassword}
                    />
                );
            case 'security':
                return <SecuritySettings />;
            case 'dashboard':
            default:
                return <ProfileDashboard user={user} orderStats={orderStats} />;
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF8F5]">
            {/* Hero Section */}
            <ProfileHero user={user} onAvatarUpdate={handleAvatarUpdate} />

            {/* Main Content Layout */}
            <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col md:flex-row gap-16">
                <ProfileSidebar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                <main className="flex-1 min-w-0">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default Profile;
