const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

router.get('/', serviceController.getServices);
router.post('/', serviceController.addService);
router.put('/:id', serviceController.editService);
router.delete('/:id', serviceController.removeService);

module.exports = router;
