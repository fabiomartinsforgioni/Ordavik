# Ordavik

**Clareza para o próximo passo.** ✨

O **Ordavik** é uma aplicação web para organizar tarefas, compromissos e demandas de trabalho, estudos e vida pessoal. Nasceu como **TaskFlow**, um projeto prático de Engenharia de Software, e evoluiu para um organizador com clientes, projetos, agenda e calendário integrados.

> **Versão atual do código: 0.6.0** · Projeto em desenvolvimento e aprendizado · Interface em português (pt-BR) · Sem necessidade de conta.

## 🎯 O que o Ordavik oferece

| Área | Recursos |
| --- | --- |
| **Hoje** | Resumo de tarefas, progresso, prazos vencidos, compromissos e atividades aguardando retorno. |
| **Minhas tarefas** | Cadastro, edição, conclusão, exclusão com desfazer, prioridades, subtarefas, modelos, recorrência, filtros, busca e ordenação. |
| **Trabalho** | Organização por clientes e demandas, tarefas vinculadas ou avulsas, notas, histórico e acompanhamento de retornos. |
| **Agenda** | Cadastro e gerenciamento de compromissos, reuniões, aniversários e datas especiais. |
| **Calendário** | Visão mensal com tarefas e compromissos integrados, incluindo feriados brasileiros de referência. |

### Detalhes úteis

- Tarefas com título, descrição, natureza, prioridade, cliente/projeto, etiquetas, datas, horários e próxima ação.
- Situações **Pendente**, **Em andamento**, **Aguardando retorno** e **Concluída**.
- Demandas com referência/chamado, contexto, evidências, objetivo, resultado esperado e critério de conclusão.
- Campo **Aguardando quem?** e data de acompanhamento independentes do prazo de entrega.
- Recorrência diária, semanal e mensal, além de estimativas e tempo realizado informados manualmente.
- Clientes com favoritos, arquivamento e vínculos preservados por identificadores.
- Temas **claro**, **escuro** e **automático**; interface responsiva.
- **Backup JSON** e restauração com validação, incluindo compatibilidade com dados do antigo TaskFlow.

**Limitações atuais:** os dados ficam no `localStorage` do navegador. Não existe login, sincronização entre dispositivos, colaboração, notificações em segundo plano, integração automática com Outlook/Google Agenda ou backend. O tempo realizado é registrado manualmente. A consulta opcional a feriados não cobre todos os calendários locais.

## 🚀 Como executar

**Para usar sem configurar o ambiente de desenvolvimento:**

1. Baixe ou clone o repositório.
2. Abra o arquivo `index.html` no navegador.
3. Navegue entre **Hoje**, **Minhas tarefas**, **Trabalho**, **Agenda** e **Calendário**.

O JavaScript pronto para o navegador já acompanha o repositório em `assets/js/app.js`. Não é necessário executar `npm install` para apenas usar a aplicação. Bootstrap e Bootstrap Icons são carregados por CDN, portanto parte da aparência e dos ícones depende de internet.

**Para desenvolver com Node.js e npm:**

```powershell
git clone https://github.com/fabiomartinsforgioni/Ordavik.git
cd Ordavik
npm ci
npm start
```

O servidor local utiliza, por padrão, **http://127.0.0.1:4173**. Você também pode abrir o projeto com a extensão **Live Server** do VS Code.

> **Atenção aos dados:** `file://`, `localhost`, portas diferentes e novos domínios podem utilizar armazenamentos distintos. Antes de mudar o endereço da aplicação, exporte um **Backup** no endereço antigo e restaure-o no novo.

## 🧰 Tecnologias e ferramentas

- **HTML5, CSS3 e JavaScript (ES Modules):** estrutura, estilos e comportamento.
- **Bootstrap 5 e Bootstrap Icons:** apoio visual.
- **Node.js e npm:** ambiente de desenvolvimento.
- **esbuild:** gera o arquivo `assets/js/app.js` usado pelo navegador.
- **Node.js Test Runner e Playwright:** testes automatizados e de navegação.
- **Prettier:** padronização do código.
- **Git e GitHub:** versionamento, Issues, branches e Pull Requests.

A aplicação não usa framework de frontend nem serviço de backend nesta etapa.

## 🏗️ Estrutura do projeto

