# Documentação do Ordavik

O Ordavik organiza tarefas pessoais, estudos e trabalho em HTML, CSS e JavaScript, com dados locais ao navegador. Esta documentação acompanha a versão 0.6.0.

## Por onde começar

| Documento                                                   | Quando consultar                                                        |
| ----------------------------------------------------------- | ----------------------------------------------------------------------- |
| [README principal](../README.md)                            | Executar o projeto, consultar recursos e comandos.                      |
| [Guia de uso](GUIA_DE_USO.md)                               | Entender as telas e organizar clientes, demandas e tarefas.             |
| [Estrutura de pastas e arquivos](ESTRUTURA.md)              | Descobrir o que faz cada arquivo e onde implementar uma mudança.        |
| [Arquitetura](ARQUITETURA.md)                               | Entender estado, dados, fluxo de execução, persistência e backups.      |
| [Alterações](ALTERACOES.md)                                 | Consultar mudanças entregues e limitações.                              |
| [Roadmap](ROADMAP.md)                                       | Ver ideias futuras, sem confundi-las com funções já disponíveis.        |
| [Plano da área Trabalho](plans/2026-10-23-area-trabalho.md) | Consultar escopo e decisões desta implementação.                        |
| [Plano da evolução inicial](plans/2026-10-23-evolucao.md)   | Consultar o contexto da organização do código e da correção dos botões. |

## Convenções

- Exemplos de tarefas e chamados são ilustrativos; o aplicativo não cria demandas de demonstração no perfil do usuário.
- Arquivos em `src/js` são os fontes. `assets/js/app.js` é gerado: depois de editar JavaScript, execute `npm run build`.
- Armazenamento local não sincroniza dispositivos. Exportação/restauração serve para copiar ou recuperar os dados.
- Arquivar preserva registros e vínculos; não significa excluir ou concluir as tarefas.
