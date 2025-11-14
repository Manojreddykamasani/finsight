const mongoose = require('mongoose');

const newsEventSchema = new mongoose.Schema({
    headline: {
        type: String,
        required: [true, 'News event must have a headline'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'News event must have content'],
        trim: true
    },
}, {
    timestamps: true 
});

newsEventSchema.index({ createdAt: -1 });

const NewsEvent = mongoose.model('NewsEvent', newsEventSchema);

module.exports = NewsEvent;