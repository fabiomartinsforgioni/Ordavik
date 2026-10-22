# ✅ TaskFlow

Gerenciador de tarefas desenvolvido para praticar **HTML, CSS, JavaScript, Bootstrap, Git e GitHub**.

## 🚀 Tecnologias

- HTML5 e CSS3
- JavaScript (DOM, eventos e funções)
- Bootstrap 5 e Bootstrap Icons (carregados por CDN)
- Git e GitHub

## ⚙️ Funcionalidades implementadas

- [x] Cadastro de tarefas
- [x] Marcar e desmarcar tarefas como concluídas
- [x] Excluir tarefas individualmente, atualizando filtros e indicadores
- [x] Persistir tarefas e seus estados no `localStorage`
- [x] Layout responsivo com navegação lateral
- [x] Tela **Início** com total, pendentes, concluídas e barra de progresso
- [x] Tela **Minhas tarefas** com filtros **Todas**, **Pendentes** e **Concluídas**
- [x] Alternância entre tema claro e escuro com preferência salva no `localStorage`
- [x] Estados vazios e melhorias de contraste e acessibilidade

## 🧭 Próximas funcionalidades

- [ ] Edição de tarefas
- [ ] Categorias e prioridades
- [ ] Dashboard de produtividade avançado
- [ ] Quadro Kanban

> **Atenção:** tarefas e preferência de tema ficam no `localStorage` deste navegador, sem sincronização entre dispositivos. Se o armazenamento estiver indisponível, o TaskFlow ainda funciona durante a sessão, mas não consegue preservar as tarefas.

## 📁 Estrutura

```text
TaskFlow/
├── index.html
├── style.css
├── script.js
└── README.md
```

## 💻 Como executar

1. Clone ou baixe o repositório.
2. Abra o projeto no VS Code.
3. Execute `index.html` em um navegador com acesso à internet para carregar Bootstrap via CDN.
4. Navegue entre **Início** e **Minhas tarefas**, adicione tarefas, altere seu status e experimente os filtros e o tema.

## 🧪 Testes manuais sugeridos

1. Adicione duas tarefas. O dashboard deve mostrar **2 no total** e **2 pendentes**.
2. Conclua uma delas. Os indicadores devem mostrar **1 pendente** e **1 concluída**, com **50%** de progresso.
3. Confira os filtros **Todas**, **Pendentes** e **Concluídas**.
4. Com o filtro **Concluídas** ativo, volte a tarefa para pendente: ela deve desaparecer desse filtro.
5. Exclua uma tarefa concluída e confira os indicadores, filtros e estado vazio.
6. Atualize a página e confira se as tarefas restantes e seus estados continuam salvos.
7. Exclua uma tarefa, atualize a página e confira se ela não retorna.
8. Alterne os temas e atualize a página: o tema também deve permanecer salvo.
9. Teste a navegação e os filtros pelo teclado, e o layout em janela estreita.

## 📈 Metodologia

O projeto é desenvolvido incrementalmente, utilizando o fluxo:

**Issue → Branch → Desenvolvimento → Testes → Commit → Push → Pull Request → Revisão → Merge.**

Cada sprint também alimenta um guia de estudos com os conceitos e boas práticas aprendidos.
