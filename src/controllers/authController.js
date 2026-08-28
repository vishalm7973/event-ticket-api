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
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  sendSuccess(res, { user, accessToken, refreshToken }, MESSAGES.LOGIN_SUCCESS);
});

const refresh = asyncHandler(async (req, res) => {
  const tokens = await authService.refresh(req.body.refreshToken);
  sendSuccess(res, tokens, MESSAGES.REFRESH_SUCCESS);
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user);
  sendSuccess(res, null, MESSAGES.LOGOUT_SUCCESS);
});

const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, req.user);
});

module.exports = { register, login, refresh, logout, getMe };
