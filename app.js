// Application that allows users to anonymously share content
// without needing to register an account, which allows the posts
// to be judged purely on the quality of the content, without giving
// users an advantage based on their credibility.
// Created By Majd Zayyad in the 1st of May 2020

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongo = require('mongodb')
var assert = require('assert')
var mongoose = require('mongoose')

var indexRouter = require('./routes/index')
var voteRouter = require('./routes/vote');
let inputRouter = require('./routes/input')
let postsRouter = require('./routes/posts')

var bodyParser = require('body-parser')

let url = 'mongodb://localhost:27017/test'

mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true });

const connection = mongoose.connection;


var app = express();

//app.use('/posts', posts)

app.use( bodyParser.json() );       // to support JSON-encoded bodies
//app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  //extended: true
//})); 

//app.use(express.urlencoded())
app.use(express.json())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/input', inputRouter)
app.use('/vote', voteRouter);
app.use('/posts', postsRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
