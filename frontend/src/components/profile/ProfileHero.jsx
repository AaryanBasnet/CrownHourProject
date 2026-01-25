import { Shield } from 'lucide-react';
import ProfilePictureUploader from '../common/ProfilePictureUploader';

const ProfileHero = ({ user, onAvatarUpdate }) => {
    return (
        <div className="bg-white border-b border-stone-200 pt-32 pb-16 px-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10">
                <div className="relative w-32 h-32 md:w-40 md:h-40">
                    <ProfilePictureUploader
                        user={user}
                        onUpdate={onAvatarUpdate}
                        size="xl"
                    />
                </div>

                <div className="text-center md:text-left space-y-2">
                    <h1 className="font-display text-4xl md:text-5xl text-stone-900 leading-tight">
                        {user.firstName} {user.lastName}
                    </h1>
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-stone-500 text-sm tracking-wide">
                        <span>{user.email}</span>
                        <span className="hidden md:inline text-stone-300">|</span>
                        <span className="flex items-center gap-1.5 text-crown-gold font-medium uppercase tracking-wider">
                            <Shield size={14} />
                            {user.role?.name || 'Member'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHero;
