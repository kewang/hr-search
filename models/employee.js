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
    },
    newestResumeId: {
      type: DataTypes.INTEGER
    },
    newestResumeDate: {
      type: DataTypes.DATE
    }
  }, {
    freezeTableName: true,
    classMethods: {
      associate: function(models) {
        Employee.hasMany(models.Resume, {
          foreignKey: "employeeId"
        });
      }
    }
  });

  return Employee;
};