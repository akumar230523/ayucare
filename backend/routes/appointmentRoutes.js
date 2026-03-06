import express from 'express';
import { createAppointment, getUserAppointments, getAppointmentById, updateAppointment } from '../controllers/appointmentController.js';

const router = express.Router();

router.post('/', createAppointment);
router.get('/', getUserAppointments);
router.get('/:id', getAppointmentById);
router.put('/:id', updateAppointment);

export default router;