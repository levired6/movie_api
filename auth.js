const jwtSecret = 'SECRET_KEY'; // This has to be the same key used in the JWTStrategy
const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); // Your local passport file


let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.username, // This is the username you’re encoding in the JWT
    expiresIn: '7d', // This specifies that the token will expire in 7 days
    algorithm: 'HS256' // This is the algorithm used to “sign” or encode the values of the JWT
  });
}


/* POST login. */
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: info ? info.message:'Something is not right', //check for info message
          user: user
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
         return res.status(500).send(error);
        }
        let token = generateJWTToken(user.toJSON());
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080'); // THIS LINE IS FOR TESTING
        return res.json({ user, token });
      });
    })(req, res);
  });
};