# Alterações

## Versão 0.6.0 — área Trabalho

- Clientes com cadastro, renomeação, favoritos, arquivamento e anotações; atalhos na navegação.
- Demandas por cliente com contexto, referências, andamento direto, acompanhamento e critério de conclusão.
- Tarefas vinculadas e avulsas sem duplicar registros entre telas; seleção contextual de cliente/demanda.
- Tipos de atividade e campos Aguardando quem?/Data de acompanhamento em tarefas e demandas.
- Agenda do cliente baseada em vínculo estruturado no compromisso.
- Backup versão 2 com cinco coleções; versões antigas aceitas e referências validadas antes da gravação.
- Documentação de uso, arquitetura e responsabilidades de cada arquivo/pasta.
- Preservação de vínculos ao editar registros de clientes arquivados; limites de textos alinhados ao armazenamento e sincronização das anotações do cliente.

## Versão 0.5.0

## Ajustes de modelos e andamento

- Catálogo ampliado para 11 modelos, com tarefa simples e lembrete sem checklist obrigatório.
- Opções dos modelos geradas a partir de uma única configuração, evitando divergência entre HTML e JavaScript.
- Seletor Andamento em cada tarefa: alteração direta com histórico, conclusão e recorrência integrados. Disponível também nas tarefas do painel Hoje.
- Reabrir uma tarefa limpa a data de conclusão. A mudança direta sincroniza a situação no formulário quando a mesma tarefa está em edição.

## Problema corrigido

O HTML carregava `script.js` como módulo ES. O Chrome bloqueia importações desse tipo ao abrir a página por `file://`, interrompendo todas as interações. A falha foi reproduzida antes da alteração. Os módulos agora são empacotados como script clássico por esbuild, com o bundle incluído no projeto.

## Organização e identidade

- Nome Ordavik aprovado pelo usuário; título da aba acompanha a tela.
- Símbolo SVG local, favicon e paleta verde petróleo/azul profundo.
- Temas claro, escuro e sistema; preferência anterior preservada.
- Fontes em src/js separados por responsabilidade e estilos em assets/css.
- Alterações locais já existentes foram usadas como ponto de partida; a exclusão anterior de GUIA_DE_ESTUDOS.md foi preservada.

## Funções acrescentadas

Cadastro rápido, modelos, situações, próxima ação, subtarefas, histórico, estimativa/tempo manual, recorrência e ordenação. Exclusão de tarefas com desfazer. Painel com atividades vencidas, de hoje e aguardando retorno. Os campos e recursos de agenda/calendário trazidos nas últimas alterações foram preservados e integrados.

## Confiabilidade

- Aviso de erro de gravação fica visível separadamente das mensagens de ação.
- Coleções inválidas não são sobrescritas silenciosamente.
- Backup preserva também os valores brutos disponíveis; restauração valida todas as coleções antes de gravar.
- Falha parcial de restauração tenta recuperar os valores anteriores exatos.
- Compatibilidade com registros antigos e backups TaskFlow.
- Validação de datas e reenvio do formulário, navegação pelo calendário e inicialização por arquivo cobertos por testes.

## Limites

Os dados continuam locais. Não há conta, backend, cobrança, sincronização, envio de notificações em segundo plano, colaboração ou integrações com calendários externos. O tempo realizado é informado manualmente. A recorrência cria uma ocorrência por conclusão; não preenche automaticamente todos os períodos passados. Desfazer está disponível enquanto a mensagem da exclusão estiver aberta.
