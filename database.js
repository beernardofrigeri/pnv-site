(function () {
  const STORAGE_KEY = "pnv_contatos_v1";
  const CONSENT_VERSION = "interest-v1";

  function readContacts() {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const contacts = JSON.parse(raw);
    if (!Array.isArray(contacts)) throw new Error("Os rascunhos salvos estão em formato inválido.");
    return contacts;
  }

  function writeContacts(contacts) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  }

  function getSupabaseConfig() {
    return window.PNV_SUPABASE_CONFIG || {};
  }

  function isSupabaseConfigured() {
    const config = getSupabaseConfig();
    try {
      const projectUrl = new URL(config.url);
      const privacyUrl = new URL(config.privacyUrl);
      return Boolean(
        projectUrl.protocol === "https:" &&
        projectUrl.hostname.endsWith(".supabase.co") &&
        typeof config.publishableKey === "string" &&
        config.publishableKey.startsWith("sb_publishable_") &&
        typeof config.dataController === "string" &&
        config.dataController.trim() &&
        privacyUrl.protocol === "https:" &&
        typeof config.contactEmail === "string" &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.contactEmail)
      );
    } catch {
      return false;
    }
  }

  const PNVDatabase = {
    async getNews() {
      const response = await fetch("data/pnv-db.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Não foi possível carregar as notícias.");
      }
      const payload = await response.json();
      return Array.isArray(payload.noticias) ? payload.noticias : [];
    },

    isSupabaseConfigured,

    async saveAssociationInterest({ nome, email, consentimento }) {
      if (!isSupabaseConfigured()) {
        throw new Error("O serviço de cadastro ainda não está configurado.");
      }
      if (!nome || !email || consentimento !== true) {
        throw new Error("Revise os dados e confirme o consentimento.");
      }

      const config = getSupabaseConfig();
      const response = await fetch(
        `${config.url.replace(/\/+$/, "")}/rest/v1/association_interests`,
        {
          method: "POST",
          headers: {
            apikey: config.publishableKey,
            "Content-Type": "application/json",
            Prefer: "return=minimal"
          },
          body: JSON.stringify({
            name: nome,
            email,
            consented: true,
            consent_version: CONSENT_VERSION
          })
        }
      );

      if (!response.ok) {
        throw new Error("Não foi possível registrar a solicitação.");
      }
    },

    saveContact(contact) {
      const contacts = readContacts();
      const record = {
        id: Date.now(),
        createdAt: new Date().toISOString(),
        nome: contact.nome || "",
        email: contact.email || "",
        telefone: contact.telefone || "",
        assunto: contact.assunto || "",
        mensagem: contact.mensagem || ""
      };
      contacts.unshift(record);
      writeContacts(contacts.slice(0, 30));
      return record;
    },

    listContacts(limit = 5) {
      return readContacts().slice(0, limit);
    },

    clearContacts() {
      writeContacts([]);
    }
  };

  window.PNVDatabase = PNVDatabase;
})();
