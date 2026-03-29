const yearNode = document.getElementById("year");
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const revealNodes = document.querySelectorAll(".reveal");
if (revealNodes.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealNodes.forEach((node) => revealObserver.observe(node));
}

const quoteModal = document.getElementById("quote-modal");
const quoteModalOpen = document.getElementById("open-quote-modal");
const quoteModalClose = document.getElementById("quote-modal-close");
const quoteModalBackdrop = document.getElementById("quote-modal-backdrop");

function setQuoteModalOpen(open) {
  if (!quoteModal) return;
  quoteModal.classList.toggle("hidden", !open);
  quoteModal.setAttribute("aria-hidden", open ? "false" : "true");
  document.body.classList.toggle("modal-open", open);
  if (open) {
    const firstInput = quoteModal.querySelector('input[name="name"]');
    window.setTimeout(() => firstInput?.focus(), 100);
  }
}

quoteModalOpen?.addEventListener("click", () => setQuoteModalOpen(true));
quoteModalClose?.addEventListener("click", () => setQuoteModalOpen(false));
quoteModalBackdrop?.addEventListener("click", () => setQuoteModalOpen(false));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && quoteModal && !quoteModal.classList.contains("hidden")) {
    setQuoteModalOpen(false);
  }
});
