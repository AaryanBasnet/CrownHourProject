const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const Role = require('../models/Role');

/**
 * Google OAuth Strategy
 *
 * Security:
 * - State parameter handled in route middleware for CSRF protection
 * - Proxy enabled for correct HTTPS resolution
 * - Email verification inherited from Google
 */

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback',
            proxy: true, // Important for resolving https correctly behind proxy
            // Security: State parameter enabled (Passport handles it automatically)
            state: true,
        },
        async (accessToken, refreshToken, profile, done) => {
            if (process.env.NODE_ENV === 'development') {
                console.log(`[OAuth Strategy] Callback triggered for: ${profile.emails[0].value}`);
            }
            try {
                // 1. Check if user exists by Google ID
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    return done(null, user);
                }

                // 2. Check if user exists by email (to link accounts)
                const email = profile.emails[0].value;
                user = await User.findOne({ email });

                if (user) {
                    // Link googleId to existing user
                    user.googleId = profile.id;
                    // If profile picture is empty, use google's
                    if (!user.profilePicture?.url) {
                        user.profilePicture = {
                            url: profile.photos[0]?.value || '',
                            publicId: 'google-oauth'
                        };
                    }
                    await user.save();
                    return done(null, user);
                }

                // 3. Create new user
                const customerRole = await Role.findOne({ name: 'customer' });
                if (!customerRole) {
                    return done(new Error('Customer role not found'), null);
                }

                const newUser = {
                    googleId: profile.id,
                    email: email,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName || 'User',
                    role: customerRole._id,
                    emailVerified: true, // Emails from Google are verified
                    profilePicture: {
                        url: profile.photos[0]?.value || '',
                        publicId: 'google-oauth'
                    }
                };

                user = await User.create(newUser);
                done(null, user);
            } catch (err) {
                console.error('Google Auth Error:', err);
                done(err, null);
            }
        }
    )
);

module.exports = passport;
