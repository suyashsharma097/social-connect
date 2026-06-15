import express from 'express';
import assetController from '../controllers/asset.controller.js';
import validate from '../middleware/validation.middleware.js';
import assetValidation from '../validations/asset.validation.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', validate(assetValidation.getAssets), assetController.getAssets);
router.post('/', restrictTo('ADMIN', 'HR'), validate(assetValidation.createAsset), assetController.createAsset);
router.post('/:id/assign', restrictTo('ADMIN', 'HR'), validate(assetValidation.assignAsset), assetController.assignAsset);
router.post('/:id/return', restrictTo('ADMIN', 'HR'), validate(assetValidation.returnAsset), assetController.returnAsset);

export default router;
