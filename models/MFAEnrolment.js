const mongoose = require('mongoose');
const crypto = require('../server/crypto')
// https://stackoverflow.com/a/49774094
const MFAEnrolmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        trim: true,
        unique: true
    },
    secret: {
        type: String,
        required: true
    },
    iv: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
});

// user pre(validate) instead of pre(save) when a field is created implicitly (e.g. iv)
// https://stackoverflow.com/a/30142097
MFAEnrolmentSchema.pre('validate', function(next) {
    if (this.isNew || this.isModified('secret')) {
        const {encrypted, iv} = crypto.encrypt(this.secret);
        this.secret = encrypted;
        this.iv = iv;
    }
    next();
});

MFAEnrolmentSchema.post('init', function(doc) {
    if(this.secret){
        this.secret = crypto.decrypt(this.secret, this.iv);
    }
});

const MFAEnrolment = mongoose.model('MFAEnrolment', MFAEnrolmentSchema);
module.exports = MFAEnrolment;