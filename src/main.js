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
let travelRate = 1;
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
let scrollDistance = 1, width = innerWidth, height = innerHeight, diameter = 1, cvWidth = 1;

function read() {
  if (scrollLocked) return;
  const raw = clamp(scrollY / scrollDistance) * 24.2;
  target = raw <= 1.4 ? raw : raw <= 6.2 ? 1.4 + (raw - 1.4) / 4 : 2.6 + (raw - 6.2) / 6;
}
function measure() {
  width = stage.clientWidth;
  height = stage.clientHeight;
  scrollDistance = Math.max(1, document.querySelector(".journey").offsetHeight - innerHeight);
  diameter = width <= 700 ? width * 3.2 : Math.min(height * 3.44, width * 2.16);
  circle.style.width = `${diameter}px`;
  circle.style.height = `${diameter}px`;
  const body = document.querySelector(".cv-body");
  const paper = document.querySelector(".cv-paper");
  const panelHeight = Math.min(height * (width <= 700 ? .68 : .78), Math.max(260, height - 190));
  stage.style.setProperty("--panel-height", `${panelHeight}px`);
  const paperWidth = panelHeight * 210 / 297;
  cvWidth = paperWidth;
  const fit = paperWidth / 794;
  paper.style.width = `${paperWidth}px`;
  paper.style.height = `${paperWidth * 297 / 210}px`;
  windows[1].style.width = `${paperWidth}px`;
  body.style.transform = `scale(${fit})`;
  const mobile = width <= 700;
  const gap = mobile ? 36 : 72;
  const projectWidth = width * (mobile ? .78 : .5);
  const projectCenter = width * (mobile ? .29 : .19) + cvWidth / 2 + gap + projectWidth / 2;
  const firstDistance = Math.max(1, projectCenter - width / 2);
  travelRate = (firstDistance + projectWidth + gap) / 2.7;
  const projectStop = 2.9 + firstDistance / travelRate;
  stops[3] = 6.2 + (projectStop - 2.6) * 6;
  snapPoints.forEach((point, index) => {
    point.style.top = `${Math.max(0, Math.min(scrollDistance - 1, stops[index] / 24.2 * scrollDistance))}px`;
  });
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
  const elapsedScroll = clamp(current - 2.9, 0, 2.7);
  const gap = mobile ? 36 : 72;
  const projectWidth = width * (mobile ? .78 : .5);
  const cvHomeX = width * (mobile ? .29 : .19);
  const projectCenter = cvHomeX + cvWidth / 2 + gap + projectWidth / 2;
  const firstDistance = projectCenter - width / 2;
  const travel = elapsedScroll * travelRate;
  const page = travel <= firstDistance ? travel / Math.max(1, firstDistance) : 1 + (travel - firstDistance) / (projectWidth + gap);
  const active = Math.round(page);
  const homeWidth = lerp(width, width * (mobile ? .30 : .23), compress);
  const homeHeight = lerp(height, height * .56, compress);
  const exit = ease(clamp((current - 1.92) / .38));
  const homeLeft = lerp(0, width * .045, compress) - exit * (homeWidth + width * .16) - travel;
  windows[0].style.visibility = "visible";
  circle.style.visibility = "visible";
  windows[0].style.width = `${homeWidth}px`;
  windows[0].style.height = `${homeHeight}px`;
  windows[0].style.left = "0";
  windows[0].style.clipPath = "none";
  windows[0].style.borderRadius = `${compress * 18}px`;
  windows[0].style.transform = `translate3d(${homeLeft}px,-50%,0)`;
  windows[0].style.setProperty("--compressed", compress);
  const entrance = ease(clamp((current - 1.78) / .86));
  const homeEdge = homeLeft + homeWidth;
  const cvX = Math.max(cvHomeX - travel, homeEdge + gap + cvWidth / 2);
  windows[1].style.transform = `translate3d(calc(-50% + ${cvX - width / 2}px), -50%, 0) rotate(0deg)`;
  windows.slice(2).forEach((element, offset) => {
    const arrival = lerp(width * 1.5, projectCenter + offset * (projectWidth + gap), entrance);
    const x = arrival - width * .5 - travel;
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

const projectDetails = document.querySelector(".project-details");
document.querySelector(".project-more").addEventListener("click", () => projectDetails.showModal());
document.querySelector(".project-details-close").addEventListener("click", () => projectDetails.close());
projectDetails.addEventListener("click", event => { if (event.target === projectDetails) projectDetails.close(); });

const contactPanel = document.querySelector(".contact-panel");
const greeting = document.querySelector(".greeting-word");
const requestLine = document.querySelector(".terminal-request");
const jsonOutput = document.querySelector(".terminal-json");
const copyStatus = document.querySelector(".copy-status");
const pause = ms => new Promise(resolve => setTimeout(resolve, reduce.matches ? 0 : ms));
let contactStarted = false;
async function typeInto(element, text, speed = 32) {
  for (const character of Array.from(text)) {
    element.textContent += character;
    if (!reduce.matches) await pause(speed);
  }
}
async function copyValue(button, value) {
  if (button.dataset.copying === "true") return;
  try {
    await navigator.clipboard.writeText(value);
    button.dataset.copying = "true";
    button.textContent = "Copied";
    copyStatus.textContent = "Copied to clipboard";
    setTimeout(() => {
      button.textContent = button.dataset.label || value;
      button.dataset.copying = "false";
      copyStatus.textContent = "";
    }, 1500);
  } catch {
    copyStatus.textContent = "Couldn't copy. You can select and copy the text.";
  }
}
async function appendContact(value, copyTarget = value) {
  const button = document.createElement("button");
  button.type = "button";
  button.disabled = true;
  button.className = "terminal-copy";
  button.setAttribute("aria-label", `Copy ${copyTarget}`);
  button.dataset.label = value;
  button.style.minWidth = `${value.length}ch`;
  button.addEventListener("click", () => copyValue(button, copyTarget));
  jsonOutput.append(button);
  await typeInto(button, value, 28);
  button.disabled = false;
}
async function contactSequence() {
  await pause(220);
  if (!reduce.matches) {
    for (const word of ["Bonjour", "Hola", "Ciao", "こんにちは", "مرحبا", "Hello"]) {
      const letters = Array.from(greeting.textContent);
      while (letters.length) {
        letters.pop(); greeting.textContent = letters.join(""); await pause(15);
      }
      greeting.lang = word === "こんにちは" ? "ja" : word === "مرحبا" ? "ar" : "en";
      await typeInto(greeting, word, 32);
      await pause(170);
    }
  }
  contactPanel.classList.add("contact-ready");
  await pause(650);
  await typeInto(requestLine, "GET https://jack-hill-dev.github.io/portfolio/contact", 24);
  await pause(400);
  const appendText = async text => {
    const node = document.createElement("span");
    jsonOutput.append(node);
    await typeInto(node, text, 23);
  };
  await appendText("{\n  \"message\": \"Hello world.\",\n  \"status\": \"200\",\n  \"contact_details\": {\n    \"email\": \"");
  await appendContact("JH.Hill2010@outlook.com");
  await appendText("\",\n    \"github\": \"");
  await appendContact("Jack-Hill-dev", "https://github.com/Jack-Hill-dev");
  await appendText("\",\n    \"mobile\": \"");
  await appendContact("+44 7306 549599");
  await appendText("\"\n  }\n}");
  contactPanel.classList.add("contact-complete");
}
const contactObserver = new IntersectionObserver(entries => {
  if (!contactStarted && entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .55)) {
    contactStarted = true;
    contactObserver.disconnect();
    contactSequence();
  }
}, { threshold: [.55] });
contactObserver.observe(contactPanel);
