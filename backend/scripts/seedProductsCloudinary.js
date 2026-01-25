const dotenv = require('dotenv');
// Load env vars immediately
dotenv.config();

const mongoose = require('mongoose');
const Product = require('../models/Product');
const slugify = require('slugify');
const { cloudinary } = require('../config/cloudinary');

// Real-world inspired high quality watch data
const products = [
    // --- LUXURY COLLECTION ---
    {
        name: "Patek Philippe Nautilus 5711",
        description: "The epitome of the elegant sports watch. With its rounded octagonal bezel, the ingenious porthole construction of its case, and its horizontally embossed dial, the Nautilus has epitomized the elegant sports watch since 1976.",
        shortDescription: "Iconic stainless steel sports watch.",
        brand: "Patek Philippe",
        model: "5711/1A",
        price: 135000,
        currency: "USD",
        stock: 3,
        category: "luxury",
        isActive: true,
        isFeatured: true,
        variants: {
            colors: [{ name: "Blue", hex: "#1C355E", inStock: true }],
            straps: [{ material: "Steel Link", priceModifier: 0, inStock: true }]
        },
        specifications: {
            movement: "automatic",
            caseMaterial: "Stainless Steel",
            caseDiameter: "40mm",
            waterResistance: "12 ATM",
            glass: "Sapphire Crystal",
            strapMaterial: "Steel",
            powerReserve: "45 Hours",
            warranty: "2 Years"
        },
        images: [
            { url: "https://pngimg.com/d/watches_PNG9866.png", alt: "Nautilus Front", isPrimary: true }
        ],
        rating: { average: 5.0, count: 42 }
    },
    {
        name: "Audemars Piguet Royal Oak",
        description: "A legend in horology. The Royal Oak was the first luxury sports watch to be made of stainless steel, featuring a revolutionary octagonal bezel with 8 hexagonal screws.",
        shortDescription: "Legendary octagonal design.",
        brand: "Audemars Piguet",
        model: "15500ST",
        price: 45000,
        currency: "USD",
        stock: 5,
        category: "luxury",
        isActive: true,
        isFeatured: true,
        variants: {
            colors: [{ name: "Silver", hex: "#C0C0C0", inStock: true }],
            straps: [{ material: "Steel Link", priceModifier: 0, inStock: true }]
        },
        specifications: {
            movement: "automatic",
            caseMaterial: "Stainless Steel",
            caseDiameter: "41mm",
            waterResistance: "5 ATM",
            glass: "Sapphire Crystal",
            strapMaterial: "Steel",
            powerReserve: "70 Hours",
            warranty: "2 Years"
        },
        images: [
            { url: "https://pngimg.com/d/watches_PNG9864.png", alt: "Royal Oak Front", isPrimary: true }
        ],
        rating: { average: 4.9, count: 38 }
    },
    {
        name: "Rolex Submariner Date",
        description: "The reference among divers' watches. The Submariner's rotatable bezel is a key functionality of the watch. Its 60-minute graduations allow a diver to accurately and safely monitor diving time and decompression stops.",
        shortDescription: "The archetypal diver's watch.",
        brand: "Rolex",
        model: "126610LN",
        price: 14000,
        currency: "USD",
        stock: 8,
        category: "sport",
        isActive: true,
        isFeatured: true,
        variants: {
            colors: [{ name: "Black", hex: "#000000", inStock: true }],
            straps: [{ material: "Oyster Steel", priceModifier: 0, inStock: true }]
        },
        specifications: {
            movement: "automatic",
            caseMaterial: "Oystersteel",
            caseDiameter: "41mm",
            waterResistance: "30 ATM (300m)",
            glass: "Sapphire Crystal",
            strapMaterial: "Steel",
            powerReserve: "70 Hours",
            warranty: "5 Years"
        },
        images: [
            { url: "https://pngimg.com/d/watches_PNG9876.png", alt: "Submariner Front", isPrimary: true }
        ],
        rating: { average: 4.8, count: 156 }
    },
    {
        name: "Omega Speedmaster Moonwatch",
        description: "The Moonwatch is one of the world's most iconic timepieces. Having been a part of all six lunar missions, the legendary Speedmaster is an impressive representation of the brand’s adventurous pioneering spirit.",
        shortDescription: "The first watch worn on the moon.",
        brand: "Omega",
        model: "310.30.42.50.01.001",
        price: 7600,
        currency: "USD",
        stock: 12,
        category: "sport",
        isActive: true,
        isFeatured: false,
        variants: {
            colors: [{ name: "Black", hex: "#000000", inStock: true }],
            straps: [{ material: "Steel Link", priceModifier: 0, inStock: true }]
        },
        specifications: {
            movement: "mechanical",
            caseMaterial: "Stainless Steel",
            caseDiameter: "42mm",
            waterResistance: "5 ATM (50m)",
            glass: "Hesalite",
            strapMaterial: "Steel",
            powerReserve: "48 Hours",
            warranty: "5 Years"
        },
        images: [
            { url: "https://pngimg.com/d/watches_PNG9895.png", alt: "Speedmaster Front", isPrimary: true }
        ],
        rating: { average: 4.9, count: 210 }
    },
    {
        name: "Vacheron Constantin Overseas",
        description: "An invitation to travel. The Overseas collection conveys the spirit of travel with its casual elegance and practical interchangeability system for straps.",
        shortDescription: "Haute Horlogerie for the traveler.",
        brand: "Vacheron Constantin",
        model: "4500V",
        price: 32000,
        currency: "USD",
        stock: 4,
        category: "luxury",
        isActive: true,
        isFeatured: false,
        variants: {
            colors: [{ name: "Blue", hex: "#1C355E", inStock: true }],
            straps: [{ material: "Steel", priceModifier: 0, inStock: true }]
        },
        specifications: {
            movement: "automatic",
            caseMaterial: "Stainless Steel",
            caseDiameter: "41mm",
            waterResistance: "15 ATM",
            glass: "Sapphire Crystal",
            strapMaterial: "Rubber / Leather / Steel",
            powerReserve: "60 Hours",
            warranty: "2 Years"
        },
        images: [
            { url: "https://pngimg.com/d/watches_PNG9898.png", alt: "Overseas Front", isPrimary: true }
        ],
        rating: { average: 4.7, count: 15 }
    },

    // --- VINTAGE / DRESS ---
    {
        name: "Cartier Tank Solo",
        description: "The modest, modern design of the Tank Solo watch made it a classic from the moment it first appeared in the Tank collection. It honors the unique aesthetic that has been the collection's success.",
        shortDescription: "A timeless rectangular classic.",
        brand: "Cartier",
        model: "W5200028",
        price: 3800,
        currency: "USD",
        stock: 10,
        category: "vintage",
        isActive: true,
        isFeatured: false,
        variants: {
            colors: [{ name: "White", hex: "#FFFFFF", inStock: true }],
            straps: [{ material: "Leather", priceModifier: 0, inStock: true }]
        },
        specifications: {
            movement: "automatic",
            caseMaterial: "Stainless Steel",
            caseDiameter: "31mm",
            waterResistance: "3 ATM",
            glass: "Sapphire Crystal",
            strapMaterial: "Calfskin",
            powerReserve: "42 Hours",
            warranty: "2 Years"
        },
        images: [
            { url: "https://pngimg.com/d/watches_PNG9884.png", alt: "Tank Solo Front", isPrimary: true }
        ],
        rating: { average: 4.6, count: 75 }
    },
    {
        name: "IWC Portugieser Chronograph",
        description: "An icon of design. The Portugieser Chronograph is one of IWC’s most iconic models. With its compact diameter of 41 millimetres, it fits almost any wrist.",
        shortDescription: "Elegant chronograph with clear dial.",
        brand: "IWC",
        model: "IW371605",
        price: 8400,
        currency: "USD",
        stock: 7,
        category: "vintage",
        isActive: true,
        isFeatured: true,
        variants: {
            colors: [{ name: "Blue", hex: "#1C355E", inStock: true }],
            straps: [{ material: "Alligator Leather", priceModifier: 0, inStock: true }]
        },
        specifications: {
            movement: "automatic",
            caseMaterial: "Stainless Steel",
            caseDiameter: "41mm",
            waterResistance: "3 ATM",
            glass: "Sapphire Crystal",
            strapMaterial: "Leather",
            powerReserve: "46 Hours",
            warranty: "2 Years"
        },
        images: [
            { url: "https://pngimg.com/d/watches_PNG9922.png", alt: "Portugieser Front", isPrimary: true }
        ],
        rating: { average: 4.8, count: 55 }
    },
    {
        name: "Jaeger-LeCoultre Reverso",
        description: "A watch like no other. Created in 1931 for polo players who wanted to protect the crystals of their watches during matches, the Reverso has become a symbol of Art Deco style.",
        shortDescription: "The reversible classic.",
        brand: "Jaeger-LeCoultre",
        model: "Q3848422",
        price: 9600,
        currency: "USD",
        stock: 4,
        category: "vintage",
        isActive: true,
        isFeatured: false,
        variants: {
            colors: [{ name: "Silver", hex: "#C0C0C0", inStock: true }],
            straps: [{ material: "Ostrich Leather", priceModifier: 0, inStock: true }]
        },
        specifications: {
            movement: "mechanical",
            caseMaterial: "Stainless Steel",
            caseDiameter: "45.6 x 27.4mm",
            waterResistance: "3 ATM",
            glass: "Sapphire Crystal",
            strapMaterial: "Leather",
            powerReserve: "42 Hours",
            warranty: "8 Years"
        },
        images: [
            { url: "https://pngimg.com/d/watches_PNG9919.png", alt: "Reverso Front", isPrimary: true }
        ],
        rating: { average: 4.9, count: 28 }
    },

    // --- SPORT / DIVER ---
    {
        name: "Breitling Navitimer B01",
        description: "The pilot's favorite. For more than 65 years, the Navitimer has been the world’s most highly regarded pilot’s watch. The Navitimer B01 Chronograph 43 features the famous circular slide rule.",
        shortDescription: "The ultimate wrist-worn instrument.",
        brand: "Breitling",
        model: "AB0121211B1X1",
        price: 9100,
        currency: "USD",
        stock: 9,
        category: "sport",
        isActive: true,
        isFeatured: false,
        variants: {
            colors: [{ name: "Black", hex: "#000000", inStock: true }],
            straps: [{ material: "Leather", priceModifier: 0, inStock: true }]
        },
        specifications: {
            movement: "automatic",
            caseMaterial: "Stainless Steel",
            caseDiameter: "43mm",
            waterResistance: "3 ATM",
            glass: "Sapphire Crystal",
            strapMaterial: "Leather",
            powerReserve: "70 Hours",
            warranty: "5 Years"
        },
        images: [
            { url: "https://pngimg.com/d/watches_PNG9890.png", alt: "Navitimer Front", isPrimary: true }
        ],
        rating: { average: 4.7, count: 62 }
    },
    {
        name: "Panerai Luminor Marina",
        description: "Italian design, Swiss technology. The Luminor Marina is one of the most recognizable watches in the world, famous for its crown-protecting bridge.",
        shortDescription: "Robust Italian naval heritage.",
        brand: "Panerai",
        model: "PAM01312",
        price: 8200,
        currency: "USD",
        stock: 6,
        category: "sport",
        isActive: true,
        isFeatured: false,
        variants: {
            colors: [{ name: "Black", hex: "#000000", inStock: true }],
            straps: [{ material: "Alligator Leather", priceModifier: 0, inStock: true }]
        },
        specifications: {
            movement: "automatic",
            caseMaterial: "Stainless Steel",
            caseDiameter: "44mm",
            waterResistance: "30 ATM",
            glass: "Sapphire Crystal",
            strapMaterial: "Leather",
            powerReserve: "72 Hours",
            warranty: "2 Years"
        },
        images: [
            { url: "https://pngimg.com/d/watches_PNG9892.png", alt: "Luminor Front", isPrimary: true }
        ],
        rating: { average: 4.6, count: 45 }
    },
    {
        name: "Tag Heuer Carrera",
        description: "Born on the track. The classic yet contemporary sports watch inspired by motor racing. Featuring a ceramic bezel and in-house Heuer 02 movement.",
        shortDescription: "Elegant racing chronograph.",
        brand: "Tag Heuer",
        model: "CBN2A1B.BA0643",
        price: 5800,
        currency: "USD",
        stock: 15,
        category: "sport",
        isActive: true,
        isFeatured: false,
        variants: {
            colors: [{ name: "Black", hex: "#000000", inStock: true }],
            straps: [{ material: "Steel", priceModifier: 0, inStock: true }]
        },
        specifications: {
            movement: "automatic",
            caseMaterial: "Stainless Steel",
            caseDiameter: "44mm",
            waterResistance: "10 ATM",
            glass: "Sapphire Crystal",
            strapMaterial: "Steel",
            powerReserve: "80 Hours",
            warranty: "2 Years"
        },
        images: [
            { url: "https://pngimg.com/d/watches_PNG9887.png", alt: "Carrera Front", isPrimary: true }
        ],
        rating: { average: 4.5, count: 88 }
    },

    // --- SMART / MODERN ---
    {
        name: "Apple Watch Ultra 2",
        description: "The most rugged and capable Apple Watch. Designed for endurance, exploration, and adventure. Aerospace-grade titanium case, up to 36 hours of battery life.",
        shortDescription: "The ultimate sports and adventure watch.",
        brand: "Apple",
        model: "Ultra 2",
        price: 799,
        currency: "USD",
        stock: 50,
        category: "smart",
        isActive: true,
        isFeatured: true,
        variants: {
            colors: [{ name: "Natural Titanium", hex: "#C0C0C0", inStock: true }],
            straps: [{ material: "Ocean Band", priceModifier: 0, inStock: true }]
        },
        specifications: {
            movement: "kinetic",
            caseMaterial: "Titanium",
            caseDiameter: "49mm",
            waterResistance: "10 ATM (100m)",
            glass: "Sapphire Crystal Front",
            strapMaterial: "Fluoroelastomer",
            powerReserve: "36 Hours",
            warranty: "1 Year"
        },
        images: [
            { url: "https://pngimg.com/d/apple_watch_PNG16.png", alt: "Apple Watch Ultra Front", isPrimary: true }
        ],
        rating: { average: 4.9, count: 500 }
    },
    {
        name: "Garmin Fenix 7X Pro",
        description: "Be stronger, 7 days a week. Long-running solar powered multisport GPS watch with scratch-resistant Power Sapphire lens, advanced training features, and flashlight.",
        shortDescription: "Ultimate multisport GPS watch.",
        brand: "Garmin",
        model: "010-02541-00",
        price: 999,
        currency: "USD",
        stock: 30,
        category: "smart",
        isActive: true,
        isFeatured: false,
        variants: {
            colors: [{ name: "Carbon Gray", hex: "#333333", inStock: true }],
            straps: [{ material: "Silicon", priceModifier: 0, inStock: true }]
        },
        specifications: {
            movement: "solar",
            caseMaterial: "Titanium",
            caseDiameter: "51mm",
            waterResistance: "10 ATM",
            glass: "Power Sapphire",
            strapMaterial: "Silicon",
            powerReserve: "28 Days",
            warranty: "1 Year"
        },
        images: [
            { url: "https://pngimg.com/d/watches_PNG9895.png", alt: "Garmin Fenix Front", isPrimary: true }
        ],
        rating: { average: 4.8, count: 120 }
    },

    // --- CASUAL / EVERYDAY ---
    {
        name: "Seiko 5 Sports",
        description: "Show your style. For over 50 years, Seiko 5 Sports has delivered consistently high levels of reliability, durability, performance and value.",
        shortDescription: "Reliable automatic sports watch.",
        brand: "Seiko",
        model: "SRPD55",
        price: 295,
        currency: "USD",
        stock: 40,
        category: "casual",
        isActive: true,
        isFeatured: false,
        variants: {
            colors: [{ name: "Black", hex: "#000000", inStock: true }],
            straps: [{ material: "Steel", priceModifier: 0, inStock: true }]
        },
        specifications: {
            movement: "automatic",
            caseMaterial: "Stainless Steel",
            caseDiameter: "42.5mm",
            waterResistance: "10 ATM",
            glass: "Hardlex",
            strapMaterial: "Steel",
            powerReserve: "41 Hours",
            warranty: "3 Years"
        },
        images: [
            { url: "https://pngimg.com/d/watches_PNG9902.png", alt: "Seiko 5 Front", isPrimary: true }
        ],
        rating: { average: 4.7, count: 350 }
    },
    {
        name: "Tissot PRX Powermatic 80",
        description: "Back to the future. Created for those with an eye for design and packed with twenty-first century features in a Tissot case shape from 1978.",
        shortDescription: "Integrated bracelet 70s vibe.",
        brand: "Tissot",
        model: "T137.407.11.041.00",
        price: 725,
        currency: "USD",
        stock: 25,
        category: "casual",
        isActive: true,
        isFeatured: true,
        variants: {
            colors: [{ name: "Navy Blue", hex: "#000080", inStock: true }],
            straps: [{ material: "Steel", priceModifier: 0, inStock: true }]
        },
        specifications: {
            movement: "automatic",
            caseMaterial: "Stainless Steel",
            caseDiameter: "40mm",
            waterResistance: "10 ATM",
            glass: "Sapphire Crystal",
            strapMaterial: "Steel",
            powerReserve: "80 Hours",
            warranty: "2 Years"
        },
        images: [
            { url: "https://pngimg.com/d/watches_PNG9895.png", alt: "Tissot PRX Front", isPrimary: true }
        ],
        rating: { average: 4.8, count: 180 }
    },
    {
        name: "Hamilton Khaki Field Mechanical",
        description: "Military heritage. Rugged, robust, and resilient, the Khaki Field Mechanical is a faithful recreation of the 1960s original and true to Hamilton’s military heritage.",
        shortDescription: "The definitive field watch.",
        brand: "Hamilton",
        model: "H69439931",
        price: 595,
        currency: "USD",
        stock: 18,
        category: "casual",
        isActive: true,
        isFeatured: false,
        variants: {
            colors: [{ name: "Black", hex: "#000000", inStock: true }],
            straps: [{ material: "NATO", priceModifier: 0, inStock: true }]
        },
        specifications: {
            movement: "mechanical",
            caseMaterial: "Stainless Steel",
            caseDiameter: "38mm",
            waterResistance: "5 ATM",
            glass: "Sapphire Crystal",
            strapMaterial: "Nylon",
            powerReserve: "80 Hours",
            warranty: "2 Years"
        },
        images: [
            { url: "https://pngimg.com/d/watches_PNG9890.png", alt: "Khaki Field Front", isPrimary: true }
        ],
        rating: { average: 4.9, count: 95 }
    },
    {
        name: "Tudor Black Bay 58",
        description: "Tudor's tribute to the 1950s. Named after the year in which the first TUDOR divers’ watch was introduced, waterproof to 200 metres, the Black Bay 58 captures the essence of that era.",
        shortDescription: "Vintage-inspired 39mm diver.",
        brand: "Tudor",
        model: "M79030N-0001",
        price: 3950,
        currency: "USD",
        stock: 8,
        category: "sport",
        isActive: true,
        isFeatured: true,
        variants: {
            colors: [{ name: "Black", hex: "#000000", inStock: true }],
            straps: [{ material: "Steel", priceModifier: 0, inStock: true }]
        },
        specifications: {
            movement: "automatic",
            caseMaterial: "Stainless Steel",
            caseDiameter: "39mm",
            waterResistance: "20 ATM (200m)",
            glass: "Domed Sapphire",
            strapMaterial: "Steel",
            powerReserve: "70 Hours",
            warranty: "5 Years"
        },
        images: [
            { url: "https://pngimg.com/d/watches_PNG9887.png", alt: "Black Bay 58 Front", isPrimary: true }
        ],
        rating: { average: 4.9, count: 68 }
    },
    {
        name: "Hublot Big Bang Integral",
        description: "The art of fusion. The Big Bang Integral Ceramic is a monobloc architecture with the bracelet integrated into the case, made entirely from high-tech ceramic.",
        shortDescription: "Bold ceramic chronograph.",
        brand: "Hublot",
        model: "451.CX.1170.CX",
        price: 24100,
        currency: "USD",
        stock: 2,
        category: "luxury",
        isActive: true,
        isFeatured: false,
        variants: {
            colors: [{ name: "Black Magic", hex: "#000000", inStock: true }],
            straps: [{ material: "Ceramic", priceModifier: 0, inStock: true }]
        },
        specifications: {
            movement: "automatic",
            caseMaterial: "Ceramic",
            caseDiameter: "42mm",
            waterResistance: "10 ATM",
            glass: "Sapphire Crystal",
            strapMaterial: "Ceramic",
            powerReserve: "72 Hours",
            warranty: "2 Years"
        },
        images: [
            { url: "https://pngimg.com/d/watches_PNG9878.png", alt: "Big Bang Front", isPrimary: true }
        ],
        rating: { average: 4.4, count: 18 }
    },
    {
        name: "Zenith Chronomaster Sport",
        description: "The master of chronographs. The Chronomaster Sport combines elements of past Zenith chronograph references with the El Primero 3600 movement that measures 1/10th of a second.",
        shortDescription: "1/10th second chronograph.",
        brand: "Zenith",
        model: "03.3100.3600/69.M3100",
        price: 11000,
        currency: "USD",
        stock: 5,
        category: "sport",
        isActive: true,
        isFeatured: false,
        variants: {
            colors: [{ name: "White", hex: "#FFFFFF", inStock: true }],
            straps: [{ material: "Steel", priceModifier: 0, inStock: true }]
        },
        specifications: {
            movement: "automatic",
            caseMaterial: "Stainless Steel",
            caseDiameter: "41mm",
            waterResistance: "10 ATM",
            glass: "Sapphire Crystal",
            strapMaterial: "Steel",
            powerReserve: "60 Hours",
            warranty: "2 Years"
        },
        images: [
            { url: "https://pngimg.com/d/watches_PNG9875.png", alt: "Chronomaster Front", isPrimary: true }
        ],
        rating: { average: 4.8, count: 33 }
    },
    {
        name: "Bell & Ross BR 03-92",
        description: "From the cockpit to the wrist. The BR 03-92 is an aviation watch designed for professionals, featuring the iconic 'circle within a square' case design.",
        shortDescription: "Aviation instrument watch.",
        brand: "Bell & Ross",
        model: "BR0392-BLC-ST",
        price: 3900,
        currency: "USD",
        stock: 12,
        category: "sport",
        isActive: true,
        isFeatured: false,
        variants: {
            colors: [{ name: "Black", hex: "#000000", inStock: true }],
            straps: [{ material: "Rubber", priceModifier: 0, inStock: true }]
        },
        specifications: {
            movement: "automatic",
            caseMaterial: "Steel",
            caseDiameter: "42mm",
            waterResistance: "10 ATM",
            glass: "Sapphire Crystal",
            strapMaterial: "Rubber",
            powerReserve: "40 Hours",
            warranty: "2 Years"
        },
        images: [
            { url: "https://pngimg.com/d/watches_PNG9881.png", alt: "BR 03-92 Front", isPrimary: true }
        ],
        rating: { average: 4.6, count: 42 }
    }
];

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    }
};

