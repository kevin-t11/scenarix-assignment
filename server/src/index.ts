import express from 'express';

const app = express();
const port = process.env.PORT || 8000;

// Define a basic route
app.get('/', (req, res) => {
  res.send('Hello from Bun and Express!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
