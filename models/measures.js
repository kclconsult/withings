'use strict';
module.exports = function(sequelize, DataTypes) {
  
	var measures = sequelize.define('measures', {
		
		value: DataTypes.STRING,
		type: DataTypes.STRING,
		multiplier: DataTypes.STRING
	
	});
	
	measures.associate = function(models) {
		
		measures.belongsTo(models.groups, {
			
			onDelete: "CASCADE",
			foreignKey: {
				allowNull: false
			}
		
		});   
	
	};
  
	return measures;

};