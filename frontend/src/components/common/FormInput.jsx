import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const FormInput = ({
    label,
    name,
    type = 'text',
    register,
    error,
    placeholder,
    Icon,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div>
            <label htmlFor={name} className="block text-xs font-medium tracking-widest uppercase text-gray-500 mb-2">
                {label}
            </label>
            <div className="relative group">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-amber-600 transition-colors" />
                    </div>
                )}

                <input
                    {...register(name)}
                    id={name}
                    type={inputType}
                    className={`block w-full ${Icon ? 'pl-12' : 'pl-4'} ${isPassword ? 'pr-12' : 'pr-4'} py-4 bg-gray-50 border ${error ? 'border-red-300' : 'border-gray-200'} text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600 focus:bg-white transition-all duration-200`}
                    placeholder={placeholder}
                    {...props}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                        {showPassword ? (
                            <EyeOff className="h-5 w-5 transition-colors" />
                        ) : (
                            <Eye className="h-5 w-5 transition-colors" />
                        )}
                    </button>
                )}
            </div>
            {error && (
                <p className="mt-1 text-xs text-red-500 ml-1">{error.message}</p>
            )}
        </div>
    );
};

export default FormInput;
