import { EntityBase } from "./EntityBase";

export declare type EntityConstructor<T extends EntityBase> = { new (...params: any[]): T; };
