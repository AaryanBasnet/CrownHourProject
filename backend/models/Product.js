const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * Product Model
 * Manages watch products in the inventory
 *
 * Security: Only admins can create/update/delete products
 * Customers can only read products
 * 
 * Enhanced: Added slug for SEO-friendly URLs
 */
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters'],
  },
  slug: {
    type: String,
    unique: true,
    index: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Short description cannot exceed 500 characters'],
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
    maxlength: [100, 'Brand name cannot exceed 100 characters'],
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true,
    maxlength: [100, 'Model cannot exceed 100 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP'],
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['luxury', 'sport', 'casual', 'smart', 'vintage'],
  },
  // Product variants (colors, straps)
  variants: {
    colors: [{
      name: String,
      hex: String,
      inStock: { type: Boolean, default: true },
    }],
    straps: [{
      material: String,
      priceModifier: { type: Number, default: 0 },
      inStock: { type: Boolean, default: true },
    }],
  },
  specifications: {
    movement: {
      type: String,
      enum: ['automatic', 'quartz', 'mechanical', 'kinetic', 'solar'],
    },
    caseMaterial: String,
    caseDiameter: String,
    waterResistance: String,
    strapMaterial: String,
    warranty: String,
    powerReserve: String,
    glass: String,
  },
  images: [{
    url: {
      type: String,
      required: true,
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false,
    },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  // SEO metadata
  seo: {
    metaTitle: String,
    metaDescription: String,
  },
  // Track who created/modified the product for audit purposes
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
});

// Pre-save middleware to generate slug
productSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });
  }
  next();
});

// Static method to find by slug
productSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug, isActive: true });
};

// Indexes for search and filtering performance
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ brand: 1, category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ slug: 1 });

module.exports = mongoose.model('Product', productSchema);
