const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "database.js"), "utf8");

function createDatabase(initialValue = null) {
  let value = initialValue;
  const context = {
    window: {
      localStorage: {
        getItem: () => value,
        setItem: (_, next) => { value = next; },
        removeItem: () => { value = null; }
      }
    }
  };
  vm.runInNewContext(source, context);
  return { database: context.window.PNVDatabase, read: () => value };
}

test("saves the first contact draft in an empty browser", () => {
  const { database, read } = createDatabase();
  database.saveContact({ nome: "Pessoa", email: "pessoa@example.com", mensagem: "Olá" });
  assert.equal(JSON.parse(read())[0].mensagem, "Olá");
  assert.equal(database.listContacts(5).length, 1);
  database.clearContacts();
  assert.deepEqual(JSON.parse(read()), []);
});

test("does not overwrite damaged draft storage", () => {
  for (const damaged of ["null", "{", "{}"]) {
    const { database, read } = createDatabase(damaged);
    assert.throws(() => database.saveContact({ nome: "Pessoa" }));
    assert.equal(read(), damaged);
  }
});
