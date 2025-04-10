const passport = require('passport'),
LocalStrategy = require('passport-local').Strategy,
Models = require('./models.js'),
passportJWT = require('passport-jwt');

let Users = Models.User,
JWTStrategy = passportJWT.Strategy,
ExtractJWT = passportJWT.ExtractJwt;

passport.use(
 new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password',
    },
    async (username, password, callback) => {
        try{
            const user = await Users.findOne({ username: username});
            if (!user) {
                return callback(null, false, {message: 'Incorrect username or password.'});
            }
            if (!user.validatePassword(password)) {
                return callback(null, false, {message: 'Incorrect username or password.'});
            }
            return callback(null, user);
        }catch(error) {
            return callback(error);
        }
    }
)
);

passport.use(
    new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'SECRET_KEY',
        },
        async (jwtPayload, callback) => {
            try {
                const user = await Users.findById(jwtPayload._id);
                return callback(null, user);
            } catch (error) {
                return callback(error);
            }
        }
    )
);
