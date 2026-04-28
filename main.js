// ═══════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════

import DATA from "./data.js";

// Genre group mapping
const GENRE_GROUP = (g) => {
  if (/hip.hop|rap|trap/i.test(g)) return "Hip-Hop";
  if (/rock|grunge|metal/i.test(g)) return "Rock";
  if (/edm|electro|synth|disco|dance/i.test(g)) return "Electronic";
  if (/indie|folk|acoustic/i.test(g)) return "Indie";
  return "Pop";
};

// Tooltip
const tip = document.getElementById("tip");
function showTip(html, e) {
  tip.innerHTML = html;
  tip.style.opacity = "1";
  positionTip(e);
}
function positionTip(e) {
  let x = e.clientX + 14,
    y = e.clientY - 10;
  if (x + 220 > window.innerWidth) x = e.clientX - 224;
  if (y + 120 > window.innerHeight) y = e.clientY - 120;
  tip.style.left = x + "px";
  tip.style.top = y + "px";
}
function hideTip() {
  tip.style.opacity = "0";
}
document.addEventListener("mousemove", (e) => {
  if (tip.style.opacity !== "0") positionTip(e);
});

// ═══════════════════════════════════════════════
// SECTION 1 — STAGE
// ═══════════════════════════════════════════════
const stageColors = {
  ALL: "#e040fb",
  Pop: "#ff6b9d",
  "Indie Pop": "#00e5ff",
  "Hip-Hop": "#ffe500",
  "Alt Rock": "#ff6b35",
  "Synth-Pop": "#b39ddb",
  "EDM/Pop": "#00e676",
  "Pop Rock": "#ff8a65",
  "R&B/Pop": "#f48fb1",
  "Funk/Pop": "#ffcc02",
  "Pop Punk": "#ef5350",
};

function buildStage(genre) {
  const filtered =
    genre === "ALL" ? DATA : DATA.filter((d) => d.primary_genre === genre);
  const totalStr = filtered.reduce((s, d) => s + d.total_streams_billions, 0);
  const color = stageColors[genre] || "#e040fb";

  document.getElementById("genre-label").textContent =
    genre === "ALL" ? "ALL GENRES" : genre.toUpperCase();
  document.getElementById("genre-label").style.color = color;
  document.getElementById("streams-total").textContent =
    totalStr.toFixed(1) + "B";
  document.getElementById("song-count").textContent =
    filtered.length + " song" + (filtered.length !== 1 ? "s" : "");

  const svg = document.getElementById("stage-svg");
  svg.innerHTML = "";
  const W = 680,
    H = 230;

  // Stage arch
  const arch = document.createElementNS("http://www.w3.org/2000/svg", "path");
  arch.setAttribute("d", "M 20 220 Q 340 20 660 220");
  arch.setAttribute("fill", "none");
  arch.setAttribute("stroke", color);
  arch.setAttribute("stroke-width", "2");
  arch.setAttribute("opacity", "0.3");
  svg.appendChild(arch);

  // Floor line
  const fl = document.createElementNS("http://www.w3.org/2000/svg", "line");
  fl.setAttribute("x1", "20");
  fl.setAttribute("y1", "220");
  fl.setAttribute("x2", "660");
  fl.setAttribute("y2", "220");
  fl.setAttribute("stroke", "rgba(255,255,255,0.08)");
  fl.setAttribute("stroke-width", "1");
  svg.appendChild(fl);

  // Performer
  const perf = document.createElementNS("http://www.w3.org/2000/svg", "g");
  perf.innerHTML = `
    <circle cx="340" cy="196" r="5" fill="${color}" opacity="0.9"/>
    <line x1="340" y1="196" x2="340" y2="215" stroke="${color}" stroke-width="2"/>
    <line x1="328" y1="204" x2="352" y2="204" stroke="${color}" stroke-width="2"/>
    <line x1="340" y1="215" x2="330" y2="224" stroke="${color}" stroke-width="2"/>
    <line x1="340" y1="215" x2="350" y2="224" stroke="${color}" stroke-width="2"/>
    <circle cx="340" cy="193" r="3" fill="${color}" opacity="0.7"/>
  `;
  svg.appendChild(perf);

  // Spotlight
  const sp = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  sp.setAttribute("points", "340,0 310,220 370,220");
  sp.setAttribute("fill", `${color}14`);
  svg.appendChild(sp);

  // Crowd dots — sort by streams desc for sizing
  const sorted = [...filtered].sort(
    (a, b) => b.total_streams_billions - a.total_streams_billions,
  );
  const maxStr = Math.max(...sorted.map((d) => d.total_streams_billions));

  // Place in crowd rows
  const rows = [
    { y: 165, count: 8, xRange: [80, 600] },
    { y: 178, count: 12, xRange: [60, 620] },
    { y: 190, count: 16, xRange: [40, 640] },
    { y: 202, count: 20, xRange: [20, 660] },
    { y: 213, count: 24, xRange: [10, 670] },
  ];
  let idx = 0;
  for (const row of rows) {
    const n = Math.min(row.count, sorted.length - idx);
    if (n <= 0) break;
    const step = (row.xRange[1] - row.xRange[0]) / row.count;
    for (let i = 0; i < row.count && idx < sorted.length; i++, idx++) {
      const song = sorted[idx];
      const x = row.xRange[0] + step * i + step / 2 + (Math.random() - 0.5) * 6;
      const r = 3 + (song.total_streams_billions / maxStr) * 5;
      const op = 0.45 + (song.total_streams_billions / maxStr) * 0.55;
      const c = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      c.setAttribute("cx", x.toFixed(1));
      c.setAttribute("cy", row.y);
      c.setAttribute("r", r.toFixed(1));
      c.setAttribute("fill", color);
      c.setAttribute("opacity", op.toFixed(2));
      c.style.cursor = "pointer";
      c.style.transition = "r .2s, opacity .2s";
      c.addEventListener("mouseenter", (ev) => {
        c.setAttribute("r", (r + 3).toFixed(1));
        showTip(
          `<b>${song.song_title}</b><br><span class="tcy">${song.artist}</span><br><span class="tye">${song.total_streams_billions}B streams</span><br>${song.primary_genre} · ${song.release_year}`,
          ev,
        );
      });
      c.addEventListener("mouseleave", () => {
        c.setAttribute("r", r.toFixed(1));
        hideTip();
      });
      svg.appendChild(c);
    }
  }
}

