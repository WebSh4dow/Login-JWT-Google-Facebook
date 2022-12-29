import { object, string, TypeOf, z } from 'zod';
import { UserEnum } from '../entities/user.entity'; 

export const createUserSchema = object({
  body: object({
    
    email: string({
      required_error: 'Email é obrigatório',
    }).email('Email inválido'),

    cnpj:string({
        required_error:'Cnpj é Obrigatório'
    }),
    
    responsavel: string({
        required_error: 'Representante é obrigátorio',
    
    }),

    telefone:string({
        required_error: 'Telefone deve ser um campo obrigátorio'
    }),

    senha: string({
      required_error: 'Senha é obrigatório',
    })
      .min(8, 'Minimo de caracters permitido é 8')
      .max(32, 'Maximo de caracters permitido é 32'),

    confirmeSenha: string({
      required_error: 'Confirme sua senha',
    }),
    
    role: z.optional(z.nativeEnum(UserEnum)),
  }).refine((data) => data.senha === data.confirmeSenha, {
    path: ['confirmeSenha'],
    message: 'Senhas não se coincidem',
  }),
});

export const loginUserSchema = object({
  body: object({
    email: string({
      required_error: 'Email é Obrigátorio',
    }).email('Email inválido'),
    

    telefone:string({
      required_error:'Telefone é Obrigátorio'
    })
    
  }),
});


export const loginCelSchema = object({
  body: object({
      telefone:string({
      required_error:'Telefone é Obrigátorio'
    })
    
  }),
});

export type CreateUserInput = Omit<TypeOf<typeof createUserSchema>['body'],'confirmeSenha'>;

export type LoginUserInput = TypeOf<typeof loginUserSchema>['body'];

export type LoginUserInputPhone = TypeOf<typeof loginCelSchema>['body'];

