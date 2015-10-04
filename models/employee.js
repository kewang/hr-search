module.exports = function(sequelize, DataTypes) {
  var Employee = sequelize.define('Employee', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING
    }
  }, {
    freezeTableName: true,
    classMethods: {
      associate: function(models) {
        Employee.hasMany(models.Resume);
      }
    }
  });

  return Employee;
};