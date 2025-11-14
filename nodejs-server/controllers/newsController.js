const NewsEvent = require('../models/newsEventModel');

exports.createNewsEvent = async (req, res) => {
    try {
        const { news_headline, news_content } = req.body;
        if (!news_headline || !news_content) {
            return res.status(400).json({ status: "fail", message: "headline and content are required." });
        }

        const newEvent = await NewsEvent.create({
            headline: news_headline,
            content: news_content
        });

        res.status(201).json({ status: "success", data: newEvent });

    } catch (err) {
        res.status(500).json({ status: "fail", message: `Error creating news event: ${err.message}` });
    }
};