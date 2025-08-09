const express = require('express');
const router = express.Router();
const authService = require('../modules/auth-service'); // or wherever auth-service.js is

// Home page
router.get('/', (req, res) => {
  res.render('home', { page: '/' });
});

// Register page and form
router.get('/register', (req, res) => {
  res.render('register', { errorMessage: null, successMessage: null });
});

router.post('/register', (req, res) => {
  authService.registerUser(req.body)
    .then(() => res.render('register', { successMessage: 'User created!', errorMessage: null }))
    .catch(err => res.render('register', { errorMessage: err, successMessage: null }));
});

// Login page and form
router.get('/login', (req, res) => {
  res.render('login', { errorMessage: null });
});

router.post('/login', (req, res) => {
  req.body.userAgent = req.get('User-Agent');
  authService.checkUser(req.body)
    .then(user => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory
      };
      res.redirect('/dashboard');
    })
    .catch(err => res.render('login', { errorMessage: err }));
});

// Dashboard (protected)
router.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('dashboard', { user: req.session.user });
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
