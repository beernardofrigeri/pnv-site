# PNV — Partido Nova Visão

Site institucional do PNV (Partido Nova Visão) — campanha "Vote 50".

Identidade visual brutalista/editorial: Swiss Graphic Design + Neo-Brutalismo + propaganda política retrô + estética zine, em roxo profundo, laranja vibrante, creme e bege.

## Estrutura

- `index.html` — Página inicial (header, hero, apresentação, propostas em pôsteres, destaques, footer)
- `sobre.html` — Sobre o partido
- `propostas.html` — Propostas completas
- `integrantes.html` — Integrantes do grupo (espaço para 11 fotos em `assets/integrantes/`)
- `noticias.html` — Notícias
- `contato.html` — Formulário de contato
- `style.css` — Design system completo (cores, tipografia, componentes)
- `script.js` — Navegação ativa + animações de entrada ao rolar (scroll reveal)
- `assets/` — Logos oficiais e fotos

## Rodando localmente

Qualquer servidor estático funciona, por exemplo:

```bash
python -m http.server 8080
```

Depois acesse `http://localhost:8080`.

## Conteúdo pendente

- Fotos dos 11 integrantes em `assets/integrantes/01.jpg` a `11.jpg`
- Foto do candidato em `assets/candidato.jpg`
- Textos definitivos de história, objetivos, princípios e propostas (atualmente com placeholders)

## Publicação (GitHub Pages)

Este repositório pode ser publicado gratuitamente com o GitHub Pages: em **Settings → Pages**, selecione a branch `main` e a pasta raiz (`/`). O site ficará disponível em `https://<usuario>.github.io/<repositorio>/`.
