const User = require('../models/User');
const AppError = require('../utils/AppError');
const { signAccessToken } = require('../utils/jwt');
const {
  createRefreshToken,
  rotateRefreshToken,
  revokeUserRefreshTokens,
} = require('./refreshTokenService');
const HTTP = require('../constants/httpStatus');
const MESSAGES = require('../constants/messages');

const issueTokens = async (user) => {
  const accessToken = signAccessToken(user);
  const refreshToken = await createRefreshToken(user._id);

  return { accessToken, refreshToken };
};

const register = async (body) => {
  const { firstName, lastName, email, password } = body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(MESSAGES.EMAIL_EXISTS, HTTP.CONFLICT);
  }

  const user = new User({
    firstName,
    lastName,
    email,
  });

  user.password = password;
  await user.save();

  return user;
};

const login = async (body) => {
  const { email, password } = body;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw new AppError(MESSAGES.INVALID_CREDENTIALS, HTTP.UNAUTHORIZED);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError(MESSAGES.INVALID_CREDENTIALS, HTTP.UNAUTHORIZED);
  }

  await revokeUserRefreshTokens(user._id);
  const tokens = await issueTokens(user);

  return { user, ...tokens };
};

const refresh = async (refreshToken) => {
  const rotated = await rotateRefreshToken(refreshToken);

  if (!rotated) {
    throw new AppError(MESSAGES.INVALID_REFRESH_TOKEN, HTTP.UNAUTHORIZED);
  }

  const user = await User.findById(rotated.userId);
  if (!user) {
    throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP.UNAUTHORIZED);
  }

  const accessToken = signAccessToken(user);

  return {
    accessToken,
    refreshToken: rotated.refreshToken,
  };
};

const logout = async (user) => {
  user.tokenVersion += 1;
  await user.save();
  await revokeUserRefreshTokens(user._id);
};

module.exports = { register, login, refresh, logout };
