// /api/index.js

const express = require('express');
const path = require('path');
const projectData = require('../modules/projects');
const app = express();

// Required for Vercel (do NOT call app.listen)
module.exports = app;

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));

// Main routes
projectData.initialize().then(() => {
  app.get('/', (req, res) => {
    res.render('home', { page: '/' });
  });

  app.get('/about', (req, res) => {
    res.render('about', { page: '/about' });
  });

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

  app.get('/solutions/projects/:id', (req, res) => {
    const id = parseInt(req.params.id);
    projectData.getProjectById(id)
      .then(project => res.render('project', { project, page: '' }))
      .catch(err => res.status(404).render('404', { page: '', message: err }));
  });

  app.get('/solutions/addProject', (req, res) => {
    projectData.getAllSectors()
      .then(sectors => res.render('addProject', { sectors }))
      .catch(err => res.render('500', { message: err }));
  });

  app.post('/solutions/addProject', (req, res) => {
    projectData.addProject(req.body)
      .then(() => res.redirect('/solutions/projects'))
      .catch(err => res.render('500', { message: `Sorry, error: ${err}` }));
  });

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

  app.post('/solutions/editProject', (req, res) => {
    projectData.editProject(req.body.id, req.body)
      .then(() => res.redirect('/solutions/projects'))
      .catch(err => res.render('500', { message: `Sorry, error: ${err}` }));
  });

  app.get('/solutions/deleteProject/:id', (req, res) => {
    projectData.deleteProject(req.params.id)
      .then(() => res.redirect('/solutions/projects'))
      .catch(err => res.render('500', { message: `Sorry, error: ${err}` }));
  });

  // 404 fallback
  app.use((req, res) => {
    res.status(404).render('404', { page: '', message: "Sorry, the page you requested was not found." });
  });
  
}).catch(err => {
  console.error('Failed to initialize project data:', err);
  // Minimal fallback for init errors
  app.use((req, res) => {
    res.status(500).send("Server initialization error.");
  });
});
