const serviceModel = require('../models/serviceModel');

const getServices = async (req, res) => {
    try {
        const rows = await serviceModel.getAllServices();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil data services', detail: error.message });
    }
};

const addService = async (req, res) => {
    try {
        const { name, description, price, duration_minutes } = req.body;
        await serviceModel.createService(name, description, price, duration_minutes);
        res.json({ message: "Service berhasil dibuat" });
    } catch (error) {
        res.status(500).json({ error: 'Gagal membuat service', detail: error.message });
    }
};

const removeService = async (req, res) => {
    try {
        await serviceModel.deleteService(req.params.id);
        res.json({ message: "Service berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ error: 'Gagal menghapus service', detail: error.message });
    }
};

const editService = async (req, res) => {
    try {
        const { name, description, price, duration_minutes } = req.body;
        await serviceModel.updateService(req.params.id, name, description, price, duration_minutes);
        res.json({ message: "Service berhasil diupdate" });
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengupdate service', detail: error.message });
    }
};

module.exports = {
    getServices,
    addService,
    removeService,
    editService
};
