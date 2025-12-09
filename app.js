const SCREENS = [
  "home",
  "montar",
  "sacola",
  "entrega",
  "pagamento",
  "pedido",
];

const STEPS = [
  { id: "pao", label: "Pão", subtitle: "Escolha a base perfeita." },
  { id: "carne", label: "Carne", subtitle: "Defina o coração do seu burger." },
  { id: "queijo", label: "Queijos", subtitle: "Cheddar, muçarela, prato…" },
  { id: "extras", label: "Camadas extras", subtitle: "Bacon, salada, crispy…" },
  { id: "molhos", label: "Molhos", subtitle: "Toque final da casa." },
];

const OPTIONS = {
  pao: [
    { id: "brioche", nome: "Pão Brioche", desc: "Macio e levemente adocicado.", preco: 2.5 },
    { id: "tradicional", nome: "Pão Tradicional", desc: "Clássico de hamburgueria.", preco: 0 },
    { id: "australiano", nome: "Pão Australiano", desc: "Intenso, com toque adocicado.", preco: 3 },
  ],
  carne: [
    { id: "smash80", nome: "Smash 80g", desc: "Fino, crosta perfeita.", preco: 9 },
    { id: "smash120", nome: "Smash 120g", desc: "Mais carne, mais sabor.", preco: 12 },
    { id: "artesanal150", nome: "Artesanal 150g", desc: "Burger alto, suculento.", preco: 16 },
  ],
  queijo: [
    { id: "cheddar", nome: "Cheddar", desc: "Clássico do burger.", preco: 3 },
    { id: "mussarela", nome: "Muçarela", desc: "Derrete fácil, sabor suave.", preco: 2.5 },
    { id: "prato", nome: "Queijo Prato", desc: "Equilíbrio perfeito.", preco: 2.5 },
  ],
  extras: [
    { id: "bacon", nome: "Bacon Crocante", desc: "Tira generosa de bacon.", preco: 4 },
    { id: "cebola", nome: "Cebola Crispy", desc: "Textura e sabor.", preco: 3 },
    { id: "salada", nome: "Mix de Salada", desc: "Alface, tomate e cebola.", preco: 2 },
  ],
  molhos: [
    { id: "maionese-casa", nome: "Maionese da Casa", desc: "Receita especial Costa-Burger.", preco: 2 },
    { id: "barbecue", nome: "Barbecue", desc: "Defumado, levemente adocicado.", preco: 2 },
    { id: "picante", nome: "Molho Picante", desc: "Pimenta na medida.", preco: 2 },
  ],
};

const EXTRAS = [
  { id: "batata", nome: "Batata frita", preco: 12 },
  { id: "refri-lata", nome: "Refrigerante lata", preco: 6 },
  { id: "refri-1l", nome: "Refrigerante 1L", preco: 10 },
  { id: "sobremesa", nome: "Sobremesa do dia", preco: 8 },
];

let currentScreen = "home";
let currentStepIndex = 0;
let currentSelections = {};
let cart = [];
let extrasSelecionados = new Set();
let currentOrderStatus = 1;

const currencyFormat = (value) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function showScreen(name) {
  currentScreen = name;
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  const el = document.querySelector(`#screen-${name}`);
  if (el) el.classList.add("active");

  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));
  const navButton = document.querySelector(`.nav-item[data-nav="${name}"]`);
  if (navButton) navButton.classList.add("active");
}

function renderStepsNav() {
  const nav = document.getElementById("steps-nav");
  nav.innerHTML = "";
  STEPS.forEach((step, index) => {
    const pill = document.createElement("button");
    pill.className = "step-pill" + (index === currentStepIndex ? " active" : "");
    pill.textContent = `${index + 1}. ${step.label}`;
    pill.addEventListener("click", () => {
      currentStepIndex = index;
      renderStepsNav();
      renderStepOptions();
      updateStepSubtitle();
    });
    nav.appendChild(pill);
  });
}

function updateStepSubtitle() {
  const step = STEPS[currentStepIndex];
  const subtitle = document.getElementById("step-subtitle");
  subtitle.textContent = step.subtitle;
}

function renderStepOptions() {
  const container = document.getElementById("options-list");
  container.innerHTML = "";
  const step = STEPS[currentStepIndex];
  const options = OPTIONS[step.id];
  const selectionsForStep = currentSelections[step.id];

  options.forEach((opt) => {
    const card = document.createElement("div");
    card.className = "option-card";
    if (selectionsForStep && selectionsForStep.id === opt.id) {
      card.classList.add("selected");
    }
    const title = document.createElement("div");
    title.className = "option-title";
    title.textContent = opt.nome;

    const desc = document.createElement("div");
    desc.className = "option-desc";
    desc.textContent = opt.desc;

    const price = document.createElement("div");
    price.className = "option-price";
    price.textContent = opt.preco > 0 ? `+ ${currencyFormat(opt.preco)}` : "Incluso";

    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(price);

    card.addEventListener("click", () => {
      currentSelections[step.id] = opt;
      renderStepOptions();
      updatePartialTotal();
      updateBurgerPreview();
    });

    container.appendChild(card);
  });
}

function updatePartialTotal() {
  let total = 0;
  Object.values(currentSelections).forEach((opt) => {
    total += opt.preco;
  });
  const label = document.getElementById("partial-total");
  if (label) {
    label.textContent = currencyFormat(total);
  }
}

function updateBurgerPreview() {
  const cheeseLayer = document.getElementById("layer-cheese");
  const pattyLayer = document.getElementById("layer-patty");
  const extrasLayer = document.getElementById("layer-extras");

  if (cheeseLayer) {
    cheeseLayer.classList.toggle("hidden", !currentSelections["queijo"]);
  }
  if (pattyLayer) {
    pattyLayer.classList.toggle("hidden", !currentSelections["carne"]);
  }
  if (extrasLayer) {
    extrasLayer.classList.toggle("hidden", !currentSelections["extras"]);
  }
}

