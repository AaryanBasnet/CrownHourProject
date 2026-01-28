import React, { useState, useEffect } from 'react';
import zxcvbn from 'zxcvbn';

const PasswordStrengthMeter = ({ password, onStrengthChange }) => {
    const [strength, setStrength] = useState(0);
    const [feedback, setFeedback] = useState([]);

    useEffect(() => {
        if (!password) {
            setStrength(0);
            setFeedback([]);
            onStrengthChange && onStrengthChange(0);
            return;
        }

        const result = zxcvbn(password);
        setStrength(result.score); // 0-4
        setFeedback(result.feedback.suggestions || []);
        onStrengthChange && onStrengthChange(result.score);
    }, [password, onStrengthChange]);

    const getColor = () => {
        switch (strength) {
            case 0: return 'bg-red-500';
            case 1: return 'bg-red-400';
            case 2: return 'bg-yellow-500';
            case 3: return 'bg-blue-400';
            case 4: return 'bg-green-500';
            default: return 'bg-gray-200';
        }
    };

    const getLabel = () => {
        switch (strength) {
            case 0: return 'Very Weak';
            case 1: return 'Weak';
            case 2: return 'Fair';
            case 3: return 'Good';
            case 4: return 'Strong';
            default: return '';
        }
    };

    return (
        <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-crown-gray font-medium">Strength: {getLabel()}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-300 ${getColor()}`}
                    style={{ width: `${(strength + 1) * 20}%` }}
                />
            </div>
            {feedback.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">{feedback[0]}</p>
            )}
        </div>
    );
};

export default PasswordStrengthMeter;
