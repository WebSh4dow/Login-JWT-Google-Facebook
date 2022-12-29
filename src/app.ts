require('dotenv').config();
import express, { NextFunction, Request, Response } from 'express';
import config from 'config';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { AppDataSource } from './db';
import AppError from './utils/appError';
import authRouter from './routes/auth.routes';
import userRouter from './routes/user.routes';
import { createClient } from "redis";
import { AccessTokenResponse, RefreshAccessTokenResponse } from 'google-auth-library/build/src/auth/oauth2client';
const session = require('express-session');


const client = createClient()

AppDataSource.initialize()
  .then(async () => {
    

    const app = express();

    app.use(express.json({ limit: '10kb' }));

   if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

    app.use(cookieParser());

   
    app.use(
      cors({
        origin: config.get<string>('origin'),
        credentials: true,
      })
    );

    
    app.use('/api/auth', authRouter);
    app.use('/api/users', userRouter);

   
    app.get('/api/healthChecker', async (_, res: Response) => {
      const message = await client.get('try');

      res.status(200).json({
        status: 'success',
        message,
      });
    });

   
    app.all('*', (req: Request, res: Response, next: NextFunction) => {
      next(new AppError(404, `Route ${req.originalUrl} not found`));
    });

    app.use(
      (error: AppError, req: Request, res: Response, next: NextFunction) => {
        error.status = error.status || 'error';
        error.statusCode = error.statusCode || 500;

        res.status(error.statusCode).json({
          status: error.status,
          message: error.message,
        });
      }
    );


    app.set('view engine', 'ejs');

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'yourSecret' 
}));

app.get('/', function(req, res) {
  res.render('pages/auth');
});


const passport = require('passport');
var userProfile: any;

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

app.get('/success', (req, res) => res.send(userProfile));
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user: any, cb: (arg0: any, arg1: any) => void) {
  cb(null, user);
});

passport.deserializeUser(function(obj: any, cb: (arg0: any, arg1: any) => void) {
  cb(null, obj);
})


/*  Google AUTH  */
 
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = 'your-Secret';
const GOOGLE_CLIENT_SECRET = 'your-Secret';

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8000/auth/google/callback"
  },
  function(accessToken: AccessTokenResponse, refreshToken: RefreshAccessTokenResponse, profile: any, done: (arg0: any, arg1: any) => any) {
      userProfile=profile;
      return done(null, userProfile);
  }
));
 

    const port = config.get<number>('port');
    app.listen(port);

    console.log(`Server started on port: ${port}`);
  })
  .catch((error) => console.log(error));
