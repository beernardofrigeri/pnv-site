// Marca o link de navegação correspondente à página atual como ativo
document.addEventListener("DOMContentLoaded", () => {
  const atual = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === atual) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  // Animação de entrada ao rolar a página
  document.querySelectorAll(".pagina-integrantes .integrante").forEach((integrante) => {
    integrante.setAttribute("data-reveal", "");
  });
  const alvos = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && alvos.length) {
    document.documentElement.classList.add("motion-ready");
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("in-view");
            observador.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.05 }
    );
    alvos.forEach((alvo) => observador.observe(alvo));
  } else {
    alvos.forEach((alvo) => alvo.classList.add("in-view"));
  }

  inicializarNoticias();
  inicializarContato();
  inicializarAssociacao();
  inicializarPerfis();
});

function inicializarPerfis() {
  const dialogo = document.querySelector(".perfil-dialog");
  if (!dialogo || typeof dialogo.showModal !== "function") return;

  const nome = dialogo.querySelector("#perfil-nome");
  const cargo = dialogo.querySelector("#perfil-cargo");
  const descricao = dialogo.querySelector("#perfil-descricao");
  const foto = dialogo.querySelector("#perfil-foto");
  const contador = dialogo.querySelector(".perfil-contador");
  const galeria = dialogo.querySelector(".perfil-galeria");
  let fotos = [];
  let indice = 0;
  let solicitado = 0;
  let requisicao = 0;
  let imagemEmCarregamento = null;
  let toqueInicial = null;

  function cancelarCarregamento() {
    if (imagemEmCarregamento) {
      imagemEmCarregamento.onload = null;
      imagemEmCarregamento.onerror = null;
      imagemEmCarregamento = null;
    }
  }

  function mostrarFoto() {
    foto.src = fotos[indice];
    foto.alt = indice === 0
      ? `Retrato de ${nome.textContent}`
      : `${nome.textContent} fazendo o sinal de 50 com as mãos`;
    contador.textContent = `Foto ${indice + 1} de ${fotos.length}`;
  }

  function mudarFoto(direcao) {
    solicitado = (solicitado + direcao + fotos.length) % fotos.length;
    const destino = solicitado;
    const atual = ++requisicao;
    cancelarCarregamento();
    if (destino === indice) {
      mostrarFoto();
      return;
    }

    const imagem = new Image();
    imagemEmCarregamento = imagem;
    contador.textContent = "Carregando foto...";
    imagem.onload = () => {
      if (atual !== requisicao || !dialogo.open) return;
      imagemEmCarregamento = null;
      indice = destino;
      mostrarFoto();
      if (typeof foto.animate === "function" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        foto.getAnimations().forEach((animacao) => animacao.cancel());
        foto.animate(
          [{ opacity: 0.35, transform: `translateX(${direcao * 12}px)` }, { opacity: 1, transform: "translateX(0)" }],
          { duration: 300, easing: "ease-out" }
        );
      }
    };
    imagem.onerror = () => {
      if (atual !== requisicao || !dialogo.open) return;
      imagemEmCarregamento = null;
      solicitado = indice;
      contador.textContent = "Não foi possível carregar a foto. Tente novamente.";
    };
    imagem.src = fotos[destino];
  }

  document.querySelectorAll(".integrante-abrir").forEach((botao) => {
    botao.addEventListener("click", () => {
      const integrante = botao.closest(".integrante");
      nome.textContent = integrante.querySelector(".integrante-nome").textContent;
      cargo.textContent = integrante.querySelector(".integrante-cargo").textContent;
      descricao.textContent = integrante.dataset.descricao;
      fotos = [integrante.querySelector("img").getAttribute("src"), integrante.dataset.segundaFoto];
      indice = 0;
      solicitado = 0;
      requisicao++;
      cancelarCarregamento();
      mostrarFoto();
      dialogo.showModal();
    });
  });

  dialogo.querySelector(".perfil-fechar").addEventListener("click", () => dialogo.close());
  dialogo.addEventListener("close", () => {
    if (!dialogo.open) {
      requisicao++;
      cancelarCarregamento();
    }
  });
  dialogo.querySelector(".perfil-anterior").addEventListener("click", () => mudarFoto(-1));
  dialogo.querySelector(".perfil-proxima").addEventListener("click", () => mudarFoto(1));
  galeria.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      mudarFoto(event.key === "ArrowRight" ? 1 : -1);
    }
  });
  galeria.addEventListener("touchstart", (event) => {
    if (event.touches.length === 1) {
      toqueInicial = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }
  }, { passive: true });
  galeria.addEventListener("touchend", (event) => {
    if (!toqueInicial || event.changedTouches.length !== 1) return;
    const dx = event.changedTouches[0].clientX - toqueInicial.x;
    const dy = event.changedTouches[0].clientY - toqueInicial.y;
    toqueInicial = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) mudarFoto(dx < 0 ? 1 : -1);
  });
}

