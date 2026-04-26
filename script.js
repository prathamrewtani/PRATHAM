function fadeVolume(video, target = 1, duration = 300) {
  const start = video.volume;
  const change = target - start;
  const startTime = performance.now();

  function animate(time) {
    const progress = Math.min((time - startTime) / duration, 1);
    video.volume = start + change * progress;

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

function setButtonIcon(button, iconClass, label) {
  if (!button) return;

  button.innerHTML = `<i class="${iconClass}"></i>`;
  button.setAttribute("aria-label", label);
}

function setFullscreenButtonState(button) {
  setButtonIcon(button, "fa-solid fa-expand", "Open fullscreen");
}

let isScrolling = false;
let activeVideo = null;

window.addEventListener("scroll", () => {
  isScrolling = true;
  clearTimeout(window.scrollTimeout);
  window.scrollTimeout = setTimeout(() => {
    isScrolling = false;
  }, 150);
});

document.addEventListener("DOMContentLoaded", () => {
  const watchBtn = document.getElementById("watchBtn");

  if (watchBtn) {
    watchBtn.addEventListener("click", function (e) {
      e.preventDefault();

      const section = document.getElementById("showcase");

      section.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    });
  }

  const form = document.querySelector(".contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      sendMail();
    });
  }

  document.querySelectorAll(".breakdown-video").forEach(container => {
    const video = container.querySelector("video");
    const btn = container.querySelector(".breakdown-mute-btn");
    const fsBtn = container.querySelector(".fullscreen-btn");

    if (!video) return;

    video.pause();
    container.classList.add("video-paused");
    setMuteButtonState(btn, true);
    setFullscreenButtonState(fsBtn);

    container.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;

      document.querySelectorAll(".breakdown-video video").forEach(v => {
        if (v !== video) {
          v.pause();
          const c = v.closest(".breakdown-video");
          c.classList.remove("video-playing");
          c.classList.add("video-paused");

          const b = c.querySelector(".breakdown-mute-btn");
          setMuteButtonState(b, true);
        }
      });

      if (video.paused) {
        video.muted = false;
        video.play().catch(() => {});
        container.classList.add("video-playing");
        container.classList.remove("video-paused");
        setMuteButtonState(btn, false);
      } else {
        video.pause();
        container.classList.add("video-paused");
        container.classList.remove("video-playing");
      }
    });

    btn?.addEventListener("click", (e) => {
      e.stopPropagation();
      video.muted = !video.muted;
      setMuteButtonState(btn, video.muted);
    });

    fsBtn?.addEventListener("click", (e) => {
      e.stopPropagation();

      video.controls = true;

      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      } else if (video.msRequestFullscreen) {
        video.msRequestFullscreen();
      }

      video.muted = false;
      video.volume = 0;
      setMuteButtonState(btn, false);
      video.play().catch(() => {});
      fadeVolume(video, 1, 400);
    });
  });
});

