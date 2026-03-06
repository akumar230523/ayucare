import express from 'express';
import { getPatientCount, getPatientById, updatePatient } from '../controllers/patientController.js';

const router = express.Router();

router.get('/count', getPatientCount);
router.get('/:id', getPatientById);
router.put('/:id', updatePatient);

export default router;