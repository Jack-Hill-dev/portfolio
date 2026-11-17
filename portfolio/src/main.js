import "./styles.css";

const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const windows = [...document.querySelectorAll(".portfolio-window")];
const statements = [...document.querySelectorAll(".statement")];
const copy = document.querySelector(".about-copy");
const underline = document.querySelector(".underlined");
const circle = document.querySelector(".blue-circle");


const snapPoints = [...document.querySelectorAll(".snap-point")];
const status = document.querySelector(".page-status");
const stage = document.querySelector(".stage");
const stops = [0, .7, 1.4, 18.2, 24.2];
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const ease = value => value * value * value * (value * (value * 6 - 15) + 10);
const lerp = (start, end, progress) => start + (end - start) * progress;
let current = 0, target = 0, velocity = 0, last = 0;
let activeText = -1, activePage = -1;
let autoplayStart = null;
let autoplayDone = false;
let scrollLocked = false;
let savedScrollBehavior = "";
const lockKeys = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "]);
function preventScroll(event) { if (scrollLocked && event.cancelable) event.preventDefault(); }
addEventListener("wheel", preventScroll, { passive: false });
addEventListener("touchmove", preventScroll, { passive: false });
addEventListener("keydown", event => { if (scrollLocked && lockKeys.has(event.key)) event.preventDefault(); });
function lockScroll() {
  scrollLocked = true;
  savedScrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";
  document.documentElement.classList.add("transition-playing");
  window.scrollTo({ top: scrollY, behavior: "instant" });
}
function finishAutoplay() {
  const raw = 6.2 + (2.9 - 2.6) * 6;
  window.scrollTo({ top: raw / 24.2 * scrollDistance, behavior: "instant" });
  target = current = 2.9;
  velocity = 0;
  autoplayStart = null;
  autoplayDone = true;
  requestAnimationFrame(() => {
    document.documentElement.classList.remove("transition-playing");
    document.documentElement.style.scrollBehavior = savedScrollBehavior;
    scrollLocked = false;
    read();
  });
}
let scrollDistance = 1, width = innerWidth, height = innerHeight, diameter = 1;

function read() {
  if (scrollLocked) return;
  const raw = clamp(scrollY / scrollDistance) * 24.2;
  target = raw <= 1.4 ? raw : raw <= 6.2 ? 1.4 + (raw - 1.4) / 4 : 2.6 + (raw - 6.2) / 6;
}
function measure() {
  width = stage.clientWidth;
  height = stage.clientHeight;
  scrollDistance = Math.max(1, document.querySelector(".journey").offsetHeight - innerHeight);
  snapPoints.forEach((point, index) => {
    point.style.top = `${Math.max(0, Math.min(scrollDistance - 1, stops[index] / 24.2 * scrollDistance))}px`;
  });
  diameter = width <= 700 ? width * 3.2 : Math.min(height * 3.44, width * 2.16);
  circle.style.width = `${diameter}px`;
  circle.style.height = `${diameter}px`;
  const body = document.querySelector(".cv-body");
  const paper = document.querySelector(".cv-paper");
  const paperWidth = Math.min(width * (width <= 700 ? .84 : .5), height * .60);
  const fit = paperWidth / 794;
  paper.style.width = `${paperWidth}px`;
  paper.style.height = `${paperWidth * 297 / 210}px`;
  windows[1].style.width = `${paperWidth}px`;
  body.style.transform = `scale(${fit})`;
  read();
}
addEventListener("scroll", read, { passive: true });
addEventListener("resize", measure, { passive: true });
window.visualViewport?.addEventListener("resize", measure, { passive: true });
measure();
current = target;
document.fonts.ready.then(measure);

