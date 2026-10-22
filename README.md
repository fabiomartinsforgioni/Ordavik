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
- [x] Layout responsivo com navegação lateral
- [x] Tela **Início** com total, pendentes, concluídas e barra de progresso
- [x] Tela **Minhas tarefas** com filtros **Todas**, **Pendentes** e **Concluídas**
- [x] Alternância entre tema claro e escuro com preferência salva no `localStorage`
- [x] Estados vazios e melhorias de contraste e acessibilidade

## 🧭 Próximas funcionalidades

- [ ] Exclusão de tarefas
- [ ] Persistência das tarefas no `localStorage`
- [ ] Edição de tarefas
- [ ] Categorias e prioridades
- [ ] Dashboard de produtividade avançado
- [ ] Quadro Kanban

> **Atenção:** por enquanto, apenas a preferência de tema é armazenada. As tarefas são mantidas em memória e desaparecem ao atualizar a página.

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
5. Alterne os temas e atualize a página: o tema deve permanecer salvo.
6. Teste a navegação e os filtros pelo teclado, e o layout em janela estreita.

## 📈 Metodologia

O projeto é desenvolvido incrementalmente, utilizando o fluxo:

**Issue → Branch → Desenvolvimento → Testes → Commit → Push → Pull Request → Revisão → Merge.**

Cada sprint também alimenta um guia de estudos com os conceitos e boas práticas aprendidos.
