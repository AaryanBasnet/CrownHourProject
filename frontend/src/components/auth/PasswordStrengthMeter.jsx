import { motion } from 'framer-motion';

const PasswordStrengthMeter = ({ password = '' }) => {
    const calculateStrength = (pwd) => {
        let strength = 0;
        if (pwd.length > 5) strength += 1;
        if (pwd.length > 7) strength += 1;
        if (/[A-Z]/.test(pwd)) strength += 1;
        if (/[0-9]/.test(pwd)) strength += 1;
        if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
        return strength;
    };

    const strength = calculateStrength(password);

    const getStrengthColor = (s) => {
        if (s === 0) return 'bg-gray-200';
        if (s <= 2) return 'bg-red-500';
        if (s <= 4) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStrengthLabel = (s) => {
        if (s === 0) return '';
        if (s <= 2) return 'Weak';
        if (s <= 4) return 'Medium';
        return 'Strong';
    };

    if (!password) return null;

    return (
        <div className="mt-2 space-y-1">
            <div className="flex gap-1 h-1">
                {[1, 2, 3, 4, 5].map((level) => (
                    <div
                        key={level}
                        className={`flex-1 rounded-full transition-colors duration-300 ${strength >= level ? getStrengthColor(strength) : 'bg-gray-100'
                            }`}
                    />
                ))}
            </div>
            <p className={`text-xs text-right font-medium ${strength <= 2 ? 'text-red-500' : strength <= 4 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                {getStrengthLabel(strength)}
            </p>
        </div>
    );
};

export default PasswordStrengthMeter;
