const yearNode = document.getElementById("year");
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

document.documentElement.style.removeProperty("--site-cursor");
document.documentElement.style.removeProperty("--site-cursor-pointer");

const siteHeader = document.querySelector(".site-header");
if (siteHeader) {
  const isHomePage = document.body.classList.contains("home-page");
  let ticking = false;

  const updateHeaderState = () => {
    const y = Math.max(0, window.scrollY || 0);
    siteHeader.classList.toggle("is-scrolled", y > 18);

    if (isHomePage) {
      siteHeader.style.setProperty("--header-fade-opacity", "1");
    } else {
      siteHeader.style.setProperty("--header-fade-opacity", "1");
    }

    ticking = false;
  };

  const requestHeaderUpdate = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeaderState);
      ticking = true;
    }
  };

  updateHeaderState();
  window.addEventListener("scroll", requestHeaderUpdate, { passive: true });
}

const smoothScrollLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
smoothScrollLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;

    event.preventDefault();
    const headerHeight = siteHeader?.offsetHeight || 0;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
    target.closest(".reveal")?.classList.add("visible");
    window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
  });
});

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