document.addEventListener("fullscreenchange", () => {
  document.querySelectorAll(".breakdown-video").forEach(container => {
    const video = container.querySelector("video");

    if (document.fullscreenElement === video) {
      container.classList.add("fullscreen");
      video.controls = true;
    } else {
      container.classList.remove("fullscreen");
      video.controls = false;
    }
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const video = entry.target;

    if (!entry.isIntersecting) {
      video.pause();
      video.muted = true;

      const container = getInteractiveVideoContainer(video);
      syncPausedContainer(container);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll("video").forEach(video => {
  observer.observe(video);
});

// ================= TILT EFFECT =================
const tiltContainer = document.querySelector(".tilt-container");
const tiltInner = document.querySelector(".tilt-inner");

if (tiltContainer && tiltInner) {
  let mouseX = 0, mouseY = 0;
  let currentX = 0, currentY = 0;
  let rafId;

  tiltContainer.addEventListener("mousemove", (e) => {
    const rect = tiltContainer.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    mouseY = (e.clientY - rect.top) / rect.height - 0.5;

    if (!rafId) rafId = requestAnimationFrame(updateTilt);
  });

  tiltContainer.addEventListener("mouseleave", () => {
    mouseX = 0;
    mouseY = 0;
    if (!rafId) rafId = requestAnimationFrame(updateTilt);
  });

  function updateTilt() {
    const ease = 0.1;
    currentX += (mouseX - currentX) * ease;
    currentY += (mouseY - currentY) * ease;

    tiltInner.style.transform = `
      perspective(1000px)
      rotateX(${currentY * -10}deg)
      rotateY(${currentX * 10}deg)
    `;

    if (
      Math.abs(currentX - mouseX) > 0.001 ||
      Math.abs(currentY - mouseY) > 0.001
    ) {
      rafId = requestAnimationFrame(updateTilt);
    } else {
      rafId = null;
    }
  }
}

// ================= EMAIL =================
function sendMail() {
  const form = document.querySelector(".contact-form");
  const nameField = document.getElementById("name");
  const emailField = document.getElementById("email");
  const projectField = document.getElementById("project");

  if (!form || !nameField || !emailField || !projectField) {
    return;
  }

  if (!form.reportValidity()) {
    return;
  }

  let params = {
    name: nameField.value.trim(),
    email: emailField.value.trim(),
    message: projectField.value.trim(),
    time: new Date().toLocaleString(),
  };

  emailjs
    .send("service_76bjicp", "template_pklxfm9", params)
    .then(() => {
      alert("Email sent successfully!");
      form.reset();
    })
    .catch(() => alert("Email failed"));
}

// ================= PROBLEM SECTION ANIMATION =================
const problemSection = document.querySelector(".problem-section");

const observer2 = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      problemSection.classList.add("visible");
    }
  });
}, { threshold: 0.3 });

if (problemSection) observer2.observe(problemSection);

const cards = document.querySelectorAll(".problem-card");

const observer3 = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, { threshold: 0.2 });

cards.forEach(card => {
  observer3.observe(card);
});

/* ================= REVEAL SYSTEM ================= */

const REVEAL_CLOSE_DELAY = 420;
const SWAP_ANIMATION_DURATION = 380;
let activeCategory = null;
let isExploded = false;
let interactionLocked = false;
let isCollapsing = false;
let isSwapAnimating = false;
let lastScrollY = window.scrollY;

function getRevealPositions() {
  if (window.innerWidth <= 768) {
    return [
      { x: "-29vw", y: "-23vh", scale: "0.8" },
      { x: "29vw", y: "-23vh", scale: "0.8" },
      { x: "-29vw", y: "23vh", scale: "0.8" },
      { x: "29vw", y: "23vh", scale: "0.8" }
    ];
  }

  return [
    { x: "-27vw", y: "-21vh", scale: "0.9" },
    { x: "27vw", y: "-21vh", scale: "0.9" },
    { x: "-27vw", y: "21vh", scale: "0.9" },
    { x: "27vw", y: "21vh", scale: "0.9" }
  ];
}

function pauseAllVideos(except = null) {
  document.querySelectorAll("video").forEach((video) => {
    if (video !== except) {
      video.pause();
      video.muted = true;
      syncPausedContainer(getInteractiveVideoContainer(video));
    }
  });

  activeVideo = except;
}

function getInteractiveVideoContainer(video) {
  return video?.closest(".main-video-box, .video-box, .breakdown-video, .video-container") || null;
}

function getMainBox(category) {
  return category?.querySelector(".main-video-box") || null;
}

function getRevealBoxes(category) {
  return Array.from(category?.querySelectorAll(".video-box") || []);
}

function getVideo(box) {
  return box?.querySelector("video") || null;
}

function getPlayButton(box) {
  return box?.querySelector(".play-btn, .main-play") || null;
}

function getMuteButton(box) {
  return box?.querySelector(".mute-btn, .main-mute") || null;
}

function syncPausedContainer(container) {
  if (!container) return;

  container.classList.remove("video-playing");
  container.classList.add("video-paused");

  if (container.matches(".main-video-box, .video-box")) {
    syncBoxUi(container);
    return;
  }

  const btn = container.querySelector(".mute-btn, .main-mute, .breakdown-mute-btn");
  setMuteButtonState(btn, true);
}

