import React from 'react';

const ProfileAddresses = ({ user, profileData, onTabChange }) => {
    // For now, only one address is supported on the backend (User model)

    return (
        <div className="animate-fade-in">
            <h2 className="font-display text-3xl mb-8 pb-4 border-b border-stone-200">My Addresses</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Default Address Card */}
                <div className="bg-white p-8 border border-stone-200 relative group hover:border-crown-gold transition-colors shadow-sm">
                    <span className="text-xs uppercase tracking-widest text-crown-gold block mb-4 font-medium">Primary Shipping Address</span>
                    <h4 className="font-display text-2xl mb-3 text-stone-900">{user.firstName} {user.lastName}</h4>
                    <p className="text-stone-500 text-sm mb-6">{user.phone}</p>

                    <address className="text-stone-700 text-base not-italic leading-loose mb-8 border-t border-stone-100 pt-4">
                        {profileData.address.street || 'No street provided'}<br />
                        {profileData.address.city || 'No city'}, {profileData.address.state || 'No state'} {profileData.address.postalCode || ''}<br />
                        {profileData.address.country || 'No country'}
                    </address>

                    <button
                        onClick={() => onTabChange('details')}
                        className="text-xs uppercase tracking-widest text-stone-900 border-b border-stone-900 pb-1 hover:text-crown-gold hover:border-crown-gold transition-colors"
                    >
                        Edit Address
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileAddresses;
