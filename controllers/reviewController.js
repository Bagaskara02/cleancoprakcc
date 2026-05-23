const reviewModel = require('../models/reviewModel');

const addReview = async (req, res) => {
    try {
        const { orderId, workerId, rating, comment } = req.body;
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating harus antara 1 sampai 5' });
        }
        await reviewModel.createReview(orderId, workerId, rating, comment);
        res.status(201).json({ message: "Review dan rating berhasil ditambahkan" });
    } catch (error) {
        res.status(500).json({ error: 'Gagal menambahkan review', detail: error.message });
    }
};

const getWorkerReviews = async (req, res) => {
    try {
        const rows = await reviewModel.getReviewsByWorker(req.params.workerId);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil data review', detail: error.message });
    }
};

module.exports = {
    addReview,
    getWorkerReviews
};
