import express from "express";
import bodyParser from 'body-parser'
import dotenv from 'dotenv';
const PORT = process.env.PORT;

// Import routes and controllers
import walletRoutes from './routes/wallet.js';

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Wallet routes
app.use('/wallet', walletRoutes);

// Transaction routes



// Start the server
const  port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});