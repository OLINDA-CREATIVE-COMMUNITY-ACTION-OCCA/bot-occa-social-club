// projectRepository.js
const { getStoredProjects} = require('../models/Projetos');
const { getStoredSprints} = require('../models/Sprint');
const { fetchStoredUsers } = require('../models/Usuario');

module.exports = {
    getStoredProjects,
    getStoredSprints,
    fetchStoredUsers
};
