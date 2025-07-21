// /api/index.js
const express = require('express');
const path = require('path');
const projectData = require('../modules/projects');
const app = express();

// Vercel expects the exported app, not app.listen()
module.exports = app;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));

// Initialize database (async for Vercel cold starts)
projectData.initialize().then(() => {

  // Home page
  app.get('/', (req, res) => {
    res.render('home', { page: '/' });
  });

  // About page
  app.get('/about', (req, res) => {
    res.render('about', { page: '/about' });
  });

  // Projects list (with optional sector filter)
  app.get('/solutions/projects', (req, res) => {
    const sector = req.query.sector;
    if (sector) {
      projectData.getProjectsBySector(sector)
        .then(projects => res.render('projects', { projects, page: '/solutions/projects' }))
        .catch(err => res.status(404).render('404', { page: '', message: err }));
    } else {
      projectData.getAllProjects()
        .then(projects => res.render('projects', { projects, page: '/solutions/projects' }))
        .catch(err => res.status(404).render('404', { page: '', message: err }));
    }
  });

  // Single project details
  app.get('/solutions/projects/:id', (req, res) => {
    const id = parseInt(req.params.id);
    projectData.getProjectById(id)
      .then(project => res.render('project', { project, page: '' }))
      .catch(err => res.status(404).render('404', { page: '', message: err }));
  });

  // Add Project page
  app.get('/solutions/addProject', (req, res) => {
    projectData.getAllSectors()
      .then(sectors => res.render('addProject', { sectors }))
      .catch(err => res.render('500', { message: err }));
  });

  // Add Project POST
  app.post('/solutions/addProject', (req, res) => {
    projectData.addProject(req.body)
      .then(() => res.redirect('/solutions/projects'))
      .catch(err => res.render('500', { message: `Error adding: ${err}` }));
  });

  // Edit project page
  app.get('/solutions/editProject/:id', (req, res) => {
    Promise.all([
      projectData.getProjectById(req.params.id),
      projectData.getAllSectors()
    ])
      .then(([project, sectors]) => {
        res.render('editProject', { project, sectors });
      })
      .catch(err => res.status(404).render('404', { message: err }));
  });

  // Edit Project POST
  app.post('/solutions/editProject', (req, res) => {
    projectData.editProject(req.body.id, req.body)
      .then(() => res.redirect('/solutions/projects'))
      .catch(err => res.render('500', { message: `Error updating: ${err}` }));
  });

  // Delete Project
  app.get('/solutions/deleteProject/:id', (req, res) => {
    projectData.deleteProject(req.params.id)
      .then(() => res.redirect('/solutions/projects'))
      .catch(err => res.render('500', { message: `Error deleting: ${err}` }));
  });

  // 404 fallback
  app.use((req, res) => {
    res.status(404).render('404', { page: '', message: "Sorry, the page you requested was not found." });
  });

}).catch(err => {
  // Show detailed error in prod for debugging
  console.error('Failed to initialize project data:', err);
  app.use((req, res) => {
    res.status(500).send("Server initialization error: " + err);
  });
});
