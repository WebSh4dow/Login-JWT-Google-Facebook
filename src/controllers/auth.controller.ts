
import { User } from "../entities/user.entity";
import { signJwt, verifyJwt } from '../utils/jwt';
import  config  from "config";
import { CreateUserInput, LoginUserInput,LoginUserInputPhone } from "../schemas/user.schema";
import { CookieOptions, NextFunction, Request, Response } from 'express';
import { createUser, findUserByTelefone, findUserByEmail, findUserById, signTokens } from "../services/user.service";
import AppError from "../utils/appError";
import { createClient } from "redis";


const client = createClient();

const cookiesOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
};

if (process.env.NODE_ENV === 'production') cookiesOptions.secure = true;

const accessTokenCookieOptions: CookieOptions = {
  ...cookiesOptions,
  expires: new Date(
    Date.now() + config.get<number>('accessTokenExpiresIn') * 60 * 1000
  ),
  maxAge: config.get<number>('accessTokenExpiresIn') * 60 * 1000,
};

const refreshTokenCookieOptions: CookieOptions = {
  ...cookiesOptions,
  expires: new Date(
    Date.now() + config.get<number>('refreshTokenExpiresIn') * 60 * 1000
  ),
  maxAge: config.get<number>('refreshTokenExpiresIn') * 60 * 1000,
};

  export const registerUserHandler = async (
    req: Request<{}, {}, CreateUserInput>,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const { cnpj,responsavel,email,telefone, senha } = req.body;
  
      const user = await createUser({
        responsavel,
        cnpj,
        telefone,
        email: email.toLowerCase(),
        senha,
      });
  
      res.status(201).json({
        status: 'success',
        data: {
          user,
        },
      });
    } catch (err: any) {
      if (err.code === '23505') {
        return res.status(409).json({
          status: 'fail',
          message: 'Você já está cadastrado, tente fazer o login!',
        });
      }
      next(err);
    }
  };

  export const loginUserHandlerExecption =  (async (
    req:Request<{},{},LoginUserInput>,
    res:Response,
    next:NextFunction
  )=>{
    try {
      const {email} = req.body;

      const user = await findUserByEmail({email});


     const { access_token, refresh_token } = await signTokens(user);

      res.cookie('access_token', access_token, accessTokenCookieOptions);
      res.cookie('refresh_token', refresh_token, refreshTokenCookieOptions);
      res.cookie('logged_in', true, {
        ...accessTokenCookieOptions,
        httpOnly: false,
      });


      res.status(200).json({
        status: 'success',
        access_token,
      });


    } catch (err) {
      next(err);
    }
  })



  export const loginUserPhoneHandlerExecption =  (async (
    req:Request<{},{},LoginUserInputPhone>,
    res:Response,
    next:NextFunction
  )=>{
    try {
      const {telefone} = req.body;

      const user = await findUserByTelefone({telefone});


     const { access_token, refresh_token } = await signTokens(user);

      res.cookie('access_token', access_token, accessTokenCookieOptions);
      res.cookie('refresh_token', refresh_token, refreshTokenCookieOptions);
      res.cookie('logged_in', true, {
        ...accessTokenCookieOptions,
        httpOnly: false,
      });


      res.status(200).json({
        status: 'success',
        access_token,
      });


    } catch (err) {
      next(err);
    }
  })




  export const refreshAccessTokenHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const refresh_token = req.cookies.refresh_token;
  
      const message = 'Could not refresh access token';
  
      if (!refresh_token) {
        return next(new AppError(403, message));
      }
  
     
      const decoded = verifyJwt<{ sub: string }>(
        refresh_token,
        'refreshTokenPublicKey'
      );
  
      if (!decoded) {
        return next(new AppError(403, message));
      }
  
      
      const session = await client.get(decoded.sub);
  
      if (!session) {
        return next(new AppError(403, message));
      }
  
    
      const user = await findUserById(JSON.parse(session).id);
  
      if (!user) {
        return next(new AppError(403, message));
      }
  
      
      const access_token = signJwt({ sub: user.id }, 'accessTokenPrivateKey', {
        expiresIn: `${config.get<number>('accessTokenExpiresIn')}m`,
      });
  
      
      res.cookie('access_token', access_token, accessTokenCookieOptions);
      res.cookie('logged_in', true, {
        ...accessTokenCookieOptions,
        httpOnly: false,
      });
  
      
      res.status(200).json({
        status: 'success',
        access_token,
      });
    } catch (err: any) {
      next(err);
    }
  };

  const logout = (res: Response) => {
    res.cookie('access_token', '', { maxAge: -1 });
    res.cookie('refresh_token', '', { maxAge: -1 });
    res.cookie('logged_in', '', { maxAge: -1 });
  };
  
  export const logoutHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = res.locals.user;
  
      await client.del(user.id);
      logout(res);
  
      res.status(200).json({
        status: 'success',
      });
    } catch (err: any) {
      next(err);
    }
  };




  