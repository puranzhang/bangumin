const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const expressSession = require('express-session');
const passport = require('./middleware/passportHandler');
const logger = require('./utils/logger')(module);

const oauth = require('./routes/oauth');
const auth = require('./routes/auth');

const app = express();
const server = app.listen(config.server.port, config.server.host);


// enable cors
const corsOption = {
  origin: config.frontEndUrl,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token'],
};

app.use(cors(corsOption));

// TODO: enable csrf in the future


// rest API requirements
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(cookieParser());

app.use(expressSession({
  secret: config.passport.secret.session,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,

  },
}));

// security setup
app.use(helmet());

app.use(passport.initialize());
app.use(passport.session());

app.use('/oauth', oauth);
app.use('/auth', auth);

// define error-handling middleware last, after other app.use() & routes calls;
const logErrors = function logErrors(err, req, res, next) {
  logger.error('%o', err.stack);
  next(err);
};


// error handler, send stacktrace only during development
// eslint-disable-next-line no-unused-vars
const generalErrorHandler = function errorHandler(err, req, res, next) {
  res.status(500);
  res.send('internal error');
};

app.use(logErrors);
app.use(generalErrorHandler);

module.exports = server;
