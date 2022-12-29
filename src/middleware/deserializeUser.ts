import { NextFunction, Request, Response } from 'express';
import { findUserById } from '../services/user.service';
import AppError from '../utils/appError';
import { verifyJwt } from '../utils/jwt';
import { createClient } from "redis";


const client = createClient();

export const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let access_token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      access_token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.access_token) {
      access_token = req.cookies.access_token;
    }

    if (!access_token) {
      return next(new AppError(401, 'Você não está logado'));
    }

   
    const decoded = verifyJwt<{ sub: string }>(
      access_token,
      'accessTokenPublicKey'
    );

    if (!decoded) {
      return next(new AppError(401, `Token inválido ou esse usuário não existe!`));
    }

    
    const session = await client.get(decoded.sub);

    if (!session) {
      return next(new AppError(401, `Token inválido ou a sessão expirou!`));
    }

    
    const user = await findUserById(JSON.parse(session).id);

    if (!user) {
      return next(new AppError(401, `Token inválido ou a sessão expirou!`));
    }

    res.locals.user = user;

    next();
  } catch (err: any) {
    next(err);
  }
};

