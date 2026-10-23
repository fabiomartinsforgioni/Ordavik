# Arquitetura e funcionamento

## Tecnologias e execução

Frontend em HTML, CSS e JavaScript nativo, sem framework de aplicação ou backend. Bootstrap/Bootstrap Icons são recursos visuais de CDN; controles possuem estilos locais alternativos. Esbuild, Playwright e Prettier são dependências de desenvolvimento.

Os fontes usam módulos ES. O build gera um script clássico autocontido, carregado com defer pelo HTML. Assim o navegador executa os módulos empacotados mesmo em file://, sem depender de importações bloqueadas pelo navegador nesse protocolo.

## Inicialização e contexto

1. O HTML aplica a preferência de tema e carrega os estilos.
2. O bundle executa app.js.
3. Cada coleção é carregada e normalizada, sem gravar automaticamente as tarefas antigas de volta.
4. app.js cria ctx com state, persist, notify, navigate e refresh.
5. Inicializa Trabalho, tarefas, agenda, eventos e backup.
6. Quando todos estão disponíveis, renderiza e sinaliza data-app-ready.
7. A consulta opcional de feriados acontece em segundo plano com alternativa local.

O estado compartilhado possui arrays tasks, meetings, celebrations, clients e demands. Os módulos mantêm a identidade dos arrays; restauração usa splice para que todas as referências recebam os dados novos. Estado de tela (cliente, mês, filtro, formulário em edição) fica nos módulos correspondentes e não representa outra cópia dos cadastros.

## Relações

```text
Cliente (id)
├── Demanda (clientId)
│   └── Tarefa (clientId + demandId)
├── Tarefa avulsa (clientId, sem demandId)
└── Compromisso (clientId)
```

Tarefas pessoais/estudos podem não ter cliente. Demandas exigem cliente. A demanda de uma tarefa precisa pertencer ao mesmo cliente selecionado. Referências usam IDs estáveis; o texto exibido é buscado no cadastro atual, preservando vínculos após renomeação.

O campo project é uma referência livre legada. Não se infere clientId a partir desse texto para evitar vínculos incorretos. Arquivar não exclui, não conclui e não remove referências. O cliente de uma demanda existente não é transferido pelo formulário.

## Fluxo de alteração

A interação valida os campos, normaliza o registro, altera o array compartilhado, tenta persistir e atualiza as visualizações. Uma tarefa exibida em Trabalho e Minhas tarefas é o mesmo objeto. O andamento usa a mesma regra no checkbox, seletor e edição, sincronizando completed, status e completedAt.

O histórico da tarefa é limitado às 100 últimas entradas. Notas de cliente são um texto geral; as anotações de demanda são um texto editável. Não constituem auditoria imutável. Tempo estimado/realizado é informado manualmente.

refresh coordena as listas e indicadores. A atualização periódica recalcula dados dependentes do horário. ui.js preserva foco e painéis abertos onde há chaves estáveis. Os formulários não são reconstruídos a cada atualização.

## Datas

Datas de planejamento usam YYYY-MM-DD e horários locais HH:mm. Tarefa sem horário vence ao final do dia. followUpDate representa o acompanhamento, independente de dueDate. Acompanhamentos são destacados em Hoje/Trabalho; não são novos eventos de calendário.

## Persistência

| Coleção/preferência | Chave                 |
| ------------------- | --------------------- |
| Tarefas             | taskflow-tasks        |
| Compromissos        | taskflow-meetings     |
| Datas especiais     | taskflow-celebrations |
| Tema                | taskflow-theme        |
| Clientes            | ordavik-clients       |
| Demandas            | ordavik-demands       |

O localStorage depende do perfil do navegador e da origem. Não é banco compartilhado, sincronização ou mecanismo de contas. Não há resolução de conflitos entre edições simultâneas em várias abas.

Se JSON ou registros estiverem inválidos, a coleção original fica bloqueada para sobrescrita silenciosa. O aplicativo pode mostrar os registros válidos e manter mudanças somente em memória, com aviso. rawStorage no backup preserva os valores originais disponíveis para recuperação técnica, não os reimporta automaticamente.

## Backup e restauração

- Versão 2: tasks, meetings, celebrations, clients e demands obrigatórios.
- Versão 1: as três coleções antigas são obrigatórias; clientes/demandas ausentes recebem listas vazias.
- Antes de gravar: verificar marca/versão, tipos, limites, IDs duplicados e coerência das referências entre coleções.
- Após confirmação: capturar valores locais anteriores, gravar as cinco coleções e, somente após sucesso, atualizar o estado em memória.
- Em falha parcial: tentar recuperar os valores anteriores exatos. Se o navegador também bloquear o rollback, informar a recuperação parcial; o arquivo do usuário continua sendo a cópia de referência.
- Restauro substitui, não mescla. A preferência de tema não é aplicada automaticamente.

## Segurança e limites

Textos do usuário são inseridos com textContent. Links de reunião só são clicáveis com HTTP/HTTPS e usam isolamento da janela de destino. Credenciais e dados sensíveis de sistemas externos não são necessários ao aplicativo.

Não há autenticação, permissões entre usuários, cobrança, notificações em segundo plano, integração de e-mail ou armazenamento de anexos. Essas capacidades precisam de decisões e serviços adicionais descritos no roadmap.
