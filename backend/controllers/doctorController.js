import User from '../models/User.js';
import Doctor from '../models/Doctor.js';


// @desc    Get all available doctors
// @route   GET /api/doctors
export const getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({ available: true })
            .select('-userId -appointments -createdAt -updatedAt')
            .lean();
        return res.json(doctors);
    } 
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error!' });
    }
};


// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
export const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ _id: req.params.id, available: true })
            .select('-userId -appointments -createdAt -updatedAt')
            .lean();

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found.' });
        }
        return res.json(doctor);
    } 
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error!' });
    }
};

// @desc    Get doctor by user ID
// @route   GET /api/doctors/user/:userId
export const getDoctorByUserId = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.params.userId })
            .select('-appointments -createdAt -updatedAt')
            .lean();
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found.' });
        }
        return res.json(doctor);
    } 
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error!' });
    }
};


// @desc    Update doctor profile
// @route   PUT /api/doctors/:id
export const updateDoctorProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            userId, name, about, iconUrl, gender, service, specialty, expression, 
            degree, experienceYears, patientsCount, fee, availableDays, startTime, 
            endTime, duration, breakDuration, appointmentTypes, consultationTypes 
        } = req.body;

        const doctor = await Doctor.findById(id);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });

        // Check ownership using userId from request body (since no auth middleware yet)
        if (doctor.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized.' });
        }

        // Update doctor fields
        if (name !== undefined) doctor.name = name;
        if (about !== undefined) doctor.about = about;
        if (iconUrl !== undefined) doctor.iconUrl = iconUrl;
        if (gender !== undefined) doctor.gender = gender;
        if (service !== undefined) doctor.service = service;
        if (specialty !== undefined) doctor.specialty = specialty;
        if (expression !== undefined) doctor.expression = expression;
        if (degree !== undefined) doctor.degree = degree;
        if (experienceYears !== undefined) doctor.experienceYears = experienceYears;
        if (patientsCount !== undefined) doctor.patientsCount = patientsCount;   // <-- added
        if (fee !== undefined) doctor.fee = fee;
        if (availableDays !== undefined) doctor.availableDays = availableDays;
        if (startTime !== undefined) doctor.startTime = startTime;
        if (endTime !== undefined) doctor.endTime = endTime;
        if (duration !== undefined) doctor.duration = duration;
        if (breakDuration !== undefined) doctor.breakDuration = breakDuration;
        if (appointmentTypes !== undefined) doctor.appointmentTypes = appointmentTypes;
        if (consultationTypes !== undefined) doctor.consultationTypes = consultationTypes;

        await doctor.save();

        // If name changed, update the corresponding User document
        if (name !== undefined) {
            await User.findByIdAndUpdate(userId, { name });
        }

        // Fetch updated doctor (excluding sensitive fields)
        const updatedDoctor = await Doctor.findById(id)
            .select('-userId -appointments -createdAt -updatedAt')
            .lean();

        return res.json({ message: 'Profile updated successfully.', doctor: updatedDoctor });
    } 
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error!' });
    }
};


// Helper to check if profile is complete
const isProfileComplete = (doctor) => {
    const required = [
        'degree', 'specialty', 'service',
        'experienceYears', 'patientsCount', 'fee',
        'availableDays', 'startTime', 'endTime', 'duration', 'breakDuration',
    ];
    for (const field of required) {
        if (!doctor[field]) return false;
    }
    if (!doctor.availableDays || doctor.availableDays.length === 0) return false;
    return true;
};


// @desc    Toggle doctor availability (Active / Inactive)
// @route   PUT /api/doctors/:id/availability
export const updateAvailability = async (req, res) => {
    try {
        const { available } = req.body;
        if (typeof available !== 'boolean') {
            return res.status(400).json({ message: '`available` must be a boolean.' });
        }

        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });

        // If trying to activate, check profile completeness
        if (available === true && !isProfileComplete(doctor)) {
            return res.status(400).json({
                message: 'Please complete your profile first.'
            });
        }

        doctor.available = available;
        await doctor.save();

        const updatedDoctor = await Doctor.findById(req.params.id)
            .select('-userId -appointments -createdAt -updatedAt')
            .lean();

        res.json({
            message: `Status updated to ${available ? 'Active' : 'Inactive'}.`,
            doctor: updatedDoctor
        });
    } 
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error!' });
    }
};