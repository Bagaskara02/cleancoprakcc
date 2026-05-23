const workerModel = require('../models/workerModel');

const getWorkers = async (req, res) => {
    try {
        const rows = await workerModel.getAllWorkers();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil data workers', detail: error.message });
    }
};

const getWorkerById = async (req, res) => {
    try {
        const row = await workerModel.getWorkerById(req.params.id);
        if (!row) return res.status(404).json({ error: 'Worker tidak ditemukan' });
        res.json(row);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil data worker', detail: error.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await workerModel.updateWorkerStatus(req.params.id, status);
        res.json({ message: "Status worker berhasil diupdate" });
    } catch (error) {
        res.status(500).json({ error: 'Gagal update status worker', detail: error.message });
    }
};

module.exports = {
    getWorkers,
    getWorkerById,
    updateStatus
};
