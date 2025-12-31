const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true, required: true },
    publicId: { type: String, trim: true },
    alt: { type: String, trim: true }
  },
  { _id: false }
);

const ClientLogoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    websiteUrl: { type: String, trim: true },
    projectTitle: { type: String, trim: true },
    description: { type: String, trim: true },
    logo: { type: ImageSchema, required: true },
    order: { type: Number, default: 0, index: true },
    isPublished: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

ClientLogoSchema.index({ isPublished: 1, order: 1 });

module.exports = mongoose.model('ClientLogo', ClientLogoSchema);

