import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    about: String,
    gender: { type: String, enum: ['male', 'female'] },
    iconUrl: { type: String, default: 'https://png.pngtree.com/png-vector/20191021/ourmid/pngtree-vector-doctor-icon-png-image_1834402.jpg' },
    service: [String],
    specialty: String,
    expression: String,
    degree: String,
    experienceYears: Number,
    patientsCount: String,
    rating: Number,
    reviewsCount: Number,
    available: { type: Boolean, default: false },
    appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }]
}, { timestamps: true });

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;