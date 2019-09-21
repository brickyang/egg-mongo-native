import { MongoClientOptions } from 'mongodb';
import MongoDB from '@brickyang/easy-mongodb';

type Default = any;
type MongoDBSingleton = MongoDB & { get(name: string): MongoDB };

interface IMongoConfig {
  host?: string | string[];
  port?: string | number;
  name?: string;
  user?: string;
  password?: string;
  options?: MongoClientOptions;
}

declare module 'egg' {
  interface Application {
    mongo: MongoDBSingleton;
  }

  interface EggAppConfig {
    mongo: {
      client?: IMongoConfig;
      clients?: { [key: string]: IMongoConfig };
      default?: IMongoConfig;
    };
  }
}

export default MongoDB;
export { ObjectId } from 'mongodb';
