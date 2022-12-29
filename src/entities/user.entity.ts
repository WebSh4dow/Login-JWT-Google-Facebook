import { Entity, Column, Index, BeforeInsert } from 'typeorm';
import {Model} from './model.entity';
const bcrypt = require('bcrypt');

export enum UserEnum{
pessoaJuridica = "Pessoa Juridica"
}

@Entity('juridic_person')
export class User extends Model {

   @Index('cnpj_index')
   @Column({
    unique:true
   })
   cnpj:string
  
   @Index('email_index')
   @Column({
    unique: true,
   })

   email: string;

   @Column()
   responsavel:string

   @Column()
   telefone:string

   @Column()
   senha: string;

   @Column({
    type: 'enum',
    enum: UserEnum,
    default: UserEnum.pessoaJuridica,
   })

   @Column({
    default: false,
   })
  
   verified: boolean;

  toJSON(): this & { telefone: any; verified: any; } {
    return { ...this, senha: undefined, verified: undefined };
  }

  @BeforeInsert()
  async hashPassword() {
    this.senha = await bcrypt.hash(this.senha, 12);
  }

  static async compareSenhas(
    candidatePassword: string,
    hashedPassword: string
  ) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  static async compareCnpj(
    candidateCnpj:string,
    hashedCnpj:string
  ){
    return await bcrypt.compare(candidateCnpj,hashedCnpj)
  }
 
}

