const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');

router.get('/', workerController.getWorkers);
router.post('/', workerController.createWorker);
router.get('/:id', workerController.getWorkerById);
router.patch('/:id/status', workerController.updateStatus);

module.exports = router;