function setPlayButtonState(button, isPlaying) {
  if (!button) return;

  button.innerHTML = isPlaying
    ? '<i class="fa-solid fa-pause"></i>'
    : '<i class="fa-solid fa-play"></i>';
  button.setAttribute("aria-label", isPlaying ? "Pause video" : "Play video");
}

function setMuteButtonState(button, isMuted) {
  if (!button) return;

  button.innerHTML = isMuted
    ? '<i class="fa-solid fa-volume-xmark"></i>'
    : '<i class="fa-solid fa-volume-high"></i>';
  button.setAttribute("aria-label", isMuted ? "Unmute video" : "Mute video");
}

function syncBoxUi(box) {
  const video = getVideo(box);

  if (!video) return;

  setPlayButtonState(getPlayButton(box), !video.paused);
  setMuteButtonState(getMuteButton(box), video.muted);
}

function syncCategoryUi(category) {
  if (!category) return;

  [getMainBox(category), ...getRevealBoxes(category)].forEach(syncBoxUi);
}

function syncAllRevealUi() {
  document.querySelectorAll(".main-video-box, .video-box").forEach(syncBoxUi);
}

function applyRevealPositions() {
  const positions = getRevealPositions();

  document.querySelectorAll(".category").forEach((category) => {
    getRevealBoxes(category).forEach((box, index) => {
      const position = positions[index % positions.length];

      box.style.setProperty("--explode-x", position.x);
      box.style.setProperty("--explode-y", position.y);
      box.style.setProperty("--explode-scale", position.scale);
    });
  });
}

function storeMainBoxOrigin(category) {
  const mainBox = getMainBox(category);

  if (!mainBox) return;

  const rect = mainBox.getBoundingClientRect();

  mainBox.style.setProperty("--collapse-top", `${rect.top}px`);
  mainBox.style.setProperty("--collapse-left", `${rect.left}px`);
  mainBox.style.setProperty("--collapse-width", `${rect.width}px`);
}

function waitForVideoReady(video, timeout = 900) {
  if (!video || video.readyState >= 2) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let finished = false;

    const finish = () => {
      if (finished) return;

      finished = true;
      video.removeEventListener("loadeddata", finish);
      resolve();
    };

    video.addEventListener("loadeddata", finish, { once: true });
    window.setTimeout(finish, timeout);
  });
}

function captureVideoFrame(video) {
  if (!video || video.readyState < 2) {
    return "";
  }

  const width = video.videoWidth || 360;
  const height = video.videoHeight || 640;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return "";
  }

  canvas.width = width;
  canvas.height = height;

  try {
    context.drawImage(video, 0, 0, width, height);
    return canvas.toDataURL("image/png");
  } catch {
    return "";
  }
}

function cloneGhostControl(control) {
  const ghostControl = control?.cloneNode(true);

  if (!ghostControl) {
    return null;
  }

  ghostControl.disabled = true;
  ghostControl.tabIndex = -1;
  ghostControl.setAttribute("aria-hidden", "true");

  return ghostControl;
}

function positionSwapGhost(ghost, rect) {
  ghost.style.top = `${rect.top}px`;
  ghost.style.left = `${rect.left}px`;
  ghost.style.width = `${rect.width}px`;
  ghost.style.height = `${rect.height}px`;
}

