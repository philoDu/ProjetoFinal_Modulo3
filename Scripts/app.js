/* ==========================================================================
   TaskFlow — script único compartilhado por todas as páginas.
   Sem backend: usa localStorage para simular sessão (nome do usuário) e
   persistência das tarefas entre Dashboard, Detalhes, Criar e Editar.
   ========================================================================== */

const STORAGE_KEYS = {
  tarefas: "taskflow.tarefas",
  usuario: "taskflow.usuarioNome",
  flash: "taskflow.flash",
};

const TAREFAS_EXEMPLO = [
  {
    id: "t1",
    titulo: "Revisar wireframes do Dashboard",
    descricao:
      "Conferir o layout em Figma com o time de design e validar os breakpoints mobile e desktop antes da implementação final.",
    prazo: "2026-09-20",
    prioridade: "alta",
    status: "andamento",
    categoria: "Design",
  },
  {
    id: "t2",
    titulo: "Escrever testes de acessibilidade",
    descricao:
      "Rodar Lighthouse e axe em todas as páginas, registrar contraste de cores e navegação por teclado na documentação.",
    prazo: "2026-09-25",
    prioridade: "media",
    status: "pendente",
    categoria: "Qualidade",
  },
  {
    id: "t3",
    titulo: "Configurar repositório no GitHub",
    descricao: "Criar o repositório, definir a branch main e organizar as pastas do projeto.",
    prazo: "2026-09-10",
    prioridade: "baixa",
    status: "concluida",
    categoria: "Organização",
  },
  {
    id: "t4",
    titulo: "Aplicar menu hambúrguer responsivo",
    descricao: "Implementar o menu de navegação mobile com botão acessível e aria-expanded.",
    prazo: "2026-09-22",
    prioridade: "media",
    status: "pendente",
    categoria: "Front-end",
  },
];

const RESUMO_LABELS = {
  pendente: "Pendentes",
  andamento: "Em andamento",
  concluida: "Concluídas",
};

/* ---------------- Helpers de armazenamento ---------------- */

function lerTarefas() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.tarefas);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.tarefas, JSON.stringify(TAREFAS_EXEMPLO));
      return [...TAREFAS_EXEMPLO];
    }
    return JSON.parse(raw);
  } catch (erro) {
    return [...TAREFAS_EXEMPLO];
  }
}

function salvarTarefas(lista) {
  try {
    localStorage.setItem(STORAGE_KEYS.tarefas, JSON.stringify(lista));
    return true;
  } catch (erro) {
    return false;
  }
}

function buscarTarefaPorId(id) {
  return lerTarefas().find((tarefa) => tarefa.id === id);
}

function obterUsuarioNome() {
  return localStorage.getItem(STORAGE_KEYS.usuario);
}

function definirUsuarioNome(nome) {
  localStorage.setItem(STORAGE_KEYS.usuario, nome);
}

function encerrarSessao() {
  localStorage.removeItem(STORAGE_KEYS.usuario);
}

function gerarId() {
  return "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function formatarData(isoDate) {
  if (!isoDate) return "Sem prazo definido";
  const [ano, mes, dia] = isoDate.split("-");
  if (!ano || !mes || !dia) return isoDate;
  return `${dia}/${mes}/${ano}`;
}

const LABELS_PRIORIDADE = { baixa: "Baixa", media: "Média", alta: "Alta" };
const LABELS_STATUS = { pendente: "Pendente", andamento: "Em andamento", concluida: "Concluída" };

/* ---------------- Notificações (toast) ---------------- */

function obterContainerNotificacoes() {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "true");
    document.body.appendChild(container);
  }
  return container;
}

function mostrarNotificacao(mensagem, tipo = "success") {
  const container = obterContainerNotificacoes();
  const toast = document.createElement("div");
  toast.className = `toast toast-${tipo}`;
  toast.setAttribute("role", tipo === "error" ? "alert" : "status");
  toast.textContent = mensagem;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.setAttribute("data-visible", "true"));

  setTimeout(() => {
    toast.setAttribute("data-visible", "false");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, 3500);
}

function definirNotificacaoFlash(mensagem, tipo = "success") {
  try {
    sessionStorage.setItem(STORAGE_KEYS.flash, JSON.stringify({ mensagem, tipo }));
  } catch (erro) {
    /* sessionStorage indisponível: a notificação não sobrevive ao redirecionamento */
  }
}

