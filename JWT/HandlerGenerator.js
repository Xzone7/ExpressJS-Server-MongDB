const jwt = require('jsonwebtoken');
const config = require('./config');

module.exports.login = (res, userData, dbData) => {

    let username = userData.username;
    let password = userData.password;

    // for the given username fetch user from DB
    /* Case 1: username NOT exists */
    if (!dbData) {
        console.log(`User: ${username} does NOT exist, sending message back to client...\n`);
        res.status(400).json({
            success: false,
            message: "Authentication failed! Please check the request"
        });
        return;
    }

    /* Case2: username exists ---> match password */
    let realUsername = dbData.username;
    let realPassword = dbData.password;

    if (realUsername === username && realPassword === password) {
        // if passed, assgin a new token for this user
        const token = jwt.sign({ username: username },
            config.secret,
            { expiresIn: '120000' });

        console.log(`Successfully created token for user: ${username}, sending message back to client...\n`);

        // return the JWT token for the future API calls
        res.status(200).json({
            success: true,
            message: "Authentication successfully!",
            token: token
        });
    } else {

        console.log(`User: ${username} posted incorrect username or password, sending message back to client...\n`);

        // if not passed, reject request, 403 - forbidden
        res.status(403).json({
            success: false,
            message: "Incorrect username or password"
        });
    }
}
