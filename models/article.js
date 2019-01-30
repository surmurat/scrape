var mongoose = require("mongoose");

var Schema =mongoose.Schema;

var ArticleSchema = new Schema({

    headline: {
        type: String,
        required: true
    },

    summary:{
        type: String,
        required: true
    },

    url: {
        type: String,
        required: true
    },

    image: {
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
        required: true
    },

    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;