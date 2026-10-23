# Ordavik

**Clareza para o próximo passo.** Organizador local de tarefas, clientes/projetos, estudos e compromissos. Interface em português, com temas claro, escuro e automático.

## Usar agora

Abra `index.html` no navegador. O JavaScript compilado já está incluído em `assets/js/app.js`; não é necessário instalar dependências para usar a aplicação.

Também é possível usar o Live Server ou executar, com Node.js instalado:

```powershell
npm ci
npm start
```

Acesse o endereço informado no terminal (por padrão, `http://127.0.0.1:4173`). Para usar outra porta no PowerShell: `$env:PORT = '4175'` antes de `npm start`.

**Dados são locais ao navegador e endereço.** Abrir por arquivo, localhost, outra porta ou outro domínio pode mostrar armazenamentos diferentes. Antes de mudar de endereço ou publicar, use **Backup** no endereço antigo e **Restaurar** no novo.

## Funcionalidades

- Área **Trabalho**, com clientes, demandas e tarefas avulsas. Mazer, Manuchar e Demandas internas aparecem como sugestões iniciais quando ainda não há cadastro de clientes.
- Clientes cadastráveis, renomeáveis, favoritos e arquiváveis. Cada cliente possui Resumo, Demandas, Tarefas, Agenda do cliente e Anotações.
- Demandas com chamado, objetivo, comportamento atual, resultado esperado, ambiente, evidências, próxima ação e critério de conclusão.
- Vínculos por IDs: tarefas e compromissos continuam associados após renomear ou arquivar um cliente. As diferentes telas consultam os mesmos registros.
- Acompanhamento de retornos: “Aguardando quem?” e “Data de acompanhamento”, separados do prazo da entrega.
- Cadastro rápido com detalhes expansíveis e 11 modelos: tarefa simples, lembrete, atividade pessoal, compras, rotina administrativa, acompanhamento de retorno, correção de problema, leitura/curso, investigação, estudos e entrega. Modelos são atalhos de preenchimento; lembretes não enviam notificações.
- Título, descrição, natureza, prioridade, cliente/projeto, etiquetas, início e prazo com horário.
- Situações Pendente, Em andamento, Aguardando retorno e Concluída; próxima ação. O seletor Andamento em cada tarefa permite mudar a situação sem abrir a edição, atualizando salvamento, histórico, indicadores e filtros.
- Subtarefas, atualizações no histórico, estimativa e tempo realizado em minutos (registro manual).
- Recorrência diária, semanal e mensal: concluir cria a próxima ocorrência; reabrir/concluir não a duplica.
- Busca e filtros combinados por situação, natureza, prioridade, prazo e cliente/projeto.
- Ordenação por prazo, prioridade, título e criação.
- Exclusão de tarefas com opção de desfazer até a mensagem ser fechada ou substituída.
- Painel Hoje com programação, vencidas e atividades aguardando retorno.
- Agenda de compromissos, links HTTP/HTTPS, aniversários e datas especiais anuais.
- Calendário integrado com os mesmos dados da agenda e tarefas, sem duplicar cadastros.
- Feriados de referência com consulta opcional à BrasilAPI e cálculo local quando indisponível. Não cobre todos os calendários estaduais e municipais.
- Exportação JSON, leitura de backups antigos do TaskFlow, validação e confirmação antes da substituição.
- Avisos persistentes de falha no armazenamento e preservação dos dados originais inválidos.
- Nome e ícone da aba, símbolo SVG local e três opções de tema.

## Organização

