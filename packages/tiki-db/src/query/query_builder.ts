import type { CollectionSchema } from "../collection/collection_schema";
import { Database } from "../database/database";
import type { DeepPartial, InferModelFieldName, Primary } from "../types";
import {
  createDefaultQuery,
  FILTER_OR,
  Filters,
  type FiltersValueType,
  type Query,
  type QueryFilters,
} from "./query";

export class QueryBuilder<C extends CollectionSchema, D extends Database> {
  declare query: Query<C, D>;

  constructor(
    public database: D,
    public collection: C,
    query?: DeepPartial<Query<C, D>>
  ) {
    this.query = Object.assign(createDefaultQuery<C, D>(), query);
  }

  byPrimary(primaries: Primary[]) {
    primaries.forEach((primary) => {
      this.query.primaries.push(primary);
    });
    return this;
  }

  orWhere(ors: QueryFilters<C>[]) {
    this.query.filters[FILTER_OR] = ors;
    return this;
  }

  where<T extends keyof FiltersValueType>(
    field: InferModelFieldName<C["model"]>,
    op: T,
    value: FiltersValueType[T]
  ) {
    if (!this.query.filters[field]) {
      // @ts-ignore
      this.query.filters[field] = {};
      if (!this.query.filters[field][op]) {
        this.query.filters[field][op] = {} as any;
      }
    }
    this.query.filters[field][op] =
      value as FiltersValueType[keyof FiltersValueType];
    return this;
  }

  whereEq(
    field: InferModelFieldName<C["model"]>,
    value: FiltersValueType[Filters.EQ]
  ) {
    return this.where(field, Filters.EQ, value);
  }

  whereNe(
    field: InferModelFieldName<C["model"]>,
    value: FiltersValueType[Filters.NE]
  ) {
    return this.where(field, Filters.NE, value);
  }

  whereIn(
    field: InferModelFieldName<C["model"]>,
    value: FiltersValueType[Filters.IN]
  ) {
    return this.where(field, Filters.IN, value);
  }

  find() {
    return this.database.find(this.collection, this.query);
  }

  findFirst() {
    return this.database.findFirst(this.collection, this.query);
  }
}
