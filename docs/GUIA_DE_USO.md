# Guia de uso

## Início / Hoje

Mostra indicadores gerais, programação do dia e tarefas que precisam de atenção: atrasadas, para hoje, aguardando retorno ou com acompanhamento marcado para hoje ou antes. São os mesmos registros exibidos em Minhas tarefas e Trabalho.

## Minhas tarefas

Digite um título e adicione, ou selecione um dos 11 modelos. Detalhes, planejamento e etapas são opcionais. Cada tarefa pode ter natureza, prioridade, descrição, etiquetas, referência livre, início, prazo, horário, próxima ação, checklist, histórico e minutos estimados/realizados.

Para atividades de trabalho, selecione **Cliente cadastrado** e, se houver, **Demanda**. A lista de demandas acompanha o cliente escolhido. Ao mudar de cliente, a demanda é limpa para evitar associações erradas. Uma tarefa vinculada a cliente é classificada como Trabalho.

O campo **Projeto / referência livre** mantém textos das versões antigas. Ele não cria um cliente automaticamente. Para organizar tarefas antigas na área de um cliente, edite e selecione o cadastro correspondente.

O seletor **Andamento** na própria tarefa permite alternar Pendente, Em andamento, Aguardando retorno e Concluída. A mudança salva os dados e atualiza indicadores, filtros e histórico. Se a tarefa deixar de corresponder ao filtro atual, ela sai daquela lista, mas permanece cadastrada.

Concluir uma tarefa recorrente cria a próxima ocorrência. Reabrir e concluir a mesma ocorrência não gera outra duplicata. Subtarefas preservam a conclusão ao serem reordenadas ou receberem novas linhas. Desfazer exclusão fica disponível enquanto a mensagem daquela exclusão estiver aberta.

## Trabalho: cliente → demanda → tarefa

### Clientes

Na primeira utilização sem cadastro de clientes, aparecem Mazer, Manuchar e Demandas internas. São sugestões editáveis; nenhuma demanda ou tarefa real é criada automaticamente.

Use **Adicionar cliente** para cadastrar outros contextos. Selecione o cliente no conjunto de botões da tela ou nos atalhos laterais. **Visão geral** reúne todas as tarefas classificadas como trabalho ou vinculadas a um cliente, inclusive atividades antigas ainda sem vínculo estruturado.

- **Editar cliente:** altera nome e anotações gerais.
- **Favoritar:** posiciona o cliente antes dos demais.
- **Arquivar cliente:** preserva tarefas, demandas, compromissos e histórico, retirando o cliente da navegação habitual. O cliente atualmente selecionado permanece acessível.
- **Mostrar arquivados:** permite localizar e reativar cadastros arquivados.

Renomear não rompe vínculos. Não há exclusão de cliente em cascata.

### Resumo

Apresenta indicadores de tarefas pendentes, em espera, vencidas e concluídas. “Acompanhar agora” considera tarefas e demandas abertas com acompanhamento para hoje ou antes. As listas abaixo destacam tarefas aguardando, vencidas ou com acompanhamento, e demandas aguardando retorno ou com acompanhamento marcado.

O prazo da demanda e o de cada tarefa são independentes. Os indicadores de tarefas vencidas usam o prazo da tarefa, não o da demanda.

### Demandas

Uma demanda representa um problema ou resultado a entregar. Exemplo hipotético: cliente Mazer, demanda “Revisar uma integração”, chamado “CH-123”.

Campos disponíveis: título, chamado/referência, andamento, prioridade, prazo, pessoa/área aguardada, acompanhamento, ambiente/sistema, objetivo, comportamento atual, resultado esperado, evidências/referências, próxima ação, critério de conclusão e histórico/anotações.

O editor informa os limites dos campos pelo comportamento normal dos controles: textos de contexto e anotações de demanda aceitam até 2.000 caracteres por campo; anotações gerais do cliente aceitam 5.000.

Em cada demanda:

