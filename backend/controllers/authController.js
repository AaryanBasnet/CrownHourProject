const User = require('../models/User');
const Role = require('../models/Role');
const { generateToken } = require('../utils/jwt');
const { generateMFASecret, generateQRCode, verifyTOTP, generateBackupCodes } = require('../utils/otp');
const { logAuth, logUserAction } = require('../utils/auditLogger');

/**
 * Authentication Controller
 * Handles user authentication, registration, and MFA
 *
 * Security:
 * - All password operations use bcrypt
 * - Failed login attempts are tracked
 * - All auth events are logged
 * - MFA support for enhanced security
 */

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      await logAuth("user_created", {
        email,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        status: "failure",
        errorMessage: "Email already registered",
      });

      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Get customer role (default role for new users)
    const customerRole = await Role.findOne({ name: "customer" });
    if (!customerRole) {
      return res.status(500).json({
        success: false,
        message: "Customer role not found. Please contact administrator.",
      });
    }

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password, // Will be hashed by pre-save hook
      firstName,
      lastName,
      phone,
      address,
      role: customerRole._id,
    });

    // Log successful registration
    await logAuth("user_created", {
      userId: user._id,
      email: user.email,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
    });

    // Generate JWT token
    const token = generateToken(user);

    // Security: Set token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true, // Prevents XSS attacks
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict", // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: customerRole.name,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password, mfaToken } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() })
      .select("+password +mfaSecret")
      .populate("role");

    if (!user) {
      // Security: Don't reveal if user exists
      await logAuth("login_failure", {
        email,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        status: "failure",
        errorMessage: "Invalid credentials",
      });

      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Security: Check if account is locked
    if (user.isLocked) {
      await logAuth("login_failure", {
        userId: user._id,
        email: user.email,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        status: "failure",
        errorMessage: "Account locked",
      });

      return res.status(401).json({
        success: false,
        message:
          "Account is locked due to too many failed login attempts. Please try again later.",
      });
    }

    // Security: Check if account is active
    if (!user.isActive) {
      await logAuth("login_failure", {
        userId: user._id,
        email: user.email,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        status: "failure",
        errorMessage: "Account inactive",
      });

      return res.status(401).json({
        success: false,
        message: "Account is inactive",
      });
    }

    // Verify password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      // Security: Increment login attempts
      await user.incLoginAttempts();

      await logAuth("login_failure", {
        userId: user._id,
        email: user.email,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        status: "failure",
        errorMessage: "Invalid password",
      });

      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Security: Check if MFA is enabled
    if (user.mfaEnabled) {
      if (!mfaToken) {
        return res.status(200).json({
          success: true,
          mfaRequired: true,
          message: "MFA token required",
        });
      }

      // Verify MFA token
      const isMFAValid = verifyTOTP(mfaToken, user.mfaSecret);

      if (!isMFAValid) {
        await logAuth("mfa_verify_failure", {
          userId: user._id,
          email: user.email,
          ipAddress: req.ip,
          userAgent: req.get("user-agent"),
          status: "failure",
        });

        return res.status(401).json({
          success: false,
          message: "Invalid MFA token",
        });
      }

      await logAuth("mfa_verify_success", {
        userId: user._id,
        email: user.email,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        status: "success",
      });
    }

    // Success: Reset login attempts and update last login
    await user.resetLoginAttempts();

    await logAuth("login_success", {
      userId: user._id,
      email: user.email,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
    });

    // Generate JWT token
    const token = generateToken(user);

    // Security: Set token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role.name,
          mfaEnabled: user.mfaEnabled,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  try {
    await logAuth("logout", {
      userId: req.user._id,
      email: req.user.email,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
    });

    // Clear cookie
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("role")
      .select("-password -mfaSecret");

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user profile",
      error: error.message,
    });
  }
};

/**
 * @desc    Enable MFA for user
 * @route   POST /api/auth/mfa/enable
 * @access  Private
 */
const enableMFA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.mfaEnabled) {
      return res.status(400).json({
        success: false,
        message: "MFA is already enabled",
      });
    }

    // Generate MFA secret
    const { secret, otpauthUrl } = generateMFASecret(user.email);

    // Generate QR code
    const qrCode = await generateQRCode(otpauthUrl);

    // Generate backup codes
    const backupCodes = generateBackupCodes();

    // Save secret and backup codes (don't enable yet, wait for verification)
    user.mfaSecret = secret;
    user.mfaBackupCodes = backupCodes;
    await user.save();

    res.status(200).json({
      success: true,
      message:
        "MFA setup initiated. Please verify with your authenticator app.",
      data: {
        qrCode,
        secret,
        backupCodes: backupCodes.map((bc) => bc.code),
      },
    });
  } catch (error) {
    console.error("Enable MFA error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to enable MFA",
      error: error.message,
    });
  }
};

/**
 * @desc    Verify and activate MFA
 * @route   POST /api/auth/mfa/verify
 * @access  Private
 */
const verifyMFA = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "MFA token is required",
      });
    }

    const user = await User.findById(req.user._id).select("+mfaSecret");

    if (!user.mfaSecret) {
      return res.status(400).json({
        success: false,
        message: "MFA setup not initiated",
      });
    }

    // Verify token
    const isValid = verifyTOTP(token, user.mfaSecret);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid MFA token",
      });
    }

    // Activate MFA
    user.mfaEnabled = true;
    await user.save();

    await logAuth("mfa_enabled", {
      userId: user._id,
      email: user.email,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
    });

    res.status(200).json({
      success: true,
      message: "MFA enabled successfully",
    });
  } catch (error) {
    console.error("Verify MFA error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify MFA",
      error: error.message,
    });
  }
};

/**
 * @desc    Disable MFA
 * @route   POST /api/auth/mfa/disable
 * @access  Private
 */
const disableMFA = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required to disable MFA",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    // Verify password before disabling MFA
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    user.mfaEnabled = false;
    user.mfaSecret = undefined;
    user.mfaBackupCodes = [];
    await user.save();

    await logAuth("mfa_disabled", {
      userId: user._id,
      email: user.email,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
    });

    res.status(200).json({
      success: true,
      message: "MFA disabled successfully",
    });
  } catch (error) {
    console.error("Disable MFA error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to disable MFA",
      error: error.message,
    });
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    // Verify current password
    const isPasswordCorrect = await user.comparePassword(currentPassword);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword; // Will be hashed by pre-save hook
    user.lastPasswordChange = Date.now();

    // Security: Increment token version to invalidate all existing JWTs
    // Further Enhancement: This forces re-authentication on all devices
    user.tokenVersion = (user.tokenVersion || 0) + 1;

    await user.save();

    await logAuth("password_change", {
      userId: user._id,
      email: user.email,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
    });

    res.status(200).json({
      success: true,
      message:
        "Password changed successfully. You have been logged out of all devices.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message,
    });
  }
};

/**
 * @desc    Logout from all devices
 * @route   POST /api/auth/logout-all
 * @access  Private
 *
 * Further Enhancement: Token versioning enables this functionality
 */
const logoutAll = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Security: Increment token version to invalidate all JWTs
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    await logAuth("logout", {
      userId: user._id,
      email: user.email,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
    });

    // Clear current session cookie
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({
      success: true,
      message: "Logged out from all devices successfully",
    });
  } catch (error) {
    console.error("Logout all error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to logout from all devices",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  logoutAll,
  getMe,
  enableMFA,
  verifyMFA,
  disableMFA,
  changePassword,
};
