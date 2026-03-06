import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';


// @desc    Register a new user
// @route   POST /api/auth/signup
export const signup = async (req, res) => {
    try {
        const { name, email, mobile, password, role } = req.body;
        if (!name || !email || !mobile || !password || !role) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        // 
        const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Email or Mobile already registered.' });
        }
        // 
        const user = await User.create({ name, email, mobile, password, role });
        // 
        if (role === 'patient') {
            await Patient.create({ userId: user._id, name });
        }
        else {
            await Doctor.create({ userId: user._id, name });
        }
        // 
        return res.status(201).json({ message: 'Sign up Successful.' });
    } 
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error!' });
    }
};


// @desc    Signin user
// @route   POST /api/auth/signin
export const signin = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password) {
            return res.status(400).json({ message: 'Identifier and Password required.' });
        }
        // 
        const user = await User.findOne({
            $or: [{ email: identifier }, { mobile: identifier }]
        });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        // 
        let profileId = null;
        if (user.role === 'patient') {
            const profile = await Patient.findOne({ userId: user._id }).select('_id').lean();
            profileId = profile?._id;
        } else {
            const profile = await Doctor.findOne({ userId: user._id }).select('_id').lean();
            profileId = profile?._id;
        }
        // 
        const userResponse = {
            _id: user._id, profileId, name: user.name, email: user.email, mobile: user.mobile, role: user.role,
        };
        // 
        return res.status(200).json({ message: 'Sign in successful.', user: userResponse });
    } 
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error..' });
    }
};