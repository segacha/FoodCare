const User = require("./userModel");
const key = "123456789trytryrtry";
const encryptor = require("simple-encryptor")(key);

module.exports.createUserDBService = async (user_info) =>
{
  try
  {
    const user = new User({
      firstname: user_info.firstname,
      lastname: user_info.lastname,
      email: user_info.email,
      password: encryptor.encrypt(user_info.password),
    });

    await user.save();
    return true;
  } catch (error)
  {
    console.error("Error creating user:", error);
    return false;
  }
};

module.exports.loginUserDBService = async (user_details) =>
{
  try
  {
    const result = await User.findOne({ email: user_details.email });

    if (result)
    {
      const decrypted = encryptor.decrypt(result.password);
      if (decrypted === user_details.password)
      {
        


        return { status: true, msg: "User validated successfully" };
      } else
      {
        return { status: false, msg: "User validation failed" };
      }
    } else
    {
      return { status: false, msg: "Invalid user details" };
    }
  } catch (error)
  {
    console.error("Error during login:", error);
    return { status: false, msg: "Invalid data" };
  }
};




