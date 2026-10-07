# TaskFlow — Sistema Gerenciador de Tarefas

Protótipo front-end de um gerenciador de tarefas, desenvolvido como projeto final dos módulos de **HTML5/CSS3** e **JavaScript Moderno (ES6+)** do curso de Programador Web da ETG (Escola Técnica do Guará).

🔗 **Demo:** https://philodu.github.io/ProjetoFinalM-dulo2-ETG/
(tela inicial: `index.html`)

## Sobre o projeto

O TaskFlow cobre o fluxo completo de autenticação (login e cadastro) e a gestão visual de tarefas — dashboard com filtros, criação, edição, detalhes e exclusão — sem depender de servidor ou banco de dados. A sessão do usuário e as tarefas são persistidas no `localStorage` do navegador.

## Funcionalidades

- **Autenticação:** login e cadastro com validação de formulário (nome completo, e-mail `.com`/`.com.br`, senha mínima de 8 caracteres).
- **Dashboard:** listagem de tarefas com filtros por status e prioridade, e resumo numérico.
- **CRUD de tarefas:** criar, editar, ver detalhes e excluir, com validação de campos (título ≥ 5 caracteres; descrição opcional, ≥ 3 caracteres se preenchida).
- **Notificações:** mensagens de sucesso/erro (toast) para toda inclusão, alteração ou exclusão de tarefa.
- **Responsivo e acessível:** layout mobile-first (Flexbox/Grid), menu hambúrguer, navegação por teclado, contraste de cores validado (WCAG 2.1 AA).

## Tecnologias

HTML5 semântico · CSS3 (variáveis, Flexbox, Grid) · JavaScript ES6+ (sem frameworks) · `localStorage`/`sessionStorage` para persistência local.

## Estrutura

```
*.html (raiz)   → index (cadastro), login, dashboard, detalhes, criar e editar tarefa
Estilos/        → stylesBase.css (folha de estilos única do projeto)
Scripts/        → app.js (lógica compartilhada por todas as páginas)
Documentação/   → documentação técnica, evidências de acessibilidade/testes
Instruções/     → diretrizes do projeto
```

## Como rodar localmente

Projeto 100% estático — basta abrir `index.html` direto no navegador, ou servir a pasta com qualquer servidor local, por exemplo:

```bash
php -S localhost:8000
```

## Documentação

A documentação técnica completa (arquitetura, requisitos, acessibilidade, testes e changelog) está em [`Documentação/Documentação_Projeto_TaskFlow.docx`](Documentação/Documentação_Projeto_TaskFlow.docx).
