'use strict';
module.exports = function(sequelize, DataTypes) {
  var users = sequelize.define('notifications', {
    data: DataTypes.STRING
  });
  return users;
};
// Temp definition