document.querySelectorAll(".gbtn").forEach((btn) => {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".gbtn").forEach((b) => b.classList.remove("on"));
    this.classList.add("on");
    buildStage(this.dataset.g);
  });
});
buildStage("ALL");

// ═══════════════════════════════════════════════
// SECTION 2 — BPM DIAL
// ═══════════════════════════════════════════════
// Pre-compute genre BPM data
const genreBPM = {};
DATA.forEach((d) => {
  if (!genreBPM[d.primary_genre])
    genreBPM[d.primary_genre] = { bpms: [], streams: 0, songs: [] };
  genreBPM[d.primary_genre].bpms.push(d.bpm);
  genreBPM[d.primary_genre].streams += d.total_streams_billions;
  genreBPM[d.primary_genre].songs.push(d);
});
const genreList = Object.entries(genreBPM)
  .map(([g, v]) => ({
    genre: g,
    avgBpm: Math.round(v.bpms.reduce((a, b) => a + b, 0) / v.bpms.length),
    streams: +v.streams.toFixed(2),
    count: v.songs.length,
  }))
  .sort((a, b) => b.streams - a.streams);

const R = 120,
  CX = 140,
  CY = 140;
const START_ANGLE = Math.PI * 0.8; // 144° from top
const END_ANGLE = Math.PI * 2.2; // 396° from top

