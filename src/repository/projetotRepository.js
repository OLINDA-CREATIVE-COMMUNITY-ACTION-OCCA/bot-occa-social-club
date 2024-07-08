// projectRepository.js
const { getStoredTasksByProjects} = require('../models/Projetos');
const { getStoredSprints} = require('../models/Sprint');
const { fetchStoredUsers } = require('../models/Usuario');

module.exports = {
    getStoredTasksByProjects,
    getStoredSprints,
    fetchStoredUsers
};
