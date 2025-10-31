import express from 'express';
import { getDistrictData, getHistoricalData } from '../controllers/districtController.js';

const router = express.Router();

router.get('/district-data', getDistrictData);
router.get('/historical-data', getHistoricalData);

router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

export default router;