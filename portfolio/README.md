# Personal portfolio app

The original centered portfolio, converted to an npm project with esbuild. HTML, CSS, and JavaScript are separate files. The explanatory source comments are preserved.

## Requirements

Node.js 22.12+ and npm. This project was built with Node 22.13.0.

## Start developing

```sh
npm install
npm run dev
```

Open the local URL printed in the terminal. esbuild updates the browser as you edit. Use the development server instead of opening index.html with file://, because JavaScript modules need to be served over HTTP.

## Build and preview

```sh
npm run check
npm run build
npm run preview
```

The production build is written to dist/. Upload that directory to a static web host. The app has no server, database, or account system.

## Files

- index.html: page metadata, introduction, project mockups, contact link, and progress dots.
- src/styles.css: annotated layout, type, artwork, responsive rules, and reduced-motion styles.
- src/main.js: imports CSS and controls scroll progress, easing, scene visibility, text emphasis, and pointer tilt.
- build.mjs: annotated bundling, local server, HTML copying, and live-reload setup.
- package.json: npm commands and the pinned esbuild development dependency.
- package-lock.json: exact dependency versions for repeatable installation; use npm ci when installing from the lockfile.
- .gitignore: keeps dependencies, generated builds, and local settings out of source control.

## Personalize

Replace bracketed copy in index.html. Update the browser title, meta description, and both the visible email and its mailto address. The two projects are sample artwork, not claims about your actual work.

Motion settings are commented in src/main.js. The journey height in src/styles.css controls available scroll distance. Reduced-motion users get vertically stacked sections instead of the animated sticky stage.

Some earlier CSS selectors and later overrides are retained from the supplied source to preserve its appearance. Comments explain their behavior.
