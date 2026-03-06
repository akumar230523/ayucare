import User from '../models/User.js';
import Patient from '../models/Patient.js';


// @desc    Get patient count
// @route   GET /api/patients/count
export const getPatientCount = async (req, res) => {
    try {
        const count = await Patient.countDocuments();
        return res.json({ count });
    } 
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error!' });
    }
};


// @desc    Get patient by ID
// @route   GET /api/patients/:id
export const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found.' });
        }
        return res.json(patient);
    } 
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error!' });
    }
};


// @desc    Update patient profile
// @route   PUT /api/patients/:id
export const updatePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        const enumFields = ['bloodGroup', 'gender'];
        enumFields.forEach(field => {
            if (updateData[field] === '') {
                delete updateData[field];
            }
        });

        // Remove immutable fields
        delete updateData._id;
        delete updateData.userId;
        delete updateData.appointments;
        delete updateData.bookedSlots;

        // Find the patient to get userId
        const existingPatient = await Patient.findById(id);
        if (!existingPatient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // If name is being updated, update the corresponding User document
        if (updateData.name && updateData.name !== existingPatient.name) {
            const user = await User.findById(existingPatient.userId);
            if (!user) {
                return res.status(404).json({ message: 'Associated user not found' });
            }
            user.name = updateData.name;
            await user.save();
        }

        // Update the patient document
        const updatedPatient = await Patient.findByIdAndUpdate(
            id,
            updateData,
            {
                returnDocument: 'after',
                runValidators: true,
                context: 'query'
            }
        );

        return res.status(200).json(updatedPatient);
    } 
    catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Server error!' });
    }
};
