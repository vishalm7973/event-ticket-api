const AppError = require('../utils/AppError');

const emailRegex = /^\S+@\S+\.\S+$/;

const validateRegister = (body) => {
  const { firstName, lastName, email, password } = body;

  if (!firstName?.trim()) {
    throw new AppError('First name is required', 400);
  }

  if (!lastName?.trim()) {
    throw new AppError('Last name is required', 400);
  }

  if (!email?.trim() || !emailRegex.test(email)) {
    throw new AppError('Valid email is required', 400);
  }

  if (!password || password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }
};

const validateLogin = (body) => {
  const { email, password } = body;

  if (!email?.trim() || !emailRegex.test(email)) {
    throw new AppError('Valid email is required', 400);
  }

  if (!password) {
    throw new AppError('Password is required', 400);
  }
};

module.exports = { validateRegister, validateLogin };