function formatarData(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(isoDate.length === 10 ? { timeZone: "UTC" } : {})
  });
}

function escapeHtml(valor) {
  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

async function inicializarNoticias() {
  const lista = document.getElementById("noticiasLista");
  const destaque = document.getElementById("noticiaDestaque");
  const filtros = document.getElementById("noticiasFiltros");
  if (!lista || !window.PNVDatabase) return;

  try {
    const noticias = await window.PNVDatabase.getNews();
    if (!noticias.length) {
      lista.innerHTML = "<p class=\"vazio\">Nenhuma notícia disponível no momento.</p>";
      if (destaque) destaque.innerHTML = "<h2>Nenhuma notícia disponível no momento.</h2>";
      return;
    }

    const [principal, ...outras] = noticias;
    if (destaque) {
      destaque.innerHTML = `
        <span class="tag">${escapeHtml(principal.categoria)}</span>
        <h2>${escapeHtml(principal.titulo)}</h2>
        <p>${escapeHtml(principal.resumo)}</p>
        <div class="meta">${formatarData(principal.data)} • PNV Comunicação</div>
      `;
    }

    const categorias = ["Todas", ...new Set(outras.map((n) => n.categoria))];
    let categoriaAtual = "Todas";

    const renderNoticias = () => {
      const visiveis = categoriaAtual === "Todas"
        ? outras
        : outras.filter((n) => n.categoria === categoriaAtual);

      lista.innerHTML = "";
      if (!visiveis.length) {
        lista.innerHTML = "<p class=\"vazio\">Nenhuma notícia nessa categoria.</p>";
        return;
      }

      visiveis.forEach((noticia) => {
        const card = document.createElement("article");
        card.className = "noticia-card";
        card.innerHTML = `
          <span class="tag">${escapeHtml(noticia.categoria)}</span>
          <h3>${escapeHtml(noticia.titulo)}</h3>
          <p>${escapeHtml(noticia.resumo)}</p>
          <div class="meta">${formatarData(noticia.data)} • PNV</div>
        `;
        lista.appendChild(card);
      });
    };

    if (filtros) {
      filtros.innerHTML = "";
      categorias.forEach((categoria) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "filtro-btn";
        if (categoria === categoriaAtual) btn.classList.add("ativo");
        btn.setAttribute("aria-pressed", String(categoria === categoriaAtual));
        btn.textContent = categoria;
        btn.addEventListener("click", () => {
          categoriaAtual = categoria;
          filtros.querySelectorAll(".filtro-btn").forEach((el) => {
            el.classList.remove("ativo");
            el.setAttribute("aria-pressed", "false");
          });
          btn.classList.add("ativo");
          btn.setAttribute("aria-pressed", "true");
          renderNoticias();
        });
        filtros.appendChild(btn);
      });
    }

    renderNoticias();
  } catch {
    lista.innerHTML = "<p class=\"vazio\">Não foi possível carregar as notícias agora.</p>";
    if (destaque) destaque.innerHTML = "<h2>Não foi possível carregar o destaque agora.</h2>";
  }
}

