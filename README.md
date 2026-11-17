# PNV — Partido Nova Visão

Site institucional estático do PNV, com cadastro de interesse integrado ao Supabase.

## Páginas e arquivos

- `index.html` — Página inicial e visão geral do plano
- `sobre.html` — Identidade e princípios
- `propostas.html` — Frentes de atuação e valores do plano PNV - SENAC
- `integrantes.html` — Integrantes
- `noticias.html` — Publicações carregadas de `data/pnv-db.json`
- `associar.html` — Cadastro de interesse em associação
- `contato.html` — Rascunhos locais; as mensagens não são enviadas à equipe
- `style.css` — Sistema visual e composições específicas para cada página
- `script.js`, `database.js` — Comportamentos do site e integração com Supabase
- `supabase/schema.sql` — Tabela e políticas de acesso do cadastro
- `supabase-config.js` — Configuração pública do projeto Supabase

## Cadastro com Supabase

1. Crie uma conta em [supabase.com](https://supabase.com/), crie um projeto no plano Free e aguarde sua inicialização. Guarde a senha do banco de dados em local seguro.
2. No projeto, abra **SQL Editor**, crie uma consulta, copie todo o conteúdo de `supabase/schema.sql` e clique em **Run**. O SQL cria `public.association_interests`, ativa RLS e permite somente a inserção anônima dos campos necessários.
3. Confira em **Integrations → Data API** se a Data API está habilitada e se a tabela no schema `public` está exposta. Não conceda permissão pública de leitura, alteração ou exclusão.
4. No diálogo **Connect** do projeto, copie a **Project URL** e a chave **Publishable key** iniciada por `sb_publishable_`. Preencha `supabase-config.js` com os dados reais:

   ```js
   window.PNV_SUPABASE_CONFIG = Object.freeze({
     url: "https://SEU-PROJETO.supabase.co",
     publishableKey: "sb_publishable_SUA_CHAVE",
     dataController: "Nome do responsável pelo tratamento",
     privacyUrl: "https://endereco-do-aviso-de-privacidade",
     contactEmail: "email-do-responsavel@exemplo.com"
   });
   ```

   Os valores acima são apenas exemplos: publique um aviso de privacidade em HTTPS e use a identidade e o e-mail reais do responsável. Nunca coloque uma chave `sb_secret_...`, `service_role` ou a senha do banco no site. A publishable key é pública; a proteção dos registros depende das permissões e da política RLS.
5. Inicie o site localmente conforme as instruções abaixo. Em **Associar**, confirme que o serviço está disponível, envie uma solicitação de teste com seus próprios dados e verifique a mensagem de sucesso. Abra **Table Editor → association_interests** no Supabase e confira se a linha apareceu; depois exclua a linha de teste pelo painel.
6. Publique as alterações do site na branch `main` para atualizar o GitHub Pages e repita o teste no endereço publicado. Os registros são gerenciados no painel do Supabase; o site não inclui uma área de administração.

Enquanto `supabase-config.js` estiver sem os dados reais, o formulário permanece desabilitado e não envia informações. Antes de ativá-lo, confirme a identidade do responsável, publique um aviso de privacidade adequado, defina retenção e atenda às obrigações aplicáveis à LGPD. Interesse em associação política pode revelar dado pessoal sensível.

O formulário registra apenas interesse e não cria uma conta, formaliza filiação ou envia e-mails automaticamente. A inserção pública também não impede spam; avalie proteção contra abuso antes de abrir o cadastro ao público.

O plano Free do Supabase tem limites de uso e pode pausar projetos com baixa atividade após sete dias. Confira os limites e a disponibilidade atuais antes de usar o serviço para cadastros reais: [preços](https://supabase.com/pricing) e [pausa de projetos](https://supabase.com/docs/guides/platform/free-project-pausing).

## Publicação gratuita

O GitHub Pages já está ativo para este repositório e publica a branch `main` em `https://beernardofrigeri.github.io/pnv-site/`. Atualizações enviadas à branch mantêm o site estático no ar. O GitHub Pages hospeda os arquivos; o Supabase fornece a API e o banco.

## Rodar localmente

Na pasta do site, inicie um servidor estático:

```powershell
python -m http.server 8080
```

Abra `http://127.0.0.1:8080`. Para testar o cadastro localmente, preencha `supabase-config.js` com uma configuração Supabase válida e execute o SQL antes de enviar dados.

## Conteúdo a completar

- Substituir as imagens ilustrativas pelos retratos autorizados dos integrantes e do candidato.
- Configurar canais de contato oficiais antes de divulgar a página.
- Publicar o aviso de privacidade e informar os dados verdadeiros do responsável pelo tratamento.