function createSwapGhost(box, rect) {
  const ghost = document.createElement("div");
  const snapshot = captureVideoFrame(getVideo(box));
  const computedStyle = window.getComputedStyle(box);
  const media = document.createElement(snapshot ? "img" : "div");
  const playGhost = cloneGhostControl(getPlayButton(box));
  const muteGhost = cloneGhostControl(getMuteButton(box));

  ghost.className = "swap-ghost";
  ghost.style.borderRadius = computedStyle.borderRadius;
  ghost.style.boxShadow = computedStyle.boxShadow;
  ghost.style.setProperty("--swap-duration", `${SWAP_ANIMATION_DURATION}ms`);
  ghost.style.transition = [
    `top ${SWAP_ANIMATION_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`,
    `left ${SWAP_ANIMATION_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`,
    `width ${SWAP_ANIMATION_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`,
    `height ${SWAP_ANIMATION_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`,
    `transform ${SWAP_ANIMATION_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`,
    `box-shadow ${SWAP_ANIMATION_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`
  ].join(", ");
  ghost.style.animationDuration = `${SWAP_ANIMATION_DURATION}ms`;

  positionSwapGhost(ghost, rect);

  media.className = "swap-ghost-media";

  if (snapshot) {
    media.src = snapshot;
    media.alt = "";
  }

  ghost.append(media);

  if (playGhost) {
    ghost.append(playGhost);
  }

  if (muteGhost) {
    ghost.append(muteGhost);
  }

  return ghost;
}

function animateSwap(mainBox, clickedBox) {
  const mainRect = mainBox.getBoundingClientRect();
  const clickedRect = clickedBox.getBoundingClientRect();
  const mainGhost = createSwapGhost(mainBox, mainRect);
  const clickedGhost = createSwapGhost(clickedBox, clickedRect);

  document.body.append(mainGhost, clickedGhost);
  mainBox.classList.add("swap-hidden");
  clickedBox.classList.add("swap-hidden");

  mainGhost.getBoundingClientRect();
  clickedGhost.getBoundingClientRect();

  mainGhost.classList.add("is-moving");
  clickedGhost.classList.add("is-moving");
  positionSwapGhost(mainGhost, clickedRect);
  positionSwapGhost(clickedGhost, mainRect);

  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve({ mainGhost, clickedGhost });
    }, SWAP_ANIMATION_DURATION);
  });
}

function pulseMainBox(box) {
  if (!box) return;

  box.classList.remove("is-swapping");
  void box.offsetWidth;
  box.classList.add("is-swapping");

  window.setTimeout(() => {
    box.classList.remove("is-swapping");
  }, 260);
}

function playVideo(video, { restart = false, unmute = false } = {}) {
  if (!video) return;

  pauseAllVideos(video);

  if (restart) {
    video.currentTime = 0;
  }

  if (unmute) {
    video.muted = false;
    video.volume = 1;
  }

  const playPromise = video.play();

  if (playPromise !== undefined) {
    playPromise.catch(() => {
      if (unmute) {
        video.muted = true;
      }

      video.play().catch(() => {});
    });
  }

  activeVideo = video;
}

function openCategory(category, afterOpen = null) {
  if (!category || interactionLocked) return false;

  if (activeCategory && activeCategory !== category) {
    collapse(activeCategory);
    window.setTimeout(() => {
      openCategory(category, afterOpen);
    }, REVEAL_CLOSE_DELAY + 30);
    return false;
  }

  storeMainBoxOrigin(category);

  activeCategory = category;
  isExploded = true;

  category.classList.remove("closing");
  category.classList.add("active");

  applyRevealPositions();
  syncCategoryUi(category);
  afterOpen?.();
  return true;
}

function collapse(category) {
  if (!category || interactionLocked) return;

  interactionLocked = true;
  isExploded = false;
  pauseAllVideos();
  syncCategoryUi(category);
  category.classList.add("closing");

  window.setTimeout(() => {
    category.classList.remove("active", "closing");

    if (activeCategory === category) {
      activeCategory = null;
    }

    interactionLocked = false;
  }, REVEAL_CLOSE_DELAY);
}

function toggleMainPlayback(category, options = {}) {
  const mainBox = getMainBox(category);
  const mainVideo = getVideo(mainBox);

  if (!mainVideo) return;

  if (mainVideo.paused) {
    playVideo(mainVideo, { restart: Boolean(options.restart), unmute: true });
  } else {
    mainVideo.pause();
    activeVideo = null;
  }

  syncCategoryUi(category);
}