function inicializarContato() {
  const form = document.getElementById("formContato");
  const feedback = document.getElementById("contatoFeedback");
  const lista = document.getElementById("mensagensSalvas");
  const limpar = document.getElementById("limparMensagens");
  if (!form || !window.PNVDatabase) return;

  const renderLista = () => {
    if (!lista) return;
    let contatos;
    try {
      contatos = window.PNVDatabase.listContacts(5);
    } catch {
      lista.innerHTML = "<li class=\"vazio\">Não foi possível acessar os rascunhos neste navegador.</li>";
      return;
    }
    if (!contatos.length) {
      lista.innerHTML = "<li class=\"vazio\">Ainda não há mensagens salvas neste dispositivo.</li>";
      return;
    }

    lista.innerHTML = "";
    contatos.forEach((contato) => {
      const item = document.createElement("li");
      item.className = "mensagem-item";
      item.innerHTML = `
        <strong>${escapeHtml(contato.nome)}</strong>
        <span>${escapeHtml(contato.assunto || "Contato geral")} • ${formatarData(contato.createdAt)}</span>
        <p>${escapeHtml(contato.mensagem)}</p>
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

    try {
      window.PNVDatabase.saveContact(contato);
    } catch {
      if (feedback) {
        feedback.textContent = "Não foi possível salvar neste navegador. Sua mensagem continua preenchida.";
        feedback.classList.add("erro");
      }
      return;
    }
    form.reset();
    if (feedback) {
      feedback.textContent = "Rascunho salvo neste navegador. Ele não foi enviado à equipe.";
      feedback.classList.remove("erro");
    }
    renderLista();
  });

  if (limpar) {
    limpar.addEventListener("click", () => {
      try {
        window.PNVDatabase.clearContacts();
      } catch {
        if (feedback) {
          feedback.textContent = "Não foi possível limpar os rascunhos neste navegador.";
          feedback.classList.add("erro");
        }
        return;
      }
      if (feedback) {
        feedback.textContent = "Histórico local removido deste navegador.";
        feedback.classList.remove("erro");
      }
      renderLista();
    });
  }
}

function inicializarAssociacao() {
  const form = document.getElementById("formAssociacao");
  const feedback = document.getElementById("associacaoFeedback");
  const status = document.getElementById("associacaoStatus");
  if (!form || !feedback || !status) return;

  const config = window.PNV_SUPABASE_CONFIG;
  if (!window.PNVDatabase?.isSupabaseConfigured() || !config) {
    status.textContent = "Cadastro indisponível no momento. Nenhum dado será enviado.";
    return;
  }

  const responsavel = document.getElementById("associacaoResponsavel");
  responsavel.textContent = `Responsável pelo tratamento: ${config.dataController}.`;

  const privacidade = document.getElementById("associacaoPrivacidade");
  const linkPrivacidade = document.createElement("a");
  linkPrivacidade.href = config.privacyUrl;
  linkPrivacidade.target = "_blank";
  linkPrivacidade.rel = "noopener noreferrer";
  linkPrivacidade.textContent = "Leia o aviso de privacidade";
  privacidade.append(linkPrivacidade);

  const contato = document.getElementById("associacaoContatoDados");
  const linkContato = document.createElement("a");
  linkContato.href = `mailto:${config.contactEmail}`;
  linkContato.textContent = config.contactEmail;
  contato.append("Para solicitar acesso ou exclusão dos dados, escreva para ", linkContato, ".");

  [responsavel, privacidade, contato].forEach((element) => { element.hidden = false; });
  form.querySelectorAll("input, button").forEach((element) => { element.disabled = false; });
  status.textContent = "Serviço disponível. Leia o aviso de privacidade antes de enviar.";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const dados = new FormData(form);
    const cadastro = {
      nome: String(dados.get("nome") || "").trim(),
      email: String(dados.get("email") || "").trim(),
      consentimento: dados.get("consentimento") === "on"
    };
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
      await window.PNVDatabase.saveAssociationInterest(cadastro);
      form.reset();
      feedback.textContent = "Solicitação registrada. Ela não formaliza filiação partidária.";
      feedback.classList.remove("erro");
    } catch {
      feedback.textContent = "Não foi possível registrar a solicitação. Tente novamente mais tarde.";
      feedback.classList.add("erro");
    } finally {
      submitButton.disabled = false;
    }
  });
}

