const nodemailer = require('nodemailer');

/**
 * Validates Email Configuration
 */
const validateEmailConfig = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn('⚠️ EMAIL_USER or EMAIL_PASSWORD missing. Email sending will fail.');
        return false;
    }
    return true;
};

/**
 * Configure Nodemailer Transporter
 * Using Gmail Service
 */
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

/**
 * Send Verification Email
 * @param {string} to - Recipient email
 * @param {string} verificationUrl - Full verification link
 */
const sendVerificationEmail = async (to, verificationUrl) => {
    if (!validateEmailConfig()) return;

    const mailOptions = {
        from: `"${process.env.MFA_ISSUER || 'CrownHour'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to,
        subject: 'Verify Your Email Address - CrownHour',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                <h1 style="color: #d4af37; text-align: center;">CrownHour</h1>
                <div style="background-color: #f9f9f9; padding: 30px; border-radius: 8px;">
                    <h2 style="margin-top: 0;">Verify your email address</h2>
                    <p>Thank you for registering with CrownHour. To complete your account setup and access our exclusive collection, please verify your email address.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" style="background-color: #0c0c0c; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">VERIFY EMAIL</a>
                    </div>
                    
                    <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
                    <p style="font-size: 12px; color: #888; word-break: break-all;">${verificationUrl}</p>
                    
                    <p style="font-size: 14px; margin-top: 30px;">This link will expire in 24 hours.</p>
                </div>
                <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
                    &copy; ${new Date().getFullYear()} CrownHour. All rights reserved.
                </div>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Verification email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('❌ Error sending verification email:', error);
        throw new Error('Email sending failed');
    }
};

/**
 * Send OTP Email
 * @param {string} to - Recipient email
 * @param {string} otp - OTP code
 */
const sendOtpEmail = async (to, otp) => {
    if (!validateEmailConfig()) return;

    const mailOptions = {
        from: `"${process.env.MFA_ISSUER || 'CrownHour'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to,
        subject: 'Your Verification Code - CrownHour',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                <h1 style="color: #d4af37; text-align: center;">CrownHour</h1>
                <div style="background-color: #f9f9f9; padding: 30px; border-radius: 8px;">
                    <h2 style="margin-top: 0;">Verify your email address</h2>
                    <p>Thank you for registering. Please use the following One-Time Password (OTP) to verify your account:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="background-color: #0c0c0c; color: #fff; padding: 12px 24px; border-radius: 4px; font-weight: bold; font-size: 24px; letter-spacing: 5px;">${otp}</span>
                    </div>
                    
                    <p style="font-size: 14px; margin-top: 30px;">This code will expire in 10 minutes.</p>
                </div>
                <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
                    &copy; ${new Date().getFullYear()} CrownHour. All rights reserved.
                </div>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 OTP email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('❌ Error sending OTP email:', error);
        throw new Error('Email sending failed');
    }
};

module.exports = {
    sendVerificationEmail,
    sendOtpEmail,
};
