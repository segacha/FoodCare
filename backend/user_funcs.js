const axios = require('axios');

async function user_login(email)
{
  try
  {
    const api_url = "http://localhost:3000/api/foodcare/get_user_by_email/" + email;
    const result = await axios.get(api_url)

    if (result)
    {
      const decrypted = encryptor.decrypt(result.password);
      if (decrypted === user_details.password)
      {
        return { status: true};
      } else
      {
        return { status: false};
      }
    } else
    {
      return { status: false};
    }
  } catch (error)
  {
    console.error("Error during login:", error);
    return { status: false};
  }
};

module.exports({user_login})
