var mongoose = require("mongoose");
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    password: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    }


});

UserSchema.methods.generateHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

UserSchema.methods.validPassword = (password, userpassword) => {
    return bcrypt.compareSync(password, userpassword);
};

module.exports = mongoose.model("User", UserSchema);