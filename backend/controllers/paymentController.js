const Stripe = require('stripe');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Initialize Stripe securely
// Prevent crash if key is missing during dev
let stripe;
const stripeKey = process.env.STRIPE_SECRET_KEY;

if (stripeKey && stripeKey.trim().length > 0) {
    try {
        stripe = Stripe(stripeKey);
    } catch (err) {
        console.error("Failed to initialize Stripe:", err.message);
    }
} else {
    console.warn("⚠️ STRIPE_SECRET_KEY is missing or empty in .env file. Payment features will not work.");
}

/**
 * Payment Controller
 * Handles Stripe payment intents and interactions
 */

/**
 * @desc    Create Payment Intent
 * @route   POST /api/payment/create-intent
 * @access  Private (Logged in users only)
 */
const createPaymentIntent = async (req, res) => {
    try {
        if (!stripe) {
            return res.status(503).json({ success: false, message: 'Payment system unavailable (Missing Config)' });
        }

        const { items, shippingAddress } = req.body;
        const userId = req.user._id;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'No items in cart' });
        }

        // 1. Calculate total securely on backend
        let totalAmount = 0;
        const verifiedItems = [];

        for (const item of items) {
            // Robustly identify the product ID (handle populated vs unpopulated)
            const productId = item.product?._id || item.product;

            if (!productId) {
                console.error("Invalid item structure:", item);
                return res.status(400).json({ success: false, message: 'Invalid item in cart' });
            }

            const product = await Product.findById(productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.name || 'Unknown Item'}`
                });
            }

            // Verify stock
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`
                });
            }

            // Calculate item total (price * quantity)
            // Add any strap/variant logic if necessary, but sticking to base price for this task unless simplified
            // Assuming price is in database. If variants modify price, we also need that logic here.

            const price = Number(product.price);
            if (isNaN(price)) {
                return res.status(500).json({ success: false, message: `Invalid price for product ${product.name}` });
            }

            const itemTotal = price * item.quantity;
            totalAmount += itemTotal;

            verifiedItems.push({
                product: product._id,
                quantity: item.quantity,
                priceAtPurchase: price,
                subtotal: itemTotal
            });
        }

        // Add Tax/Shipping if needed (Keeping simple: Free shipping, no tax logic implemented yet)

        // Add Tax and Shipping (matching orderController logic)
        const tax = totalAmount * 0.10; // 10% Tax
        const shipping = totalAmount > 100 ? 0 : 10; // Free shipping > $100, else $10

        const finalAmount = totalAmount + tax + shipping;

        if (isNaN(finalAmount)) {
            return res.status(500).json({ success: false, message: 'Error calculating order total' });
        }

        // Convert to cents for Stripe
        const amountInCents = Math.round(finalAmount * 100);

        if (amountInCents < 50) { // Stripe minimum is usually around 50 cents
            return res.status(400).json({ success: false, message: 'Order amount too low' });
        }

        // 2. Create PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                userId: userId.toString(),
                itemCount: items.length
            }
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            amount: totalAmount,
            currency: 'USD'
        });

    } catch (error) {
        console.error('Create Payment Intent Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment intent',
            error: error.message
        });
    }
};

/**
 * @desc    Handle Stripe Webhooks
 * @route   POST /api/payment/webhook
 * @access  Public (Stripe signature verification)
 */
const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);

            // Here you would typically look up the order by paymentIntent.id
            // and update its status to 'confirmed' / 'paid'
            // Since we currently create orders AFTER payment on client, 
            // this webhook acts as a redundant check or for async payment methods.

            // To make "Order Creation" fully secure against network dropouts,
            // we should ideally create the order in "Pending" state BEFORE payment,
            // and then use this webhook to flip it to "Confirmed".

            break;
        case 'payment_intent.payment_failed':
            const failedIntent = event.data.object;
            console.error(`Payment failed: ${failedIntent.last_payment_error?.message}`);
            break;
        default:
            // Unexpected event type
            console.log(`Unhandled event type ${event.type}.`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.send();
};

module.exports = {
    createPaymentIntent,
    handleStripeWebhook
};
