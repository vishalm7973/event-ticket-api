const mongoose = require('mongoose');
const ROLES = require('../constants/roles');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('validate', function () {
  if (this.isNew && !this._password && !this.passwordHash) {
    this.invalidate('password', 'Password is required');
  }
});

userSchema.pre('save', async function () {
  if (!this._password) return;

  this.passwordHash = await bcrypt.hash(this._password, 10);
});

userSchema.virtual('password').set(function (value) {
  this._password = value;
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
