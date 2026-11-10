// Marca o link de navegação correspondente à página atual como ativo
document.addEventListener("DOMContentLoaded", () => {
  const atual = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === atual) {
      link.classList.add("active");
    }
  });

  // Animação de entrada ao rolar a página
  const alvos = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && alvos.length) {
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("in-view");
            observador.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    alvos.forEach((alvo) => observador.observe(alvo));
  } else {
    alvos.forEach((alvo) => alvo.classList.add("in-view"));
  }

  inicializarNoticias();
  inicializarContato();
});

function formatarData(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

async function inicializarNoticias() {
  const lista = document.getElementById("noticiasLista");
  const destaque = document.getElementById("noticiaDestaque");
  if (!lista || !window.PNVDatabase) return;

  try {
    const noticias = await window.PNVDatabase.getNews();
    if (!noticias.length) {
      lista.innerHTML = "<p class=\"vazio\">Nenhuma notícia disponível no momento.</p>";
      return;
    }

    const [principal, ...outras] = noticias;
    if (destaque) {
      destaque.innerHTML = `
        <span class="tag">${principal.categoria}</span>
        <h2>${principal.titulo}</h2>
        <p>${principal.resumo}</p>
        <div class="meta">${formatarData(principal.data)} • PNV Comunicação</div>
      `;
    }

    lista.innerHTML = "";
    outras.forEach((noticia) => {
      const card = document.createElement("article");
      card.className = "noticia-card";
      card.innerHTML = `
        <span class="tag">${noticia.categoria}</span>
        <h3>${noticia.titulo}</h3>
        <p>${noticia.resumo}</p>
        <div class="meta">${formatarData(noticia.data)} • PNV</div>
      `;
      lista.appendChild(card);
    });
  } catch (erro) {
    lista.innerHTML = "<p class=\"vazio\">Não foi possível carregar as notícias agora.</p>";
  }
}

function inicializarContato() {
  const form = document.getElementById("formContato");
  const feedback = document.getElementById("contatoFeedback");
  const lista = document.getElementById("mensagensSalvas");
  if (!form || !window.PNVDatabase) return;

  const renderLista = () => {
    if (!lista) return;
    const contatos = window.PNVDatabase.listContacts(5);
    if (!contatos.length) {
      lista.innerHTML = "<li class=\"vazio\">Ainda não há mensagens salvas neste dispositivo.</li>";
      return;
    }

    lista.innerHTML = "";
    contatos.forEach((contato) => {
      const item = document.createElement("li");
      item.className = "mensagem-item";
      item.innerHTML = `
        <strong>${contato.nome}</strong>
        <span>${contato.assunto || "Contato geral"} • ${formatarData(contato.createdAt)}</span>
        <p>${contato.mensagem}</p>
      `;
      lista.appendChild(item);
    });
  };

  renderLista();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const dados = new FormData(form);
    const contato = {
      nome: String(dados.get("nome") || "").trim(),
      email: String(dados.get("email") || "").trim(),
      telefone: String(dados.get("telefone") || "").trim(),
      assunto: String(dados.get("assunto") || "").trim(),
      mensagem: String(dados.get("mensagem") || "").trim()
    };

    if (!contato.nome || !contato.email || !contato.mensagem) {
      if (feedback) {
        feedback.textContent = "Preencha nome, e-mail e mensagem.";
        feedback.classList.add("erro");
      }
      return;
    }

    window.PNVDatabase.saveContact(contato);
    form.reset();
    if (feedback) {
      feedback.textContent = "Mensagem registrada com sucesso no banco local deste navegador.";
      feedback.classList.remove("erro");
    }
    renderLista();
  });
}

