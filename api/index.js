const express = require('express');
const path = require('path');
const session = require('express-session');
const projectData = require('../modules/projects');
const authService = require('../modules/auth-service');
const app = express();
require('dotenv').config();  // This loads .env locally but is ignored on Vercel


module.exports = app; // Vercel style

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

// Middleware for showing user session in views
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

Promise.all([projectData.initialize(), authService.initialize()])
.then(() => {
  // Home, About, Projects, Project Detail...
  app.get('/', (req, res) => res.render("home", { page: "/" }));
  app.get('/about', (req, res) => res.render("about", { page: "/about" }));
  app.get('/solutions/projects', (req, res) => {
    const sector = req.query.sector;
    (sector ? projectData.getProjectsBySector(sector) : projectData.getAllProjects())
      .then(projects => res.render('projects', { projects, page: '/solutions/projects' }))
      .catch(err => res.status(404).render('404', { page: '', message: err }));
  });
  app.get('/solutions/projects/:id', (req, res) => {
    projectData.getProjectById(req.params.id)
      .then(project => res.render('project', { project, page: '' }))
      .catch(err => res.status(404).render('404', { page: '', message: err }));
  });

  // Add/Edit/Delete project - protected routes (must be logged in)
  function ensureLogin(req, res, next) {
    if (!req.session.user) return res.redirect('/login');
    next();
  }
  app.get('/solutions/addProject', ensureLogin, (req, res) => {
    projectData.getAllSectors()
      .then(sectors => res.render('addProject', { sectors }))
      .catch(err => res.render('500', { message: err }));
  });
  app.post('/solutions/addProject', ensureLogin, (req, res) => {
    projectData.addProject(req.body)
      .then(() => res.redirect('/solutions/projects'))
      .catch(err => res.render('500', { message: err }));
  });
  app.get('/solutions/editProject/:id', ensureLogin, (req, res) => {
    Promise.all([
      projectData.getProjectById(req.params.id),
      projectData.getAllSectors()
    ])
      .then(([project, sectors]) => res.render('editProject', { project, sectors }))
      .catch(err => res.status(404).render('404', { message: err }));
  });
  app.post('/solutions/editProject', ensureLogin, (req, res) => {
    projectData.editProject(req.body.id, req.body)
      .then(() => res.redirect('/solutions/projects'))
      .catch(err => res.render('500', { message: err }));
  });
  app.get('/solutions/deleteProject/:id', ensureLogin, (req, res) => {
    projectData.deleteProject(req.params.id)
      .then(() => res.redirect('/solutions/projects'))
      .catch(err => res.render('500', { message: err }));
  });

  // Registration and Login
  app.get('/register', (req, res) => res.render('register', { errorMessage: null, successMessage: null }));
  app.post('/register', (req, res) => {
    authService.registerUser(req.body)
      .then(() => res.render("register", { successMessage: "User created!", errorMessage: null }))
      .catch(err => res.render("register", { errorMessage: err, successMessage: null }));
  });

  app.get('/login', (req, res) => res.render("login", { errorMessage: null }));
  app.post('/login', (req, res) => {
    req.body.userAgent = req.get("User-Agent");
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

  app.get('/dashboard', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.render('dashboard', { user: req.session.user });
  });

  app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
  });

  // 404 fallback
  app.use((req, res) => {
    res.status(404).render('404', { page: '', message: "Sorry, the page you requested was not found." });
  });

}).catch(err => {
  console.error('Failed to initialize:', err);
  app.use((req, res) => {
    res.status(500).send("Server initialization error: " + err);
  });
});
