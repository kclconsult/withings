'use strict';
module.exports = function(sequelize, DataTypes) {

	var groups = sequelize.define('groups', {
	
		grpid: DataTypes.STRING,
		category: DataTypes.STRING,
		date: DataTypes.STRING // ~MDC Change to proper date.

	});

	return groups;

};