import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    age: Number,
    gender: { type: String, enum: ['male', 'female'] },
    iconUrl: { type: String, default: 'https://png.pngtree.com/png-vector/20191009/ourmid/pngtree-user-icon-png-image_1796659.jpg' }, 
    height: Number,
    weight: Number,
    problem: String,
    appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }]
}, { timestamps: true });

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;