# Cada pasta e arquivo

## Raiz

| Caminho             | Responsabilidade                                                                                                                                                             |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.html`        | Estrutura das cinco telas: Hoje, Minhas tarefas, Trabalho, Agenda e Calendário. Contém formulários fixos, regiões acessíveis, metadados, links de estilos e o script gerado. |
| `README.md`         | Apresentação, uso rápido, comandos, recursos e links desta documentação.                                                                                                     |
| `package.json`      | Nome/versão, dependências de desenvolvimento e comandos npm.                                                                                                                 |
| `package-lock.json` | Versões exatas das dependências para instalações reproduzíveis com `npm ci`.                                                                                                 |
| `.gitignore`        | Exclui dependências, capturas, logs e artefatos temporários do versionamento.                                                                                                |
| `.prettierrc.json`  | Padrão de indentação, aspas e largura usado pelo formatador.                                                                                                                 |
| `.prettierignore`   | Evita formatar dependências, capturas, bundle gerado e lockfile.                                                                                                             |

`script.js` e `style.css` da raiz foram substituídos pela organização abaixo. A página utiliza os novos caminhos. A exclusão de `GUIA_DE_ESTUDOS.md` já existia no início da reorganização; a documentação atual está em `docs`.

## src/js — fontes JavaScript

| Arquivo         | O que faz                                                                                                                                                                                             |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app.js`        | Carrega as coleções, cria o contexto compartilhado, inicializa módulos, alterna telas/tema, atualiza o painel Hoje e coordena a atualização da interface.                                             |
| `config.js`     | Define nome e assinatura da marca. Alterações precisam de novo build. Metadados e títulos de fallback do HTML também devem ser revisados ao mudar a marca.                                            |
| `data.js`       | Define chaves de armazenamento e opções gerais. Normaliza tarefas/compromissos/datas especiais, valida datas/horas, gera IDs, lê/grava dados, protege coleções inválidas e consulta/calcula feriados. |
| `task-rules.js` | Regras independentes da interface: andamento, filtros, pesquisa, ordenação, preservação das subtarefas, recorrência e catálogo de modelos.                                                            |
| `tasks.js`      | Liga o formulário às regras e ao armazenamento. Renderiza as tarefas, incluindo seleção direta de andamento, subtarefas, histórico, referências de cliente/demanda e acompanhamento.                  |
| `work-rules.js` | Define tipos de atividade; normaliza clientes/demandas, valida vínculos e calcula indicadores de trabalho. Usado também na validação de backups.                                                      |
| `work.js`       | Gerencia clientes e demandas, favoritos, arquivamento, abas por contexto, tarefas avulsas, compromissos associados e anotações. Gera os formulários específicos de Trabalho.                          |
| `agenda.js`     | Cadastro, edição, exclusão e apresentação de compromissos, aniversários e datas especiais. Fornece a linha de compromisso reutilizada em Trabalho.                                                    |
| `calendar.js`   | Desenha a grade mensal de 42 dias a partir de eventos fornecidos. Não mantém cópias das coleções.                                                                                                     |
| `events.js`     | Converte tarefas, compromissos, datas especiais e feriados em eventos. Controla o mês/dia selecionado e ações do calendário.                                                                          |
| `backup.js`     | Exporta JSON versão 2, aceita versões 1/2, normaliza e verifica referências, confirma restauração e tenta rollback em erro parcial.                                                                   |
| `ui.js`         | Cria elementos com texto seguro, botões, estados vazios e mensagens. Preserva detalhes abertos e foco por chaves estáveis durante atualização de listas.                                              |

## assets — arquivos usados pelo navegador

| Arquivo              | O que faz                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `css/style.css`      | Entrada dos estilos: importa temas, componentes e responsividade.                                                         |
| `css/themes.css`     | Variáveis de cores, superfícies, texto, bordas e sombras para claro/escuro.                                               |
| `css/components.css` | Estrutura, cards, formulários, botões, listas, calendário, área Trabalho e estados visuais.                               |
| `css/responsive.css` | Ajustes para desktop menor, tablet e celular; respeita preferência por movimento reduzido.                                |
| `icons/ordavik.svg`  | Símbolo local do aplicativo e favicon.                                                                                    |
| `js/app.js`          | Bundle clássico gerado pelo esbuild. É carregado pelo HTML e permite execução direta por arquivo. Não editar manualmente. |

## scripts — ferramentas de desenvolvimento

| Arquivo     | O que faz                                                                                                                                           |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `build.mjs` | Empacota `src/js/app.js` e suas dependências em `assets/js/app.js`.                                                                                 |
| `serve.mjs` | Servidor HTTP local, limitado a 127.0.0.1, com tipos corretos de conteúdo e bloqueio de caminhos internos. Porta padrão 4173; aceita variável PORT. |
| `check.mjs` | Executa a conferência de sintaxe dos arquivos JavaScript de src/js e scripts.                                                                       |

## tests — verificações

| Arquivo                | Cobertura                                                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `data.test.mjs`        | Compatibilidade de tarefas antigas, datas, prazos e normalização.                                                                       |
| `rules.test.mjs`       | Recorrência, subtarefas, filtros, ordenação e validação básica de backup.                                                               |
| `storage.test.mjs`     | Proteção de originais inválidos e rollback na restauração.                                                                              |
| `task-status.test.mjs` | Transições de andamento e modelos simples.                                                                                              |
| `work.test.mjs`        | Clientes, demandas, vínculos, acompanhamento e compatibilidade de backup v1/v2.                                                         |
| `file-smoke.mjs`       | Inicialização e navegação ao abrir o HTML diretamente, com rede externa bloqueada.                                                      |
| `browser-smoke.mjs`    | Fluxos gerais em Chrome isolado: tarefas, andamento, modelos, checklist, recorrência, agenda, calendário, backup, tema, foco e celular. |
| `work-browser.mjs`     | Fluxos de clientes/demandas, isolamento de contextos, avulsas, edição de arquivados, notas, agenda associada e backup com referências.  |

## docs — documentação

`README.md` é o índice. `GUIA_DE_USO.md` explica a operação. Este arquivo é o mapa de fontes. `ARQUITETURA.md` detalha estado e persistência. `ALTERACOES.md` registra as entregas. `ROADMAP.md` descreve o que ainda não foi implementado. `plans/` guarda os planos e as decisões de implementação.

## Pastas locais geradas

- `node_modules/`: dependências instaladas por npm, ignoradas pelo Git.
- `output/playwright/`: imagens dos testes, ignoradas pelo Git. Podem conter apenas os exemplos criados pelos testes isolados.
- `.playwright-cli/`: registros de ferramentas de inspeção, quando utilizadas, ignorados pelo Git.
- `output/`: pode conter artefatos temporários de inspeção e cópias locais de referência; não faz parte da aplicação publicada.

## Onde mexer para cada mudança

- Novo modelo: `task-rules.js` — as opções são geradas por `tasks.js`.
- Novo campo de tarefa: HTML, normalização em `data.js`, formulário/renderização em `tasks.js` e testes.
- Nova regra de cliente/demanda: `work-rules.js`, `work.js` e testes de vínculos/backup.
- Novo estilo: variável em themes ou componente/responsividade correspondente.
- Novo dado persistido: definir chave, normalizador, estado e política de backup/migração antes da interface.
- Qualquer mudança de JavaScript: executar build e as verificações relevantes.