function exibirNotificacaoFlashPendente() {
  let bruto;
  try {
    bruto = sessionStorage.getItem(STORAGE_KEYS.flash);
    if (bruto) sessionStorage.removeItem(STORAGE_KEYS.flash);
  } catch (erro) {
    return;
  }
  if (!bruto) return;
  try {
    const { mensagem, tipo } = JSON.parse(bruto);
    mostrarNotificacao(mensagem, tipo);
  } catch (erro) {
    /* flash corrompido: ignora */
  }
}

/* ---------------- Cabeçalho: menu, saudação e saída ---------------- */

function iniciarNavegacao() {
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const aberto = menu.getAttribute("data-open") === "true";
      menu.setAttribute("data-open", String(!aberto));
      toggle.setAttribute("aria-expanded", String(!aberto));
    });
  }

  const nomeEl = document.getElementById("navUserName");
  if (nomeEl) {
    const nome = obterUsuarioNome();
    nomeEl.textContent = nome ? `Olá, ${nome}` : "Olá, visitante";
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      encerrarSessao();
    });
  }
}

/* ---------------- Validação simples de formulário ---------------- */

function aplicarValidacaoMinlength(campo) {
  // Alguns navegadores não aplicam o constraint nativo de minlength em <textarea>;
  // reforça a regra manualmente via Constraint Validation API para funcionar em todos.
  const minimo = campo.minLength;
  if (minimo > 0 && campo.value.length > 0 && campo.value.length < minimo) {
    campo.setCustomValidity(`Deve ter pelo menos ${minimo} caracteres.`);
  } else {
    campo.setCustomValidity("");
  }
}

function marcarCampoComoTocado(campo) {
  campo.setAttribute("data-touched", "true");
  aplicarValidacaoMinlength(campo);
  const wrapper = campo.closest(".field");
  if (wrapper) {
    wrapper.classList.toggle("field--error", !campo.checkValidity());
  }
}

function validarFormulario(form, statusEl) {
  let valido = true;
  form.querySelectorAll("input, select, textarea").forEach((campo) => {
    marcarCampoComoTocado(campo);
    if (!campo.checkValidity()) valido = false;
  });

  if (!valido && statusEl) {
    statusEl.textContent = "Verifique os campos destacados antes de continuar.";
    statusEl.className = "form-status form-status--error";
  }

  return valido;
}

/* ---------------- Página: Login ---------------- */

function iniciarPaginaLogin() {
  const form = document.getElementById("formLogin");
  if (!form) return;
  const statusEl = document.getElementById("loginStatus");

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!validarFormulario(form, statusEl)) return;

    const email = form.email.value.trim();
    if (!obterUsuarioNome()) {
      const nomeDerivado = email
        .split("@")[0]
        .replace(/[._-]+/g, " ")
        .split(" ")
        .filter(Boolean)
        .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
        .join(" ");
      definirUsuarioNome(nomeDerivado);
    }

    statusEl.textContent = "Login realizado! Redirecionando para o seu dashboard...";
    statusEl.className = "form-status form-status--success";
    setTimeout(() => {
      window.location.href = "dashboardTarefas.html";
    }, 600);
  });
}

/* ---------------- Página: Cadastro ---------------- */

function iniciarPaginaCadastro() {
  const form = document.getElementById("formCadastro");
  if (!form) return;
  const statusEl = document.getElementById("cadastroStatus");

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!validarFormulario(form, statusEl)) return;

    if (form.senha.value !== form.confirmarSenha.value) {
      statusEl.textContent = "As senhas informadas não coincidem.";
      statusEl.className = "form-status form-status--error";
      form.confirmarSenha.closest(".field").classList.add("field--error");
      return;
    }

    definirUsuarioNome(form.nome.value.trim());
    statusEl.textContent = "Conta criada com sucesso! Redirecionando...";
    statusEl.className = "form-status form-status--success";
    setTimeout(() => {
      window.location.href = "dashboardTarefas.html";
    }, 600);
  });
}

/* ---------------- Página: Dashboard ---------------- */

