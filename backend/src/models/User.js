const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PermissionSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    viewAll: { type: Boolean, default: false }
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'employee'], default: 'employee', index: true },
    isActive: { type: Boolean, default: true, index: true },

    // RBAC בסיסי: On/Off לכל מודול + אופציה "רואה הכל"
    permissions: {
      clients: { type: PermissionSchema, default: () => ({}) },
      leads: { type: PermissionSchema, default: () => ({}) },
      tasks_calendar: { type: PermissionSchema, default: () => ({}) },
      marketing: { type: PermissionSchema, default: () => ({}) },
      cms: { type: PermissionSchema, default: () => ({}) },
      invoices_docs: { type: PermissionSchema, default: () => ({}) },
      settings: { type: PermissionSchema, default: () => ({}) }
    },

    // מאפשר לפסול טוקנים אחרי שינוי סיסמה
    tokenVersion: { type: Number, default: 0 }
  },
  { timestamps: true }
);

UserSchema.methods.setPassword = async function setPassword(password) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(password, salt);
};

UserSchema.methods.comparePassword = async function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

UserSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    _id: this._id,
    username: this.username,
    role: this.role,
    isActive: this.isActive,
    permissions: this.permissions,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('User', UserSchema);

