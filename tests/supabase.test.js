const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "database.js"), "utf8");

function createDatabase(config, fetchImpl) {
  const context = {
    URL,
    window: {
      PNV_SUPABASE_CONFIG: config,
      localStorage: { getItem: () => null, setItem: () => {} }
    },
    fetch: fetchImpl
  };
  vm.runInNewContext(source, context);
  return context.window.PNVDatabase;
}

const configured = {
  url: "https://pnvtest.supabase.co",
  publishableKey: "sb_publishable_public_test_key",
  dataController: "Responsável",
  privacyUrl: "https://example.com/privacidade",
  contactEmail: "privacidade@example.com"
};

test("keeps the form unavailable when Supabase is not configured", async () => {
  let requests = 0;
  const database = createDatabase({}, async () => { requests += 1; });

  assert.equal(database.isSupabaseConfigured(), false);
  await assert.rejects(
    database.saveAssociationInterest({
      nome: "Pessoa",
      email: "pessoa@example.com",
      consentimento: true
    }),
    /não está configurado/
  );
  assert.equal(requests, 0);
});

test("does not send the publishable key to a non-Supabase host", () => {
  const database = createDatabase(
    { ...configured, url: "https://example.com" },
    async () => {}
  );

  assert.equal(database.isSupabaseConfigured(), false);
});

test("submits only consented registration fields with the publishable API key", async () => {
  const requests = [];
  const database = createDatabase(configured, async (...request) => {
    requests.push(request);
    return { ok: true };
  });

  assert.equal(database.isSupabaseConfigured(), true);
  await database.saveAssociationInterest({
    nome: "Pessoa",
    email: "pessoa@example.com",
    consentimento: true
  });

  assert.equal(requests.length, 1);
  assert.equal(
    requests[0][0],
    "https://pnvtest.supabase.co/rest/v1/association_interests"
  );
  assert.equal(requests[0][1].headers.apikey, configured.publishableKey);
  assert.equal(requests[0][1].headers["Content-Type"], "application/json");
  assert.equal(requests[0][1].headers.Prefer, "return=minimal");
  assert.deepEqual(Object.keys(requests[0][1].headers).sort(), [
    "Content-Type",
    "Prefer",
    "apikey"
  ]);
  assert.deepEqual(JSON.parse(requests[0][1].body), {
    name: "Pessoa",
    email: "pessoa@example.com",
    consented: true,
    consent_version: "interest-v1"
  });
});

test("rejects unconsented requests and reports Supabase failures", async () => {
  let requests = 0;
  const database = createDatabase(configured, async () => {
    requests += 1;
    return { ok: false };
  });

  await assert.rejects(
    database.saveAssociationInterest({
      nome: "Pessoa",
      email: "pessoa@example.com",
      consentimento: false
    }),
    /consentimento/
  );
  assert.equal(requests, 0);
  await assert.rejects(
    database.saveAssociationInterest({
      nome: "Pessoa",
      email: "pessoa@example.com",
      consentimento: true
    }),
    /Não foi possível registrar/
  );
  assert.equal(requests, 1);
});
