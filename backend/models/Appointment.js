import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema(
    {
        medicines: [
            {
                medicineName: String,
                dosage: String,
                frequency: String,
                duration: String
            }
        ],
        doctorDescription: String,
        prescribedAt: { type: Date, default: Date.now }
    },
    { _id: false }
);

const appointmentSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patientName: { type: String, required: true },
    doctorName: { type: String, required: true },
    // 
    patientProblem: { type: String, maxlength: 500 },
    prescription: [prescriptionSchema],
    // 
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    // 
    appointmentType: { type: String, enum: ['Individual', 'Group'], required: true, default: 'Individual' },
    visitType: { type: String, enum: ['New', 'Repeat'], required: true, default: 'New' },
    consultationType: { type: String, enum: ['Audio', 'Video', 'In-person'], required: true, default: 'Video' },
    status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
}, { timestamps: true });

appointmentSchema.index({ doctorId: 1, date: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;