function criarCardTarefa(tarefa) {
  const li = document.createElement("li");
  li.className = "task-card";
  li.innerHTML = `
    <div class="task-card-top">
      <h3><a href="detalhesTarefas.html?id=${tarefa.id}">${tarefa.titulo}</a></h3>
      <span class="badge badge-prioridade-${tarefa.prioridade}">${LABELS_PRIORIDADE[tarefa.prioridade]}</span>
    </div>
    <p>${tarefa.descricao}</p>
    <div class="task-meta">
      <span class="badge badge-categoria">${tarefa.categoria}</span>
      <span class="badge badge-status-${tarefa.status}">${LABELS_STATUS[tarefa.status]}</span>
      <span>Prazo: ${formatarData(tarefa.prazo)}</span>
    </div>
    <div class="task-card-actions">
      <a class="btn btn-secondary btn-sm" href="detalhesTarefas.html?id=${tarefa.id}">Ver detalhes</a>
      <a class="btn btn-secondary btn-sm" href="editarTarefa.html?id=${tarefa.id}">Editar</a>
      <button type="button" class="btn btn-danger btn-sm" data-excluir="${tarefa.id}">Excluir</button>
    </div>
  `;
  return li;
}

function iniciarPaginaDashboard() {
  const lista = document.getElementById("listaTarefas");
  if (!lista) return;

  const vazio = document.getElementById("estadoVazio");
  const filtroStatus = document.getElementById("filtroStatus");
  const filtroPrioridade = document.getElementById("filtroPrioridade");
  const resumo = {
    pendente: document.getElementById("resumoPendente"),
    andamento: document.getElementById("resumoAndamento"),
    concluida: document.getElementById("resumoConcluida"),
    total: document.getElementById("resumoTotal"),
  };

  function atualizarResumo(tarefas) {
    if (!resumo.total) return;
    resumo.total.textContent = tarefas.length;
    ["pendente", "andamento", "concluida"].forEach((s) => {
      if (resumo[s]) resumo[s].textContent = tarefas.filter((t) => t.status === s).length;
    });
  }

  function renderizar() {
    const tarefas = lerTarefas();
    atualizarResumo(tarefas);

    const status = filtroStatus ? filtroStatus.value : "";
    const prioridade = filtroPrioridade ? filtroPrioridade.value : "";

    const filtradas = tarefas.filter(
      (t) => (!status || t.status === status) && (!prioridade || t.prioridade === prioridade)
    );

    lista.innerHTML = "";
    filtradas.forEach((tarefa) => lista.appendChild(criarCardTarefa(tarefa)));

    if (vazio) vazio.hidden = filtradas.length > 0;
  }

  lista.addEventListener("click", (evento) => {
    const botao = evento.target.closest("[data-excluir]");
    if (!botao) return;
    const id = botao.getAttribute("data-excluir");
    const confirmar = window.confirm("Tem certeza que deseja excluir esta tarefa?");
    if (!confirmar) return;

    const sucesso = salvarTarefas(lerTarefas().filter((t) => t.id !== id));
    if (!sucesso) {
      mostrarNotificacao("Não foi possível executar a ação.", "error");
      return;
    }
    mostrarNotificacao("Tarefa excluída.", "success");
    renderizar();
  });

  filtroStatus?.addEventListener("change", renderizar);
  filtroPrioridade?.addEventListener("change", renderizar);

  renderizar();
}

/* ---------------- Página: Detalhes da tarefa ---------------- */

function iniciarPaginaDetalhes() {
  const container = document.getElementById("detalheTarefa");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;

  const tarefa = buscarTarefaPorId(id);
  if (!tarefa) return;

  document.getElementById("detalheTitulo").textContent = tarefa.titulo;
  document.getElementById("detalheDescricao").textContent = tarefa.descricao;
  document.getElementById("detalhePrazo").textContent = formatarData(tarefa.prazo);
  document.getElementById("detalheCategoria").textContent = tarefa.categoria;

  const badgePrioridade = document.getElementById("detalhePrioridade");
  badgePrioridade.textContent = LABELS_PRIORIDADE[tarefa.prioridade];
  badgePrioridade.className = `badge badge-prioridade-${tarefa.prioridade}`;

  const badgeStatus = document.getElementById("detalheStatus");
  badgeStatus.textContent = LABELS_STATUS[tarefa.status];
  badgeStatus.className = `badge badge-status-${tarefa.status}`;

  const linkEditar = document.getElementById("linkEditar");
  if (linkEditar) linkEditar.href = `editarTarefa.html?id=${tarefa.id}`;

  const btnExcluir = document.getElementById("btnExcluirDetalhe");
  if (btnExcluir) {
    btnExcluir.addEventListener("click", () => {
      const confirmar = window.confirm("Tem certeza que deseja excluir esta tarefa?");
      if (!confirmar) return;

      const sucesso = salvarTarefas(lerTarefas().filter((t) => t.id !== id));
      if (!sucesso) {
        mostrarNotificacao("Não foi possível executar a ação.", "error");
        return;
      }
      definirNotificacaoFlash("Tarefa excluída.", "success");
      window.location.href = "dashboardTarefas.html";
    });
  }
}