function tick(time) {
  const dt = Math.min((time - last) / 1000 || 1 / 60, .04);
  last = time;
  if (!scrollLocked && target < 1.4) autoplayDone = false;
  if (!autoplayDone && autoplayStart === null && target >= 1.55 && current >= 1.48) {
    autoplayStart = time;
    lockScroll();
  }
  if (autoplayStart !== null) {
    const progress = reduce.matches ? 1 : clamp((time - autoplayStart) / 3000);
    current = lerp(1.55, 2.9, ease(progress));
    velocity = 0;
    if (progress === 1) finishAutoplay();
  } else if (reduce.matches) { current = target; velocity = 0; }
  else {
    const omega = 16, decay = Math.exp(-omega * dt), change = current - target;
    const step = (velocity + omega * change) * dt;
    velocity = (velocity - omega * step) * decay;
    current = target + (change + step) * decay;
  }
  let nextText = activeText < 0 ? Math.round(clamp(current / 1.4) * 2) : activeText;
  if (current > (nextText + .5) * .7 + .06 && nextText < 2) nextText++;
  if (current < (nextText - .5) * .7 - .06 && nextText > 0) nextText--;
  if (nextText !== activeText) {
    activeText = nextText;
    statements.forEach((element, index) => element.classList.toggle("is-current", index === activeText));
    const drawing = activeText === 1;
    underline.classList.toggle("is-drawn", drawing);
    underline.classList.toggle("is-erasing", !drawing);
    underline.style.setProperty("--underline", drawing ? 1 : 0);
  }
  const mobile = width <= 700;
  copy.style.transform = reduce.matches ? "none" : `translate3d(0,${-clamp(current / 1.4) * (mobile ? 24 : 65)}px,0)`;
  const compress = ease(clamp((current - 1.55) / .9));
  const rawPage = current <= 4 ? clamp((current - 2.9) / 1.1) : 1 + clamp((current - 4) / 1.6);
  const page = rawPage;
  const active = Math.round(page);
  const spacing = width * (mobile ? .86 : .43);
  const homeWidth = lerp(width, width * (mobile ? .30 : .23), compress);
  const homeHeight = lerp(height, height * .56, compress);
  const exit = ease(clamp((current - 2.25) / .65));
  const homeLeft = lerp(0, width * .045, compress) - exit * (homeWidth + width * .08) - page * spacing;
  windows[0].style.width = `${homeWidth}px`;
  windows[0].style.height = `${homeHeight}px`;
  windows[0].style.left = "0";
  windows[0].style.clipPath = "none";
  windows[0].style.borderRadius = `${compress * 18}px`;
  windows[0].style.transform = `translate3d(${homeLeft}px,-50%,0)`;
  windows[0].style.setProperty("--compressed", compress);
  const cvHomeX = width * (mobile ? .38 : .26);
  const entrance = ease(clamp((current - 2.05) / .85));
  const cvX = lerp(width * 1.35, cvHomeX, entrance) - page * spacing;
  windows[1].style.transform = `translate3d(calc(-50% + ${cvX - width / 2}px), -50%, 0) rotate(${reduce.matches ? 0 : 4}deg)`;
  windows.slice(2).forEach((element, offset) => {
    const arrival = lerp(width * 1.5, width * .5 + (offset + 1) * spacing, entrance);
    const x = arrival - width * .5 - page * spacing;
    element.style.transform = `translate3d(calc(-50% + ${x}px), -50%, 0)`;
  });

  const contact = ease(clamp((current - 1.55) / .45));
  const flight = clamp((current - 2.15) / .65);
  const shrink = ease(clamp((current - 1.95) / .8));
  const size = lerp(diameter, mobile ? 160 : 260, shrink);
  const initialX = width * (mobile ? .9 : .6) + diameter / 2;
  const edge = homeLeft + homeWidth;
  const pushedX = edge - size / 2;
  const x = lerp(initialX, pushedX, contact) - ease(flight) * (width + size);
  const y = lerp(height * (mobile ? .85 : .5), height * .52, contact) - Math.sin(flight * Math.PI) * height * .08;
  circle.style.transform = `translate3d(${x - diameter / 2}px,${y - diameter / 2}px,0) scale(${size / diameter})`;
  circle.style.opacity = 1 - ease(clamp((flight - .85) / .15));

  windows.forEach((element, index) => {
    const usable = index === 1 ? entrance > .65 && page < .8 : index === 0 ? exit < .95 : entrance > .9 && Math.abs((index - 1) - page) < 1.1;
    element.inert = !usable;
    element.setAttribute("aria-hidden", !usable);
  });
  if (activePage !== active) {
    activePage = active;
    status.textContent = active === 1 ? "CV, page 2 of 4" : `Page ${active + 1} of 4`;
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
