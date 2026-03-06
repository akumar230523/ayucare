import mongoose from 'mongoose';

// Documents Upload
const documentSchema = new mongoose.Schema(
    {
        title: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now }
    }
);

// Vital Signs
const vitalSignsSchema = new mongoose.Schema(
    {
        bloodPressure: String,
        heartRate: Number,
        temperature: Number,
        oxygenLevel: Number,
        sugarLevel: Number,
        respiratoryRate: Number,
        recordedAt: { type: Date, default: Date.now }
    },
    { _id: false }
);

// Test Reports
const testReportSchema = new mongoose.Schema(
    {
        testName: String,
        reportFileUrl: String,
        result: String,
        date: { type: Date, default: Date.now }
    }
);

// Emergency Contact Subschema
const emergencyContactSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        relation: { type: String, enum: ['Parent', 'Sibling', 'Spouse', 'Child', 'Friend', 'Other'] },
        email: String,
        mobile: String
    },
    { _id: false }
);

// Booked Slot
const bookedSlotSchema = new mongoose.Schema(
    {
        date: { type: String, required: true },
        startTime: { type: String, required: true },
    },
    { _id: false }
);

// Patient Schema
const patientSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    iconUrl: { type: String, default: 'https://png.pngtree.com/png-vector/20191018/ourmid/pngtree-user-icon-isolated-on-abstract-background-png-image_1824979.jpg' },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    age: Number,
    height: Number,
    weight: Number,
    // 
    allergies: [String],
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] },
    problems: [{ type: String, enum: ['Blood Pressure', 'Diabetes', 'Tension', 'Heart Disease', 'Asthma', 'Thyroid', 'Other'] }],
    documents: [documentSchema],
    vitalSigns: [vitalSignsSchema],
    testReports: [testReportSchema],
    emergencyContacts: [emergencyContactSchema],
    // 
    appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }],
    bookedSlots: [bookedSlotSchema],
}, { timestamps: true });

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;