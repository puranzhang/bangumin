const router = require('express').Router();
const passport = require('passport');
const logger = require('../utils/logger')(module);
const csrf = require('csurf');
const config = require('../config');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const getUserProfile = require('../middleware/userProfileHandler');
const { CustomError } = require('../middleware/errorHandler');
const asyncHandler = require('express-async-handler');

// generate a jwt token
const createToken = function createToken(auth) {
  return jwt.sign(
    {
      id: auth.id,
    }, config.passport.secret.jwt,
    {
      expiresIn: '5 days',
    },
  );
};

// retrieve id from req.auth and pass it to createToken()
const generateToken = function generateToken(req, res, next) {
  req.token = createToken(req.auth);
  next();
};

// send jwt auth token in header back to client
const sendToken = function sendToken(req, res, next) {
  res.header('x-auth-token', req.token);
  res.status(200).json(req.auth);
  next();
};

// authenticate user using jwt token
const authenticate = expressJwt({
  secret: config.passport.secret.jwt,
  requestProperty: 'auth',
  getToken(req) {
    if (req.headers['x-auth-token']) {
      return req.headers['x-auth-token'];
    }
    return null;
  },
});

/**
 * a route that will authenticate user identity and issue a new jwt token in header
 * the authentication will be done by checking whether bangumi can verify user identity
 * with the provided access token
 */
router.post('/jwt/token/', asyncHandler(getUserProfile), (req, res, next) => {
  req.auth = {
    id: req.bangumin.userProfile.user_id,
  };

  if (!req.auth.id) return next(new CustomError('user_not_exist', 'Cannot find user from bangumi database'));

  return next();
}, generateToken, sendToken);


router.get('/me/', (req, res, next) => {
  res.json({ status: 'good!' });
});

module.exports = router;
