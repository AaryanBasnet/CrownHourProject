import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    Shield,
    Smartphone,
    Lock,
    CheckCircle2,
    AlertCircle,
    Copy,
    Loader2,
    ArrowRight,
    KeyRound
} from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import FormInput from '../common/FormInput';
import PasswordStrengthMeter from '../auth/PasswordStrengthMeter';

const SecuritySettings = () => {
    const { user, refreshUser } = useAuthStore();
    const { addToast } = useToast();

    const [loading, setLoading] = useState(false);
    const [setupMode, setSetupMode] = useState(false);
    const [qrData, setQrData] = useState(null);
    const [backupCodes, setBackupCodes] = useState([]);
    const [showBackupCodes, setShowBackupCodes] = useState(false);
    const [showRegenerateForm, setShowRegenerateForm] = useState(false);

    // Setup Verification Form
    const { register: registerVerify, handleSubmit: submitVerify, reset: resetVerify, watch: watchVerify } = useForm();

    // Disable MFA Form
    const { register: registerDisable, handleSubmit: submitDisable, reset: resetDisable } = useForm();

    // Regenerate Backup Codes Form
    const { register: registerRegenerate, handleSubmit: submitRegenerate, reset: resetRegenerate } = useForm();

    // Change Password Form
    const {
        register: registerPassword,
        handleSubmit: submitPassword,
        reset: resetPassword,
        watch: watchPassword,
        formState: { errors: passwordErrors }
    } = useForm();

    const newPasswordValue = watchPassword('newPassword');

    const onChangePassword = async (data) => {
        if (data.newPassword !== data.confirmPassword) {
            addToast('Passwords do not match', 'error');
            return;
        }
        setLoading(true);
        try {
            await authService.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            });
            resetPassword();
            addToast('Password updated successfully', 'success');
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to update password', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle Enable MFA (Step 1: Get QR)
    const initiateSetup = async () => {
        setLoading(true);
        try {
            const response = await authService.enableMFA();
            setQrData(response.data);
            setBackupCodes(response.data.backupCodes || []);
            setSetupMode(true);
            addToast('MFA Setup initialized. Please scan the QR code.', 'success');
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to start MFA setup', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle Verify MFA (Step 2: Verify Code)
    const onVerifySubmit = async (data) => {
        setLoading(true);
        try {
            await authService.verifyMFA(data.token);
            await refreshUser(); // Update user state to reflect mfaEnabled = true
            setSetupMode(false);
            // Keep backup codes visible after verification
            setShowBackupCodes(true);
            resetVerify();
            addToast('Two-Factor Authentication Enabled Successfully!', 'success');
        } catch (error) {
            addToast(error.response?.data?.message || 'Invalid verification code', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle Disable MFA
    const onDisableSubmit = async (data) => {
        setLoading(true);
        try {
            await authService.disableMFA(data.password);
            await refreshUser(); // Update user state to reflect mfaEnabled = false
            setBackupCodes([]);
            setShowBackupCodes(false);
            resetDisable();
            addToast('MFA has been disabled.', 'success');
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to disable MFA', 'error');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        addToast('Secret key copied to clipboard', 'success');
    };

    // View existing backup codes
    const handleViewBackupCodes = async () => {
        setLoading(true);
        try {
            const response = await authService.getBackupCodes();
            setBackupCodes(response.data.backupCodes);
            setShowBackupCodes(true);
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to retrieve backup codes', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Regenerate backup codes
    const onRegenerateSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await authService.regenerateBackupCodes(data.password);
            setBackupCodes(response.data.backupCodes.map(code => ({ code, used: false })));
            setShowBackupCodes(true);
            setShowRegenerateForm(false);
            resetRegenerate();
            addToast('Backup codes regenerated successfully', 'success');
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to regenerate backup codes', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Copy all backup codes
    const copyAllBackupCodes = () => {
        const codes = backupCodes.map(bc => typeof bc === 'string' ? bc : bc.code).join('\n');
        navigator.clipboard.writeText(codes);
        addToast('All backup codes copied to clipboard', 'success');
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="bg-white p-8 border border-stone-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-crown-gold/5 rounded-bl-full -mr-8 -mt-8" />

                <div className="flex items-start gap-4 relaitve z-10">
                    <div className="p-3 bg-stone-50 rounded-full text-crown-gold">
                        <Shield size={32} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-serif text-crown-black mb-2">Login Security</h2>
                        <p className="text-stone-500 max-w-xl">
                            Protect your account with Two-Factor Authentication (2FA). When enabled,
                            you will need to enter a code from your authenticator app to log in.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Status Card */}
            <div className={`p-8 border ${user?.mfaEnabled ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-stone-100'} shadow-sm transition-colors duration-500`}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${user?.mfaEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-100 text-stone-400'}`}>
                            {user?.mfaEnabled ? <CheckCircle2 size={24} /> : <Lock size={24} />}
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-crown-black">
                                Two-Factor Authentication is {user?.mfaEnabled ? <span className="text-emerald-600">Enabled</span> : <span className="text-stone-400">Disabled</span>}
                            </h3>
                            <p className="text-sm text-stone-500 mt-1">
                                {user?.mfaEnabled
                                    ? 'Your account is currently protected.'
                                    : 'Add an extra layer of security to your account.'}
                            </p>
                        </div>
                    </div>

                    {!user?.mfaEnabled && !setupMode && (
                        <button
                            onClick={initiateSetup}
                            disabled={loading}
                            className="px-6 py-3 bg-crown-black text-white text-sm tracking-widest uppercase hover:bg-stone-800 transition-colors flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Shield size={16} />}
                            Enable 2FA
                        </button>
                    )}
                </div>

                {/* SETUP MODE UI */}
                {setupMode && qrData && (
                    <div className="mt-8 pt-8 border-t border-stone-200 animate-slide-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Step 1: Scan */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 text-crown-gold">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full border border-crown-gold text-xs font-bold">1</span>
                                    <h4 className="font-medium tracking-wide uppercase text-xs">Scan QR Code</h4>
                                </div>

                                <div className="bg-stone-50 p-6 rounded-lg border border-stone-100 inline-block">
                                    <img src={qrData.qrCode} alt="MFA QR Code" className="w-48 h-48 mix-blend-multiply" />
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-medium text-xs uppercase tracking-wide text-stone-900">Manual Entry</h4>
                                    <p className="text-xs text-stone-500">
                                        If you can't scan the QR code, manually enter this key into your authenticator app:
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 bg-stone-50 border border-stone-200 p-3 rounded text-xs font-mono text-crown-gold break-all leading-relaxed select-all">
                                            {qrData.secret}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(qrData.secret)}
                                            className="p-3 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded transition-colors"
                                            title="Copy to clipboard"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-stone-400 italic">
                                        Note: After adding this key to your app, enter the generated 6-digit code in step 2.
                                    </p>
                                </div>

                                {/* Backup Codes Display */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-xs uppercase tracking-wide text-stone-900">Backup Codes</h4>
                                    <p className="text-xs text-stone-500">
                                        Save these backup codes in a secure location. Each can be used once if you lose access to your authenticator:
                                    </p>
                                    <div className="bg-stone-50 border border-stone-200 p-4 rounded">
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            {qrData.backupCodes?.map((code, index) => (
                                                <code key={index} className="text-xs font-mono text-crown-gold bg-white p-2 rounded border border-stone-100">
                                                    {code}
                                                </code>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => {
                                                const codes = qrData.backupCodes.join('\n');
                                                navigator.clipboard.writeText(codes);
                                                addToast('All backup codes copied to clipboard', 'success');
                                            }}
                                            className="w-full py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-medium uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Copy size={14} />
                                            Copy All Codes
                                        </button>
                                    </div>
                                    <div className="flex items-start gap-2 p-3 bg-amber-50 text-amber-900 text-xs rounded border border-amber-100">
                                        <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                                        <p>
                                            Important: Store these codes securely. They will not be shown again after you leave this page.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Verify */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 text-crown-gold">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full border border-crown-gold text-xs font-bold">2</span>
                                    <h4 className="font-medium tracking-wide uppercase text-xs">Enter Verification Code</h4>
                                </div>

                                <div className="bg-stone-50 p-6 rounded-lg border border-stone-100">
                                    <p className="text-sm text-stone-600 mb-6">
                                        Enter the 6-digit code from your authenticator app to verify the setup.
                                    </p>

                                    <form onSubmit={submitVerify(onVerifySubmit)} className="space-y-4">
                                        <div className="relative">
                                            <input
                                                {...registerVerify('token', { required: true, minLength: 6, maxLength: 6 })}
                                                type="text"
                                                placeholder="000 000"
                                                className="w-full text-center text-2xl tracking-[0.5em] py-4 bg-white border border-stone-200 focus:border-crown-gold focus:ring-1 focus:ring-crown-gold outline-none transition-all font-mono"
                                                maxLength={6}
                                            />
                                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={20} />
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => { setSetupMode(false); setQrData(null); }}
                                                className="flex-1 py-3 px-4 bg-white border border-stone-200 text-stone-600 text-xs font-medium tracking-widest uppercase hover:bg-stone-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading || !watchVerify('token')}
                                                className="flex-1 py-3 px-4 bg-crown-gold text-white text-xs font-medium tracking-widest uppercase hover:bg-amber-600 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                                            >
                                                {loading && <Loader2 className="animate-spin" size={14} />}
                                                Verify & Enable
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-blue-50/50 text-blue-800 text-xs rounded border border-blue-100">
                                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                    <p>
                                        Ensure your authenticator app (Google Authenticator, Authy, etc.) is installed on your mobile device before proceeding.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* BACKUP CODES MANAGEMENT */}
                {user?.mfaEnabled && (
                    <div className="mt-8 pt-8 border-t border-emerald-100 space-y-6">
                        <div>
                            <h4 className="text-sm font-medium text-stone-900 mb-4 uppercase tracking-wider">Backup Codes</h4>
                            <p className="text-sm text-stone-500 mb-4">
                                View your backup codes or generate new ones if needed.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleViewBackupCodes}
                                    disabled={loading}
                                    className="py-2.5 px-5 bg-stone-100 text-stone-700 border border-stone-200 hover:bg-stone-200 transition-all text-xs font-medium uppercase tracking-widest flex items-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={14} /> : <Lock size={14} />}
                                    View Codes
                                </button>
                                <button
                                    onClick={() => setShowRegenerateForm(!showRegenerateForm)}
                                    className="py-2.5 px-5 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-all text-xs font-medium uppercase tracking-widest"
                                >
                                    Regenerate
                                </button>
                            </div>

                            {/* Backup Codes Display */}
                            {showBackupCodes && backupCodes.length > 0 && (
                                <div className="mt-6 p-6 bg-stone-50 border border-stone-200 rounded animate-slide-up">
                                    <div className="flex items-center justify-between mb-4">
                                        <h5 className="text-xs font-medium uppercase tracking-wider text-stone-900">Your Backup Codes</h5>
                                        <button
                                            onClick={() => setShowBackupCodes(false)}
                                            className="text-xs text-stone-500 hover:text-stone-700"
                                        >
                                            Hide
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        {backupCodes.map((bc, index) => {
                                            const code = typeof bc === 'string' ? bc : bc.code;
                                            const used = typeof bc === 'string' ? false : bc.used;
                                            return (
                                                <code
                                                    key={index}
                                                    className={`text-xs font-mono p-2 rounded border ${used
                                                            ? 'bg-stone-200 text-stone-400 line-through border-stone-300'
                                                            : 'bg-white text-crown-gold border-stone-200'
                                                        }`}
                                                >
                                                    {code}
                                                </code>
                                            );
                                        })}
                                    </div>
                                    <button
                                        onClick={copyAllBackupCodes}
                                        className="w-full py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-medium uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Copy size={14} />
                                        Copy All Codes
                                    </button>
                                </div>
                            )}

                            {/* Regenerate Form */}
                            {showRegenerateForm && (
                                <div className="mt-6 p-6 bg-amber-50 border border-amber-200 rounded animate-slide-up">
                                    <h5 className="text-xs font-medium uppercase tracking-wider text-amber-900 mb-3">Regenerate Backup Codes</h5>
                                    <p className="text-xs text-amber-800 mb-4">
                                        This will invalidate all existing backup codes and generate new ones.
                                    </p>
                                    <form onSubmit={submitRegenerate(onRegenerateSubmit)} className="flex items-end gap-3">
                                        <div className="flex-1">
                                            <FormInput
                                                label="Password"
                                                name="password"
                                                type="password"
                                                register={registerRegenerate}
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowRegenerateForm(false)}
                                            className="mb-1 py-3.5 px-4 bg-white border border-stone-200 text-stone-600 text-xs font-medium uppercase tracking-widest hover:bg-stone-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="mb-1 py-3.5 px-5 bg-amber-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-amber-700 transition-all"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={14} /> : 'Generate'}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>

                        {/* DISABLE UI */}
                        <div className="pt-6 border-t border-stone-200">
                            <h4 className="text-sm font-medium text-stone-900 mb-4 uppercase tracking-wider">Disable Two-Factor Authentication</h4>
                            <p className="text-sm text-stone-500 mb-6">
                                To disable 2FA, please enter your current password for security verification.
                            </p>

                            <form onSubmit={submitDisable(onDisableSubmit)} className="flex items-end gap-4 max-w-md">
                                <div className="flex-1">
                                    <FormInput
                                        label="Current Password"
                                        name="password"
                                        type="password"
                                        register={registerDisable}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="mb-1 py-3.5 px-6 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 hover:border-red-200 transition-all text-xs font-bold uppercase tracking-widest"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : 'Disable'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Change Password Section */}
            <div className="bg-white p-8 border border-stone-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <KeyRound className="text-crown-gold" size={24} />
                    <h3 className="text-lg font-serif text-crown-black">Change Password</h3>
                </div>
                <form onSubmit={submitPassword(onChangePassword)} className="space-y-6 max-w-md">
                    <FormInput
                        label="Current Password"
                        name="currentPassword"
                        type="password"
                        register={registerPassword}
                        error={passwordErrors.currentPassword}
                        placeholder="••••••••"
                        required
                    />
                    <div>
                        <FormInput
                            label="New Password"
                            name="newPassword"
                            type="password"
                            register={registerPassword}
                            error={passwordErrors.newPassword}
                            placeholder="••••••••"
                            required
                        />
                        <PasswordStrengthMeter password={newPasswordValue} />
                    </div>
                    <FormInput
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        register={registerPassword}
                        error={passwordErrors.confirmPassword}
                        placeholder="••••••••"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="py-3 px-6 bg-crown-black text-white text-xs font-medium tracking-widest uppercase hover:bg-stone-800 transition-colors flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : 'Update Password'}
                    </button>
                </form>
            </div>

            {/* Session Management */}
            <div className="bg-white p-8 border border-stone-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <Smartphone className="text-crown-gold" size={24} />
                    <h3 className="text-lg font-serif text-crown-black">Session Management</h3>
                </div>
                <div className="max-w-xl">
                    <p className="text-stone-500 text-sm mb-6">
                        Lost a phone or logged in on a public computer? You can log out of all other active sessions across
                        all your devices. This will require you to log back in on this device as well.
                    </p>
                    <button
                        onClick={async () => {
                            if (window.confirm('Are you sure you want to log out from all devices? This will end all your active sessions.')) {
                                setLoading(true);
                                try {
                                    const { logoutAll } = useAuthStore.getState();
                                    await logoutAll();
                                    addToast('Successfully logged out from all devices', 'success');
                                    // The app will automatically redirect to login because isLoggedIn becomes false
                                } catch (error) {
                                    addToast('Failed to revoke sessions', 'error');
                                    setLoading(false);
                                }
                            }
                        }}
                        disabled={loading}
                        className="py-3 px-6 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <AlertCircle size={16} />}
                        Logout from all devices
                    </button>
                </div>
            </div>

            {/* Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-stone-50 border border-stone-100">
                    <div className="flex items-center gap-3 mb-3">
                        <Smartphone className="text-crown-gold" size={20} />
                        <h4 className="font-serif text-lg text-crown-black">Authenticator App</h4>
                    </div>
                    <p className="text-sm text-stone-500 leading-relaxed">
                        Use an app like Google Authenticator, Microsoft Authenticator, or Authy to generate your verification codes. These apps work offline and are more secure than SMS.
                    </p>
                </div>

                <div className="p-6 bg-stone-50 border border-stone-100">
                    <div className="flex items-center gap-3 mb-3">
                        <Lock className="text-crown-gold" size={20} />
                        <h4 className="font-serif text-lg text-crown-black">Backup Codes</h4>
                    </div>
                    <p className="text-sm text-stone-500 leading-relaxed">
                        When you enable 2FA, you'll receive 10 backup codes. Each code can be used once if you lose access to your authenticator app. Store them securely!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;
