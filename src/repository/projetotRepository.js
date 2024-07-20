// projectRepository.js
const { getStoredTasksByProjects} = require('../models/TasksByProjects');
const { getStoredSprints} = require('../models/GetStoredSprints');
const { fetchStoredUsers } = require('../models/Usuario');

module.exports = {
    getStoredTasksByProjects,
    getStoredSprints,
    fetchStoredUsers
};
