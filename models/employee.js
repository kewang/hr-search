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
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
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
        
        Employee.hasMany(models.Comment, {
          foreignKey: "employeeId"
        });
      }
    }
  });

  return Employee;
};