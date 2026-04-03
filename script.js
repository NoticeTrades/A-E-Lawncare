const yearNode = document.getElementById("year");
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

document.documentElement.style.removeProperty("--site-cursor");
document.documentElement.style.removeProperty("--site-cursor-pointer");

const siteHeader = document.querySelector(".site-header");
if (siteHeader) {
  const minOpacity = 0;
  const fadeDistance = 170;
  const updateHeaderFade = () => {
    const y = Math.max(0, window.scrollY || 0);
    const progress = Math.min(1, y / fadeDistance);
    const opacity = 1 - (1 - minOpacity) * progress;
    siteHeader.style.setProperty("--header-fade-opacity", opacity.toFixed(3));
    siteHeader.style.pointerEvents = opacity <= 0.02 ? "none" : "auto";
  };
  updateHeaderFade();
  window.addEventListener("scroll", updateHeaderFade, { passive: true });
}

const heroVideo = document.querySelector(".hero-bg-video");
if (heroVideo) {
  heroVideo.preload = "auto";
  const startHeroVideo = () => {
    heroVideo.play().catch(() => {});
  };
  if (heroVideo.readyState >= 2) {
    startHeroVideo();
  } else {
    heroVideo.addEventListener("loadeddata", startHeroVideo, { once: true });
  }
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
