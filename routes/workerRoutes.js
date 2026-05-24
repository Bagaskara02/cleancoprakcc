const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');

router.get('/', workerController.getWorkers);
router.post('/', workerController.createWorker);
router.post('/login', workerController.login);
router.get('/:id', workerController.getWorkerById);
router.patch('/:id/status', workerController.updateStatus);
router.put('/:id', workerController.updateWorker);
router.delete('/:id', workerController.removeWorker);

module.exports = router;
