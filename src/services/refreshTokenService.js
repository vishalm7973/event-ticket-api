const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const getRefreshExpiry = () => {
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  const match = expiresIn.match(/^(\d+)([dhms])$/);

  if (!match) {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  const value = Number.parseInt(match[1], 10);
  const unit = match[2];
  const units = { d: 86400000, h: 3600000, m: 60000, s: 1000 };

  return new Date(Date.now() + value * units[unit]);
};

const createRefreshToken = async (userId) => {
  const token = crypto.randomBytes(40).toString('hex');

  await RefreshToken.create({
    userId,
    tokenHash: hashToken(token),
    expiresAt: getRefreshExpiry(),
  });

  return token;
};

const rotateRefreshToken = async (token) => {
  const tokenHash = hashToken(token);
  const stored = await RefreshToken.findOne({ tokenHash });

  if (!stored || stored.expiresAt < new Date()) {
    if (stored) await RefreshToken.deleteOne({ _id: stored._id });
    return null;
  }

  await RefreshToken.deleteOne({ _id: stored._id });

  const newToken = await createRefreshToken(stored.userId);
  return { userId: stored.userId, refreshToken: newToken };
};

const revokeUserRefreshTokens = async (userId) => {
  await RefreshToken.deleteMany({ userId });
};

module.exports = {
  createRefreshToken,
  rotateRefreshToken,
  revokeUserRefreshTokens,
};
