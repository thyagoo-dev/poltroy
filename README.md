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

Abra a URL do preview online e aguarde o primeiro carregamento. Depois, teste o reload offline nas rotas internas. Em produção, sirva o aplicativo por HTTPS e configure o servidor para encaminhar rotas SPA a `index.html`.

O Cache Storage contém apenas os arquivos estáticos do aplicativo. Ônibus, viagens, passageiros e estados de assento continuam no IndexedDB/Dexie.

A instalação fica em **Mais → Aplicativo**, quando oferecida pelo navegador. Novas versões mostram **Agora não / Atualizar**; o aplicativo só aplica a atualização após confirmação.

O gerador de Service Worker do Workbox usa a distribuição oficial WASM do Rollup, via override do pnpm, para funcionar também em ambientes Windows que bloqueiam o módulo nativo. O bundler do Vite 8 permanece inalterado.

## Backup e restauração

Em **Mais → Backup e restauração**, exporte um JSON versionado com ônibus, layouts, viagens, passageiros e estados de assento. A exportação usa um snapshot consistente e funciona offline.

Ao selecionar um arquivo, o POLTROY valida os dados e suas referências antes de mostrar o resumo. Somente após confirmação explícita os cinco conjuntos de dados são substituídos em uma única transação: qualquer falha na escrita desfaz toda a substituição. Não há merge.

Depois do sucesso, os contextos de ônibus e viagem são limpos e o aplicativo recarrega. O ônibus ativo pode ser selecionado novamente pelas regras normais da aplicação. Backup vazio é permitido; Cache Storage, Service Worker e preferências de UI não fazem parte do arquivo.

O backup é JSON sem criptografia e pode conter nomes, telefones, observações e dados operacionais. Guarde-o em local seguro. Nenhum arquivo é enviado a servidores. A leitura aceita até 50 MiB; layouts importados têm limite de 100.000 células ocupadas para evitar expansão excessiva durante a validação.

## Responsividade

O layout permanece mobile-first e usa os breakpoints existentes: xs (480 px), sm (640 px), md (768 px), lg (1024 px), xl (1280 px) e 2xl (1536 px). As listas de ônibus, viagens e passageiros passam a duas colunas em md; a sidebar substitui a navegação floating em lg. A área de conteúdo tem largura máxima e Mais usa uma coluna de leitura mais compacta.

Os mapas preservam CSS Grid e células entre 44 e 56 px. Os presets de 44, 40 e 30 lugares cabem em 320 px; layouts mais largos usam scroll horizontal apenas no mapa. Cards quebram conteúdo sem espaços, sem esconder overflow do documento.

Header, navegação, sidebar e dialogs respeitam safe areas. Dialogs e a prévia de backup têm scroll próprio limitado pela altura dinâmica (dvh). A adaptação usa CSS/Tailwind, sem estado JavaScript de viewport ou detecção de dispositivo. A ordem visual das ações acompanha a ordem do teclado.

Os tokens de altura do header e de espaço reservado à navegação também definem o scroll-padding do documento. O scroll nativo de foco considera essas áreas, inclusive com viewport reduzido; campos maiores, como textareas, continuam acessíveis pelo scroll natural, sem detectar o teclado em JavaScript.

## Identidade visual — Refino 15.1

O POLTROY utiliza Light Mode como tema único: fundo slate-50 (#F8FAFC), superfícies brancas e primary blue-600 (#2563EB). Cores, bordas e sombras são centralizadas em tokens semânticos; textos terciários e status usam tons com contraste adequado. A navegação floating, os layouts responsivos e os fluxos offline permanecem preservados.
