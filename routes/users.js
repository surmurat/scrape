var express = require('express');
var db = require('../models');
var {ensureAuthenticated} = require('../config/ensureAuth');
var router = express.Router();

/* GET users listing. */
router.get('/', ensureAuthenticated, function(req, res, next) {
  var user = {};
  if (req.user) {
    user._id = req.user._id;
    user.email = req.user.email;
  } else {
    user = null;
  }
  db.Comment.find({'user': req.user._id}).populate('article', 'headline').then(comments => {
    res.render('dashboard', {title: 'Dashboard', comments: comments, user: user});
  }).catch(err => console.log(err));
});

router.delete('/deletecomment', ensureAuthenticated, (req, res) => {
  const {commentId} = req.body;
  if (!commentId) {
    return res.status(400).end();
  }
  db.Comment.findByIdAndDelete(commentId, (err) => {
    if (err) {
      return res.status(500).end();
    }
    let response = {
      message: 'Done!'
    };
    res.json(response);
  });
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
            res.redirect('/getComments/' + articleId);
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