/* ---------------- Página: Criar tarefa ---------------- */

function iniciarPaginaCriar() {
  const form = document.getElementById("formCriarTarefa");
  if (!form) return;
  const statusEl = document.getElementById("criarStatus");

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!validarFormulario(form, statusEl)) return;

    const novaTarefa = {
      id: gerarId(),
      titulo: form.titulo.value.trim(),
      descricao: form.descricao.value.trim(),
      prazo: form.prazo.value,
      prioridade: form.prioridade.value,
      status: form.status.value,
      categoria: form.categoria.value.trim() || "Geral",
    };

    const sucesso = salvarTarefas([novaTarefa, ...lerTarefas()]);
    if (!sucesso) {
      statusEl.textContent = "Não foi possível executar a ação.";
      statusEl.className = "form-status form-status--error";
      mostrarNotificacao("Não foi possível executar a ação.", "error");
      return;
    }

    statusEl.textContent = "Tarefa criada com sucesso! Redirecionando para o dashboard...";
    statusEl.className = "form-status form-status--success";
    definirNotificacaoFlash("Tarefa criada.", "success");
    setTimeout(() => {
      window.location.href = "dashboardTarefas.html";
    }, 600);
  });
}

/* ---------------- Página: Editar tarefa ---------------- */

function iniciarPaginaEditar() {
  const form = document.getElementById("formEditarTarefa");
  if (!form) return;
  const statusEl = document.getElementById("editarStatus");

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const tarefa = id ? buscarTarefaPorId(id) : null;

  if (tarefa) {
    form.titulo.value = tarefa.titulo;
    form.descricao.value = tarefa.descricao;
    form.prazo.value = tarefa.prazo;
    form.prioridade.value = tarefa.prioridade;
    form.status.value = tarefa.status;
    form.categoria.value = tarefa.categoria;
  }

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!validarFormulario(form, statusEl)) return;

    const idAtual = tarefa ? tarefa.id : gerarId();
    const tarefaAtualizada = {
      id: idAtual,
      titulo: form.titulo.value.trim(),
      descricao: form.descricao.value.trim(),
      prazo: form.prazo.value,
      prioridade: form.prioridade.value,
      status: form.status.value,
      categoria: form.categoria.value.trim() || "Geral",
    };

    const tarefas = lerTarefas();
    const indice = tarefas.findIndex((t) => t.id === idAtual);
    if (indice >= 0) {
      tarefas[indice] = tarefaAtualizada;
    } else {
      tarefas.unshift(tarefaAtualizada);
    }

    const sucesso = salvarTarefas(tarefas);
    if (!sucesso) {
      statusEl.textContent = "Não foi possível executar a ação.";
      statusEl.className = "form-status form-status--error";
      mostrarNotificacao("Não foi possível executar a ação.", "error");
      return;
    }

    statusEl.textContent = "Alterações salvas com sucesso! Redirecionando...";
    statusEl.className = "form-status form-status--success";
    definirNotificacaoFlash("Tarefa alterada.", "success");
    setTimeout(() => {
      window.location.href = `detalhesTarefas.html?id=${idAtual}`;
    }, 600);
  });
}

/* ---------------- Inicialização ---------------- */

document.addEventListener("DOMContentLoaded", () => {
  exibirNotificacaoFlashPendente();
  iniciarNavegacao();
  iniciarPaginaLogin();
  iniciarPaginaCadastro();
  iniciarPaginaDashboard();
  iniciarPaginaDetalhes();
  iniciarPaginaCriar();
  iniciarPaginaEditar();
});
