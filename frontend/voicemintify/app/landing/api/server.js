const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors module
const {mintNFT, sellNFT} = require('./web3');

const app = express();
const port = 3500;

// Middleware to parse JSON in the request body
app.use(bodyParser.json());

// Enable CORS for all routes
app.use(cors());

// Endpoint for mintNFT
app.post('/mintNFT', async (req, res) => {
    const { id, sellerId, privateKey } = req.body;
  
    try {
      // Call mintNFT only when a request is made
      const result = await mintNFT(id, sellerId, privateKey);
      res.json(result);
    } catch (error) {
      console.error('Error in mintNFT:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// Endpoint for sellNFT
app.post('/sellNFT', async (req, res) => {
  const { sellerId, sellerKey, buyerId } = req.body;

  try {
    await sellNFT(sellerId, sellerKey, buyerId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error in sellNFT:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
