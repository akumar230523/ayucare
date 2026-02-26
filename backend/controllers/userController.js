import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';

// @desc    Register a new user
// @route   POST /api/users/signup
export const signup = async (req, res) => {
    try {
        const { name, email, mobile, password, role } = req.body;
        // 
        if (!name || !email || !mobile || !password || !role) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        // 
        const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Email or Mobile already registered.' });
        }
        // Create user
        const user = await User.create({ name, email, mobile, password, role });
        // Create corresponding patient or doctor record
        if (role === 'patient') {
            await Patient.create({ userId: user._id, name });
        } else {
            await Doctor.create({ userId: user._id, name });
        }
        // 
        return res.status(201).json({ message: 'Sign up Successful!' });
    } 
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error..' });
    }
};

// @desc    Signin user
// @route   POST /api/users/signin
export const signin = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password) {
            return res.status(400).json({ message: 'Identifier and Password required.' });
        }

        const user = await User.findOne({
            $or: [{ email: identifier }, { mobile: identifier }]
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials!' });
        }

        // Plain text password comparison (consider hashing in production)
        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials!' });
        }

        // Fetch additional profile data and extract profileId
        let profile = null;
        let profileId = null;

        if (user.role === 'patient') {
            profile = await Patient.findOne({ userId: user._id }).lean();
        } 
        else {
            profile = await Doctor.findOne({ userId: user._id }).lean();
        }

        if (profile) {
            profileId = profile._id;          // save the profile document ID
            delete profile._id;                // remove to avoid overwriting user._id
            delete profile.createdAt;
            delete profile.updatedAt;
        }
        // Merge user and profile
        const userResponse = { _id: user._id, profileId, name: user.name, email: user.email, mobile: user.mobile, role: user.role, ...profile };
        // Remove sensitive fields
        delete userResponse.password;
        // 
        return res.status(200).json({ message: 'Sign in successful.', user: userResponse });
    } 
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error..' });
    }
};

// @desc    Get total patient count
// @route   GET /api/users/patients/count
export const getPatientCount = async (req, res) => {
    try {
        const count = await Patient.countDocuments();
        res.json({ count });
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error..' });
    }
};

// @desc    Get all available doctors
// @route   GET /api/users/doctors
export const getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({ available: true })
            .select('-userId -appointments -createdAt -updatedAt')
            .lean();
        res.json(doctors);
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error..' });
    }
};

// @desc    Get single doctor by ID
// @route   GET /api/users/doctors/:id
export const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ 
            _id: req.params.id, 
            available: true 
        })
        .select('-userId -appointments -createdAt -updatedAt')
        .lean();
        // 
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found!' });
        }
        res.json(doctor);
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error..' });
    }
};