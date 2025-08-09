const express = require('express');
const router = express.Router();

// Define routes on this router
router.get('/', (req, res) => {
  res.send('Home from router');
});

router.get('/about', (req, res) => {
  res.send('About from router');
});

// Export router
module.exports = router;
