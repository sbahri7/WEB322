/********************************************************************************
*  WEB322 – Assignment 04
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Satyam Bahri   Student ID: 172151227   Date: 2025-07-14
*
*  Published URL: https://web-app322-git-main-satyam-bahris-projects.vercel.app
*git URl : https://github.com/sbahri7/WEB322.git
********************************************************************************/


const express = require('express');
const path = require('path');
const projectData = require('./modules/projects');
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

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
      .catch(err => res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` }));
  });

  app.get('/solutions/editProject/:id', (req, res) => {
    Promise.all([
      projectData.getProjectById(req.params.id),
      projectData.getAllSectors()
    ]).then(([project, sectors]) => {
      res.render('editProject', { project, sectors });
    }).catch(err => res.status(404).render('404', { message: err }));
  });

  app.post('/solutions/editProject', (req, res) => {
    projectData.editProject(req.body.id, req.body)
      .then(() => res.redirect('/solutions/projects'))
      .catch(err => res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` }));
  });

  app.get('/solutions/deleteProject/:id', (req, res) => {
    projectData.deleteProject(req.params.id)
      .then(() => res.redirect('/solutions/projects'))
      .catch(err => res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` }));
  });

  app.use((req, res) => {
    res.status(404).render('404', { page: '', message: "Sorry, the page you requested was not found." });
  });

  app.listen(HTTP_PORT, () => {
    console.log(`server listening on: ${HTTP_PORT}`);
  });

}).catch(err => {
  console.error('Failed to initialize project data:', err);
});
