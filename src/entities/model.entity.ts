import { BaseEntity, Column, CreateDateColumn, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export abstract class Model extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id:string;

    @CreateDateColumn()
    created_at:Date

    @UpdateDateColumn()
    update_at:Date
}