const uploadToCloudinary = async (url, folder = 'crown-hour/products') => {
    try {
        console.log(`Uploading ${url} to Cloudinary...`);
        const result = await cloudinary.uploader.upload(url, {
            folder: folder,
            resource_type: 'image'
        });
        console.log(`✅ Uploaded: ${result.secure_url}`);
        return result.secure_url;
    } catch (error) {
        console.error(`❌ Failed to upload ${url}:`, error.message);
        // Fallback to original URL if upload fails (e.g., if internet is flaky or rate limit)
        return url;
    }
};

const seedData = async () => {
    await connectDB();

    try {
        console.log('Clearing existing products...');
        await Product.deleteMany({});

        // 1. Get the Role model to find what ID 'admin' maps to
        const Role = require('../models/Role');
        const adminRole = await Role.findOne({ name: 'admin' });

        if (!adminRole) {
            console.error('❌ Error: "admin" role not found in roles collection. Please seed roles first.');
            process.exit(1);
        }

        // 2. Find a user with that admin Role ID
        const User = require('../models/User');
        let adminUser = await User.findOne({ role: adminRole._id });

        // Fallback: If no admin, just pick *any* user to be the creator
        if (!adminUser) {
            console.log('⚠️ No admin user found. Falling back to first available user for "createdBy" field.');
            adminUser = await User.findOne({});
        }

        if (!adminUser) {
            console.error('❌ Error: No users found in database. Please seed users first.');
            process.exit(1);
        }

        console.log(`Using user "${adminUser.email}" as product creator.`);

        // 3. Process products one by one to handle uploads sequentially (to avoid overwhelming API)
        const productsWithData = [];

        for (const product of products) {
            console.log(`Processing ${product.name}...`);

            // Upload images to Cloudinary
            const processedImages = [];
            for (const img of product.images) {
                const cloudinaryUrl = await uploadToCloudinary(img.url);
                processedImages.push({
                    ...img,
                    url: cloudinaryUrl
                });
            }

            productsWithData.push({
                ...product,
                images: processedImages,
                createdBy: adminUser._id,
                slug: slugify(product.name, { lower: true, strict: true })
            });
        }

        // 4. Insert all products
        await Product.insertMany(productsWithData);
        console.log(`✅ Successfully seeded ${products.length} products with Cloudinary images.`);

        process.exit();
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
};

seedData();
