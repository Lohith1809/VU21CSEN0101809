const express = require('express');
const axios = require('axios');

const app = express();
const port = 9876;

const WINDOW_SIZE = 10; // Maximum number of elements in the sliding window
let numberWindow = []; // Array to store numbers within the window

// Replace 'YOUR_API_KEY' with your actual API key or token
const API_KEY = 'YOUR_API_KEY';

app.get('/numbers/:numberid', async (req, res) => {
    const numberid = req.params.numberid; // Extract number type from URL parameter
    let apiUrl;

    switch (numberid) {
        case 'p':
            apiUrl = 'http://20.244.56.144/test/primes';
            break;
        case 'f':
            apiUrl = 'http://20.244.56.144/test/fibo';
            break;
        case 'e':
            apiUrl = 'http://20.244.56.144/test/even';
            break;
        case 'r':
            apiUrl = 'http://20.244.56.144/test/random';
            break;
        default:
            return res.status(400).json({ error: 'Invalid numberid' });
    }

    const windowPrevState = [...numberWindow];

    try {
        // Make the request with the authorization header
        const response = await axios.get(apiUrl, {
            timeout: 500,
            headers: {
                'Authorization': `Bearer ${API_KEY}` // Set the authorization header
            }
        });
        const newNumbers = response.data.numbers || []; // Ensure newNumbers is an array

        // Update the sliding window with new numbers
        newNumbers.forEach(num => {
            if (!numberWindow.includes(num)) { // Check for uniqueness
                if (numberWindow.length >= WINDOW_SIZE) { // Maintain window size
                    numberWindow.shift(); // Remove oldest number if window is full
                }
                numberWindow.push(num); // Add new number to the window
            }
        });

        // Calculate the average of numbers in the window
        const average = numberWindow.length > 0
            ? (numberWindow.reduce((acc, num) => acc + num, 0) / numberWindow.length).toFixed(2)
            : 0;

        // Respond with the previous state, current state, new numbers, and average
        res.json({
            windowPrevState,
            windowCurrState: [...numberWindow], // Current state of the window
            numbers: newNumbers, // Numbers fetched from the API
            avg: parseFloat(average) // Average of numbers in the window
        });

    } catch (error) {
        // Handle errors such as timeouts or network issues
        console.error('Error fetching numbers:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch numbers', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
