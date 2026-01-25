import { Loader2 } from 'lucide-react';

const ProfileDetails = ({
    profileData,
    handleProfileChange,
    updateProfile,
    loading,
    passwordData,
    handlePasswordChange,
    changePassword
}) => {
    return (
        <div className="animate-fade-in">
            <h2 className="font-display text-3xl mb-8 pb-4 border-b border-stone-200">Account Details</h2>

            <form onSubmit={updateProfile} className="mb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-stone-500">First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            value={profileData.firstName}
                            onChange={handleProfileChange}
                            className="w-full p-4 bg-white border border-stone-200 focus:border-crown-gold outline-none transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-stone-500">Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            value={profileData.lastName}
                            onChange={handleProfileChange}
                            className="w-full p-4 bg-white border border-stone-200 focus:border-crown-gold outline-none transition-colors"
                        />
                    </div>
                </div>

                <div className="space-y-2 mb-6">
                    <label className="text-xs uppercase tracking-widest text-stone-500">Phone</label>
                    <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        className="w-full p-4 bg-white border border-stone-200 focus:border-crown-gold outline-none transition-colors"
                    />
                </div>

                {/* Integrated Address Fields for Editing */}
                <h3 className="font-display text-xl mb-6 mt-10">Shipping Address</h3>
                <div className="space-y-4 mb-8">
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-stone-500">Street Address</label>
                        <input
                            type="text"
                            name="address.street"
                            value={profileData.address.street}
                            onChange={handleProfileChange}
                            className="w-full p-4 bg-white border border-stone-200 focus:border-crown-gold outline-none transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-stone-500">City</label>
                            <input
                                type="text"
                                name="address.city"
                                value={profileData.address.city}
                                onChange={handleProfileChange}
                                className="w-full p-4 bg-white border border-stone-200 focus:border-crown-gold outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-stone-500">State</label>
                            <input
                                type="text"
                                name="address.state"
                                value={profileData.address.state}
                                onChange={handleProfileChange}
                                className="w-full p-4 bg-white border border-stone-200 focus:border-crown-gold outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-stone-500">Postal Code</label>
                            <input
                                type="text"
                                name="address.postalCode"
                                value={profileData.address.postalCode}
                                onChange={handleProfileChange}
                                className="w-full p-4 bg-white border border-stone-200 focus:border-crown-gold outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-stone-500">Country</label>
                            <input
                                type="text"
                                name="address.country"
                                value={profileData.address.country}
                                onChange={handleProfileChange}
                                className="w-full p-4 bg-white border border-stone-200 focus:border-crown-gold outline-none transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-stone-900 text-white px-8 py-4 uppercase tracking-[2px] text-xs hover:bg-crown-gold transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading && <Loader2 className="animate-spin" size={16} />}
                        Save Changes
                    </button>
                </div>
            </form>

            <h3 className="font-display text-2xl mb-8 border-t border-stone-200 pt-10">Change Password</h3>
            <form onSubmit={changePassword}>
                <div className="space-y-2 mb-6">
                    <label className="text-xs uppercase tracking-widest text-stone-500">Current Password</label>
                    <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-4 bg-white border border-stone-200 focus:border-crown-gold outline-none transition-colors"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-stone-500">New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full p-4 bg-white border border-stone-200 focus:border-crown-gold outline-none transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-stone-500">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className="w-full p-4 bg-white border border-stone-200 focus:border-crown-gold outline-none transition-colors"
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-stone-900 text-white px-8 py-4 uppercase tracking-[2px] text-xs hover:bg-crown-gold transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading && <Loader2 className="animate-spin" size={16} />}
                        Update Password
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileDetails;
