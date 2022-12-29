
import { DataSource } from "typeorm";

import 'reflect-metadata'
import { Model } from "./entities/model.entity";
import { userInfo } from "os";
import { User } from "./entities/user.entity";
export const AppDataSource = new DataSource ({

    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "",
    password: "",
    database: "",
    entities:[ 
     Model,User
      ],
    migrations:["src/default/migrations/*.ts"],
    logging:true,
    synchronize:true

})
