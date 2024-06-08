const axios = require('axios');

async function user_login(user_details)
{
  try
  {
    console.log("we are in the login function")
    const api_url = "http://localhost:3000/api/foodcare/get_user_by_email/" + user_details.email;
    const result = await axios.get(api_url)
    console.log("the result is: " + result)

    if (result)
    {
      const decrypted = encryptor.decrypt(result.password);
      if (decrypted === user_details.password)
      {
        return { status: true, msg: "User validated successfully", user: result};
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

module.exports({user_login})
