import { test, mock } from "node:test";
import assert from "node:assert/strict";
import router from "../src/routes/workspace.route.js";
import { Collection } from "../src/models/workspace.model.js";
import { Song } from "../src/models/song.model.js";
import { protectedRoute } from "../src/middleware/auth.middleware.js";
const id = "507f1f77bcf86cd799439011";
function response() {
  return {
    code: 200,
    body: null,
    status(n) {
      this.code = n;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    },
  };
}
async function call(method, path, req) {
  const handler = router.stack
    .find((s) => s.route?.path === path && s.route.methods[method])
    .route.stack.at(-1).handle;
  const res = response();
  let error;
  await handler(
    { auth: { userId: "owner-A" }, params: { id }, body: {}, ...req },
    res,
    (e) => {
      error = e;
    },
  );
  if (error) throw error;
  return res;
}
test("private workspace rejects a signed-out request", async () => {
  const res = response();
  let next = false;
  await protectedRoute({ auth: { userId: null } }, res, () => {
    next = true;
  });
  assert.equal(res.code, 401);
  assert.equal(next, false);
});
test("playlist creation takes ownership from verified session", async (t) => {
  t.after(() => mock.restoreAll());
  let written;
  mock.method(Collection, "create", async (value) => {
    written = value;
    return value;
  });
  const res = await call("post", "/collections", {
    body: { name: " My mix ", owner: "victim", isPublic: true },
  });
  assert.equal(res.code, 201);
  assert.equal(written.owner, "owner-A");
  assert.equal(written.name, "My mix");
});
test("playlist edits are scoped to the authenticated owner", async (t) => {
  t.after(() => mock.restoreAll());
  let filter;
  mock.method(Collection, "findOne", async (value) => {
    filter = value;
    return null;
  });
  const res = await call("put", "/collections/:id", {
    body: { name: "Stolen" },
  });
  assert.deepEqual(filter, { _id: id, owner: "owner-A" });
  assert.equal(res.code, 404);
});
test("playlist deletion cannot target another owner", async (t) => {
  t.after(() => mock.restoreAll());
  let filter;
  mock.method(Collection, "deleteOne", async (value) => {
    filter = value;
    return { deletedCount: 0 };
  });
  const res = await call("delete", "/collections/:id", {});
  assert.equal(filter.owner, "owner-A");
  assert.equal(res.code, 404);
});
test("invalid playlist ids are rejected before querying MongoDB", async (t) => {
  t.after(() => mock.restoreAll());
  const query = mock.method(Collection, "findOne", () => {
    throw new Error("must not query");
  });
  const res = await call("put", "/collections/:id", {
    params: { id: "invalid" },
  });
  assert.equal(res.code, 400);
  assert.equal(query.mock.callCount(), 0);
});
test("unknown tracks cannot enter a playlist", async (t) => {
  t.after(() => mock.restoreAll());
  let saved = false;
  mock.method(Collection, "findOne", async () => ({
    songs: [],
    save() {
      saved = true;
    },
  }));
  mock.method(Song, "find", () => ({ select: async () => [] }));
  const res = await call("put", "/collections/:id", { body: { songs: [id] } });
  assert.equal(res.code, 400);
  assert.equal(saved, false);
});
test("public reads enforce public visibility or ownership", async (t) => {
  t.after(() => mock.restoreAll());
  let filter;
  mock.method(Collection, "findOne", (value) => {
    filter = value;
    return { populate: async () => null };
  });
  const res = await call("get", "/collections/:id", {});
  assert.deepEqual(filter.$or, [{ isPublic: true }, { owner: "owner-A" }]);
  assert.equal(res.code, 404);
});
