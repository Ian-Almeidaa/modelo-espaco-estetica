document.documentElement.classList.add("js");

const params = new URLSearchParams(window.location.search);
const captureMode = params.has("capture");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
document.documentElement.classList.toggle("capture-mode", captureMode);

const menuButton = document.querySelector("[data-menu-button]");
const navLinks = document.querySelector("[data-nav-links]");

const closeMenu = () => {
  menuButton?.setAttribute("aria-expanded", "false");
  menuButton?.setAttribute("aria-label", "Abrir menu");
  navLinks?.classList.remove("open");
};

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
  navLinks?.classList.toggle("open", !isOpen);
});

navLinks?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

const filterButtons = [...document.querySelectorAll("[data-filter]")];
const packageRows = [...document.querySelectorAll("[data-package-row]")];

const applyFilter = (category, updateUrl = true) => {
  const safeCategory = filterButtons.some((button) => button.dataset.filter === category) ? category : "todos";

  filterButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.filter === safeCategory));
  });

  packageRows.forEach((row) => {
    const categories = row.dataset.category?.split(" ") ?? [];
    row.hidden = safeCategory !== "todos" && !categories.includes(safeCategory);
  });

  if (updateUrl && !captureMode) {
    const url = new URL(window.location.href);
    if (safeCategory === "todos") url.searchParams.delete("categoria");
    else url.searchParams.set("categoria", safeCategory);
    history.replaceState({}, "", url);
  }
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => applyFilter(button.dataset.filter ?? "todos"));
});

applyFilter(captureMode ? "todos" : params.get("categoria") ?? "todos", false);

document.querySelectorAll("[data-comparison]").forEach((comparison) => {
  const range = comparison.querySelector("[data-comparison-range]");
  if (!range) return;

  const setWipe = (value) => {
    comparison.style.setProperty("--wipe", `${value}%`);
    range.setAttribute("aria-valuetext", `${value}% da imagem antes`);
  };
  setWipe(range.value);

  range.addEventListener("input", () => {
    setWipe(range.value);
  });

  const updateFromPointer = (event) => {
    const bounds = range.getBoundingClientRect();
    const rawValue = ((event.clientX - bounds.left) / bounds.width) * 100;
    const value = Math.min(Number(range.max), Math.max(Number(range.min), rawValue));
    range.value = String(Math.round(value));
    setWipe(range.value);
  };

  range.addEventListener("pointerdown", (event) => {
    range.setPointerCapture(event.pointerId);
    comparison.classList.add("is-dragging");
    updateFromPointer(event);
  });

  range.addEventListener("pointermove", (event) => {
    if (!range.hasPointerCapture(event.pointerId)) return;
    updateFromPointer(event);
  });

  const finishDrag = (event) => {
    if (range.hasPointerCapture(event.pointerId)) range.releasePointerCapture(event.pointerId);
    comparison.classList.remove("is-dragging");
  };

  range.addEventListener("pointerup", finishDrag);
  range.addEventListener("pointercancel", finishDrag);
});

document.querySelectorAll("details").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    document.querySelectorAll("details").forEach((other) => {
      if (other !== item) other.removeAttribute("open");
    });
  });
});

const dialog = document.querySelector("[data-demo-dialog]");

document.querySelectorAll("[data-demo-action]").forEach((button) => {
  button.addEventListener("click", () => {
    closeMenu();
    if (dialog && typeof dialog.showModal === "function") dialog.showModal();
  });
});

document.querySelectorAll("[data-dialog-close]").forEach((button) => {
  button.addEventListener("click", () => dialog?.close());
});

dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

const stickyCta = document.querySelector("[data-sticky-cta]");
const toggleStickyCta = () => stickyCta?.classList.toggle("visible", !captureMode && window.scrollY > 720);
window.addEventListener("scroll", toggleStickyCta, { passive: true });
toggleStickyCta();

if (window.gsap && window.ScrollTrigger && !captureMode && !reducedMotion.matches) {
  gsap.registerPlugin(ScrollTrigger);

  gsap.timeline({ defaults: { ease: "power3.out" } })
    .from(".site-header", { y: -14, opacity: 0, duration: 0.48 })
    .from("[data-hero-copy] > *", { y: 16, opacity: 0, duration: 0.54, stagger: 0.08 }, "-=0.18")
    .from("[data-hero-visual]", { y: 18, opacity: 0, duration: 0.72 }, "-=0.4");

  gsap.utils.toArray("[data-reveal]").forEach((element) => {
    gsap.to(element, {
      y: 0,
      opacity: 1,
      duration: 0.55,
      ease: "power3.out",
      scrollTrigger: { trigger: element, start: "top 84%", once: true }
    });
  });

  gsap.utils.toArray("[data-reveal-group]").forEach((group) => {
    gsap.to(group.children, {
      y: 0,
      opacity: 1,
      duration: 0.48,
      stagger: 0.08,
      ease: "power3.out",
      scrollTrigger: { trigger: group, start: "top 84%", once: true }
    });
  });

  gsap.to(".hero-visual > img", {
    yPercent: 7,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.7 }
  });
} else {
  document.querySelectorAll("[data-reveal], [data-reveal-group] > *").forEach((element) => {
    element.style.opacity = "1";
    element.style.transform = "none";
  });
}
