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
*  Published URL: https://vercel.com/satyam-bahris-projects
*
********************************************************************************/

const express = require('express');
const path = require('path');
const projectData = require('./modules/projects');
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static('public'));

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
        .then(projects => {
          if (projects.length === 0) {
            res.status(404).render('404', { page: '', message: `No projects found for sector: ${sector}` });
          } else {
            res.render('projects', { projects, page: '/solutions/projects' });
          }
        })
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
      .then(project => {
        if (!project) {
          res.status(404).render('404', { page: '', message: `No project found with id: ${id}` });
        } else {
          res.render('project', { project, page: '' });
        }
      })
      .catch(err => res.status(404).render('404', { page: '', message: err }));
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
