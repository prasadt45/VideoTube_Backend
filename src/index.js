import dotenv from "dotenv"; 
import connectDB from "./db/index.js"; 
import { app } from "./app.js";

dotenv.config({
    path: './env',
});

const server = app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on port ${process.env.PORT || 8000}`);
});

connectDB()
    .then(() => {
        // Ensure the server only listens after DB connection is successful
        console.log('Connected to database');
    })
    .catch((err) => {
        console.error('Database connection failed', err);
        server.close(() => {
            process.exit(1); // Exit with failure code
        });
    });

// Proper shutdown handling
process.on('SIGINT', () => {
    console.log('Server is shutting down gracefully...');
    server.close(() => {
        console.log('Server has shut down.');
        process.exit(0); // Exit with success code
    });
});

process.on('SIGTERM', () => {
    console.log('Server is terminating...');
    server.close(() => {
        console.log('Server has terminated.');
        process.exit(0);
    });
});
