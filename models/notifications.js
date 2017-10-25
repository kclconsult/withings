'use strict';
module.exports = function(sequelize, DataTypes) {
  var notifications = sequelize.define('notifications', {
    data: DataTypes.STRING
  });
  return notifications;
};
// Temp definition