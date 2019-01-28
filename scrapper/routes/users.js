var express = require('express');
var db = require('../models');
var {ensureAuthenticated} = require('../config/ensureAuth');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('dashboard', {title: 'Dashboard', comments: null});
});

router.post('/postcomment', ensureAuthenticated, (req, res) => {
  const {body, articleId} = req.body;
  if (!body || !articleId || !req.user){
    return res.status(400).end();
  }
  var newComment = {};
  newComment.body = body;
  newComment.user = req.user._id;
  newComment.article = articleId;
  newComment.createdAt = new Date();
  db.Article.findOne({'_id' : articleId}).then(article => {
    if (article) {
      db.Comment.create(newComment)
      .then(comment => {
        if (comment)
        {
          comment.populate('user', 'email');
          article.comments.push(comment._id);
          article.save(err => {
            if (err) throw err;
            res.json(comment);
          });
        } else {
          res.status(400).end();
        }
      }).catch(err => console.log(err));
    }
  });
});

// delete route to delete a comment.
// post route to add comment.

module.exports = router;
