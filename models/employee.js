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
    gender: {
      type: DataTypes.ENUM,
      values: ["male", "female"]
    },
    age: {
      type: DataTypes.INTEGER
    },
    highSalary: {
      type: DataTypes.INTEGER
    },
    lowSalary: {
      type: DataTypes.INTEGER
    },
    avatar: {
      type: DataTypes.STRING
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
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

        Employee.belongsTo(models.Resume, {
          as: "NewestResume",
          foreignKey: "newestResumeId",
          constraints: false
        });
      }
    }
  });

  return Employee;
};