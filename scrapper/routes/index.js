var express = require('express');
var axios = require('axios');
var cheerio = require('cheerio');
var db = require('../models');
var passport = require('passport');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  db.Article.find({}).populate({
    path: 'comments',
    populate: {
      path: 'user',
      select: 'email'
    }
  }).then((result) => {
    res.render('index', { title: 'Article Scrapper', articles: result });
  }).catch(err => console.log(err));
});

// get route to show a article
router.get('/article/:articleId', (req, res) => {
  res.render('article', { article: null, title: 'Article Page' });
});

router.get('/signup', (req, res) => {
  res.render('signup', { title: 'Sign-up', message: req.flash('signupMessage') });
});

router.get('/login', (req, res) => {
  res.render('login', { title: 'Login', message: req.flash('loginMessage') });
});

router.post('/logout', (req, res) => {
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
    res.status(200).end();
  }).catch(err => console.log(err));
});

module.exports = router;