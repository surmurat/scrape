var express = require('express');
var axios = require('axios');
var cheerio = require('cheerio');
var db = require('../models');
var passport = require('passport');
var fs = require('fs');
var hbs = require('hbs');
var path = require('path');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  db.Article.find({}).populate({
    path: 'comments',
    populate: {
      path: 'user',
      select: 'email'
    }
  }).then((result) => {
    var user = {};
    if (req.user) {
      user._id = req.user._id;
      user.email = req.user.email;
    } else {
      user = null;
    }
    console.log(user);
    res.render('index', { title: 'Article Scrapper', articles: result, user: user });
  }).catch(err => console.log(err));
});

router.get('/signup', (req, res) => {
  var user = {};
  if (req.user) {
    user._id = req.user._id;
    user.email = req.user.email;
  } else {
    user = null;
  }
  res.render('signup', { title: 'Sign-up', message: req.flash('signupMessage'), user: user });
});

router.get('/login', (req, res) => {
  var user = {};
  if (req.user) {
    user._id = req.user._id;
    user.email = req.user.email;
  } else {
    user = null;
  }
  res.render('login', { title: 'Login', message: req.flash('loginMessage'), user: user });
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/', // redirect to the secure profile section
  failureRedirect: '/login', // redirect back to the signup page if there is an error
  failureFlash: true // allow flash messages
}));

router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/', // redirect to the secure profile section
  failureRedirect: '/signup', // redirect back to the signup page if there is an error
  failureFlash: true // allow flash messages
}));

router.get('/getArticles', (req, res) => {
  db.Article.find({}).populate({
    path: 'comments',
    populate: {
      path: 'user',
      select: 'email'
    }
  }).then((savedArticles)=> {
    res.json(savedArticles);
  });
});

router.get('/getComments/:articleId', (req, res) => {
  var articleId = req.params.articleId;
  if (!articleId) {
    return res.status(404).end();
  }
  var file = path.join(__dirname,'..' , 'views/partials/comments.hbs');
  fs.readFile(file, (err, content) => {
    if (err) throw err;
    db.Comment.find({'article' : articleId}).populate('user', 'email').then(data => {
      var source = content.toString();
      if (!source) return res.status(400).end();
      var template = hbs.handlebars.compile(source);
      var output = template({comments: data});
      res.json({result: output});
    }).catch(err => console.log(err));
  });
});

router.post('/scrape', (req, res) => {
  axios.get('https://www.reuters.com/news/technology').then((response) => {
    const $ = cheerio.load(response.data);
    $('article').each((index, element) => {
      var article = {};

      article.headline = $(element).find('.story-title').text();
      if (article.headline) {
        article.headline = article.headline.replace(/\r|\n|\t/g, '');
      }
      article.summary = $(element).find('p').text();
      article.url = 'https://www.reuters.com' + $(element).find('a').attr('href');
      article.image = $(element).find('img').attr('org-src');
      article.createdAt = new Date();
      db.Article.findOne({ 'headline': article.headline }, (err, result) => {
        if (err) {
          console.log(err);
        }
        if (!err && !result) {
          db.Article.create(article).then(a => {
            console.log(a);
          }).catch(err => console.log(err));
        }
      });
    });
  }).then(() => {
    res.redirect('/getArticles');
  }).catch(err => console.log(err));
});

module.exports = router;