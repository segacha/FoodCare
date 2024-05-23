const userModel = require('./userModel');
const key = '123456789trytryrtyr';
const encryptor = require('simple-encryptor')(key);

module.exports.createUserDBService = async (userDetails) => {
    try {
        const userModelData = new userModel({
            firstname: userDetails.firstname,
            lastname: userDetails.lastname,
            email: userDetails.email,
            password: encryptor.encrypt(userDetails.password)
        });

        await userModelData.save();
        return true;
    } catch (error) {
        console.error("Error creating user:", error);
        return false;
    }
}

module.exports.loginUserDBService = async (employeeDetails) => {
    try {
        const result = await userModel.findOne({ email: employeeDetails.email });

        if (result) {
            const decrypted = encryptor.decrypt(result.password);
            if (decrypted === employeeDetails.password) {
                return { status: true, msg: "User validated successfully" };
            } else {
                return { status: false, msg: "User validation failed" };
            }
        } else {
            return { status: false, msg: "Invalid user details" };
        }
    } catch (error) {
        console.error("Error during login:", error);
        return { status: false, msg: "Invalid data" };
    }
}