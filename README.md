# Poltroy

PWA mobile-first e offline-first para gerenciamento de ônibus, viagens, passageiros e mapas de assentos.

## Status

Em desenvolvimento.

Etapa atual:

**Etapa 13 — PWA e funcionamento offline**

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
