require('dotenv').config();
require('pg');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
    logging: false
  }
);

// Models
const Sector = sequelize.define('Sector', {
  id: { type: Sequelize.INTEGER, primaryKey: true },
  sector_name: Sequelize.STRING
}, { timestamps: false });

const Project = sequelize.define('Project', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  title: Sequelize.STRING,
  feature_img_url: Sequelize.STRING,
  sector_id: Sequelize.INTEGER,
  intro_short: Sequelize.TEXT,
  summary_short: Sequelize.TEXT,
  impact: Sequelize.TEXT,
  original_source_url: Sequelize.STRING
}, { timestamps: false });

Project.belongsTo(Sector, { foreignKey: "sector_id" });

// --- Sequelize Initialization ---
function initialize() {
  return sequelize.sync();
}

// --- CRUD Functions ---
function getAllProjects() {
  return Project.findAll({ include: [Sector] });
}

function getProjectById(projectId) {
  return Project.findAll({ where: { id: projectId }, include: [Sector] })
    .then(results => results[0] ? results[0] : Promise.reject("Unable to find requested project"));
}

function getProjectsBySector(sector) {
  return Project.findAll({
    include: [Sector],
    where: {
      '$Sector.sector_name$': {
        [Sequelize.Op.iLike]: `%${sector}%`
      }
    }
  }).then(results => results.length
    ? results
    : Promise.reject("Unable to find requested projects")
  );
}

function getAllSectors() {
  return Sector.findAll();
}

function addProject(projectData) {
  return Project.create(projectData)
    .catch(err => Promise.reject(err.errors[0].message));
}

function editProject(id, projectData) {
  return Project.update(projectData, { where: { id: id } })
    .then(res => res[0] === 1 ? undefined : Promise.reject("Unable to update project"))
    .catch(err => Promise.reject(err.errors[0].message));
}

function deleteProject(id) {
  return Project.destroy({ where: { id: id } })
    .then(res => res === 1 ? undefined : Promise.reject("Unable to delete project"))
    .catch(err => Promise.reject(err.errors[0].message));
}

module.exports = {
  initialize,
  getAllProjects,
  getProjectById,
  getProjectsBySector,
  getAllSectors,
  addProject,
  editProject,
  deleteProject
};
