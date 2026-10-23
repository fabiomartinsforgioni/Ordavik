# Evolução futura

## Experiência local

- Quadro por andamento e visão semanal do trabalho; as listas por cliente/demanda já estão disponíveis.
- Dependências entre tarefas e seleção de até três focos do dia.
- Resumos de tempo por cliente/demanda e modelos personalizados por cliente.
- Exportação de um texto de acompanhamento revisável pelo usuário.
- Preferências de filtros por usuário e visualização semanal.
- Exportação CSV e arquivo de calendário ICS.
- Temporizador de foco, se validado como necessidade; hoje os minutos são informados manualmente.
- Instalação PWA e estratégia offline completa para ícones/estilos externos.
- Melhorias de navegação de calendário exclusivamente por teclado e testes com leitores de tela.

## Validar o produto

Usar com profissionais que dividem demandas entre clientes e projetos. Verificar se a visão Hoje, próxima ação e situação Aguardando retorno ajudam a retomar atividades. Avaliar necessidade real antes de construir colaboração e planos pagos.

## Serviços para uma versão comercial

1. Escolher hospedagem, domínio e serviço de autenticação.
2. Criar backend e banco, autorização por usuário e organização.
3. Projetar sincronização e resolução de conflitos entre dispositivos.
4. Definir backup do servidor, recuperação, monitoramento e política de dados.
5. Implementar times, permissões e histórico compartilhado quando necessários.
6. Definir planos e integrar cobrança em ambiente de testes antes da publicação.

## Marca, repositório e publicação

Nome do projeto: **Ordavik**. O repositório foi renomeado e está disponível em [fabiomartinsforgioni/Ordavik](https://github.com/fabiomartinsforgioni/Ordavik), com o histórico anterior do TaskFlow preservado.

A verificação de disponibilidade de marca, domínio e perfis públicos ainda é necessária antes de uso comercial. O código está no GitHub, mas a disponibilização da aplicação como site publicado (por exemplo, GitHub Pages) permanece uma etapa futura.

**Cuidado na publicação:** `localStorage` depende do endereço/origem. Antes de mudar de endereço, exporte um backup na origem antiga e restaure-o na nova.
