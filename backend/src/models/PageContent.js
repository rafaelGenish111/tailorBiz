const mongoose = require('mongoose');

/**
 * PageContent
 * Stores draft/published JSON content for site pages (e.g. home/about),
 * including version history to support rollback.
 */
const PageContentSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true
    },

    seo: {
      title: { type: String, trim: true },
      description: { type: String, trim: true }
    },

    draft: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    published: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },

    publishedAt: Date,

    versions: [
      {
        createdAt: { type: Date, default: Date.now },
        createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
        draft: { type: mongoose.Schema.Types.Mixed, default: {} },
        published: { type: mongoose.Schema.Types.Mixed, default: null },
        seo: {
          title: { type: String, trim: true },
          description: { type: String, trim: true }
        }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('PageContent', PageContentSchema);

