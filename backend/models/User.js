const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { encrypt, decrypt } = require("../utils/encryption");

/**
 * User Model
 * Manages user accounts with security features
 *
 * Security Features:
 * - Password hashing with bcrypt (never store plain text)
 * - Field-level encryption for PII using AES-256-GCM
 *   - Phone numbers encrypted at rest
 *   - MFA secrets encrypted at rest
 * - Token versioning for immediate session revocation
 * - MFA (Multi-Factor Authentication) support
 * - Login attempt tracking for brute-force protection
 * - Account locking after failed attempts
 * - Session management
 *
 * High-Level Enhancements:
 * 1. Field-Level Encryption: Phone numbers and MFA secrets encrypted at rest
 * 2. Token Versioning: Enables immediate JWT revocation
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows null/undefined values to duplicate
      select: false,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      }, // Valid: Password required only if no googleId
      minlength: [8, "Password must be at least 8 characters"],
      // Security: Never return password in queries by default
      select: false,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      // Security: Phone number will be encrypted at rest using AES-256-GCM
      // High Enhancement: Field-level encryption for PII protection
      match: [/^[\d\s\-\+\(\)]+$/, "Please provide a valid phone number"],
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    // Profile picture stored on Cloudinary
    profilePicture: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    // Security: MFA configuration
    mfaEnabled: {
      type: Boolean,
      default: false,
    },
    mfaSecret: {
      type: String,
      // Security: Encrypted at rest using AES-256-GCM (auto decrypt on read)
      // Don't return MFA secret in queries
      select: false,
    },
    mfaBackupCodes: [
      {
        code: String,
        used: { type: Boolean, default: false },
      },
    ],
    // Security: Track login attempts for brute-force protection
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    // Security: Session management
    lastLogin: {
      type: Date,
    },
    lastPasswordChange: {
      type: Date,
      default: Date.now,
    },
    // Security: Password History & Expiry
    passwordHistory: {
      type: [String], // Stores hashed passwords
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      default: Date.now,
    },
    // Security: Token versioning for immediate session revocation
    // High Enhancement: Allows invalidating all active sessions
    tokenVersion: {
      type: Number,
      default: 0,
    },
    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationOTP: {
      type: String,
      select: false,
    },
    verificationOTPExpires: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

// Security: Virtual property to check if account is locked
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Security: Hash password before saving
// This ensures passwords are NEVER stored in plain text
userSchema.pre("save", async function (next) {
  // Only hash if password is modified
  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Security: Use bcrypt with salt rounds = 12 for strong hashing
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Security: Encrypt PII before saving to database
// High Enhancement: Field-level encryption for data privacy
userSchema.pre("save", async function (next) {
  try {
    // Encrypt phone number if modified and not already encrypted
    if (this.isModified("phone") && this.phone) {
      this.phone = encrypt(this.phone);
    }

    // Security: Encrypt MFA secret if modified
    // MFA secrets must be encrypted at rest but recoverable for TOTP verification
    if (this.isModified("mfaSecret") && this.mfaSecret) {
      this.mfaSecret = encrypt(this.mfaSecret);
    }

    next();
  } catch (error) {
    console.error("Encryption error:", error);
    next(error);
  }
});

// Security: Decrypt PII after loading from database
// High Enhancement: Automatic decryption when reading data
userSchema.post("init", function (doc) {
  try {
    // Decrypt phone number after loading from DB
    if (doc.phone) {
      doc.phone = decrypt(doc.phone);
    }

    // Security: Decrypt MFA secret after loading from DB
    if (doc.mfaSecret) {
      doc.mfaSecret = decrypt(doc.mfaSecret);
    }
  } catch (error) {
    console.error("Decryption error:", error);
    // Don't fail the query, just log the error
  }
});

// Security: Decrypt PII after findOne operations
userSchema.post("findOne", function (doc) {
  if (doc) {
    try {
      if (doc.phone) {
        doc.phone = decrypt(doc.phone);
      }

      // Security: Decrypt MFA secret after findOne
      if (doc.mfaSecret) {
        doc.mfaSecret = decrypt(doc.mfaSecret);
      }
    } catch (error) {
      console.error("Decryption error:", error);
    }
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // Security: Use bcrypt compare to validate password
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = async function () {
  // Security: Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  // Use ACCOUNT_LOCK variables (separate from IP rate limiting)
  const maxAttempts = parseInt(process.env.ACCOUNT_LOCK_MAX_ATTEMPTS) || 5;
  const lockTime = parseInt(process.env.ACCOUNT_LOCK_DURATION) || 300000; // 5 minutes

  // Security: Lock account after max failed attempts
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
    console.log(
      `[ACCOUNT LOCKED] User: ${this.email} locked after ${maxAttempts} failed attempts`,
    );
  }

  return await this.updateOne(updates);
};

// Method to reset login attempts after successful login
userSchema.methods.resetLoginAttempts = async function () {
  return await this.updateOne({
    $set: { loginAttempts: 0, lastLogin: Date.now() },
    $unset: { lockUntil: 1 },
  });
};

// Security: Increment token version to invaoginidate all existing JWTs
// High Enhancement: Enables immediate session revocation
userSchema.methods.incrementTokenVersion = async function () {
  this.tokenVersion += 1;
  return await this.save();
};

// Security: Ensure indexes for email lookup performance
userSchema.index({ email: 1 });

module.exports = mongoose.model("User", userSchema);
