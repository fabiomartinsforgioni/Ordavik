# ✅ TaskFlow

Aplicação de gerenciamento de tarefas construída como projeto de aprendizado em **Engenharia de Software**. O código foi organizado e comentado para facilitar revisões de HTML, CSS, JavaScript e Git.

## 🚀 Tecnologias

- **HTML5:** estrutura semântica e formulários acessíveis.
- **CSS3:** componentes, Flexbox, Grid, responsividade e temas.
- **JavaScript:** DOM, eventos, objetos, arrays, funções e `localStorage`.
- **Bootstrap 5 e Bootstrap Icons:** carregados por CDN.
- **Git e GitHub:** Issues, branches, commits e Pull Requests.

## ✅ Funcionalidades

- Cadastrar tarefas com **prioridade Baixa, Média ou Alta**.
- Exibir indicadores de prioridade nos temas claro e escuro.
- Editar descrição **e** prioridade de tarefas já existentes.
- Salvar ou cancelar edições; usar **Enter** para salvar e **Esc** para cancelar.
- Marcar/desmarcar tarefas como concluídas e excluir tarefas.
- Filtrar por **Todas, Pendentes ou Concluídas**.
- Exibir dashboard com quantidade de tarefas e progresso.
- Preservar tarefas, status, prioridades e tema ao atualizar a página usando `localStorage`.
- Tratar tarefas anteriores à inclusão das prioridades, adotando **Média** por padrão.
- Navegar entre Início e Minhas tarefas em layout responsivo.

> **Atenção:** `localStorage` é local a cada navegador/origem. O TaskFlow não sincroniza dados entre dispositivos. Se o armazenamento estiver bloqueado, o aplicativo funciona enquanto a página permanecer aberta, mas não salva as alterações.

## 📁 Arquivos

```text
TaskFlow/
├── index.html           # Estrutura visual e formulários
├── style.css            # Temas e estilos responsivos
├── script.js            # Regras e interações das tarefas
├── README.md            # Documentação do projeto
└── GUIA_DE_ESTUDOS.md   # Explicação dos conceitos da Sprint 03
```

## 💻 Como executar

1. Abra a pasta do projeto no VS Code.
2. Abra `index.html` no navegador, preferencialmente usando a extensão **Live Server**.
3. Mantenha a conexão com a internet para carregar o Bootstrap e seus ícones.
4. Clique em **Minhas tarefas** e experimente o cadastro, a edição, os filtros e o tema.

Não é necessário instalar bibliotecas ou executar `npm install` nesta etapa.

## 🧪 Testes manuais da Sprint 03

| Cenário | Resultado esperado |
| --- | --- |
| Criar uma tarefa com prioridade Alta | Etiqueta vermelha e prioridade salva |
| Criar tarefas Baixa e Média | Etiquetas azul e amarela |
| Recarregar a página | Tarefas e prioridades permanecem |
| Editar descrição e prioridade | Ambos os valores são atualizados |
| Cancelar a edição | Nenhuma alteração é aplicada |
| Salvar descrição contendo apenas espaços | Validação impede salvar |
| Pressionar Enter durante a edição | Salva, caso o texto seja válido |
| Pressionar Esc durante a edição | Cancela, mesmo com foco na prioridade |
| Concluir uma tarefa e editar sua prioridade | Continua concluída |
| Excluir uma tarefa | Só a selecionada desaparece; indicadores atualizam |
| Usar filtros e alternar tema | Lista e cores continuam coerentes |
| Abrir em largura de celular | Formulário e edição cabem na tela |
| Carregar tarefa antiga sem `priority` | Ela recebe prioridade Média |

### Conferência pelo navegador

Abra as ferramentas de desenvolvedor (`F12`) e consulte o Console:

```javascript
JSON.parse(localStorage.getItem("taskflow-tasks"))
```

Cada tarefa deve possuir `id`, `description`, `completed` e `priority`.

## 🔧 Boas práticas aplicadas

- Separação do código por responsabilidades, com documentação de funções.
- Nomes descritivos para variáveis, constantes e funções.
- Remoção de CSS duplicado e organização por componentes.
- Uso de `textContent` para inserir descrições com segurança.
- Verificação dos dados salvos antes de construir a interface.
- Reutilização de funções de atualização de etiquetas e indicadores.
- Acessibilidade com `aria-label`, foco por teclado e estados visíveis.
- Estilos responsivos sem adicionar dependências.

## 🧭 Fluxo de trabalho

**Issue → Branch → Desenvolvimento → Testes → Commit → Push → Pull Request → Revisão → Merge.**

Esta versão revisada foi preparada **antes do commit**. Os arquivos devem ser testados no ambiente local e conferidos com `git diff` antes de qualquer publicação.

## 📚 Material complementar

Veja o arquivo [`GUIA_DE_ESTUDOS.md`](GUIA_DE_ESTUDOS.md) para entender as principais funções, métodos e decisões técnicas utilizadas nesta sprint.
