# Poltroy

PWA mobile-first e offline-first para gerenciamento de ônibus, viagens, passageiros e mapas de assentos.

## Status

Em desenvolvimento.

Etapa atual:

**Etapa 15 — Responsividade e adaptação avançada**

## Objetivo

O Poltroy tem como objetivo facilitar o acompanhamento operacional de viagens de ônibus, permitindo visualizar rapidamente:

- assentos livres;
- assentos ocupados;
- assentos reservados;
- assentos bloqueados;
- passageiros associados aos assentos;
- ônibus e viagem em operação.

## Princípios

O projeto seguirá os seguintes princípios:

- mobile-first;
- offline-first;
- acessibilidade;
- simplicidade operacional;
- alta performance;
- arquitetura escalável;
- TypeScript com tipagem estrita;
- desenvolvimento incremental.

## Stack

A base inicial utiliza:

- React;
- TypeScript;
- Vite;
- ESLint;
- pnpm.

Outras tecnologias serão adicionadas progressivamente conforme as necessidades do projeto.

## Desenvolvimento

Instale as dependências:

```bash
pnpm install
```

## PWA

O Service Worker é gerado apenas no build de produção. Para testar instalação e funcionamento offline:

```bash
pnpm build
pnpm preview
```

Abra `/poltroy/` na URL do preview online e aguarde o primeiro carregamento. Depois, teste o reload offline nas rotas internas. O GitHub Pages usa o recovery descrito abaixo para deep links online; outros servidores precisam encaminhar rotas SPA a `index.html`.

O Cache Storage contém apenas os arquivos estáticos do aplicativo. Ônibus, viagens, passageiros e estados de assento continuam no IndexedDB/Dexie.

A instalação fica em **Mais → Aplicativo**, quando oferecida pelo navegador. Novas versões mostram **Agora não / Atualizar**; o aplicativo só aplica a atualização após confirmação.

O gerador de Service Worker do Workbox usa a distribuição oficial WASM do Rollup, via override do pnpm, para funcionar também em ambientes Windows que bloqueiam o módulo nativo. O bundler do Vite 8 permanece inalterado.

## Deployment — GitHub Pages

O destino de produção é `https://thyagoo-dev.github.io/poltroy/`, no repositório `thyagoo-dev/poltroy`. `pnpm dev` continua na raiz local `/`; `pnpm build` usa `/poltroy/`, e `pnpm preview` deve ser aberto nesse caminho. Router, assets, manifest e Service Worker usam essa base; o SW controla somente `/poltroy/`.

O workflow `.github/workflows/deploy-pages.yml` roda em push na `main` ou execução manual. Usa Node 24 e pnpm 12.3.4, instala com lockfile congelado e executa testes, lint e build antes de publicar `dist` como artefato do Pages. Após revisar, fazer commit e push, confirme **Settings → Pages → Build and deployment → Source → GitHub Actions** no repositório, se ainda não estiver configurado. A publicação real depende dessa execução remota.

Deep links com BrowserRouter usam `public/404.html`: uma rota ausente no servidor redireciona para a raiz da aplicação com `__poltroy_route`; o `index.html` restaura path, query e hash com `history.replaceState` antes do React iniciar. A URL final permanece limpa e a recuperação aceita somente caminhos internos da mesma origem.

IndexedDB é associado à origem: dados de localhost não aparecem automaticamente no GitHub Pages. Para transportá-los, exporte um backup local e restaure manualmente na aplicação publicada.

## Backup e restauração

Em **Mais → Backup e restauração**, exporte um JSON versionado com ônibus, layouts, viagens, passageiros e estados de assento. A exportação usa um snapshot consistente e funciona offline.

Ao selecionar um arquivo, o POLTROY valida os dados e suas referências antes de mostrar o resumo. Somente após confirmação explícita os cinco conjuntos de dados são substituídos em uma única transação: qualquer falha na escrita desfaz toda a substituição. Não há merge.

Depois do sucesso, os contextos de ônibus e viagem são limpos e o aplicativo recarrega. O ônibus ativo pode ser selecionado novamente pelas regras normais da aplicação. Backup vazio é permitido; Cache Storage, Service Worker e preferências de UI não fazem parte do arquivo.

O backup é JSON sem criptografia e pode conter nomes, telefones, documentos de identificação, observações e dados operacionais. Guarde-o em local seguro. Nenhum arquivo é enviado a servidores. A leitura aceita até 50 MiB; layouts importados têm limite de 100.000 células ocupadas para evitar expansão excessiva durante a validação.