function polarToXY(angle, r) {
  return {
    x: CX + r * Math.cos(angle - Math.PI / 2),
    y: CY + r * Math.sin(angle - Math.PI / 2),
  };
}
function arcPath(a1, a2, r) {
  const s = polarToXY(a1, r),
    e = polarToXY(a2, r);
  const large = a2 - a1 > Math.PI ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

function updateDial(bpm) {
  const pct = bpm / 180;
  const angle = START_ANGLE + (END_ANGLE - START_ANGLE) * pct;
  document
    .getElementById("dial-track")
    .setAttribute("d", arcPath(START_ANGLE, END_ANGLE, R));
  document
    .getElementById("dial-fill")
    .setAttribute("d", arcPath(START_ANGLE, angle, R));
  const knob = polarToXY(angle, R);
  document.getElementById("dial-knob").setAttribute("cx", knob.x);
  document.getElementById("dial-knob").setAttribute("cy", knob.y);
  document.getElementById("dial-num").textContent = bpm;
  // CSS slider gradient
  document
    .getElementById("bpm-range")
    .style.setProperty("--pct", pct * 100 + "%");
  updateBPMCards(bpm);
}

function updateBPMCards(bpm) {
  const RANGE = 20;
  const matches = genreList
    .filter((g) => Math.abs(g.avgBpm - bpm) <= RANGE)
    .sort((a, b) => Math.abs(a.avgBpm - bpm) - Math.abs(b.avgBpm - bpm))
    .slice(0, 4);
  const maxStr = Math.max(...genreList.map((g) => g.streams));
  const container = document.getElementById("bpm-cards");
  if (matches.length === 0) {
    container.innerHTML = `<div class="bpm-card"><div class="bc-genre" style="color:var(--mu)">NO MATCH</div><div class="bc-meta">No genres average near ${bpm} BPM</div></div>`;
    return;
  }
  container.innerHTML = matches
    .map(
      (g, i) => `
    <div class="bpm-card${i === 0 ? " hl" : ""}">
      <div class="bc-genre">${g.genre}</div>
      <div class="bc-meta">avg <span>${g.avgBpm} BPM</span> · <span>${g.streams.toFixed(1)}B</span> streams · <span>${g.count}</span> songs</div>
      <div class="bc-bar"><div class="bc-fill" style="width:${((g.streams / maxStr) * 100).toFixed(1)}%"></div></div>
    </div>
  `,
    )
    .join("");
}

document.getElementById("bpm-range").addEventListener("input", function () {
  updateDial(+this.value);
});
updateDial(100);

// ═══════════════════════════════════════════════
// SECTION 3 — SCATTER
// ═══════════════════════════════════════════════
let scatterFilter = "ALL",
  scatterAxis = "danceability";
const cv = document.getElementById("scatter-cv");
const ctx = cv.getContext("2d");
const GENRE_COLORS = {
  Pop: "#ff6b9d",
  "Hip-Hop": "#ffe500",
  Rock: "#ff6b35",
  Electronic: "#00e676",
  Indie: "#00e5ff",
  Other: "#b39ddb",
};

function getColor(d) {
  return GENRE_COLORS[GENRE_GROUP(d.primary_genre)] || "#b39ddb";
}

function drawScatter() {
  const W = cv.offsetWidth;
  cv.width = W;
  cv.height = 360;
  const PAD = { l: 52, r: 24, t: 20, b: 48 };
  const iW = W - PAD.l - PAD.r,
    iH = 360 - PAD.t - PAD.b;

  ctx.clearRect(0, 0, W, 360);

  const visible =
    scatterFilter === "ALL"
      ? DATA
      : DATA.filter((d) => GENRE_GROUP(d.primary_genre) === scatterFilter);

  const xKey = scatterAxis;
  const xRange = xKey === "bpm" ? [0, 200] : [0, 1];
  const yMax = 5.5;

  // Grid lines
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = PAD.t + iH * (1 - i / 5);
    ctx.beginPath();
    ctx.moveTo(PAD.l, y);
    ctx.lineTo(PAD.l + iW, y);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "9px DM Mono";
    ctx.textAlign = "right";
    ctx.fillText(((i * yMax) / 5).toFixed(1) + "B", PAD.l - 4, y + 3);
  }
  for (let i = 0; i <= 5; i++) {
    const x = PAD.l + iW * (i / 5);
    ctx.beginPath();
    ctx.moveTo(x, PAD.t);
    ctx.lineTo(x, PAD.t + iH);
    ctx.stroke();
  }

  // Y-axis label
  ctx.save();
  ctx.translate(14, PAD.t + iH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "9px DM Mono";
  ctx.textAlign = "center";
  ctx.fillText("TOTAL STREAMS (B)", 0, 0);
  ctx.restore();

  // Trend line (simple linear regression)
  const pts = visible.map((d) => ({
    x: (d[xKey] - xRange[0]) / (xRange[1] - xRange[0]),
    y: d.total_streams_billions / yMax,
  }));
  if (pts.length > 2) {
    const mx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const my = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    const num = pts.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0);
    const den = pts.reduce((s, p) => s + (p.x - mx) ** 2, 0);
    const m = den ? num / den : 0;
    const b2 = my - m * mx;
    ctx.strokeStyle = "rgba(255,229,0,0.2)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(PAD.l + 0 * iW, PAD.t + (1 - (m * 0 + b2)) * iH);
    ctx.lineTo(PAD.l + 1 * iW, PAD.t + (1 - (m * 1 + b2)) * iH);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Dots
  const maxStr2 = Math.max(...DATA.map((d) => d.total_streams_billions));
  cv._dots = [];
  visible.forEach((d) => {
    const xv = d[xKey],
      yv = d.total_streams_billions;
    const px = PAD.l + ((xv - xRange[0]) / (xRange[1] - xRange[0])) * iW;
    const py = PAD.t + (1 - yv / yMax) * iH;
    const r = 3.5 + (yv / maxStr2) * 8;
    const color = getColor(d);
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fillStyle = color + "bb";
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
    cv._dots.push({ x: px, y: py, r, d });
  });

  // Legend
  const grps = Object.keys(GENRE_COLORS);
  let lx = PAD.l + 10,
    ly = PAD.t + 12;
  grps.forEach((g) => {
    ctx.beginPath();
    ctx.arc(lx, ly, 5, 0, Math.PI * 2);
    ctx.fillStyle = GENRE_COLORS[g];
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "9px DM Mono";
    ctx.textAlign = "left";
    ctx.fillText(g, lx + 8, ly + 3);
    lx += ctx.measureText(g).width + 26;
  });
}

cv.addEventListener("mousemove", (e) => {
  if (!cv._dots) return;
  const rect = cv.getBoundingClientRect();
  const mx = e.clientX - rect.left,
    my = e.clientY - rect.top;
  let hit = null;
  for (const dot of cv._dots) {
    if (Math.hypot(mx - dot.x, my - dot.y) < dot.r + 4) {
      hit = dot;
      break;
    }
  }
  if (hit) {
    const d = hit.d;
    const xLbl = {
      danceability: "Danceability",
      energy: "Energy",
      valence: "Valence",
      acousticness: "Acousticness",
      bpm: "BPM",
    }[scatterAxis];
    const xVal =
      scatterAxis === "bpm" ? d.bpm : (d[scatterAxis] * 100).toFixed(0) + "%";
    showTip(
      `<b>${d.song_title}</b><br><span class="tcy">${d.artist}</span><br><span class="tye">${d.total_streams_billions}B</span> streams<br>${xLbl}: <span class="tcy">${xVal}</span><br>${d.primary_genre}`,
      e,
    );
  } else hideTip();
});
cv.addEventListener("mouseleave", hideTip);

document.querySelectorAll("[data-f]").forEach((btn) => {
  btn.addEventListener("click", function () {
    document
      .querySelectorAll("[data-f]")
      .forEach((b) => b.classList.remove("on"));
    this.classList.add("on");
    scatterFilter = this.dataset.f;
    drawScatter();
  });
});
document.getElementById("x-axis").addEventListener("change", function () {
  scatterAxis = this.value;
  const lbl = this.options[this.selectedIndex].text;
  document.getElementById("x-label-low").textContent = "Low " + lbl;
  document.getElementById("x-label-title").textContent =
    lbl.toUpperCase() + " →";
  document.getElementById("x-label-high").textContent = "High " + lbl;
  drawScatter();
});
window.addEventListener("resize", drawScatter);
drawScatter();

// ═══════════════════════════════════════════════
// SECTION 4 — VALENCE / EMOTION FACE
// ═══════════════════════════════════════════════
// Key genres for valence explorer (pick most interesting)
const VALENCE_GENRES = [
  "Pop",
  "Indie Pop",
  "Hip-Hop",
  "Alt Rock",
  "Synth-Pop",
  "EDM/Pop",
  "R&B/Pop",
  "Funk/Pop",
  "Pop Punk",
  "Pop Rock",
];
const EMOTION_LABELS = (v) => {
  if (v >= 0.8)
    return {
      label: "EUPHORIC 🎉",
      desc: "Bright, joyful, celebratory. Pure energy and happiness.",
    };
  if (v >= 0.65)
    return {
      label: "UPBEAT 😊",
      desc: "Positive and feel-good. Great for dancing and good vibes.",
    };
  if (v >= 0.5)
    return {
      label: "NEUTRAL 😐",
      desc: "Balanced mood. Not too happy, not too sad.",
    };
  if (v >= 0.35)
    return {
      label: "MELANCHOLIC 😔",
      desc: "Bittersweet and introspective. Emotionally complex.",
    };
  return {
    label: "DARK 😢",
    desc: "Sad, brooding, or intense. Heavy emotional weight.",
  };
};

const vBtnsEl = document.getElementById("val-btns");
VALENCE_GENRES.forEach((g) => {
  const songs = DATA.filter((d) => d.primary_genre === g);
  if (!songs.length) return;
  const avgVal = (
    songs.reduce((s, d) => s + d.valence, 0) / songs.length
  ).toFixed(2);
  const totalStr = songs
    .reduce((s, d) => s + d.total_streams_billions, 0)
    .toFixed(1);
  const btn = document.createElement("button");
  btn.className = "val-genre-btn";
  btn.dataset.g = g;
  btn.innerHTML = `<span>${g}</span>
    <div class="vg-right">
      <span class="vg-val" style="color:var(--cy)">${(avgVal * 100).toFixed(0)}%</span>
      <span class="vg-lbl">valence</span>
    </div>`;
  btn.addEventListener("click", () =>
    selectValGenre(g, +avgVal, +totalStr, songs.length),
  );
  vBtnsEl.appendChild(btn);
});

function selectValGenre(genre, valence, streams, count) {
  document
    .querySelectorAll(".val-genre-btn")
    .forEach((b) => b.classList.remove("on"));
  document
    .querySelector(`.val-genre-btn[data-g="${genre}"]`)
    .classList.add("on");
  updateFace(valence);
  const emo = EMOTION_LABELS(valence);
  document.getElementById("val-info-genre").textContent =
    genre.toUpperCase() + " · " + emo.label;
  document.getElementById("val-info-text").textContent =
    `Avg valence: ${(valence * 100).toFixed(0)}% across ${count} song${count > 1 ? "s" : ""} — ${streams}B total streams. ${emo.desc}`;
}

function updateFace(v) {
  // Mouth: v=0 → sad, v=0.5 → flat, v=1 → big smile
  const cy = 128 + (v - 0.5) * 28;
  const ctrl = 100;
  document
    .getElementById("face-mouth")
    .setAttribute("d", `M 68 128 Q 100 ${cy} 132 128`);
  // Brows: low valence = furrowed (inner corners down), high = raised
  const browY = 68 - (v - 0.5) * 10;
  document
    .getElementById("brow-l")
    .setAttribute(
      "d",
      `M 60 ${browY + (v < 0.4 ? 8 : 0)} Q 72 ${browY} 84 ${browY + (v < 0.4 ? 8 : 0)}`,
    );
  document
    .getElementById("brow-r")
    .setAttribute(
      "d",
      `M 116 ${browY + (v < 0.4 ? 8 : 0)} Q 128 ${browY} 140 ${browY + (v < 0.4 ? 8 : 0)}`,
    );
  // Blush
  const blushOp = Math.max(0, (v - 0.65) * 3);
  document
    .getElementById("blush-l")
    .setAttribute("opacity", blushOp.toFixed(2));
  document
    .getElementById("blush-r")
    .setAttribute("opacity", blushOp.toFixed(2));
  // Eye color
  const ec = v > 0.5 ? "#e040fb" : "#00e5ff";
  document.getElementById("eye-l").setAttribute("fill", ec);
  document.getElementById("eye-r").setAttribute("fill", ec);
  // Label
  document.getElementById("face-val-num").textContent =
    (v * 100).toFixed(0) + "% VALENCE";
}

updateFace(0.5);
