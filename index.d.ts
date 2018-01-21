import {
  ObjectId,
  CollectionInsertOneOptions,
  UpdateWriteOpResult,
  Collection,
  FindOneAndReplaceOption,
  Db,
  IndexOptions,
  InsertOneWriteOpResult,
  InsertWriteOpResult,
  CollectionInsertManyOptions,
  FindAndModifyWriteOpResultObject,
  MongoCountPreferences,
  ReadPreference,
  CollectionOptions,
  CollectionCreateOptions,
} from 'mongodb';

declare class MongoDB {
  public db: Db;

  public connect(url: string): Promise<Db>;

  public insertOne(
    name: string,
    args?: { doc: Object; options?: CollectionInsertOneOptions }
  ): Promise<InsertOneWriteOpResult>;

  public insertMany(
    name: string,
    args?: { docs: Object[]; options?: CollectionInsertManyOptions }
  ): Promise<InsertWriteOpResult>;

  public findOneAndUpdate(
    name: string,
    args?: {
      filter: Object;
      update: Object;
      options?: FindOneAndReplaceOption;
    }
  ): Promise<FindAndModifyWriteOpResultObject>;

  public findOneAndReplace(
    name: string,
    args?: {
      filter: Object;
      replacement: Object;
      options?: FindOneAndReplaceOption;
    }
  ): Promise<FindAndModifyWriteOpResultObject>;

  public findOneAndDelete(
    name: string,
    args?: {
      filter: Object;
      options?: { projection?: Object; sort?: Object; maxTimeMS?: number };
    }
  ): Promise<FindAndModifyWriteOpResultObject>;

  public updateMany(
    name: string,
    args: {
      filter: Object;
      update: Object;
      options?: { upsert?: boolean; w?: any; wtimeout?: number; j?: boolean };
    }
  ): Promise<UpdateWriteOpResult>;

  public deleteMany(
    name: string,
    args: { filter: any; options?: CollectionOptions }
  ): Promise<number>;

  public find<T = any>(
    name: string,
    args: {
      query: any;
      skip?: number;
      limit?: number;
      project?: any;
      sort?: { [key: string]: number };
    }
  ): Promise<T[]>;

  public count(
    name: string,
    args: {
      query: any;
      options?: MongoCountPreferences;
    }
  ): Promise<number>;

  public distinct(
    name: string,
    args?: {
      key?: string;
      query?: any;
      options?: { readPreference?: ReadPreference | string };
    }
  ): Promise<string[]>;

  public createIndex(
    name: string,
    args: { fieldOrSpec: string | any; options?: IndexOptions }
  ): Promise<string>;

  public listCollections(args?: {
    filter?: any;
    options?: { batchSize?: number; readPreference?: ReadPreference | string };
  }): Promise<string[]>;

  public createCollection(args: {
    name: string;
    options?: CollectionCreateOptions;
  }): Promise<Collection>;

  public aggregate<T = any>(name: string, pipeline: Object[]): Promise<T[]>;
}

export default MongoDB;
