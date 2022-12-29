import express from 'express';
import {
  loginUserHandlerExecption,
  loginUserPhoneHandlerExecption,
  logoutHandler,
  refreshAccessTokenHandler,
  registerUserHandler,
} from '../controllers/auth.controller';
import { deserializeUser } from '../middleware/deserializeUser';
import { requireUser } from '../middleware/requireUser';
import { validate } from '../middleware/validate';
import { createUserSchema, loginCelSchema, loginUserSchema } from '../schemas/user.schema';

const router = express.Router();


router.post('/register', validate(createUserSchema), registerUserHandler);


router.post('/loginEmail', validate(loginUserSchema), loginUserHandlerExecption);

router.post('/logincelPhone', validate(loginCelSchema), loginUserPhoneHandlerExecption);

router.get('/logout', deserializeUser, requireUser, logoutHandler);


router.get('/refresh', refreshAccessTokenHandler);










export default router;

