(function () {
  const STORAGE_KEY = "pnv_contatos_v1";

  function safeParse(json, fallback) {
    try {
      return JSON.parse(json);
    } catch {
      return fallback;
    }
  }

  function readContacts() {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return safeParse(raw, []);
  }

  function writeContacts(contacts) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
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