```text
index.html                 Estrutura semântica das cinco telas
src/js/
  app.js                   Inicialização, navegação, tema, painel e estado compartilhado
  config.js                Nome e assinatura da marca
  data.js                  Datas, normalização, persistência e feriados
  task-rules.js            Filtros, ordenação, recorrência e modelos
  work-rules.js            Normalização, vínculos e indicadores de trabalho
  work.js                  Clientes, demandas e suas visualizações
  tasks.js                 Formulário e apresentação das tarefas
  agenda.js                Compromissos, aniversários e datas especiais
  calendar.js              Renderização da grade mensal
  events.js                Integração das entidades com o calendário
  backup.js                Exportação, validação e restauração
  ui.js                    Componentes e mensagens seguras
assets/
  css/                     Temas, componentes e responsividade
  icons/ordavik.svg         Símbolo e favicon
  js/app.js                Bundle gerado; não editar manualmente
scripts/                   Build, servidor local e conferência de sintaxe
tests/                     Testes de regras, armazenamento e navegação real
docs/                      Plano, alterações e evolução futura
```

## Documentação completa

- [Índice da documentação](docs/README.md).
- [Guia de uso e exemplos de trabalho](docs/GUIA_DE_USO.md).
- [Cada pasta e arquivo explicado](docs/ESTRUTURA.md).
- [Arquitetura, dados e funcionamento interno](docs/ARQUITETURA.md).
- [Alterações realizadas](docs/ALTERACOES.md) e [roadmap](docs/ROADMAP.md).

### Começar a organizar o trabalho

1. Abra **Trabalho** e selecione um cliente, ou use **Adicionar cliente**.
2. Para uma entrega com várias atividades, crie uma **Nova demanda**.
3. Dentro da demanda, use **Adicionar tarefa**: cliente e demanda são preenchidos automaticamente.
4. Para uma atividade independente, use **Nova tarefa de trabalho** no cliente, sem selecionar demanda.
5. Informe quem precisa retornar e a data de acompanhamento quando necessário. Altere o andamento diretamente nas listas.

O campo **Projeto / referência livre** preserva o antigo “Cliente / Projeto”. Textos antigos não são convertidos automaticamente em clientes; edite a tarefa e selecione o cadastro correspondente.

## Desenvolver

Edite os módulos em `src/js`. Depois de qualquer mudança no JavaScript, gere novamente o arquivo usado pelo navegador:

```powershell
npm run build
```

O build empacota os módulos em um script clássico, corrigindo o bloqueio de CORS que impedia todos os botões ao abrir o HTML por `file://`. Os fontes continuam separados e testáveis.

Bootstrap e Bootstrap Icons são carregados por CDN. O código de interação é local e os estilos têm alternativas locais para os controles; alguns ícones decorativos dependem da conexão. O símbolo da marca e o favicon são locais.

## Verificar

```powershell
npm test
npm run check
npm run format:check
npm run test:browser
```

Os testes de navegador usam Playwright com Google Chrome instalado. Eles trabalham em um contexto isolado, sem acessar as tarefas do seu perfil pessoal. As capturas ficam em `output/playwright/`, ignorado pelo Git.

`npm run format` padroniza os fontes. O bundle e o lockfile não são formatados manualmente.

## Compatibilidade e recuperação

As chaves `taskflow-tasks`, `taskflow-meetings`, `taskflow-celebrations` e `taskflow-theme` foram mantidas. Clientes e demandas usam `ordavik-clients` e `ordavik-demands`. O campo legado `description` continua representando o título para preservar compatibilidade.

O backup atual é versão 2 e inclui clientes e demandas. Backups TaskFlow/Ordavik versão 1 continuam aceitos. **Restaurar substitui todas as coleções; uma cópia antiga sem clientes/demandas restaura essas coleções vazias.** A confirmação informa isso antes de gravar. Vínculos inconsistentes são recusados antes da restauração. Exporte uma cópia atual antes de retornar a uma versão antiga.

Se o armazenamento contiver JSON ou registros inválidos, a aplicação mostra os registros válidos, avisa e bloqueia a sobrescrita da coleção original. Exporte um backup: `rawStorage` inclui o conteúdo original para recuperação manual. A restauração automática usa as coleções normalizadas; não interpreta `rawStorage` como dados válidos. Guarde o arquivo exportado antes de tentar reparar dados.

O nome Ordavik foi escolhido pelo usuário nesta etapa. Registro de marca, domínio, publicação e renomeação do repositório remoto não foram realizados. Veja `docs/ROADMAP.md`.
