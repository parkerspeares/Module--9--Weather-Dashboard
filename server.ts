import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
dotenv.config();

// Import the routes
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from the client's dist folder
app.use(express.static(path.join(__dirname, '../client/dist')));

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect the routes
app.use(routes);

// Start the server on the specified port
app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));