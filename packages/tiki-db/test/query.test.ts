import { expect, test } from "vitest";

import { getTestDatabase } from "./base";
import { InMemoryStorage } from "../src";

const storage = InMemoryStorage;

test("Direct Query and Query through QueryBuilder should return same result", async () => {
  const { db } = getTestDatabase(storage);

  expect(
    await db.collections.users.find({
      with: {
        posts: true,
      },
      filters: {
        firstname: {
          $eq: "",
        },
        $or: [
          {
            id: {
              $eq: "123",
            },
            firstname: { $eq: "John" },
          },
          { lastname: { $eq: "Doe" } },
        ],
        email: {
          $eq: "john.doe@mail.com",
        },
      },
    })
  ).toStrictEqual(
    await db.collections.users
      .query()
      .orWhere([
        db.collections.users
          .query()
          .whereEq("id", "123")
          .whereEq("firstname", "John").query.filters,
        db.collections.users.query().whereEq("lastname", "Doe").query.filters,
      ])
      .whereEq("email", "john.doe@mail.com")
      .find()
  );
});
