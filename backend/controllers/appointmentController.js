import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';

const addMinutes = (time, mins) => {
    const [h, m] = time.split(':').map(Number);
    const total  = h * 60 + m + mins;
    return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

// Create Appointment ─────────────────────────────────────────────────────────────────────────────
export const createAppointment = async (req, res) => {
    try {
        const { patientId, doctorId, date, startTime, appointmentType, visitType, consultationType, patientProblem } = req.body;

        if (!patientId || !doctorId || !date || !startTime) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });
        if (!doctor.available) return res.status(400).json({ message: 'Doctor is not available for booking.' });

        const patient = await Patient.findById(patientId);
        if (!patient) return res.status(404).json({ message: 'Patient not found.' });

        const endTime = addMinutes(startTime, doctor.duration || 30);

        // Is doctor's slot already taken?
        const doctorSlotTaken = doctor.bookedSlots.some(s => s.date === date && s.startTime === startTime);
        if (doctorSlotTaken) {
            return res.status(409).json({ message: 'This time slot is already booked.' });
        }

        // Does the patient already have an appointment at this time (with any doctor)?
        const patientSlotTaken = patient.bookedSlots.some(s => s.date === date && s.startTime === startTime);
        if (patientSlotTaken) {
            return res.status(409).json({ message: 'You already have an appointment at this time.' });
        }

        // DB-level overlap guard (safety net for race conditions)
        const overlap = await Appointment.findOne({
            doctorId, date,
            startTime: { $lt: endTime },
            endTime:   { $gt: startTime },
        });
        if (overlap) {
            return res.status(409).json({ message: 'This time slot is already booked.' });
        }

        const appointment = await Appointment.create({
            patientId,
            doctorId,
            patientName: patient.name,
            doctorName: doctor.name,
            date,
            startTime,
            endTime,
            appointmentType: appointmentType || 'Individual',
            visitType: visitType || 'New',
            consultationType: consultationType || 'Video',
            patientProblem: patientProblem || '',
            status: 'Scheduled',
        });

        // Record the slot in Doctor and Patient
        await Doctor.findByIdAndUpdate(doctorId, {
            $push: { appointments: appointment._id, bookedSlots: { date, startTime } },
        });
        await Patient.findByIdAndUpdate(patientId, {
            $push: { appointments: appointment._id, bookedSlots: { date, startTime } },
        });

        res.status(201).json({ message: 'Appointment booked successfully.', appointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Get Appointments for a User ─────────────────────────────────────────────────────────────────────
export const getUserAppointments = async (req, res) => {
    try {
        const { userId, role } = req.query;
        if (!userId || !role) return res.status(400).json({ message: 'Missing user info.' });

        if (role === 'patient') {
            const patient = await Patient.findOne({ userId });
            if (!patient) return res.status(404).json({ message: 'Patient not found.' });
            const appointments = await Appointment.find({ patientId: patient._id })
                .populate('doctorId', 'name specialty iconUrl')
                .sort({ date: -1, startTime: -1 });
            return res.json(appointments);
        }

        if (role === 'doctor') {
            const doctor = await Doctor.findOne({ userId });
            if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });
            const appointments = await Appointment.find({ doctorId: doctor._id })
                .populate('patientId', 'name age gender iconUrl')
                .sort({ date: -1, startTime: -1 });
            return res.json(appointments);
        }

        res.status(400).json({ message: 'Invalid role.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Get Single Appointment ─────────────────────────────────────────────────────────────────────────
export const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patientId', 'name age gender iconUrl allergies problems')
            .populate('doctorId',  'name specialty iconUrl degree appointmentTypes consultationTypes');
        if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
        res.json(appointment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Update Appointment ─────────────────────────────────────────────────────────────────────────────
export const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, patientProblem, prescription, appointmentType, visitType, consultationType, userId, role } = req.body;

        const appointment = await Appointment.findById(id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });

        // Authorise
        if (role === 'patient') {
            const patient = await Patient.findOne({ userId });
            if (!patient || appointment.patientId.toString() !== patient._id.toString()) {
                return res.status(403).json({ message: 'Unauthorized.' });
            }
        } else if (role === 'doctor') {
            const doctor = await Doctor.findOne({ userId });
            if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
                return res.status(403).json({ message: 'Unauthorized.' });
            }
        } else {
            return res.status(400).json({ message: 'Invalid role.' });
        }

        // Status change
        if (status) {
            if (!['Scheduled', 'Completed', 'Cancelled'].includes(status)) {
                return res.status(400).json({ message: 'Invalid status.' });
            }
            // On cancel — free the booked slot in both Doctor and Patient
            if (status === 'Cancelled' && appointment.status !== 'Cancelled') {
                await Doctor.findByIdAndUpdate(appointment.doctorId, {
                    $pull: { bookedSlots: { date: appointment.date, startTime: appointment.startTime } },
                });
                await Patient.findByIdAndUpdate(appointment.patientId, {
                    $pull: { bookedSlots: { date: appointment.date, startTime: appointment.startTime } },
                });
            }
            appointment.status = status;
        }

        // Patient can edit their fields while the appointment is still Scheduled
        if (role === 'patient' && appointment.status === 'Scheduled') {
            if (patientProblem !== undefined) appointment.patientProblem = patientProblem;
            if (appointmentType) appointment.appointmentType = appointmentType;
            if (visitType) appointment.visitType = visitType;
            if (consultationType) appointment.consultationType = consultationType;
        }

        // Doctor saves prescription — replace latest or push new entry
        if (role === 'doctor' && prescription) {
            const entry = {
                medicines:         Array.isArray(prescription.medicines) ? prescription.medicines : [],
                doctorDescription: prescription.doctorDescription || '',
                prescribedAt:      new Date(),
            };
            if (appointment.prescription && appointment.prescription.length > 0) {
                // Replace the last entry
                appointment.prescription[appointment.prescription.length - 1] = entry;
            } else {
                appointment.prescription.push(entry);
            }
            appointment.markModified('prescription');
        }

        await appointment.save();
        res.json({ message: 'Appointment updated.', appointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
};