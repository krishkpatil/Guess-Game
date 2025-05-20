# 🌍 World Flag Challenge

A single‑page Flag‑guessing game built with **Leaflet**, vanilla **JS**, and a splash of **confetti**. Click the country whose flag you see, beat the clock for more points, and track your high score locally.

---

## 🗂 Project structure

```text
.
├── index.html       # Mark‑up & component layout
├── style.css        # All custom styles + Leaflet tweaks
├── main.js          # Game logic & state management
└── README.md        # This file
```

> You can organise further (e.g. `css/`, `js/`, `assets/flags`)—just update the paths in **index.html** accordingly.

---

## 🚀 Quick start

1. **Clone** the repo

   ```bash
   git clone https://github.com/krishkpatil/Guess-Game.git
   cd Guess-Game
   ```

2. **Serve** it locally (any static server)

   ```bash
   # Using Python 3
   python -m http.server 8000
   # Or with npm (http‑server)
   npx http-server -p 8000
   ```

3. Open [http://localhost:8000](http://localhost:8000) in your browser. That’s it!

---

## 🏗 Deploying

### GitHub Pages

1. Push the repo to GitHub.
2. In **Repository → Settings → Pages**, select the **main** branch (root).
3. Save—GitHub builds and serves automatically at `https://<user>.github.io/<repo>/`.

### Netlify / Vercel

Both detect static sites automatically:

```bash
npm i -g vercel  # or netlify-cli
vercel           # log in → follow prompts
```

> No backend = no special config.

---

## 🔧 Customising

* **Add more countries** → edit `COUNTRIES` array in **main.js** (name, ISO‑2, `[lat,lng]`).
* **Change scoring** → tweak `POINTS_TABLE` in **main.js**.
* **Styling** → modify **style.css** (all colours pulled from CSS variables).

---

## 📄 License

MIT — do what you like, attribution appreciated.
