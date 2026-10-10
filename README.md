# Poltroy

PWA mobile-first e offline-first para gerenciamento de ônibus, viagens, passageiros e mapas de assentos.

## Status

Em desenvolvimento.

Etapa atual:

**Etapa 14 — Backup e restauração dos dados locais**

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
