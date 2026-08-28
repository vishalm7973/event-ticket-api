const User = require('../models/User');
const AppError = require('../utils/AppError');
const { signToken } = require('../utils/jwt');
const { validateRegister, validateLogin } = require('../validators/authValidator');

const register = async (body) => {
  validateRegister(body);

  const { firstName, lastName, email, password } = body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('Email already exists', 409);
  }

  const user = new User({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim(),
  });

  user.password = password;
  await user.save();

  return user;
};

const login = async (body) => {
  validateLogin(body);

  const { email, password } = body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken(user._id, user.role);

  return { user, token };
};

module.exports = { register, login };
