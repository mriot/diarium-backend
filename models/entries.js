module.exports = (sequelize, DataTypes) => {
	const model = sequelize.define("entry", {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		picturename: {
			type: DataTypes.STRING,
			unique: true,
		},
		name: {
			type: DataTypes.STRING,
			unique: true,
		},
		manufacturedin: { type: DataTypes.INTEGER, }
	});

	return model;
};
