var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var moment = require('moment');

var routes = require('./routes/index');
var employees = require('./routes/employees');

var models = require("./models");
var User = models.User;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'hr-search'}));
app.use(passport.initialize());
app.use(passport.session());

app.locals.moment = moment;

app.use('/', routes);
app.use('/employees', employees);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

passport.use(new LocalStrategy(function(username, password, done) {
  User.findOne({
    where: {
      username: username
    }
  }).then(function(user) {
    if (!user) {
      return done(null, false, {message: 'Invalid username or password'});
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return done(null, false, {message: 'Invalid username or password'});
    } else {
      return done(null, user);
    }
  });
}));

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
  User.findOne({
    where: {
      username: username
    }
  }).then(function(user) {
    done(null, user);
  });
});

module.exports = app;
