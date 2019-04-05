'use strict';
module.exports = function(sequelize, DataTypes) {
  var notifications = sequelize.define('notifications', {
    data: DataTypes.TEXT
  });
  return notifications;
};
// Temp definition
