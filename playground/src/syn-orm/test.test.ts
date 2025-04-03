import type { Field } from "./schema/field";
import { Schema } from "./schema/schema";
import { string } from "./schema/string";

class Collection<
  CollectionName extends string = string,
  S extends Schema = Schema
> {
  constructor(public collectionName: CollectionName, public schema: S) {}
}

class Relation<RefCName extends string = string> {
  declare referencedCollectionName: RefCName;

  constructor(
    referencedCollection: Collection<RefCName>,
    public field: string
  ) {
    this.referencedCollectionName = referencedCollection.collectionName;
  }
}

class HasMany<RefCName extends string = string> extends Relation<RefCName> {}

class BelongsTo<RefCName extends string = string> extends Relation<RefCName> {}

class Relations<
  CollectionName extends string = string,
  Config extends Record<string, Relation> = Record<string, Relation>
> {
  constructor(
    public collection: Collection<CollectionName>,
    public config: Config
  ) {}
}

function collection<
  CollectionName extends string = string,
  S extends Record<string, Field> = Record<string, Field>
>(collectionName: CollectionName, schema: S) {
  return new Collection(collectionName, new Schema(schema));
}

function hasMany<RefC extends Collection>(
  referencedCollection: RefC,
  field: keyof RefC["schema"]["schema"]
) {
  return new HasMany(referencedCollection, field as string);
}
function belongsTo<C extends Collection, RefC extends Collection = Collection>(
  referencedCollection: RefC,
  field: keyof C["schema"]["schema"]
) {
  return new BelongsTo(referencedCollection, field as string);
}

type RelationSetupFn<
  C extends Collection = Collection,
  Config extends Record<string, Relation> = Record<string, Relation>
> = (relations: {
  hasMany: typeof hasMany;
  belongsTo: typeof belongsTo<C>;
}) => Config;

function relations<
  C extends Collection = Collection,
  Config extends Record<string, Relation> = Record<string, Relation>
>(collection: C, setup: RelationSetupFn<C, Config>) {
  return new Relations(collection, setup({ hasMany, belongsTo }));
}

// --------

const users = collection("users", {
  id: string("id", ""),
});

const pets = collection("users", {
  id: string("id", ""),
  user_id: string("id", ""),
});

const usersRelations = relations(users, ({ hasMany }) => ({
  pets: hasMany(pets, "user_id"),
}));

const petsRelations = relations(pets, ({ belongsTo }) => ({
  user: belongsTo(users, "user_id"),
}));
