import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import connectDB from './configuration/connectDB.js';
import appointmentRoutes from './routes/appointmentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);

// Function to connect to database and start server.
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    } 
    catch (error) {
        console.error("Failed to start server: ", error.message);
        process.exit(1);
    }
};

startServer();