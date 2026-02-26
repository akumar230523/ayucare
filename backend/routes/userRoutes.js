import express from 'express';
import { signup, signin, getDoctors, getDoctorById, getPatientCount } from '../controllers/userController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/doctors', getDoctors);
router.get('/doctors/:id', getDoctorById);
router.get('/patients/count', getPatientCount);  // new route

export default router;