## Responsividade

O layout permanece mobile-first e usa os breakpoints existentes: xs (480 px), sm (640 px), md (768 px), lg (1024 px), xl (1280 px) e 2xl (1536 px). As listas de ônibus, viagens e passageiros passam a duas colunas em md; a sidebar substitui a navegação floating em lg. A área de conteúdo tem largura máxima e Mais usa uma coluna de leitura mais compacta.

Os mapas preservam CSS Grid, com poltronas entre 44 e 76 px de largura e 68 a 72 px de altura. Os presets de 46, 44, 40 e 30 lugares cabem em 320 px; layouts mais largos usam scroll horizontal apenas no mapa. Cards quebram conteúdo sem espaços, sem esconder overflow do documento.

Header, navegação, sidebar e dialogs respeitam safe areas. Dialogs e a prévia de backup têm scroll próprio limitado pela altura dinâmica (dvh). A adaptação usa CSS/Tailwind, sem estado JavaScript de viewport ou detecção de dispositivo. A ordem visual das ações acompanha a ordem do teclado.

Os tokens de altura do header e de espaço reservado à navegação também definem o scroll-padding do documento. O scroll nativo de foco considera essas áreas, inclusive com viewport reduzido; campos maiores, como textareas, continuam acessíveis pelo scroll natural, sem detectar o teclado em JavaScript.

## Identidade visual — Refino 15.1

O POLTROY utiliza Light Mode como tema único: fundo slate-50 (#F8FAFC), superfícies brancas e primary blue-600 (#2563EB). Cores, bordas e sombras são centralizadas em tokens semânticos; textos terciários e status usam tons com contraste adequado. A navegação floating, os layouts responsivos e os fluxos offline permanecem preservados.

## Mapa de assentos — Refino 15.2

O mapa usa uma única superfície de veículo e CSS Grid com corredores estreitos derivados do layout. Poltronas operacionais mostram o passageiro associado ou a situação, com detalhes no sheet existente. O preset convencional de 46 lugares está disponível, mantendo 44 como padrão e os presets de 40/30. A orientação frontal é motorista à esquerda e entrada à direita; layouts legados recebem apenas normalização de apresentação, sem alterar IDs ou dados persistidos.

## Mapa operacional — Refino 15.3

A aba Mapa é um workspace operacional único: sem viagem selecionada, apresenta o acesso a Viagens; viagens planejadas ou em andamento abrem o mapa de passageiros e estados. O resumo é compacto, a busca permanece visível e os seis filtros ficam em um dialog próprio. Selecionar ônibus na Frota mantém o usuário nessa página. Os componentes de mapa físico permanecem disponíveis, sem fallback automático na aba Mapa.

## Passenger Data v2 — Refino 15.4

Passageiros novos exigem nome completo e nome de exibição de até 16 pontos de código Unicode. CPF/RG são opcionais; CPF usa máscara na UI e dígitos no armazenamento. Registros legados usam os primeiros 16 caracteres do nome completo como fallback de apresentação, sem gravação automática. O schema Dexie permanece v1. Backups novos são v2, com importação de v1 convertida em memória e IDs/associações preservados.

## Navegação de passageiros — Refino 15.5

A listagem `/passengers` reúne busca e acesso aos cadastros. Criação e edição usam páginas dedicadas (`/passengers/new` e `/passengers/:passengerId/edit`); após salvar, abrem os detalhes em `/passengers/:passengerId`. Identificação aparece somente nos detalhes e na edição. As subrotas também funcionam offline após o cache da aplicação estar disponível.

## Central Mais — Refino 15.6

`/more` reúne os links para Aplicativo (`/more/app`), Backup e restauração (`/more/backup`), Configurações (`/more/settings`) e Sobre (`/more/about`). Instalação PWA e backup têm páginas próprias; Configurações informa que ainda não há preferências configuráveis. As subrotas funcionam offline após o cache da aplicação estar disponível.

## Shell e contexto de ônibus — Refino 15.7

O header mostra o ônibus selecionado em Mapa e Viagens como link para a Frota; em `/buses`, apresenta um indicador sem navegação redundante. Passageiros, Mais, suas subrotas e páginas não encontradas não exibem esse contexto. O header permanece `sticky`, com safe area e tokens de altura preservados; seu topo foi validado durante a rolagem longa no preview de produção.