- **Ver tarefas:** abre a lista daquele cliente filtrada pela demanda.
- **Adicionar tarefa:** abre o cadastro com cliente e demanda preenchidos.
- **Editar demanda:** modifica os detalhes; o cliente da demanda permanece fixo para proteger vínculos de tarefas existentes.
- **Arquivar demanda:** preserva o registro; use Mostrar arquivados para reativar.
- **Andamento:** altera a situação da demanda diretamente no cartão.

Concluir uma demanda não conclui suas tarefas automaticamente. Essa separação permite registrar a situação da entrega sem alterar atividades silenciosamente.

### Tarefas e atividades avulsas

**Nova tarefa de trabalho** abre o cadastro no contexto do cliente. Sem demanda selecionada, ela é avulsa. Na aba Tarefas, filtre por texto, andamento e demanda; “Tarefas avulsas” mostra as que não pertencem a uma demanda.

Tipos de atividade: atividade, suporte, investigação, correção, melhoria, reunião, documentação e rotina. São classificações, não criam eventos de agenda automaticamente.

O andamento, a edição e a exclusão usam os mesmos controles de Minhas tarefas. Alterações aparecem também na visão geral e no painel Hoje.

### Aguardando quem? e acompanhamento

“Aguardando quem?” identifica a pessoa, área ou retorno necessário. A data de acompanhamento indica quando consultar ou cobrar, não quando entregar.

Exemplo: prazo final na sexta, acompanhamento na terça para consultar o resultado de um teste. A tarefa pode estar Aguardando retorno e manter como próxima ação “Conferir o resultado enviado”. Esses campos também existem em demandas.

Os destaques são visuais dentro do aplicativo. Não há envio automático de e-mails, notificações ou cobranças.

### Agenda do cliente

Mostra compromissos associados pelo campo Cliente cadastrado da Agenda. Textos antigos no campo Cliente / Projeto não criam esse vínculo automaticamente. Para associar um compromisso antigo, edite-o e selecione o cliente.

### Anotações

Registre informações gerais e use **Salvar anotações**. São as mesmas anotações acessíveis em Editar cliente. O editor acompanha mudanças salvas sem substituir um texto que esteja sendo efetivamente modificado na aba. Salve antes de sair do contexto ou recarregar a página.

## Agenda e calendário

Cadastre compromissos com data, início e término. O término deve ser posterior ao início no mesmo dia. Links HTTP/HTTPS podem ser abertos com segurança pelo controle de reunião. Aniversários e datas especiais se repetem anualmente.

O calendário reúne prazos de tarefas, compromissos, datas especiais e feriados de referência. Selecionar um dia mostra seus eventos. “Novo compromisso nesta data” preenche a data no formulário da Agenda. A data de acompanhamento aparece nos painéis de atenção; não é criada como compromisso no calendário.

## Backup e Restaurar

**Backup** baixa um JSON com tarefas, compromissos, datas especiais, clientes e demandas. Inclui uma cópia dos valores locais disponíveis para recuperação técnica. Não apaga registros e não envia o arquivo para uma nuvem.

**Restaurar** valida o arquivo, pede confirmação e substitui todas as coleções locais pelos dados daquela cópia. Não mescla registros. Antes de restaurar, exporte os dados atuais.

O formato atual é versão 2. Cópias versão 1 de TaskFlow/Ordavik são aceitas; como não possuem clientes e demandas, essas coleções ficam vazias após a restauração. Referências inexistentes ou incompatíveis são recusadas antes da gravação.

O arquivo pode ter até 5 MB, com até 5.000 registros por coleção. Falhas de gravação geram aviso persistente. Caso já existam dados locais inválidos, os originais não são sobrescritos silenciosamente; exporte uma cópia para recuperação.

## Tema e endereço

O botão de tema alterna Sistema, Claro e Escuro. O tema fica salvo naquele navegador/endereço. Ele não é restaurado automaticamente pelo backup de cadastros.

Arquivos locais, localhost, portas e domínios diferentes podem apresentar coleções diferentes. Para mudar de endereço, exporte no antigo e restaure no novo. Não há conta, sincronização entre dispositivos ou colaboração nesta versão.
