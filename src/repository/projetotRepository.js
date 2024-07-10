// projectRepository.js
const { getStoredTasksByProjects} = require('../models/TasksByProjects');
const { getStoredSprints} = require('../models/Sprint');
const { fetchStoredUsers } = require('../models/Usuario');

module.exports = {
    getStoredTasksByProjects,
    getStoredSprints,
    fetchStoredUsers
};
