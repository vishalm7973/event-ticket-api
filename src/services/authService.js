const User = require('../models/User');
const AppError = require('../utils/AppError');
const { signToken } = require('../utils/jwt');
const HTTP = require('../constants/httpStatus');
const MESSAGES = require('../constants/messages');

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

  const token = signToken(user._id, user.role);

  return { user, token };
};

module.exports = { register, login };
