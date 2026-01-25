const ProfileDashboard = ({ user, orderStats }) => {
    return (
        <div className="space-y-12 animate-fade-in">
            <div>
                <h2 className="font-display text-3xl mb-8 pb-4 border-b border-stone-200">Overview</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white p-8 border border-stone-200 text-center hover:border-crown-gold transition-colors duration-300 shadow-sm hover:shadow-md">
                        <div className="font-display text-4xl text-stone-900 mb-2">{orderStats?.count || 0}</div>
                        <div className="text-xs uppercase tracking-widest text-stone-500">Total Orders</div>
                    </div>
                </div>

                <div className="bg-stone-50 p-8 border border-stone-200">
                    <h3 className="font-display text-2xl mb-4">Welcome Back</h3>
                    <p className="text-stone-600 text-sm leading-relaxed">
                        Hello {user.firstName}, from your account dashboard you can view your
                        activity, manage your shipping addresses, and edit your password and account details.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProfileDashboard;
