# Área Trabalho — plano de implementação

## Objetivo e escopo aprovado

Organizar clientes, demandas e tarefas avulsas em uma nova área Trabalho. Permitir cadastro, edição, arquivamento e favoritos de clientes; demandas com contexto, situação e critério de conclusão; relação das tarefas por IDs; acompanhamento de retornos independente do prazo. Preservar navegação geral, andamento direto e dados existentes. Documentar pastas, arquivos, fluxos e compatibilidade.

## Arquitetura e arquivos

- src/js/work-rules.js: normalização de clientes/demandas, vínculos e resumos testáveis.
- src/js/work.js: interface de clientes, demandas, tarefas, agenda e anotações.
- src/js/data.js: campos opcionais de trabalho nas tarefas e vínculo de cliente em compromissos.
- src/js/tasks.js e agenda.js: seleção de cliente e demanda, criação contextual e acompanhamento.
- src/js/app.js: estado compartilhado e navegação Trabalho.
- src/js/backup.js: versão 2 com clientes/demandas, leitura da versão 1 e validação de vínculos antes de restaurar.
- index.html e assets/css: novos formulários, navegação e layout responsivo.
- tests/: regras de vínculo, migração de backups e fluxo real de trabalho.
- README.md e docs/: guia de uso, mapa de arquivos e arquitetura.

## Etapas de execução

1. Escrever e observar falhas dos testes de normalização, vínculos, backup e indicadores.
2. Implementar regras e ampliar a persistência mantendo chaves antigas.
3. Criar a área Trabalho e integrar tarefas/agenda sem duplicar registros.
4. Atualizar backups e validar referências antes de qualquer gravação.
5. Exercitar CRUD, arquivamento, tarefas avulsas, acompanhamento e recarga no Chrome.
6. Atualizar documentação, gerar bundle, executar testes, sintaxe e formatação; revisar código.

## Decisões

- Cliente e demanda usam IDs estáveis, permitindo renomear sem perder vínculos.
- Cliente arquivado permanece nos dados e no backup; tarefas continuam visíveis na visão geral.
- Campos antigos project permanecem disponíveis como referência livre, sem inferir relações automaticamente.
- Sem exclusão em cascata. Demandas podem ser arquivadas; encerrar demanda não conclui tarefas silenciosamente.
- Mazer, Manuchar e Demandas internas são sugestões iniciais somente em uma instalação sem cadastro de clientes.
- Nenhum dado demonstrativo de tarefas ou demandas será criado no perfil do usuário.
