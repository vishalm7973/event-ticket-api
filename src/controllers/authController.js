const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const HTTP = require('../constants/httpStatus');
const MESSAGES = require('../constants/messages');

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  sendSuccess(res, user, MESSAGES.USER_REGISTERED, HTTP.CREATED);
});

const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  sendSuccess(res, { user, token }, MESSAGES.LOGIN_SUCCESS);
});

const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, req.user);
});

module.exports = { register, login, getMe };
