import EventEmitter from 'events';
import {
  Collection,
  CollectionAggregationOptions,
  CollectionCreateOptions,
  CollectionInsertManyOptions,
  CollectionInsertOneOptions,
  CommonOptions,
  Cursor,
  Db,
  DeleteWriteOpResultObject,
  FindAndModifyWriteOpResultObject,
  FindOneAndReplaceOption,
  FindOneOptions,
  IndexOptions,
  InsertOneWriteOpResult,
  InsertWriteOpResult,
  MongoCallback,
  MongoClientOptions,
  MongoCountPreferences,
  ReadPreference,
  UpdateWriteOpResult,
} from 'mongodb';

export { ObjectId } from 'mongodb';

type Default = any;

declare class MongoDB {
  private url: string;
  private clientOptions: MongoClientOptions;
  public db: Db;
  public config: IMongoConfig;

  constructor(config: IMongoConfig);

  public connect(url: string): Promise<Db>;

  public insertOne(
    name: string,
    args?: { doc: Object; options?: CollectionInsertOneOptions }
  ): Promise<InsertOneWriteOpResult>;

  public insertMany(
    name: string,
    args?: { docs: Object[]; options?: CollectionInsertManyOptions }
  ): Promise<InsertWriteOpResult>;

  public findOneAndUpdate<T = Default>(
    name: string,
    args: {
      filter: Object;
      update: Object;
      options?: FindOneAndReplaceOption;
    }
  ): Promise<FindAndModifyWriteOpResultObject<T>>;

  public findOneAndReplace<T = Default>(
    name: string,
    args: {
      filter: Object;
      replacement: Object;
      options?: FindOneAndReplaceOption;
    }
  ): Promise<FindAndModifyWriteOpResultObject<T>>;

  public findOneAndDelete<T = Default>(
    name: string,
    args: {
      filter: Object;
      options?: {
        projection?: Object;
        sort?: Object;
        maxTimeMS?: number;
        session?: ClientSession;
      };
    }
  ): Promise<FindAndModifyWriteOpResultObject<T>>;

  public updateMany(
    name: string,
    args: {
      filter: Object;
      update: Object;
      options?: CommonOptions & { upsert?: boolean };
    }
  ): Promise<UpdateWriteOpResult>;

  public deleteMany(
    name: string,
    args: { filter: Object; options?: CommonOptions }
  ): Promise<DeleteWriteOpResultObject>;

  public find<T = Default>(
    name: string,
    args: {
      query?: any;
      skip?: number;
      limit?: number;
      projection?: any;
      project?: any;
      sort?: { [key: string]: number };
      options?: FindOneOptions;
    },
    returnCursor: boolean
  ): Promise<Cursor<T>>;

  public find<T = Default>(
    name: string,
    args?: {
      query?: any;
      skip?: number;
      limit?: number;
      projection?: any;
      project?: any;
      sort?: { [key: string]: number };
      options?: FindOneOptions;
    }
  ): Promise<T[]>;

  public count(
    name: string,
    args?: {
      query?: any;
      options?: MongoCountPreferences;
    }
  ): Promise<number>;

  public distinct(
    name: string,
    args: {
      key: string;
      query?: Object;
      options?: {
        readPreference?: ReadPreference | string;
        maxTimeMS?: number;
        session?: ClientSession;
      };
    }
  ): Promise<any[]>;

  public createIndex(
    name: string,
    args: { fieldOrSpec: string | any; options?: IndexOptions }
  ): Promise<string>;

  public listCollections(args: {
    filter?: Object;
    options?: { batchSize?: number; readPreference?: ReadPreference | string };
  }): Promise<string[]>;

  public createCollection<T = Default>(args: {
    name: string;
    options?: CollectionCreateOptions;
  }): Promise<Collection<T>>;

  public aggregate<T = Default>(
    name: string,
    args: { pipeline: any[]; options?: CollectionAggregationOptions }
  ): Promise<T[]>;
}

export default MongoDB;

interface IMongoConfig {
  host?: string | string[];
  port?: string | number;
  name?: string;
  user?: string;
  password?: string;
  options?: MongoClientOptions;
}

declare class ClientSession extends EventEmitter {
  endSession(callback?: MongoCallback<void>): void;
  endSession(options: any, callback?: MongoCallback<void>): void;
  equals(session: ClientSession): boolean;
}

declare module 'egg' {
  interface Application {
    mongo: MongoDB;
  }

  interface EggAppConfig {
    mongo: {
      client?: IMongoConfig;
      clients?: { [key: string]: IMongoConfig };
      default?: IMongoConfig;
    };
  }
}
