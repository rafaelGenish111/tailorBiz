const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true },
    publicId: { type: String, trim: true },
    alt: { type: String, trim: true }
  },
  { _id: false }
);

const ArticleBlockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['hero', 'heading', 'paragraph', 'image', 'quote', 'cta', 'divider', 'list']
    },
    data: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { _id: false }
);

const ArticleSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true
    },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, trim: true },
    category: { type: String, trim: true, default: 'general' },
    tags: [{ type: String, trim: true }],

    coverImage: { type: ImageSchema, default: null },

    seo: {
      title: { type: String, trim: true },
      description: { type: String, trim: true }
    },

    draft: {
      blocks: { type: [ArticleBlockSchema], default: [] }
    },

    published: {
      blocks: { type: [ArticleBlockSchema], default: [] }
    },

    isPublished: { type: Boolean, default: false, index: true },
    publishedAt: Date,

    versions: [
      {
        createdAt: { type: Date, default: Date.now },
        createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
        title: { type: String, trim: true },
        excerpt: { type: String, trim: true },
        category: { type: String, trim: true },
        tags: [{ type: String, trim: true }],
        coverImage: { type: ImageSchema, default: null },
        seo: {
          title: { type: String, trim: true },
          description: { type: String, trim: true }
        },
        draft: {
          blocks: { type: [ArticleBlockSchema], default: [] }
        },
        published: {
          blocks: { type: [ArticleBlockSchema], default: [] }
        },
        isPublished: { type: Boolean, default: false },
        publishedAt: Date
      }
    ]
  },
  { timestamps: true }
);

ArticleSchema.index({ category: 1, isPublished: 1, publishedAt: -1 });

module.exports = mongoose.model('Article', ArticleSchema);

