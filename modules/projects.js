const projectData = require("../data/projectData");
const sectorData = require("../data/sectorData");

let projects = [];

function initialize() {
  return new Promise((resolve, reject) => {
    try {
      projects = [];
      projectData.forEach(proj => {
        const sector = sectorData.find(sec => sec.id === proj.sector_id);
        projects.push({
          ...proj,
          sector: sector ? sector.sector_name : null
        });
      });
      resolve();
    } catch (err) {
      reject("Failed to initialize projects: " + err);
    }
  });
}

function getAllProjects() {
  return new Promise((resolve, reject) => {
    projects.length === 0 
      ? reject("Project data not initialized.") 
      : resolve(projects);
  });
}

function getProjectById(projectId) {
  return new Promise((resolve, reject) => {
    const project = projects.find(proj => proj.id === projectId);
    project 
      ? resolve(project) 
      : reject(`Unable to find requested project with id: ${projectId}`);
  });
}

function getProjectsBySector(sector) {
  return new Promise((resolve, reject) => {
    const search = sector.toLowerCase();
    const matched = projects.filter(proj =>
      typeof proj.sector === "string" &&
      proj.sector.toLowerCase().includes(search)
    );
    matched.length > 0 
      ? resolve(matched) 
      : reject(`Unable to find requested projects for sector: ${sector}`);
  });
}

module.exports = { initialize, getAllProjects, getProjectById, getProjectsBySector };