async function swapMainVideo(category, clickedBox) {
  const mainBox = getMainBox(category);
  const mainVideo = getVideo(mainBox);
  const clickedVideo = getVideo(clickedBox);

  if (!mainBox || !mainVideo || !clickedVideo || isSwapAnimating) return;

  const mainSrc = mainVideo.getAttribute("src");
  const clickedSrc = clickedVideo.getAttribute("src");

  if (!mainSrc || !clickedSrc) return;

  if (mainSrc === clickedSrc) {
    playVideo(mainVideo, { restart: true, unmute: true });
    syncCategoryUi(category);
    return;
  }

  isSwapAnimating = true;
  interactionLocked = true;

  mainVideo.pause();
  clickedVideo.pause();
  syncCategoryUi(category);

  let swapGhosts = null;

  try {
    await Promise.all([
      waitForVideoReady(mainVideo, 220),
      waitForVideoReady(clickedVideo, 220)
    ]);

    const swapAnimation = animateSwap(mainBox, clickedBox);

    mainVideo.setAttribute("src", clickedSrc);
    clickedVideo.setAttribute("src", mainSrc);

    mainVideo.load();
    clickedVideo.load();

    mainVideo.muted = false;
    clickedVideo.muted = true;

    [swapGhosts] = await Promise.all([
      swapAnimation,
      Promise.all([
        waitForVideoReady(mainVideo),
        waitForVideoReady(clickedVideo)
      ])
    ]);

    playVideo(mainVideo, { restart: true, unmute: true });
    syncCategoryUi(category);
  } finally {
    mainBox.classList.remove("swap-hidden");
    clickedBox.classList.remove("swap-hidden");
    swapGhosts?.mainGhost.remove();
    swapGhosts?.clickedGhost.remove();
    interactionLocked = false;
    isSwapAnimating = false;
  }
}

document.querySelectorAll(".main-video-box, .video-box").forEach((box) => {
  const video = getVideo(box);
  const playButton = getPlayButton(box);
  const muteButton = getMuteButton(box);

  if (!video) return;

  syncBoxUi(box);

  box.addEventListener("click", (event) => {
    if (event.target.closest("button") || interactionLocked) return;

    const category = box.closest(".category");

    if (!category) return;

    if (box.classList.contains("main-video-box")) {
      if (activeCategory !== category || !isExploded) {
        openCategory(category);
      } else {
        toggleMainPlayback(category);
      }

      return;
    }

    if (activeCategory === category && isExploded) {
      swapMainVideo(category, box);
    }
  });

  playButton?.addEventListener("click", (event) => {
    event.stopPropagation();

    const category = box.closest(".category");

    if (!category || interactionLocked) return;

    if (box.classList.contains("main-video-box")) {
      if (activeCategory !== category || !isExploded) {
        openCategory(category, () => {
          toggleMainPlayback(category, { restart: true });
        });
        return;
      }

      toggleMainPlayback(category);
      return;
    }

    if (activeCategory === category && isExploded) {
      swapMainVideo(category, box);
    }
  });

  muteButton?.addEventListener("click", (event) => {
    event.stopPropagation();

    video.muted = !video.muted;
    syncBoxUi(box);
  });
});

document.querySelectorAll(".reveal-grid").forEach((grid) => {
  grid.addEventListener("click", (event) => {
    const category = grid.closest(".category");

    if (
      event.target === grid &&
      category &&
      category === activeCategory &&
      isExploded
    ) {
      collapse(category);
    }
  });
});

window.addEventListener("resize", applyRevealPositions);

window.addEventListener("scroll", () => {
  const currentScroll = window.scrollY;

  if (!activeCategory || !isExploded) {
    lastScrollY = currentScroll;
    return;
  }

  if (!isCollapsing && Math.abs(currentScroll - lastScrollY) > 10) {
    isCollapsing = true;
    collapse(activeCategory);

    window.setTimeout(() => {
      isCollapsing = false;
    }, REVEAL_CLOSE_DELAY + 120);
  }

  lastScrollY = currentScroll;
});

document.addEventListener("click", (event) => {
  if (!activeCategory || !isExploded) return;

  if (event.target.closest(".category")) return;

  collapse(activeCategory);
});

applyRevealPositions();
syncAllRevealUi();
