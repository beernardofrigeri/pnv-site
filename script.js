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
});

