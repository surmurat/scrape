var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CommentSchema = new Schema({
    body: {
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
        required: true
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    article: {
        type: Schema.Types.ObjectId,
        ref: "Article"
    }
});


var Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;

