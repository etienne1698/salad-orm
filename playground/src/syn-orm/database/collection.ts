import type { Model } from "../model/model";
import type {
  AnyButMaybeT,
  InferModelNormalizedType,
  MaybeAsArray,
  Primary,
} from "../types";
import type { Database } from "./database";

export class Collection<M extends Model, D extends Database = Database> {
  constructor(public database: D, public model: M) {
    this.database.store.load(model);
  }

  saveRelations(data: Record<string, any>) {
    return this.database.store.saveRelations(this.model.relations(), data);
  }

  saveOne(
    data: AnyButMaybeT<InferModelNormalizedType<M>>,
    saveRelations: boolean = true
  ) {
    return this.database.store.saveOne(this.model, data, saveRelations);
  }

  save(
    data: MaybeAsArray<AnyButMaybeT<InferModelNormalizedType<M>>>,
    saveRelations: boolean = true
  ) {
    return this.database.store.save(this.model, data, saveRelations);
  }

  delete(primary: string) {
    return this.database.store.delete(this.model, primary);
  }

  query() {
    return this.database.query(this.model);
  }

  all() {
    return this.database.store.get(this.model);
  }

  getByPrimary(primary: Primary) {
    return this.database.store.getByPrimary(this.model, primary);
  }
}

export function collection<M extends Model, D extends Database = Database>(
  database: D,
  model: M
) {
  return new Collection<M>(database, model);
}
