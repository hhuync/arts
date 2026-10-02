(() => {

  // ---------- Burger menu ----------
  const menuToggle = document.getElementById("menuToggle");
  const siteMenu = document.getElementById("siteMenu");

  function setMenu(open) {
    if (!menuToggle || !siteMenu) return;
    menuToggle.classList.toggle("open", open);
    siteMenu.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
  }

  menuToggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    setMenu(!siteMenu.classList.contains("open"));
  });

  document.addEventListener("click", (event) => {
    if (!siteMenu?.classList.contains("open")) return;
    if (siteMenu.contains(event.target) || menuToggle.contains(event.target)) return;
    setMenu(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && siteMenu?.classList.contains("open")) {
      setMenu(false);
      menuToggle.focus();
    }
  });

  const headerHeight = () =>
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 68;

  // ---------- Featured slideshow ----------
  const featured = window.FEATURED_ARTWORKS || [];
  const featuredImage = document.getElementById("featuredImage");
  const featuredCaption = document.getElementById("featuredCaption");
  const featuredDots = document.getElementById("featuredDots");
  const featuredOpen = document.getElementById("featuredOpen");

  let featuredIndex = 0;
  let featuredTimer;

  function renderFeatured(index, restart = true) {
    if (!featured.length) return;

    featuredIndex = (index + featured.length) % featured.length;
    const art = featured[featuredIndex];

    featuredImage.style.opacity = "0";

    window.setTimeout(() => {
      featuredImage.src = art.src;
      featuredImage.alt = art.alt;
      featuredCaption.innerHTML = art.caption;
      featuredImage.style.opacity = "1";
    }, 140);

    [...featuredDots.children].forEach((dot, i) => {
      dot.classList.toggle("active", i === featuredIndex);
      dot.setAttribute("aria-current", i === featuredIndex ? "true" : "false");
    });

    if (restart) startFeaturedTimer();
  }

  function startFeaturedTimer() {
    window.clearInterval(featuredTimer);
    featuredTimer = window.setInterval(() => {
      renderFeatured(featuredIndex + 1, false);
    }, 6500);
  }

  featured.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "featured-dot";
    dot.setAttribute("aria-label", `Show featured artwork ${index + 1}`);
    dot.addEventListener("click", () => renderFeatured(index));
    featuredDots.appendChild(dot);
  });

  if (featured.length) renderFeatured(0);

  // ---------- Accordion behavior ----------
  const sections = [...document.querySelectorAll(".accordion-section")];

  function scrollHeaderToTop(section) {
    const top =
      window.scrollY +
      section.getBoundingClientRect().top -
      headerHeight();

    window.scrollTo({
      top: Math.max(0, top),
      behavior: "smooth"
    });
  }

  function closeSection(section, { scroll = false } = {}) {
    if (!section.classList.contains("open")) return;

    const header = section.querySelector(".accordion-header");
    section.classList.remove("open");
    header.setAttribute("aria-expanded", "false");

    if (scroll) {
      requestAnimationFrame(() => {
        scrollHeaderToTop(section);
      });
    }
  }

  function openSection(section) {
    sections.forEach(other => {
      if (other !== section) closeSection(other);
    });

    const header = section.querySelector(".accordion-header");
    section.classList.add("open");
    header.setAttribute("aria-expanded", "true");

    requestAnimationFrame(() => {
      scrollHeaderToTop(section);
    });

    history.replaceState(null, "", `#${section.id}`);
  }

  sections.forEach(section => {
    const header = section.querySelector(".accordion-header");

    header.addEventListener("click", () => {
      if (section.classList.contains("open")) {
        closeSection(section, { scroll: true });
        history.replaceState(null, "", window.location.pathname);
      } else {
        openSection(section);
      }
    });
  });


  // Burger menu items open the matching accordion section automatically.
  document.querySelectorAll("[data-open-section]").forEach(button => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.openSection);
      setMenu(false);

      if (target?.classList.contains("accordion-section")) {
        openSection(target);
      }
    });
  });

  // Open section from hash on load, if present.
  const hashId = window.location.hash.replace("#", "");
  if (hashId) {
    const target = document.getElementById(hashId);
    if (target?.classList.contains("accordion-section")) {
      window.setTimeout(() => openSection(target), 80);
    }
  }

  // ---------- Lightbox ----------
  const galleryButtons = [...document.querySelectorAll(".gallery-item")];
  const galleryData = galleryButtons.map(btn => ({
    src: btn.dataset.src,
    title: btn.dataset.title || "",
    caption: btn.dataset.caption || "",
    alt: btn.querySelector("img")?.alt || btn.dataset.title || "Artwork"
  }));

  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");

  let currentCollection = galleryData;
  let currentIndex = 0;

  function openLightbox(collection, index) {
    if (!collection.length) return;

    currentCollection = collection;
    currentIndex = (index + collection.length) % collection.length;

    const item = collection[currentIndex];
    lightboxImage.src = item.src;
    lightboxImage.alt = item.alt || item.title || "Artwork";
    lightboxCaption.innerHTML = item.caption || `<em>${item.title}</em>`;

    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function shiftLightbox(direction) {
    openLightbox(currentCollection, currentIndex + direction);
  }

  galleryButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => openLightbox(galleryData, index));
  });

  featuredOpen?.addEventListener("click", () => {
    const featuredCollection = featured.map(art => ({
      src: art.src,
      title: art.alt,
      caption: art.caption,
      alt: art.alt
    }));

    openLightbox(featuredCollection, featuredIndex);
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", () => shiftLightbox(-1));
  lightboxNext.addEventListener("click", () => shiftLightbox(1));

  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", event => {
    if (!lightbox.classList.contains("open")) return;

    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") shiftLightbox(-1);
    if (event.key === "ArrowRight") shiftLightbox(1);
  });

  // ---------- Contact form ----------
  const contactForm = document.getElementById("contactForm");
  const formMessage = document.getElementById("formMessage");

  contactForm?.addEventListener("submit", async event => {
    event.preventDefault();

    formMessage.textContent = "Sending…";
    formMessage.className = "form-message";

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" }
      });

      if (!response.ok) throw new Error();

      formMessage.textContent = "Thanks for reaching out! I'll get back to you soon.";
      formMessage.classList.add("success");
      contactForm.reset();
    } catch {
      formMessage.textContent = "Oops! Something went wrong. Please try again.";
      formMessage.classList.add("error");
    }
  });
})();
