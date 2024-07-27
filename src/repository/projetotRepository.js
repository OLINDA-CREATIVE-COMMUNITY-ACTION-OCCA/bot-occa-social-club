// projectRepository.js
const { getStoredTasksByProjects} = require('../models/Task');
const { getStoredSprints} = require('../models/Sprint');
const { fetchStoredUsers } = require('../models/User');

module.exports = {
    getStoredTasksByProjects,
    getStoredSprints,
    fetchStoredUsers
};
