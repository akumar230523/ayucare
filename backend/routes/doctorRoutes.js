import express from 'express';
import { getDoctors, getDoctorById, getDoctorByUserId, updateDoctorProfile, updateAvailability } from '../controllers/doctorController.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/user/:userId', getDoctorByUserId);
router.put('/:id', updateDoctorProfile);
router.put('/:id/availability', updateAvailability);

export default router;