```text
Ordavik/
├── index.html                # Interface das cinco áreas
├── assets/
│   ├── css/                 # Componentes, temas e responsividade
│   ├── icons/ordavik.svg    # Símbolo e favicon
│   └── js/app.js            # Bundle gerado para o navegador
├── src/js/
│   ├── app.js               # Inicialização, navegação e estado compartilhado
│   ├── data.js              # Persistência, normalização, datas e feriados
│   ├── tasks.js             # Tarefas e formulários
│   ├── task-rules.js        # Modelos, filtros, ordenação e recorrência
│   ├── work.js              # Clientes, demandas e área Trabalho
│   ├── work-rules.js        # Regras e vínculos da área Trabalho
│   ├── agenda.js            # Compromissos e datas especiais
│   ├── calendar.js          # Calendário mensal
│   ├── events.js            # Integração de eventos e tarefas
│   ├── backup.js            # Exportação e restauração
│   ├── ui.js                # Componentes e mensagens
│   └── config.js            # Identidade da marca
├── scripts/                 # Build, servidor e verificações
├── tests/                   # Testes unitários e de navegador
├── docs/                    # Guias, arquitetura, mudanças e roadmap
├── GUIA_DE_ESTUDOS.md       # Registro histórico de conceitos da Sprint 03
├── package.json
└── README.md
```

**Importante:** edite o código em `src/js/`, não diretamente em `assets/js/app.js`. Depois de alterar os módulos, execute `npm run build` e inclua o bundle atualizado no commit.

## 🧪 Desenvolvimento e qualidade

```powershell
npm ci                 # Instala as dependências do projeto
npm run build          # Gera o JavaScript usado pelo navegador
npm run check          # Verifica a sintaxe dos arquivos JavaScript
npm test               # Executa os testes unitários
npm run format:check   # Confere a formatação
npm run test:browser   # Executa o build e os testes de navegação
```

A suíte atual contém **18 testes unitários**, que cobrem, entre outros pontos, compatibilidade de tarefas antigas, regras de status, recorrência, filtros, vínculos entre entidades e validação de backups. Os testes de navegador utilizam Playwright e **Google Chrome instalado**; devem ser executados antes de integrar alterações relevantes.

O projeto segue o fluxo **Issue → Branch → Desenvolvimento → Testes → Commit → Pull Request → Revisão → Merge**.

## 💾 Persistência, backup e migração

O Ordavik armazena as coleções diretamente no navegador e mantém as chaves legadas `taskflow-tasks`, `taskflow-meetings`, `taskflow-celebrations` e `taskflow-theme` para evitar a perda de dados na mudança de nome. Clientes e demandas usam `ordavik-clients` e `ordavik-demands`.

O backup atual utiliza o **formato versão 2**, que inclui clientes e demandas. Backups versão 1 podem ser importados, mas **restaurar substitui os dados atuais**, em vez de combiná-los. Exporte uma cópia antes de fazer restaurações ou migrar para outro navegador/endereço.

Consulte [Arquitetura](docs/ARQUITETURA.md) e [Guia de uso](docs/GUIA_DE_USO.md) para detalhes de relações, segurança e recuperação de dados.

## 📚 Documentação e evolução

- 📖 [Índice da documentação](docs/README.md)
- 🧭 [Guia de uso](docs/GUIA_DE_USO.md)
- 🧩 [Estrutura e responsabilidades dos arquivos](docs/ESTRUTURA.md)
- 🏛️ [Arquitetura técnica](docs/ARQUITETURA.md)
- 📝 [Histórico de alterações](docs/ALTERACOES.md)
- 🗺️ [Roadmap](docs/ROADMAP.md)
- 🎓 [Guia de estudos: fundamentos e Sprint 03](GUIA_DE_ESTUDOS.md)

**Próximos passos:** ampliar testes de acessibilidade, aprimorar a visão semanal e os relatórios, explorar instalação PWA e validar a utilidade da aplicação com usuários antes de considerar autenticação, sincronização e recursos comerciais. O roadmap registra possibilidades, não funcionalidades já entregues.

## 👨‍💻 Desenvolvimento

Projeto desenvolvido por [Fabio Martins Forgioni](https://github.com/fabiomartinsforgioni) como parte da jornada de aprendizagem em **Engenharia de Software**, com foco em prática real, organização do código, testes, documentação e evolução incremental.

**Ordavik v0.6.0** · *Clareza para o próximo passo.*