function initButtons() {
  document.querySelectorAll("[data-next]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-next");
      showScreen(target);
    });
  });

  document.querySelectorAll("[data-back]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-back");
      showScreen(target);
    });
  });

  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-nav");
      if (target === "home") {
        showScreen("home");
      } else if (target === "sacola") {
        showScreen("sacola");
      } else if (target === "pedido") {
        showScreen("pedido");
      } else if (target === "conta") {
        alert("Área de conta será implementada em versões futuras.");
      }
    });
  });

  const nextStepBtn = document.getElementById("btn-next-step");
  if (nextStepBtn) {
    nextStepBtn.addEventListener("click", () => {
      if (currentStepIndex < STEPS.length - 1) {
        currentStepIndex += 1;
        renderStepsNav();
        renderStepOptions();
        updateStepSubtitle();
      } else {
        addCurrentBurgerToCart();
        showScreen("sacola");
        renderCart();
      }
    });
  }

  const btnSimularPagamento = document.getElementById("btn-simular-pagamento");
  if (btnSimularPagamento) {
    btnSimularPagamento.addEventListener("click", () => {
      alert("Pagamento simulado como aprovado. Redirecionando para rastreamento.");
      showScreen("pedido");
    });
  }

  const btnSimularProgresso = document.getElementById("btn-simular-progresso");
  if (btnSimularProgresso) {
    btnSimularProgresso.addEventListener("click", () => {
      advanceOrderStatus();
    });
  }
}

function addCurrentBurgerToCart() {
  const missingStep = STEPS.find((s) => !currentSelections[s.id]);
  if (missingStep) {
    alert(`Você ainda não escolheu a camada: ${missingStep.label}`);
    return;
  }
  let total = 0;
  Object.values(currentSelections).forEach((opt) => {
    total += opt.preco;
  });
  const item = {
    id: Date.now(),
    nome: "Meu Burger em Camadas",
    camadas: { ...currentSelections },
    preco: total,
  };
  cart.push(item);
  currentSelections = {};
  currentStepIndex = 0;
  renderStepsNav();
  renderStepOptions();
  updatePartialTotal();
  updateBurgerPreview();
}

function renderCart() {
  const container = document.getElementById("cart-items");
  container.innerHTML = "";
  if (cart.length === 0) {
    container.innerHTML = "<p>Sua sacola está vazia. Monte um burger para começar.</p>";
  }

  cart.forEach((item) => {
    const el = document.createElement("div");
    el.className = "cart-item";

    const header = document.createElement("div");
    header.className = "cart-item-header";
    const title = document.createElement("div");
    title.textContent = item.nome;
    const price = document.createElement("div");
    price.textContent = currencyFormat(item.preco);
    header.appendChild(title);
    header.appendChild(price);

    const desc = document.createElement("div");
    const textos = [];
    Object.values(item.camadas).forEach((c) => textos.push(c.nome));
    desc.textContent = textos.join(" • ");

    const actions = document.createElement("div");
    actions.className = "cart-item-actions";
    const btnRemove = document.createElement("button");
    btnRemove.className = "btn ghost small";
    btnRemove.textContent = "Remover";
    btnRemove.addEventListener("click", () => {
      cart = cart.filter((c) => c.id !== item.id);
      renderCart();
      updateResumo();
    });
    actions.appendChild(btnRemove);

    el.appendChild(header);
    el.appendChild(desc);
    el.appendChild(actions);
    container.appendChild(el);
  });

  renderExtrasChips();
  updateResumo();
}

function renderExtrasChips() {
  const container = document.getElementById("extras-chips");
  container.innerHTML = "";
  EXTRAS.forEach((extra) => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.textContent = `${extra.nome} (${currencyFormat(extra.preco)})`;
    if (extrasSelecionados.has(extra.id)) chip.classList.add("selected");
    chip.addEventListener("click", () => {
      if (extrasSelecionados.has(extra.id)) {
        extrasSelecionados.delete(extra.id);
      } else {
        extrasSelecionados.add(extra.id);
      }
      renderExtrasChips();
      updateResumo();
    });
    container.appendChild(chip);
  });
}

function updateResumo() {
  let subtotal = cart.reduce((acc, item) => acc + item.preco, 0);
  EXTRAS.forEach((extra) => {
    if (extrasSelecionados.has(extra.id)) subtotal += extra.preco;
  });
  const taxa = cart.length > 0 ? 7.0 : 0;

  const subtotalLabel = document.getElementById("summary-subtotal");
  const taxaLabel = document.getElementById("summary-delivery");
  const totalLabel = document.getElementById("summary-total");

  if (subtotalLabel) subtotalLabel.textContent = currencyFormat(subtotal);
  if (taxaLabel) taxaLabel.textContent = currencyFormat(taxa);
  if (totalLabel) totalLabel.textContent = currencyFormat(subtotal + taxa);
}

function advanceOrderStatus() {
  if (currentOrderStatus >= 4) return;
  currentOrderStatus += 1;
  for (let i = 1; i <= 4; i++) {
    const li = document.getElementById(`status-${i}`);
    li.classList.remove("done", "current");
    if (i < currentOrderStatus) {
      li.classList.add("done");
    } else if (i === currentOrderStatus) {
      li.classList.add("current");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  showScreen("home");
  initButtons();
  renderStepsNav();
  renderStepOptions();
  updateStepSubtitle();
  updateBurgerPreview();
});
