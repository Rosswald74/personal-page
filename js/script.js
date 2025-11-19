/* Minimal interactions: simple carousel and button hooks */
document.addEventListener("DOMContentLoaded", function () {
  const images = [
    "image/logoposter1.jpg",
    "image/logoposter2.jpg",
    "image/logoposter3.jpg",
  ];

  let idx = 0;
  const imgEl = document.getElementById("eventImg");
  const prev = document.querySelector(".card-events .thumb-arrow.prev");
  const next = document.querySelector(".card-events .thumb-arrow.next");

  // Coming Soon slider elements
  const imagesComing = ["image/logosoon1.jpg", "image/logosoon2.jpg"];
  let cidx = 0;
  const comingImg = document.getElementById("comingImg");
  const comingPrev = document.querySelector(".card-coming .thumb-arrow.prev");
  const comingNext = document.querySelector(".card-coming .thumb-arrow.next");

  function show(i) {
    idx = (i + images.length) % images.length;
    if (!imgEl) return;
    // reset zoom so transition restarts
    imgEl.classList.remove("zoom");
    imgEl.style.opacity = 0;
    // preload next image to reduce flash
    const pre = new Image();
    pre.src = images[idx];
    pre.onload = () => {
      setTimeout(() => {
        imgEl.src = images[idx];
        // small delay before adding zoom so transition is visible
        void imgEl.offsetWidth;
        imgEl.classList.add("zoom");
        imgEl.style.opacity = 1;
      }, 120);
    };
  }

  if (prev && next) {
    prev.addEventListener("click", () => show(idx - 1));
    next.addEventListener("click", () => show(idx + 1));
  }

  // Coming Soon functions and handlers
  function showComing(i) {
    cidx = (i + imagesComing.length) % imagesComing.length;
    if (!comingImg) return;
    comingImg.classList.remove("zoom");
    comingImg.style.opacity = 0;
    const pre = new Image();
    pre.src = imagesComing[cidx];
    pre.onload = () => {
      setTimeout(() => {
        comingImg.src = imagesComing[cidx];
        void comingImg.offsetWidth;
        comingImg.classList.add("zoom");
        comingImg.style.opacity = 1;
      }, 120);
    };
  }

  if (comingPrev && comingNext) {
    comingPrev.addEventListener("click", () => showComing(cidx - 1));
    comingNext.addEventListener("click", () => showComing(cidx + 1));
  }

  // initialize coming soon slider
  showComing(0);

  // separate autoplay for coming soon
  let comingAutoplay = setInterval(() => showComing(cidx + 1), 6000);
  [comingPrev, comingNext, comingImg].forEach(
    (el) =>
      el &&
      el.addEventListener("mouseenter", () => clearInterval(comingAutoplay))
  );
  [comingPrev, comingNext, comingImg].forEach(
    (el) =>
      el &&
      el.addEventListener("mouseleave", () => {
        comingAutoplay = setInterval(() => showComing(cidx + 1), 6000);
      })
  );

  // show initial slide immediately so broken alt text doesn't show
  show(0);

  // simple autoplay every 5s
  let autoplay = setInterval(() => show(idx + 1), 5000);
  [prev, next, imgEl].forEach(
    (el) =>
      el && el.addEventListener("mouseenter", () => clearInterval(autoplay))
  );
  [prev, next, imgEl].forEach(
    (el) =>
      el &&
      el.addEventListener("mouseleave", () => {
        autoplay = setInterval(() => show(idx + 1), 5000);
      })
  );

  // CTA hooks (safe guards)
  const artworkBtn = document.getElementById("artworkBtn");
  const furmeetBtn = document.getElementById("furmeetBtn");
  if (artworkBtn)
    artworkBtn.addEventListener("click", function (e) {
      // If the button has an href (used as data on the button), navigate to that
      // section smoothly. This keeps the markup as <button> while restoring
      // expected anchor-like behaviour.
      const href =
        (artworkBtn.getAttribute && artworkBtn.getAttribute("href")) ||
        "#artwork";
      if (href && href.startsWith("#")) {
        const target = document.querySelector(href);
        if (target) {
          if (e && typeof e.preventDefault === "function") e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          try {
            history.replaceState && history.replaceState(null, "", href);
          } catch (err) {}
          return;
        }
      }
      // fallback: navigate the page (will replace current location)
      if (href && !href.startsWith("#")) {
        try {
          window.location.href = href;
        } catch (err) {}
      }
    });
  if (furmeetBtn)
    furmeetBtn.addEventListener("click", function (e) {
      // If there's a section with id 'furmeet', scroll to it smoothly.
      const target = document.getElementById("furmeet");
      if (target) {
        if (e && typeof e.preventDefault === "function") e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        // update URL hash without jumping instantly
        try {
          history.replaceState && history.replaceState(null, "", "#furmeet");
        } catch (err) {}
      } else {
        // fallback: keep previous behavior
        alert("Open Furmeet — implement link or modal here");
      }
    });

  // Ensure social anchors open in a new tab and are accessible
  try {
    const socialAnchors = document.querySelectorAll(".icons a[href]");
    socialAnchors.forEach((a) => {
      a.style.cursor = "pointer";
      if (!a.hasAttribute("target")) a.setAttribute("target", "_blank");
      // add rel to prevent opener access when opening new tab
      const rel = a.getAttribute("rel") || "";
      if (!/noopener/i.test(rel))
        a.setAttribute("rel", (rel + " noopener noreferrer").trim());
    });
  } catch (e) {}

  /* Keyboard navigation (left/right) for event slider */
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });

  /* Simple touch (swipe) support for both sliders */
  function addSwipeHandlers(containerSelector, prevFn, nextFn) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    let startX = null;
    container.addEventListener(
      "touchstart",
      function (e) {
        startX = e.touches[0].clientX;
      },
      { passive: true }
    );
    container.addEventListener(
      "touchend",
      function (e) {
        if (startX === null) return;
        const endX = e.changedTouches[0].clientX;
        const dx = endX - startX;
        if (Math.abs(dx) > 30) {
          if (dx > 0) prevFn();
          else nextFn();
        }
        startX = null;
      },
      { passive: true }
    );
  }

  addSwipeHandlers(
    ".card-events .thumb-wrap",
    () => show(idx - 1),
    () => show(idx + 1)
  );
  addSwipeHandlers(
    ".card-coming .thumb-wrap",
    () => showComing(cidx - 1),
    () => showComing(cidx + 1)
  );

  /* Lightbox / full-view for attended slider */
  try {
    const fullImages = [
      "image/poster 1.jpg",
      "image/poster 2.jpg",
      "image/poster 3.png",
    ];
    // full-size images for Coming Soon slider (fallback to thumbnails if missing)
    const fullImagesComing = ["image/soon 1.jpg", "image/soon 2.jpg"];
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxVideo = document.getElementById("lightboxVideo");
    const lightboxClose = document.querySelector(".lightbox-close");

    function openLightbox(src) {
      if (!lightbox || !lightboxImg) return;
      // ensure video is stopped/hidden
      if (lightboxVideo) {
        try {
          lightboxVideo.pause();
        } catch (e) {}
        lightboxVideo.style.display = "none";
        lightboxVideo.src = "";
      }
      if (lightboxImg) {
        lightboxImg.style.display = "block";
        lightboxImg.src = src;
      }
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
    }

    function openVideo(src) {
      if (!lightbox || !lightboxVideo) return;
      // hide image view
      if (lightboxImg) {
        lightboxImg.style.display = "none";
        lightboxImg.src = "";
      }
      lightboxVideo.style.display = "block";
      lightboxVideo.src = src;
      lightboxVideo.load();
      // do not autoplay with sound; user can press play
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      // clear media sources after close animation
      setTimeout(() => {
        try {
          if (lightboxImg) lightboxImg.src = "";
          if (lightboxVideo) {
            lightboxVideo.pause();
            lightboxVideo.src = "";
            lightboxVideo.style.display = "none";
          }
        } catch (e) {}
      }, 300);
    }

    if (imgEl) {
      imgEl.style.cursor = "zoom-in";
      imgEl.addEventListener("click", function () {
        const full = fullImages[idx] || images[idx];
        openLightbox(full);
      });
    }

    // Coming Soon click: open corresponding full-size "soon" image
    if (comingImg) {
      comingImg.style.cursor = "zoom-in";
      comingImg.addEventListener("click", function () {
        const full = fullImagesComing[cidx] || imagesComing[cidx];
        openLightbox(full);
      });
    }

    // wire video thumbnails (if present) to open the video player in lightbox
    try {
      const videoThumbs = document.querySelectorAll(".video-thumb");
      if (
        videoThumbs &&
        videoThumbs.length &&
        typeof openVideo === "function"
      ) {
        videoThumbs.forEach(function (vt) {
          vt.addEventListener("click", function () {
            const src = vt.dataset && vt.dataset.src;
            if (!src) return;
            openVideo(src);
          });
          vt.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              const src = vt.dataset && vt.dataset.src;
              if (!src) return;
              openVideo(src);
            }
          });
        });
      }
    } catch (e) {
      // ignore
    }

    // Also make the small <video> elements inside thumbnails clickable (they may intercept clicks)
    try {
      const thumbVideos = document.querySelectorAll(".video-thumb video");
      if (thumbVideos && thumbVideos.length) {
        thumbVideos.forEach(function (v) {
          v.addEventListener("click", function (ev) {
            // find parent .video-thumb to get data-src
            const p = v.closest(".video-thumb");
            if (!p) return;
            const src = p.dataset && p.dataset.src;
            if (!src) return;
            openVideo(src);
            // prevent default native controls (we don't show controls on thumbnail)
            ev.preventDefault();
          });
        });
      }
    } catch (e) {}

    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
    if (lightbox) {
      lightbox.addEventListener("click", function (e) {
        if (e.target === lightbox || e.target.dataset.close !== undefined)
          closeLightbox();
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLightbox();
    });
  } catch (e) {
    // fail silently if lightbox elements not present
  }

  // Show/hide the "go to home" floating button based on scroll position.
  (function () {
    const gotoBtn = document.getElementById("goto-home");
    const homeSection = document.getElementById("home");
    if (!gotoBtn) return;

    function updateGoto() {
      const sc = window.scrollY || window.pageYOffset || 0;
      // hide when near top (homepage); show after user scrolls down
      if (sc > 80) gotoBtn.classList.add("show");
      else gotoBtn.classList.remove("show");
    }

    // initial state
    updateGoto();
    // update on scroll/resize
    window.addEventListener("scroll", updateGoto, { passive: true });
    window.addEventListener("resize", updateGoto);

    // click: smooth scroll to #home (or top) and update hash
    gotoBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (homeSection)
        homeSection.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
      try {
        history.replaceState && history.replaceState(null, "", "#home");
      } catch (err) {}
    });
  })();

  /* Tabs: Photos / Videos inside the Furmeet area */
  (function () {
    const tabBtns = document.querySelectorAll(".furmeet-tabs .tab-btn");
    const tabPanels = document.querySelectorAll(".tab-panel");

    function activateTab(name) {
      tabBtns.forEach((b) => {
        const is = b.dataset.tab === name;
        b.classList.toggle("active", is);
        b.setAttribute("aria-selected", is ? "true" : "false");
      });
      tabPanels.forEach((p) => {
        const match = p.dataset.tab === name;
        p.classList.toggle("active", match);
        if (match) p.removeAttribute("hidden");
        else p.setAttribute("hidden", "");
      });
    }

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        activateTab(btn.dataset.tab);
      });
      btn.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          const arr = Array.from(tabBtns);
          let i = arr.indexOf(btn);
          if (e.key === "ArrowRight") i = (i + 1) % arr.length;
          else i = (i - 1 + arr.length) % arr.length;
          arr[i].focus();
          activateTab(arr[i].dataset.tab);
        }
      });
    });

    // If user went to a hash containing "video", default to videos tab
    try {
      if (location.hash && location.hash.toLowerCase().includes("video"))
        activateTab("videos");
    } catch (e) {}
  })();

  /* Artwork tabs: Illustration / Character / Reference */
  (function () {
    const tabBtns = document.querySelectorAll(".artwork-tabs .art-tab-btn");
    const tabPanels = document.querySelectorAll(".artwork-tab-panel");
    if (!tabBtns || !tabBtns.length) return;
    const sketchDropdown = document.querySelector(".sketch-dropdown");
    const sketchesBtn = document.querySelector(
      '.art-tab-btn[data-tab="sketches"]'
    );

    function activateTab(name) {
      tabBtns.forEach((b) => {
        const is = b.dataset.tab === name;
        b.classList.toggle("active", is);
        b.setAttribute("aria-selected", is ? "true" : "false");
      });
      tabPanels.forEach((p) => {
        const match = p.dataset.tab === name;
        p.classList.toggle("active", match);
        if (match) p.removeAttribute("hidden");
        else p.setAttribute("hidden", "");
      });
    }

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        activateTab(btn.dataset.tab);
        // If the clicked button is the Sketches tab, toggle dropdown
        if (btn.dataset.tab === "sketches" && sketchDropdown) {
          const isOpen = sketchDropdown.classList.toggle("open");
          sketchDropdown.setAttribute("aria-hidden", isOpen ? "false" : "true");
        } else if (sketchDropdown) {
          // close dropdown when other tabs selected
          sketchDropdown.classList.remove("open");
          sketchDropdown.setAttribute("aria-hidden", "true");
        }
      });
      btn.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          const arr = Array.from(tabBtns);
          let i = arr.indexOf(btn);
          if (e.key === "ArrowRight") i = (i + 1) % arr.length;
          else i = (i - 1 + arr.length) % arr.length;
          arr[i].focus();
          activateTab(arr[i].dataset.tab);
        }
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (e) {
      if (!sketchDropdown) return;
      if (sketchDropdown.classList.contains("open")) {
        const insideDropdown =
          e.target.closest && e.target.closest(".sketch-dropdown");
        const clickedSketchBtn =
          e.target.closest &&
          e.target.closest('.art-tab-btn[data-tab="sketches"]');
        if (!insideDropdown && !clickedSketchBtn) {
          sketchDropdown.classList.remove("open");
          sketchDropdown.setAttribute("aria-hidden", "true");
        }
      }
    });
  })();

  /* Sketches sub-tabs: Digital / Traditional (acts like Furmeet tablist) */
  (function () {
    // Use dropdown buttons as the sketch tab controls (support previous in-panel tabs if present)
    const tabBtns = document.querySelectorAll(
      ".sketch-dropdown .tab-btn, .sketch-tabs .tab-btn"
    );
    const tabPanels = document.querySelectorAll(".sketch-panel");
    const sketchDropdown = document.querySelector(".sketch-dropdown");
    if (!tabBtns || !tabBtns.length) return;

    function activateTab(name) {
      tabBtns.forEach((b) => {
        const is = b.dataset.tab === name;
        b.classList.toggle("active", is);
        b.setAttribute("aria-selected", is ? "true" : "false");
      });
      tabPanels.forEach((p) => {
        const match = p.dataset.tab === name;
        p.classList.toggle("active", match);
        if (match) p.removeAttribute("hidden");
        else p.setAttribute("hidden", "");
      });
      // keep dropdown open after selection (do not auto-close)
    }

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        activateTab(btn.dataset.tab);
      });
      btn.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          const arr = Array.from(tabBtns);
          let i = arr.indexOf(btn);
          if (e.key === "ArrowRight") i = (i + 1) % arr.length;
          else i = (i - 1 + arr.length) % arr.length;
          arr[i].focus();
          activateTab(arr[i].dataset.tab);
        }
      });
    });
  })();

  // set up click-to-open-lightbox for gallery images (if present)
  try {
    const galleryImgs = document.querySelectorAll(".furmeet-gallery img");
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    if (galleryImgs && lightbox && lightboxImg) {
      galleryImgs.forEach((img) => {
        img.addEventListener("click", function () {
          const src = img.getAttribute("src") || img.dataset.src;
          if (!src) return;
          lightboxImg.src = src;
          lightbox.classList.add("open");
          lightbox.setAttribute("aria-hidden", "false");
        });
      });
    }
    // artwork gallery images
    try {
      const artImgs = document.querySelectorAll(".artwork-gallery img");
      if (artImgs && lightbox && lightboxImg) {
        artImgs.forEach((img) => {
          img.addEventListener("click", function () {
            const src = img.getAttribute("src") || img.dataset.src;
            if (!src) return;
            lightboxImg.src = src;
            lightbox.classList.add("open");
            lightbox.setAttribute("aria-hidden", "false");
          });
        });
      }
    } catch (e) {
      // ignore
    }
  } catch (e) {
    // ignore
  }
})();
