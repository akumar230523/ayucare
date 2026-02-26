import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';

// @desc    Create a new appointment
// @route   POST /api/appointments
export const createAppointment = async (req, res) => {
    try {
        const { patientId, doctorId, date, time, patientProblem } = req.body;

        if (!patientId || !doctorId || !date || !time) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        // Verify doctor exists and is available
        const doctor = await Doctor.findById(doctorId);
        if (!doctor || !doctor.available) {
            return res.status(400).json({ message: 'Doctor is not available for booking.' });
        }

        // Verify patient exists
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found.' });
        }

        // Create appointment
        const appointment = await Appointment.create({
            patientId,
            doctorId,
            doctorName: doctor.name,
            patientName: patient.name,
            patientProblem: patientProblem || '',
            date,
            time,
            status: 'scheduled'
        });
        // Push appointment ID to both doctor and patient
        await Doctor.findByIdAndUpdate(doctorId, {
            $push: { appointments: appointment._id }
        });
        await Patient.findByIdAndUpdate(patientId, {
            $push: { appointments: appointment._id }
        });
        // 
        res.status(201).json({ message: 'Appointment booked successfully.', appointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// @desc    Get appointments for a user (patient or doctor)
// @route   GET /api/appointments
export const getUserAppointments = async (req, res) => {
    try {
        const { userId, role } = req.query; // userId = User collection _id

        if (!userId || !role) {
            return res.status(400).json({ message: 'Missing user info.' });
        }

        let appointments = [];
        if (role === 'patient') {
            const patient = await Patient.findOne({ userId });
            if (!patient) return res.status(404).json({ message: 'Patient not found.' });
            appointments = await Appointment.find({ patientId: patient._id })
                .populate('doctorId', 'name specialty iconUrl')
                .sort({ date: -1, time: -1 });
        } else if (role === 'doctor') {
            const doctor = await Doctor.findOne({ userId });
            if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });
            appointments = await Appointment.find({ doctorId: doctor._id })
                .populate('patientId', 'name age gender problem')
                .sort({ date: -1, time: -1 });
        } else {
            return res.status(400).json({ message: 'Invalid role.' });
        }

        res.json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// @desc    Update appointment status (cancel/complete)
// @route   PUT /api/appointments/:id
export const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status.' });
        }

        const appointment = await Appointment.findByIdAndUpdate(id, { status }, { new: true });
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }

        res.json({ message: 'Appointment updated.', appointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
};