import express from 'express';
import { createAppointment, getUserAppointments, updateAppointmentStatus } from '../controllers/appointmentController.js';

const router = express.Router();

router.post('/', createAppointment);
router.get('/', getUserAppointments);
router.put('/:id', updateAppointmentStatus);

export default router;