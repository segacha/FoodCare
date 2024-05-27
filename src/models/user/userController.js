const userService = require('./userServices');

const createUserControllerFn = async (req, res) =>
{
    try
    {
        console.log(req.body);
        const status = await userService.createUserDBService(req.body);
        console.log(status);

        if (status)
        {
            res.send({ "status": true, "message": "User created successfully" });
        } else
        {
            res.send({ "status": false, "message": "Error creating user" });
        }
    } catch (err)
    {
        console.log(err);
        res.status(500).send({ "status": false, "message": "Internal Server Error" });
    }
};

const loginUserControllerFn = async (req, res) =>
{
    try
    {
        const result = await userService.loginUserDBService(req.body);
        if (result.status)
        {
            res.send({ "status": true, "message": result.msg });
        } else
        {
            res.send({ "status": false, "message": result.msg });
        }
    } catch (error)
    {
        console.log(error);
        res.status(500).send({ "status": false, "message": "Internal Server Error" });
    }
};

module.exports = { createUserControllerFn, loginUserControllerFn };