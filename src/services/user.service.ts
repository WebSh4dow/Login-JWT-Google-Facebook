import { User } from '../entities/user.entity';
import { CreateUserInput } from '../schemas/user.schema'; 
import { AppDataSource } from '../db'; 
import { createClient } from 'redis';
import  config from   'config'
import { signJwt } from '../utils/jwt';

const client = createClient();


const userRepository = AppDataSource.getRepository(User);

export const createUser = async (input: CreateUserInput) => {
  return (await AppDataSource.manager.save(
    AppDataSource.manager.create(User, input)
  )) as User;
};

export const findUserByCnpj = async ({cnpj}:{cnpj:string}) => {
    return await userRepository.findOneBy({cnpj});
}

export const findUserByEmail = async ({ email }: { email: string }) => {
  return await userRepository.findOneBy({ email });
};

export const findUserByTelefone = async ({ telefone }: { telefone: string }) => {
    return await userRepository.findOneBy({ telefone });
  };

export const findUserById = async (userId: string) => {
  return await userRepository.findOneBy({ id: userId });
};

export const findUser = async (query: Object) => {
  return await userRepository.findOneBy(query);
};

export const signTokens = async (user: User) => {
  
  client.set(user.id, JSON.stringify(user), {
    EX: config.get<number>('redisCacheExpiresIn') * 60,
  });

  
  const access_token = signJwt({ sub: user.id }, 'accessTokenPrivateKey', {
    expiresIn: `${config.get<number>('accessTokenExpiresIn')}m`,
  });

  const refresh_token = signJwt({ sub: user.id }, 'refreshTokenPrivateKey', {
    expiresIn: `${config.get<number>('refreshTokenExpiresIn')}m`,
  });

  return { access_token, refresh_token };
};