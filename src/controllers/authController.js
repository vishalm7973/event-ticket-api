const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  sendSuccess(res, user, 'User registered', 201);
});

const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  sendSuccess(res, { user, token }, 'Login successful');
});

module.exports = { register, login };
