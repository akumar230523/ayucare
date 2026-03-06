import mongoose from 'mongoose';

// Each booked slot stores the date and startTime
const bookedSlotSchema = new mongoose.Schema(
    {
        date: { type: String, required: true },
        startTime: { type: String, required: true },
    },
    { _id: false }
);

const doctorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    about: String,
    iconUrl: { type: String, default: 'https://png.pngtree.com/png-vector/20190419/ourmid/pngtree-vector-doctor-icon-png-image_956640.jpg' },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    // 
    degree: String,
    service: [String],
    specialty: String,
    expression: String,
    // 
    experienceYears: Number,
    patientsCount: String,
    rating: Number,
    reviewsCount: Number,
    fee: Number,
    // 
    availableDays: [{ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }],
    startTime: String,
    endTime: String,
    duration: Number,
    breakDuration: Number,
    // 
    appointmentTypes: [{ type: String, enum: ['Individual', 'Group'] }],
    consultationTypes: [{ type: String, enum: ['Video', 'Audio', 'In-person'] }],
    available: { type: Boolean, default: false },
    appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }],
    bookedSlots: [bookedSlotSchema],
}, { timestamps: true });

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
