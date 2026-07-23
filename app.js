/**
 * Plantatec — plantas técnicas de embalagens flexíveis
 *
 * Tubo / gusset / Fin Seal / Bottom Gusset: planta horizontal
 * Doyen / K-skirt (I): face = (altura − sanfona) / 2
 */

const $ = (sel, root = document) => root.querySelector(sel);
const round2 = (n) => Math.round(n * 100) / 100;

const CHAPEU_W = 25;
const CHAPEU_H = 9;
const CORNER_DIAM = 15; // mm

function readForm(form) {
  const fd = new FormData(form);
  const num = (k, fallback = 0) => {
    const v = parseFloat(String(fd.get(k) ?? ""));
    return Number.isFinite(v) ? v : fallback;
  };
  return {
    tipoEmbalagem: String(fd.get("tipoEmbalagem") || "2side"),
    cantos: String(fd.get("cantos") || "reto"),
    largura: num("largura", 0),
    alturaTotal: num("alturaTotal", 0),
    sanfona: num("sanfona", 0),
    suspensao: String(fd.get("suspensao") || "nenhuma"),
    diametroFuro: num("diametroFuro", 0),
    distSuspensao: num("distSuspensao", 0),
    soldaLateral: Math.max(1, num("soldaLateral", 8)),
    transpasse: Math.max(0, num("transpasse", 0)),
    soldaDorsal: Math.max(0, num("soldaDorsal", 10)),
    fundo: Math.max(0, num("fundo", 0)),
    ladoTranspasse: String(fd.get("ladoTranspasse") || "esquerda"),
    tipoSoldaLong: String(fd.get("tipoSoldaLong") || "lap") === "fin" ? "fin" : "lap",
    distUSanfona: Math.max(0, num("distUSanfona", 3)),
    temZipper: fd.get("temZipper") === "on",
    distZipper: num("distZipper", 0),
    larguraZipper: num("larguraZipper", 10) || 10,
    temCorte: fd.get("temCorte") === "on",
    distCorte: num("distCorte", 0),
    temFotocelula: fd.get("temFotocelula") === "on",
    fotoLargura: Math.max(1, num("fotoLargura", 5)),
    fotoAltura: Math.max(1, num("fotoAltura", 10)),
    fotoPosicao: String(fd.get("fotoPosicao") || "canto-esquerdo-baixo"),
    fotoDistLateral: Math.max(0, num("fotoDistLateral", 0)),
    fotoDistVertical: Math.max(0, num("fotoDistVertical", 0)),
    fotoMeio: fd.get("fotoMeio") === "on",
    temValvula: fd.get("temValvula") === "on",
    valvulaY: num("valvulaY", 40),
    valvulaX: num("valvulaX", 0),
    valvulaDiametro: Math.max(1, num("valvulaDiametro", 15)),
    valvulaLivre: Math.max(0, num("valvulaLivre", 3)),
    spoutPosicao: String(fd.get("spoutPosicao") || "centro"),
    spoutLivre: Math.max(0, num("spoutLivre", 5)),
  };
}

function derive(p) {
  const S = Math.max(0, p.sanfona);
  const W = p.largura;
  const is4side = p.tipoEmbalagem === "4side";
  const isFlatBottom = p.tipoEmbalagem === "flatbottom";
  const isSideGusset = p.tipoEmbalagem === "sidegusset";
  const isBottomGusset = p.tipoEmbalagem === "bottomgusset";
  const isSpouted = p.tipoEmbalagem === "spouted";
  const isStickPack = p.tipoEmbalagem === "stickpack";
  const isGusset = is4side || isFlatBottom || isSideGusset || isSpouted;
  const is2side = p.tipoEmbalagem === "2side";
  const isAlmofada = p.tipoEmbalagem === "almofada";
  const isFinSeal = p.tipoEmbalagem === "finseal";
  const isLapSeal = p.tipoEmbalagem === "lapseal";
  const isFlowPack = p.tipoEmbalagem === "flowpack";
  const isPillow = is2side || isAlmofada || isFinSeal || isLapSeal;
  const is3side = p.tipoEmbalagem === "3side";
  const isSachet3 = p.tipoEmbalagem === "sachet3";
  const isSachet4 = p.tipoEmbalagem === "sachet4";
  const isVacuum3 = p.tipoEmbalagem === "vacuum3";
  const isVacuum4 = p.tipoEmbalagem === "vacuum4";
  const isVacuum = isVacuum3 || isVacuum4;
  const isSachet = isSachet3 || isSachet4;
  const isFlatSheet = is3side || isSachet || isVacuum;
  // Gusset / pillow / 3side / sachet / vacuum / bottom / flow / stick: altura = painel (ou comprimento)
  // Doyen/K (I): face = (altura − sanfona) / 2
  const face =
    isGusset || isPillow || isFlatSheet || isBottomGusset || isFlowPack || isStickPack
      ? p.alturaTotal
      : (p.alturaTotal - S) / 2;
  const sanfona = isPillow || isFlatSheet ? 0 : S;
  const fundo = isFlatBottom ? Math.max(0, round2(p.fundo || 0)) : 0;
  const soldaAuto = Math.min(12, Math.max(5, round2(W * 0.08)));
  const solda = p.soldaLateral > 0 ? round2(p.soldaLateral) : soldaAuto;
  const transpasse = isFlatSheet ? 0 : Math.max(0, round2(p.transpasse || 0));
  const soldaDorsalRaw = Math.max(0, round2(p.soldaDorsal ?? 0));
  const soldaDorsal =
    transpasse > 0.01
      ? Math.min(transpasse, soldaDorsalRaw > 0 ? soldaDorsalRaw : Math.min(10, transpasse))
      : 0;
  const ladoTranspasse = p.ladoTranspasse === "direita" ? "direita" : "esquerda";
  const tipoSoldaLong = isFinSeal
    ? "fin"
    : isLapSeal
      ? "lap"
      : p.tipoSoldaLong === "fin"
        ? "fin"
        : "lap";
  const distUSanfona = Math.max(0, round2(p.distUSanfona ?? 3));
  const distZip = Math.max(2, p.distZipper);
  const zipW = Math.max(1, p.larguraZipper || 10);
  const distCorte = Math.max(2, p.distCorte);
  const distSusp = Math.max(2, p.distSuspensao);
  const util = Math.max(4, W - 2 * solda);
  const uRadius = util / 2;
  const cornerR = p.cantos === "arredondado" ? CORNER_DIAM / 2 : 0;

  // Flow Pack: filme = 2×alturaProduto + largura + transpasse; passo = comprimento + 2×solda
  const flowFilmW = isFlowPack ? round2(2 * S + W + transpasse) : 0;
  const flowPitch = isFlowPack ? round2(face + 2 * solda) : 0;

  // Stick Pack: filme = 2×largura + 2×profundidade + transpasse; passo = comprimento + 2×solda
  const stickFilmW = isStickPack ? round2(2 * W + 2 * S + transpasse) : 0;
  const stickPitch = isStickPack ? round2(face + 2 * solda) : 0;

  const ok = isFlowPack
    ? face > 8 && W > 4 && S > 0
    : isStickPack
      ? face > 8 && W > 4 && S > 0
      : isBottomGusset
        ? face > 8 && W > 4 && S > 4
        : isSideGusset || isSpouted
          ? face > 8 && W > solda * 2 + 4 && S > 4
          : is4side || isFlatBottom
            ? face > 8 && W > solda * 2 + 4 && S >= 0 && (!isFlatBottom || fundo > 4)
            : isPillow
              ? face > 8 && W > 4
              : isFlatSheet
                ? face > 8 && W > solda * 2 + 4
                : face > 8 && W > solda * 2 + 4 && sanfona >= 0 && Math.abs(face * 2 + sanfona - p.alturaTotal) < 0.05;

  return {
    face,
    sanfona,
    fundo,
    W,
    solda,
    transpasse,
    soldaDorsal,
    ladoTranspasse,
    tipoSoldaLong,
    distUSanfona,
    distZip,
    zipW,
    distCorte,
    distSusp,
    uRadius,
    cornerR,
    flowFilmW,
    flowPitch,
    stickFilmW,
    stickPitch,
    is4side,
    isFlatBottom,
    isSideGusset,
    isBottomGusset,
    isSpouted,
    isStickPack,
    isGusset,
    is2side,
    isAlmofada,
    isFinSeal,
    isLapSeal,
    isFlowPack,
    isPillow,
    is3side,
    isSachet3,
    isSachet4,
    isSachet,
    isVacuum3,
    isVacuum4,
    isVacuum,
    isFlatSheet,
    ok,
  };
}

function roundedRectPath(x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  if (rr <= 0) return `M${x},${y} H${x + w} V${y + h} H${x} Z`;
  return [
    `M${x + rr},${y}`,
    `H${x + w - rr}`,
    `A${rr} ${rr} 0 0 1 ${x + w},${y + rr}`,
    `V${y + h - rr}`,
    `A${rr} ${rr} 0 0 1 ${x + w - rr},${y + h}`,
    `H${x + rr}`,
    `A${rr} ${rr} 0 0 1 ${x},${y + h - rr}`,
    `V${y + rr}`,
    `A${rr} ${rr} 0 0 1 ${x + rr},${y}`,
    "Z",
  ].join(" ");
}

function pathChapeu(cx, domeY, towardBottom, w = CHAPEU_W, h = CHAPEU_H) {
  const bodyH = (5 / 9) * h;
  const rEnd = bodyH / 2;
  const domeR = h - bodyH;
  const k = 0.5522847498;
  const kr = k * rEnd;
  const kd = k * domeR;
  const left = cx - w / 2;
  const right = cx + w / 2;

  if (!towardBottom) {
    const cyTop = domeY;
    const yShoulder = cyTop + domeR;
    const yBottom = cyTop + h;
    return [
      `M${left + rEnd},${yBottom}`,
      `L${right - rEnd},${yBottom}`,
      `C${right - rEnd + kr},${yBottom} ${right},${yBottom - rEnd + kr} ${right},${yBottom - rEnd}`,
      `C${right},${yBottom - rEnd - kr} ${right - rEnd + kr},${yShoulder} ${right - rEnd},${yShoulder}`,
      `L${cx + domeR},${yShoulder}`,
      `C${cx + domeR},${yShoulder - kd} ${cx + kd},${cyTop} ${cx},${cyTop}`,
      `C${cx - kd},${cyTop} ${cx - domeR},${yShoulder - kd} ${cx - domeR},${yShoulder}`,
      `L${left + rEnd},${yShoulder}`,
      `C${left + rEnd - kr},${yShoulder} ${left},${yBottom - rEnd - kr} ${left},${yBottom - rEnd}`,
      `C${left},${yBottom - rEnd + kr} ${left + rEnd - kr},${yBottom} ${left + rEnd},${yBottom}`,
      "Z",
    ].join(" ");
  }

  const cyDome = domeY;
  const yShoulder = cyDome - domeR;
  const yTop = cyDome - h;
  return [
    `M${left + rEnd},${yTop}`,
    `L${right - rEnd},${yTop}`,
    `C${right - rEnd + kr},${yTop} ${right},${yTop + rEnd - kr} ${right},${yTop + rEnd}`,
    `C${right},${yTop + rEnd + kr} ${right - rEnd + kr},${yShoulder} ${right - rEnd},${yShoulder}`,
    `L${cx + domeR},${yShoulder}`,
    `C${cx + domeR},${yShoulder + kd} ${cx + kd},${cyDome} ${cx},${cyDome}`,
    `C${cx - kd},${cyDome} ${cx - domeR},${yShoulder + kd} ${cx - domeR},${yShoulder}`,
    `L${left + rEnd},${yShoulder}`,
    `C${left + rEnd - kr},${yShoulder} ${left},${yTop + rEnd + kr} ${left},${yTop + rEnd}`,
    `C${left},${yTop + rEnd - kr} ${left + rEnd - kr},${yTop} ${left + rEnd},${yTop}`,
    "Z",
  ].join(" ");
}

/** Cor técnica: hex (compatível SVG/Illustrator/browser). CMYK fica só como metadado. */
function ink(c, m, y, k, hex) {
  return { hex, cmyk: `${c},${m},${y},${k}` };
}

const C = {
  ink: ink(0, 0, 0, 0.88, "#1a1a1a"),
  /** Solda das faces */
  solda: ink(0.55, 0.05, 0.35, 0, "#2db89a"),
  soldaStroke: ink(0.75, 0.15, 0.45, 0.1, "#0d6b52"),
  /** Solda na sanfona / fundo (cor distinta) */
  soldaSanfona: ink(0.15, 0.45, 0.85, 0.05, "#e8a04a"),
  soldaSanfonaStroke: ink(0.25, 0.55, 0.9, 0.15, "#b56e1a"),
  fold: ink(0.55, 0.25, 0, 0.15, "#3d6fa8"),
  zipper: ink(0.82, 0.32, 0, 0, "#2f6f9a"),
  zipperFill: ink(0.55, 0.12, 0, 0, "#7eb8d4"),
  soldaOpacity: 0.55,
  zipperOpacity: 0.5,
  /** Guia de arte */
  corte: ink(0, 0.95, 0.9, 0, "#e53935"),
  dobra: ink(0.9, 0.45, 0, 0, "#1565c0"),
  /** Transpasse: cor distinta da dobra */
  transpasse: ink(0.05, 0.8, 0.9, 0, "#ef6c00"),
  picote: ink(0, 0.85, 0.75, 0.05, "#c62828"),
  foto: ink(0, 0, 0, 1, "#000000"),
  chapeu: ink(0.05, 0.35, 0.75, 0.2, "#7a5c2e"),
  dim: ink(0.7, 0.35, 0, 0.15, "#1a4a8a"),
  dimMuted: ink(0.4, 0.2, 0, 0.35, "#5a6a80"),
  panelLabel: ink(0.35, 0.15, 0.1, 0.35, "#6a7585"),
  paper: ink(0.02, 0.03, 0.08, 0, "#f3f0e8"),
  sangria: ink(0.15, 0.7, 0.55, 0, "#c2185b"),
};

/** Cores das cotas = mesma família do item medido */
const DIM_COLOR = {
  geral: C.dim,
  painel: ink(0.6, 0.15, 0.4, 0.2, "#2e7d5b"),
  solda: C.soldaStroke,
  canto: ink(0.15, 0.2, 0.35, 0.4, "#5a5548"),
  chapeu: C.chapeu,
  furo: C.chapeu,
  valvula: C.chapeu,
  transpasse: C.transpasse,
  zipper: C.zipper,
  picote: C.picote,
  foto: ink(0, 0, 0, 0.85, "#2a2a2a"),
};

/**
 * Pintura só em atributos XML (sem style=).
 * O Illustrator frequentemente ignora/quebra stroke/fill quando vêm só do style.
 */
function paintFill(color, opacity = null) {
  const opAttr = opacity == null ? "" : ` fill-opacity="${opacity}"`;
  return `fill="${color.hex}"${opAttr}`;
}

function paintStroke(color, width, dash = null) {
  const dAttr = dash ? ` stroke-dasharray="${dash}"` : "";
  return `fill="none" stroke="${color.hex}" stroke-width="${width}" stroke-linecap="square" stroke-linejoin="miter"${dAttr}`;
}

function paintSolda(strokeWidth = 0.35) {
  const o = C.soldaOpacity;
  return `fill="${C.solda.hex}" fill-opacity="${o}" stroke="${C.soldaStroke.hex}" stroke-width="${strokeWidth}" stroke-linejoin="miter"`;
}

/** Solda na região da sanfona / fundo (âmbar — distinta da solda das faces) */
function paintSoldaSanfona(strokeWidth = 0.35) {
  const o = C.soldaOpacity;
  return `fill="${C.soldaSanfona.hex}" fill-opacity="${o}" stroke="${C.soldaSanfonaStroke.hex}" stroke-width="${strokeWidth}" stroke-linejoin="miter"`;
}

/** Solda com fill-rule evenodd (mesma geometria do .exe / pack) */
function paintSoldaEvenodd(strokeWidth = 0.4) {
  const o = C.soldaOpacity;
  return `fill="${C.solda.hex}" fill-opacity="${o}" fill-rule="evenodd" stroke="${C.soldaStroke.hex}" stroke-width="${strokeWidth}" stroke-linejoin="miter"`;
}

function paintSoldaHatch() {
  const o = C.soldaOpacity;
  // Fundo sólido + pattern: se o pattern falhar no AI, a cor da solda permanece
  return `fill="${C.solda.hex}" fill-opacity="${o}" stroke="${C.soldaStroke.hex}" stroke-width="0.35" stroke-linejoin="miter"`;
}

function soldaHatchDefs() {
  // Mantido vazio — hatch via pattern costuma sumir no Illustrator; solda fica sólida colorida
  return "";
}

function paintZipper(strokeWidth = 0.4) {
  const o = C.zipperOpacity;
  return `fill="${C.zipperFill.hex}" fill-opacity="${o}" stroke="${C.zipper.hex}" stroke-width="${strokeWidth}" stroke-linejoin="miter"`;
}

function paintText(color) {
  return `fill="${color.hex}" stroke="none"`;
}

// Preview no browser; no export os textos viram curvas (sem dependência de fonte)
const FONT = "Arial, Helvetica, sans-serif";

function pouchDefs(ox, oy, W, H, r) {
  const clip =
    r > 0
      ? `<clipPath id="clip-pouch"><path d="${roundedRectPath(ox, oy, W, H, r)}"/></clipPath>`
      : `<clipPath id="clip-pouch"><rect x="${ox}" y="${oy}" width="${W}" height="${H}"/></clipPath>`;
  return `<defs>${clip}</defs>`;
}

function sealLabel(x, y, text, opts = {}) {
  const { rotate = 0, size = 2.4, fill = C.soldaStroke, anchor = "middle" } = opts;
  const t = rotate
    ? ` transform="rotate(${rotate} ${x} ${y})"`
    : "";
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle"
    font-size="${size}" font-family="${FONT}" font-weight="700"${t} ${paintText(fill)}>${escapeXml(text)}</text>`;
}

function dimText(x, y, lines, opts = {}) {
  const { anchor = "middle", size = 3.1, fill = C.dim } = opts;
  const arr = Array.isArray(lines) ? lines : [lines];
  const step = size + 1.1;
  const startY = y - ((arr.length - 1) * step) / 2;
  return arr
    .map(
      (line, i) =>
        `<text x="${x}" y="${startY + i * step}" text-anchor="${anchor}" dominant-baseline="middle"
          font-size="${size}" font-family="${FONT}" font-weight="700" ${paintText(fill)}>${escapeXml(String(line))}</text>`
    )
    .join("");
}

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Cota: nome e valor em linhas separadas (leitura profissional).
 * opts.sub = linha intermediária opcional (ex.: L / A da fotocélula).
 */
function cotaLabel(name, value, _span = 99, opts = {}) {
  const { sub = null } = opts;
  if (sub) return [name, sub, String(value)];
  return [name, String(value)];
}

function DimPlanner() {
  return {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    laneGap: 22,
    base: 16,
    next(side) {
      this[side] += 1;
      return this.base + (this[side] - 1) * this.laneGap;
    },
    pads() {
      return {
        padL: Math.max(48, 28 + this.left * this.laneGap + 18),
        padR: Math.max(52, 30 + this.right * this.laneGap + 16),
        padT: Math.max(34, 22 + this.top * this.laneGap + 10),
        padB: Math.max(38, 24 + this.bottom * 8),
      };
    },
  };
}

function dimLine(x1, y1, x2, y2, lines, opts = {}) {
  const {
    offset = 11,
    outside = true,
    vertical = Math.abs(x2 - x1) < 0.01,
    size = 2.85,
    color = DIM_COLOR.geral,
    /** mid | start | end — trechos curtos usam "end" para não encavalar */
    textAt = "mid",
  } = opts;
  let ax1 = x1;
  let ay1 = y1;
  let ax2 = x2;
  let ay2 = y2;
  let tx;
  let ty;
  const tick = 2.4;
  let ticks;
  const span = vertical ? Math.abs(y2 - y1) : Math.abs(x2 - x1);
  const place = textAt === "auto" ? (span < 16 ? "end" : "mid") : textAt;
  const sw = Math.max(0.4, opts.strokeWidth || 0.42);
  const stroke = paintStroke(color, sw);

  if (vertical) {
    const dir = outside ? 1 : -1;
    ax1 = x1 + dir * offset;
    ax2 = x2 + dir * offset;
    tx = ax1 + (outside ? 3.8 : -3.8);
    if (place === "start") ty = Math.min(y1, y2) + 2.2;
    else if (place === "end") ty = Math.max(y1, y2) - 2.2;
    else ty = (y1 + y2) / 2;
    ticks = `<line x1="${ax1 - tick}" y1="${ay1}" x2="${ax1 + tick}" y2="${ay1}" ${stroke}/>
      <line x1="${ax2 - tick}" y1="${ay2}" x2="${ax2 + tick}" y2="${ay2}" ${stroke}/>
      <line x1="${x1}" y1="${y1}" x2="${ax1}" y2="${y1}" ${paintStroke(color, sw * 0.85, "1.2 1.4")}/>
      <line x1="${x2}" y1="${y2}" x2="${ax2}" y2="${y2}" ${paintStroke(color, sw * 0.85, "1.2 1.4")}/>`;
  } else {
    const dir = outside ? -1 : 1;
    ay1 = y1 + dir * offset;
    ay2 = y2 + dir * offset;
    if (place === "start") tx = Math.min(x1, x2) + 4;
    else if (place === "end") tx = Math.max(x1, x2) - 4;
    else tx = (x1 + x2) / 2;
    // Texto abaixo da linha de cota (não em cima — evita sobrepor a planta)
    ty = ay1 + (outside ? -3.8 : 4.2);
    if (opts.labelBelow) ty = ay1 + 4.2;
    ticks = `<line x1="${ax1}" y1="${ay1 - tick}" x2="${ax1}" y2="${ay1 + tick}" ${stroke}/>
      <line x1="${ax2}" y1="${ay2 - tick}" x2="${ax2}" y2="${ay2 + tick}" ${stroke}/>
      <line x1="${x1}" y1="${y1}" x2="${x1}" y2="${ay1}" ${paintStroke(color, sw * 0.85, "1.2 1.4")}/>
      <line x1="${x2}" y1="${y2}" x2="${x2}" y2="${ay2}" ${paintStroke(color, sw * 0.85, "1.2 1.4")}/>`;
  }
  const anchor = vertical ? (outside ? "start" : "end") : place === "mid" ? "middle" : place === "start" ? "start" : "end";
  return `<g class="cota" data-name="Cota">
      ${ticks}
      <line x1="${ax1}" y1="${ay1}" x2="${ax2}" y2="${ay2}" ${stroke}/>
    ${dimText(tx, ty, lines, { anchor, size, fill: color })}
  </g>`;
}

function drawSoldasLateraisFull(planta, ox, oy, W, totalH, sl) {
  planta.push(`<rect x="${ox}" y="${oy}" width="${sl}" height="${totalH}" ${paintSolda(0.35)}/>`);
  planta.push(`<rect x="${ox + W - sl}" y="${oy}" width="${sl}" height="${totalH}" ${paintSolda(0.35)}/>`);
  planta.push(sealLabel(ox + sl / 2, oy + totalH / 2, "SOLDA LATERAL", { rotate: -90, size: 2.1 }));
  planta.push(sealLabel(ox + W - sl / 2, oy + totalH / 2, "SOLDA LATERAL", { rotate: -90, size: 2.1 }));
}

/**
 * Solda U (Doyen) — igual ao .exe (pack 14/07):
 * face com fill-rule evenodd = laterais + U; miolo limpo abrindo para a boca;
 * sanfona só laterais + dobra (olho pontilhado).
 */
function drawDoyenSeals(planta, frente, sanfona, verso, d) {
  const sl = d.solda;
  const ox = frente.x;
  const W = frente.w;
  const leftIn = ox + sl;
  const rightIn = ox + W - sl;
  const midX = ox + W / 2;
  const rx = Math.max(1, (W - 2 * sl) / 2);
  // Altura do arco: cabe na face deixando a faixa mínima = sl
  const ryMax = Math.max(8, frente.h - 2 * sl - 4);
  const ry = Math.min(d.uRadius, frente.h * 0.42, ryMax);

  // FRENTE: ponta do U a sl mm da junção com a sanfona (distância menor = solda lateral)
  {
    const yTip = frente.y + frente.h - sl;
    const yArc = yTip - ry;
    const inner = `M${leftIn},${frente.y} L${rightIn},${frente.y} L${rightIn},${yArc} A${rx} ${ry} 0 0 1 ${leftIn},${yArc} Z`;
    planta.push(`
      <path d="M${ox},${frente.y} H${ox + W} V${frente.y + frente.h} H${ox} Z ${inner}"
        ${paintSoldaEvenodd(0.4)}/>
      <path d="M${rightIn},${yArc} A${rx} ${ry} 0 0 1 ${leftIn},${yArc}" ${paintStroke(C.soldaStroke, 0.5)}/>
    `);
    planta.push(sealLabel(midX, yTip - Math.min(ry * 0.35, 12), "SOLDA U", { size: 2.4 }));
  }

  // VERSO: espelho (ponta a sl mm da sanfona)
  {
    const yTip = verso.y + sl;
    const yArc = yTip + ry;
    const inner = `M${leftIn},${verso.y + verso.h} L${rightIn},${verso.y + verso.h} L${rightIn},${yArc} A${rx} ${ry} 0 0 0 ${leftIn},${yArc} Z`;
    planta.push(`
      <path d="M${ox},${verso.y} H${ox + W} V${verso.y + verso.h} H${ox} Z ${inner}"
        ${paintSoldaEvenodd(0.4)}/>
      <path d="M${rightIn},${yArc} A${rx} ${ry} 0 0 0 ${leftIn},${yArc}" ${paintStroke(C.soldaStroke, 0.5)}/>
    `);
    planta.push(sealLabel(midX, yTip + Math.min(ry * 0.35, 12), "SOLDA U", { size: 2.4 }));
  }

  const gx = sanfona.x;
  const gy = sanfona.y;
  const gw = sanfona.w;
  const gh = sanfona.h;
  const midY = gy + gh / 2;
  planta.push(`<rect x="${gx}" y="${gy}" width="${sl}" height="${gh}" ${paintSoldaSanfona(0.35)}/>`);
  planta.push(`<rect x="${gx + gw - sl}" y="${gy}" width="${sl}" height="${gh}" ${paintSoldaSanfona(0.35)}/>`);
  planta.push(`<line x1="${gx}" y1="${midY}" x2="${gx + gw}" y2="${midY}" ${paintStroke(C.fold, 0.32, "2 1.5")}/>`);

  const eyeRx = Math.max(6, (gw - 2 * sl) / 2);
  const eyeRy = Math.max(4, Math.min(gh / 2 - 0.5, gh * 0.45));
  planta.push(
    `<path d="M${gx + sl},${midY} A${eyeRx} ${eyeRy} 0 0 1 ${gx + gw - sl},${midY} A${eyeRx} ${eyeRy} 0 0 1 ${gx + sl},${midY} Z"
      ${paintStroke(C.fold, 0.45, "2 1.4")}/>`
  );

  const tri = 2.4;
  planta.push(`<path d="M${midX},${gy} L${midX - tri},${gy - tri} L${midX + tri},${gy - tri} Z" ${paintFill(C.ink)}/>`);
  planta.push(`<path d="M${midX},${gy + gh} L${midX - tri},${gy + gh + tri} L${midX + tri},${gy + gh + tri} Z" ${paintFill(C.ink)}/>`);
}


/**
 * Solda K (K-skirt) — geometria magenta (print):
 *
 * Em cada lateral, o K é a polilinha de 3 pontos (ex. direita):
 *   A = borda externa, S/2 acima do início da sanfona
 *   B = início da sanfona, S/2 para dentro (45°)
 *   C = borda externa, no meio da sanfona (dobra)
 *
 * Solda do fundo: altura = SL, meio a meio na dobra (SL/2 na face + SL/2 na sanfona),
 * de lateral a lateral. Idem no verso.
 */
function drawKSkirtSeals(planta, frente, sanfona, verso, d) {
  const sl = d.solda;
  const ox = frente.x;
  const W = frente.w;
  const midX = ox + W / 2;
  const halfS = Math.max(0, d.sanfona / 2);
  const run = Math.min(halfS, W / 2 - 0.5, Math.max(0, frente.h - 1));
  // Solda fundo: SL total, metade pra cima / metade pra baixo da dobra
  const halfFundo = Math.max(0.5, sl / 2);

  const gx = sanfona.x;
  const gy = sanfona.y;
  const gw = sanfona.w;
  const gh = sanfona.h;
  const midY = gy + gh / 2;
  const xBL = ox + run;
  const xBR = ox + W - run;

  /** Solda do fundo: faixa SL centrada na dobra (SL/2 face + SL/2 sanfona), de lateral a lateral */
  const drawSoldaFundo = (foldY) => {
    const y0 = foldY - halfFundo;
    planta.push(`<rect x="${ox}" y="${y0}" width="${W}" height="${halfFundo * 2}" ${paintSoldaSanfona(0.4)}/>`);
    planta.push(
      `<line x1="${ox}" y1="${foldY}" x2="${ox + W}" y2="${foldY}" ${paintStroke(C.soldaSanfonaStroke, 0.4)}/>`
    );
  };

  // —— FRENTE —— laterais + triângulos K
  {
    const yBottom = frente.y + frente.h;
    const yA = yBottom - run;

    planta.push(`<rect x="${ox}" y="${frente.y}" width="${sl}" height="${frente.h}" ${paintSolda(0.4)}/>`);
    planta.push(`<rect x="${ox + W - sl}" y="${frente.y}" width="${sl}" height="${frente.h}" ${paintSolda(0.4)}/>`);

    if (run > 0) {
      planta.push(`<path d="M${ox},${yA} L${ox},${yBottom} L${xBL},${yBottom} Z" ${paintSolda(0.4)}/>`);
      planta.push(`<path d="M${ox + W},${yA} L${ox + W},${yBottom} L${xBR},${yBottom} Z" ${paintSolda(0.4)}/>`);
      planta.push(`<line x1="${ox}" y1="${yA}" x2="${xBL}" y2="${yBottom}" ${paintStroke(C.soldaStroke, 0.55)}/>`);
      planta.push(`<line x1="${ox + W}" y1="${yA}" x2="${xBR}" y2="${yBottom}" ${paintStroke(C.soldaStroke, 0.55)}/>`);
    }
    planta.push(sealLabel(midX, yBottom - Math.max(10, run * 0.35), "SOLDA K", { size: 2.4 }));
  }

  // —— VERSO —— espelho
  {
    const yTop = verso.y;
    const yA = yTop + run;

    planta.push(`<rect x="${ox}" y="${verso.y}" width="${sl}" height="${verso.h}" ${paintSolda(0.4)}/>`);
    planta.push(`<rect x="${ox + W - sl}" y="${verso.y}" width="${sl}" height="${verso.h}" ${paintSolda(0.4)}/>`);

    if (run > 0) {
      planta.push(`<path d="M${ox},${yA} L${ox},${yTop} L${xBL},${yTop} Z" ${paintSolda(0.4)}/>`);
      planta.push(`<path d="M${ox + W},${yA} L${ox + W},${yTop} L${xBR},${yTop} Z" ${paintSolda(0.4)}/>`);
      planta.push(`<line x1="${ox}" y1="${yA}" x2="${xBL}" y2="${yTop}" ${paintStroke(C.soldaStroke, 0.55)}/>`);
      planta.push(`<line x1="${ox + W}" y1="${yA}" x2="${xBR}" y2="${yTop}" ${paintStroke(C.soldaStroke, 0.55)}/>`);
    }
    planta.push(sealLabel(midX, yTop + Math.max(10, run * 0.35), "SOLDA K", { size: 2.4 }));
  }

  // —— SANFONA —— laterais + triângulos K até C (cor distinta)
  planta.push(`<rect x="${gx}" y="${gy}" width="${sl}" height="${gh}" ${paintSoldaSanfona(0.35)}/>`);
  planta.push(`<rect x="${gx + gw - sl}" y="${gy}" width="${sl}" height="${gh}" ${paintSoldaSanfona(0.35)}/>`);

  if (run > 0) {
    planta.push(`<path d="M${xBR},${gy} L${gx + gw},${gy} L${gx + gw},${midY} Z" ${paintSoldaSanfona(0.35)}/>`);
    planta.push(`<path d="M${xBL},${gy} L${gx},${gy} L${gx},${midY} Z" ${paintSoldaSanfona(0.35)}/>`);
    planta.push(`<path d="M${xBR},${gy + gh} L${gx + gw},${gy + gh} L${gx + gw},${midY} Z" ${paintSoldaSanfona(0.35)}/>`);
    planta.push(`<path d="M${xBL},${gy + gh} L${gx},${gy + gh} L${gx},${midY} Z" ${paintSoldaSanfona(0.35)}/>`);

    planta.push(`<line x1="${xBR}" y1="${gy}" x2="${gx + gw}" y2="${midY}" ${paintStroke(C.soldaSanfonaStroke, 0.55)}/>`);
    planta.push(`<line x1="${xBL}" y1="${gy}" x2="${gx}" y2="${midY}" ${paintStroke(C.soldaSanfonaStroke, 0.55)}/>`);
    planta.push(`<line x1="${xBR}" y1="${gy + gh}" x2="${gx + gw}" y2="${midY}" ${paintStroke(C.soldaSanfonaStroke, 0.55)}/>`);
    planta.push(`<line x1="${xBL}" y1="${gy + gh}" x2="${gx}" y2="${midY}" ${paintStroke(C.soldaSanfonaStroke, 0.55)}/>`);
  }

  // Solda do fundo meio a meio (frente|sanfona e verso|sanfona)
  drawSoldaFundo(gy);
  drawSoldaFundo(gy + gh);
  planta.push(sealLabel(midX, gy, "SOLDA FUNDO", { size: 2.0, fill: C.soldaSanfonaStroke }));
  planta.push(sealLabel(midX, gy + gh, "SOLDA FUNDO", { size: 2.0, fill: C.soldaSanfonaStroke }));

  planta.push(`<line x1="${gx}" y1="${midY}" x2="${gx + gw}" y2="${midY}" ${paintStroke(C.fold, 0.32, "2 1.5")}/>`);

  const tri = 2.4;
  planta.push(`<path d="M${gx + gw},${midY} L${gx + gw + tri},${midY - tri} L${gx + gw + tri},${midY + tri} Z" ${paintFill(C.ink)}/>`);
  planta.push(`<path d="M${gx},${midY} L${gx - tri},${midY - tri} L${gx - tri},${midY + tri} Z" ${paintFill(C.ink)}/>`);
}

/**
 * 3 soldas / Sachê 3 / Sachê 4 — duas folhas, planta horizontal:
 * Frente | Costas
 * - 3 soldas: lat.esq + lat.dir + inferior (boca aberta)
 * - 4 soldas: + solda superior estrutural
 */
function buildDrawing3Side(p, d, pads) {
  const { padL, padT, padR, padB } = pads;
  const W = d.W;
  const H = d.face;
  const sl = d.solda;
  const isSachet3 = p.tipoEmbalagem === "sachet3";
  const isSachet4 = p.tipoEmbalagem === "sachet4";
  const isVacuum3 = p.tipoEmbalagem === "vacuum3";
  const isVacuum4 = p.tipoEmbalagem === "vacuum4";
  const isVacuum = isVacuum3 || isVacuum4;
  const isSachet = isSachet3 || isSachet4;
  const closedTop = isSachet4 || isVacuum4;
  const nomeTipo = isVacuum4
    ? "VACUUM 4 SOLDAS"
    : isVacuum3
      ? "VACUUM 3 SOLDAS"
      : isSachet4
        ? "SACHÊ 4 SOLDAS"
        : isSachet3
          ? "SACHÊ 3 SOLDAS"
          : "3 SOLDAS";

  const frente = {
    id: "frente",
    label: "FRENTE",
    sub: isVacuum ? "produto / vácuo" : isSachet ? "dose / arte" : "folha / arte",
    x: padL,
    y: padT,
    w: W,
    h: H,
    boca: "top",
  };
  const verso = {
    id: "verso",
    label: "COSTAS",
    sub: isVacuum ? "barreira / verso" : isSachet ? "info / verso" : "folha / verso",
    x: padL + W,
    y: padT,
    w: W,
    h: H,
    boca: "top",
  };
  const panels = [frente, verso];
  const totalW = 2 * W;
  const totalH = H;
  const svgW = totalW + padL + padR;
  const svgH = totalH + padT + padB + 28;

  const planta = [];
  const cotas = [];

  planta.push(`<defs>${soldaHatchDefs()}</defs>`);

  for (const panel of panels) {
    planta.push(
      `<rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}" ${paintStroke(C.ink, 0.25)}/>`
    );
    const cx = panel.x + panel.w / 2;
    const cy = panel.y + panel.h / 2;
    planta.push(
      `<text x="${cx}" y="${cy - 2.2}" text-anchor="middle" dominant-baseline="middle"
        font-size="3.2" font-family="${FONT}" opacity="0.5" ${paintText(C.panelLabel)}>${panel.label}</text>`
    );
    planta.push(
      `<text x="${cx}" y="${cy + 3.2}" text-anchor="middle" dominant-baseline="middle"
        font-size="1.7" font-family="${FONT}" opacity="0.45" ${paintText(C.panelLabel)}>${panel.sub}</text>`
    );

    planta.push(`<rect x="${panel.x}" y="${panel.y}" width="${sl}" height="${panel.h}" ${paintSoldaHatch()}/>`);
    planta.push(`<rect x="${panel.x + panel.w - sl}" y="${panel.y}" width="${sl}" height="${panel.h}" ${paintSoldaHatch()}/>`);
    planta.push(`<rect x="${panel.x}" y="${panel.y + panel.h - sl}" width="${panel.w}" height="${sl}" ${paintSoldaHatch()}/>`);
    if (closedTop) {
      planta.push(`<rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${sl}" ${paintSoldaHatch()}/>`);
    }

    planta.push(
      sealLabel(panel.x + sl / 2, panel.y + panel.h / 2, "SOLDA LAT. ESQ.", {
        rotate: -90,
        size: 1.85,
      })
    );
    planta.push(
      sealLabel(panel.x + panel.w - sl / 2, panel.y + panel.h / 2, "SOLDA LAT. DIR.", {
        rotate: -90,
        size: 1.85,
      })
    );
    planta.push(sealLabel(cx, panel.y + panel.h - sl / 2, "SOLDA INFERIOR", { size: 1.9 }));
    if (closedTop) {
      planta.push(sealLabel(cx, panel.y + sl / 2, isVacuum ? "SOLDA PÓS-VÁCUO" : "SOLDA SUPERIOR", { size: 1.9 }));
    } else {
      planta.push(
        `<line x1="${panel.x + sl}" y1="${panel.y + 0.4}" x2="${panel.x + panel.w - sl}" y2="${panel.y + 0.4}"
          ${paintStroke(C.dobra, 0.55, "3 1.8")}/>`
      );
      planta.push(
        `<text x="${cx}" y="${panel.y - 3.2}" text-anchor="middle" font-size="2.1" font-family="${FONT}" font-weight="700" ${paintText(C.dimMuted)}>${isVacuum ? "BOCA (VÁCUO)" : "BOCA (ENVASE)"}</text>`
      );
      planta.push(
        `<text x="${cx}" y="${panel.y + 5.5}" text-anchor="middle" font-size="1.45" font-family="${FONT}" ${paintText(C.dimMuted)}>${isVacuum ? "solda após retirada do ar" : "sem solda estrutural"}</text>`
      );
    }
  }

  planta.push(
    `<line x1="${frente.x + W}" y1="${padT}" x2="${frente.x + W}" y2="${padT + H}" ${paintStroke(C.corte, 0.35, "2.5 1.5")}/>`
  );
  planta.push(
    `<text x="${frente.x + W + 2}" y="${padT + 12}" text-anchor="start" font-size="1.55" font-family="${FONT}" font-weight="700" ${paintText(C.corte)}>DUAS FOLHAS</text>`
  );

  if (p.temZipper) drawZipper(planta, frente, d);
  if (p.temCorte) drawRasgo(planta, frente, d);
  drawSuspension(planta, frente, p, d);

  if (p.temFotocelula) drawFotocelula(planta, p, d, padL, padT, totalW, totalH);

  planta.push(`<rect x="${padL}" y="${padT}" width="${totalW}" height="${totalH}" ${paintStroke(C.corte, 0.7)}/>`);

  const legY = padT + totalH + 14;
  const legX = padL;
  planta.push(`<line x1="${legX}" y1="${legY}" x2="${legX + 10}" y2="${legY}" ${paintStroke(C.corte, 0.7)}/>`);
  planta.push(`<text x="${legX + 12}" y="${legY}" dominant-baseline="middle" font-size="2" font-family="${FONT}" ${paintText(C.corte)}>CORTE EXTERNO</text>`);
  planta.push(`<rect x="${legX + 70}" y="${legY - 3}" width="10" height="6" ${paintSoldaHatch()}/>`);
  planta.push(
    `<text x="${legX + 82}" y="${legY}" dominant-baseline="middle" font-size="2" font-family="${FONT}" ${paintText(C.soldaStroke)}>${
      closedTop
        ? isVacuum
          ? "4 SOLDAS · ALTA RESISTÊNCIA"
          : "4 SOLDAS (LAT+SUP+INF)"
        : isVacuum
          ? "3 SOLDAS · PÓS-VÁCUO NO TOPO"
          : "3 SOLDAS (LAT+LAT+INF)"
    }</text>`
  );
  if (!closedTop) {
    planta.push(`<line x1="${legX + 195}" y1="${legY}" x2="${legX + 205}" y2="${legY}" ${paintStroke(C.dobra, 0.5, "3 1.8")}/>`);
    planta.push(`<text x="${legX + 207}" y="${legY}" dominant-baseline="middle" font-size="2" font-family="${FONT}" ${paintText(C.dobra)}>${isVacuum ? "ABERTURA VÁCUO" : "BOCA ABERTA"}</text>`);
  }

  const pitchNote = isSachet || isVacuum ? ` · passo ≈ ${round2(H + 2 * sl)}` : "";
  planta.push(`
    <g font-family="${FONT}" ${paintText(C.ink)}>
      <text x="${padL}" y="${svgH - 10}" font-size="2.8" font-weight="700">${nomeTipo} · F/C ${round2(W)}×${round2(H)} · SL ${round2(sl)} · arte ${round2(totalW)}×${round2(H)} mm${pitchNote}</text>
    </g>
  `);

  const planner = DimPlanner();
  const fs = Math.min(3.0, Math.max(2.4, totalW / 70));
  const rx = padL + totalW;
  const stripOff = planner.next("top");

  for (const panel of panels) {
    const name = panel.id === "frente" ? "FRENTE" : "COSTAS";
    cotas.push(
      dimLine(panel.x, padT, panel.x + panel.w, padT, cotaLabel(name, round2(panel.w)), {
        offset: stripOff,
        outside: true,
        size: fs - 0.2,
        color: DIM_COLOR.painel,
      })
    );
  }

  cotas.push(
    dimLine(padL, padT, rx, padT, cotaLabel("LARG. ARTE", round2(totalW)), {
      offset: planner.next("top"),
      outside: true,
      size: fs,
      color: DIM_COLOR.geral,
    })
  );
  cotas.push(
    dimLine(padL, padT, padL, padT + H, cotaLabel("ALTURA", round2(H)), {
      offset: planner.next("left"),
      outside: false,
      vertical: true,
      size: fs,
      color: DIM_COLOR.geral,
    })
  );
  cotas.push(
    dimLine(padL, padT + 18, padL + sl, padT + 18, cotaLabel("SOLDA LAT.", round2(sl)), {
      offset: planner.next("left"),
      outside: false,
      size: fs - 0.15,
      color: DIM_COLOR.solda,
      labelBelow: true,
    })
  );
  cotas.push(
    dimLine(padL, padT + H - sl, padL, padT + H, cotaLabel("SOLDA INF.", round2(sl)), {
      offset: planner.next("left"),
      outside: false,
      vertical: true,
      size: fs - 0.15,
      color: DIM_COLOR.solda,
      textAt: "auto",
    })
  );
  if (isSachet || isVacuum) {
    cotas.push(
      dimLine(rx, padT, rx, padT + H + (closedTop ? 0 : sl), cotaLabel("PASSO ≈", round2(H + (closedTop ? 0 : sl) + sl)), {
        offset: planner.next("right"),
        outside: true,
        vertical: true,
        size: fs - 0.15,
        color: DIM_COLOR.geral,
        textAt: "auto",
      })
    );
  }

  if (p.temZipper) {
    const yStart = frente.y + d.distZip;
    const yEnd = yStart + d.zipW;
    cotas.push(
      dimLine(rx, frente.y, rx, yStart, cotaLabel("ZIPPER", round2(d.distZip)), {
        offset: planner.next("right"),
        outside: true,
        vertical: true,
        size: fs - 0.1,
        color: DIM_COLOR.zipper,
        textAt: "auto",
      })
    );
    cotas.push(
      dimLine(rx, yStart, rx, yEnd, cotaLabel("ZIPPER", round2(d.zipW), d.zipW, { sub: "LARG" }), {
        offset: planner.next("right"),
        outside: true,
        vertical: true,
        size: fs - 0.1,
        color: DIM_COLOR.zipper,
        textAt: "auto",
      })
    );
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Plantatec ${nomeTipo}: Frente | Costas -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
  xmlns:i="http://ns.adobe.com/AdobeIllustrator/10.0/" version="1.1"
  width="${svgW}mm" height="${svgH}mm" viewBox="0 0 ${svgW} ${svgH}"
  color-interpolation="auto">
  <g id="Planta" inkscape:groupmode="layer" inkscape:label="Planta" data-name="Planta">
    ${planta.join("\n")}
  </g>
  <g id="Cotas" inkscape:groupmode="layer" inkscape:label="Cotas" data-name="Cotas">
    ${cotas.join("\n")}
  </g>
</svg>`;

  collectMagnetGuides3Side(padL, padT, totalW, totalH, W, H, sl);
  return {
    svg,
    resumo: `${nomeTipo} · F/C ${round2(W)}×${round2(H)} · arte ${round2(totalW)}×${round2(H)} · SL ${round2(sl)} mm`,
  };
}

/**
 * Flow Pack (HFFS) — desenvolvimento do perímetro + passo:
 * Largura do filme = Altura + Largura + Altura + Transpasse
 * Passo = Comprimento + solda front + solda rear
 */
function buildDrawingFlowPack(p, d, pads) {
  const { padL, padT, padR, padB } = pads;
  const prodL = d.face;
  const prodW = d.W;
  const prodH = d.sanfona;
  const tr = d.transpasse;
  const sl = d.solda;
  const sd = d.soldaDorsal;
  const isFin = d.tipoSoldaLong === "fin";
  const lapLeft = d.ladoTranspasse !== "direita";
  const pitch = d.flowPitch;

  let x = padL + (lapLeft && tr > 0.01 ? tr : 0);
  const h1 = {
    id: "h1",
    label: "ALTURA",
    sub: "lado / envoltório",
    x,
    y: padT,
    w: prodH,
    h: pitch,
  };
  x += prodH;
  const top = {
    id: "top",
    label: "LARGURA",
    sub: "face superior",
    x,
    y: padT,
    w: prodW,
    h: pitch,
  };
  x += prodW;
  const h2 = {
    id: "h2",
    label: "ALTURA",
    sub: "lado / envoltório",
    x,
    y: padT,
    w: prodH,
    h: pitch,
  };
  x += prodH;

  const transp =
    tr > 0.01
      ? {
          id: "transp",
          label: "TRANSPASSE",
          sub: isFin ? "Fin Seal" : "Lap Seal",
          x: lapLeft ? padL : x,
          y: padT,
          w: tr,
          h: pitch,
          isTranspasse: true,
        }
      : null;

  const body = [h1, top, h2];
  const panels = (lapLeft ? [transp, ...body] : [...body, transp]).filter(Boolean);
  const totalW = d.flowFilmW;
  const totalH = pitch;
  const svgW = totalW + padL + padR;
  const svgH = totalH + padT + padB + 28;

  const planta = [];
  const cotas = [];
  planta.push(`<defs>${soldaHatchDefs()}</defs>`);

  for (const panel of panels) {
    if (panel.w <= 0.01) continue;
    if (panel.isTranspasse) {
      planta.push(`
        <rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}"
          fill="${C.transpasse.hex}" fill-opacity="0.2"
          stroke="${C.transpasse.hex}" stroke-width="0.45" stroke-dasharray="2 1.2"/>
      `);
      planta.push(
        sealLabel(panel.x + panel.w / 2, panel.y + panel.h / 2, "TRANSPASSE", {
          rotate: -90,
          size: 1.8,
          fill: C.transpasse,
        })
      );
    } else {
      planta.push(
        `<rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}" ${paintStroke(C.ink, 0.25)}/>`
      );
      const cx = panel.x + panel.w / 2;
      const cy = panel.y + panel.h / 2;
      if (panel.w < 28) {
        planta.push(
          `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
            font-size="2.2" font-family="${FONT}" opacity="0.5" transform="rotate(-90 ${cx} ${cy})"
            ${paintText(C.panelLabel)}>${panel.label}</text>`
        );
      } else {
        planta.push(
          `<text x="${cx}" y="${cy - 2}" text-anchor="middle" dominant-baseline="middle"
            font-size="2.8" font-family="${FONT}" opacity="0.5" ${paintText(C.panelLabel)}>${panel.label}</text>`
        );
        planta.push(
          `<text x="${cx}" y="${cy + 3}" text-anchor="middle" dominant-baseline="middle"
            font-size="1.5" font-family="${FONT}" opacity="0.45" ${paintText(C.panelLabel)}>${panel.sub}</text>`
        );
      }
    }
  }

  if (transp && sd > 0.01) {
    const sx = lapLeft ? transp.x + transp.w - sd : transp.x;
    planta.push(`<rect x="${sx}" y="${padT}" width="${sd}" height="${totalH}" ${paintSoldaHatch()}/>`);
    planta.push(
      sealLabel(sx + sd / 2, padT + totalH / 2, isFin ? "SOLDA LONG. · FIN" : "SOLDA LONG. · LAP", {
        rotate: -90,
        size: 1.65,
      })
    );
  }

  for (const panel of panels) {
    if (panel.w <= 0.01) continue;
    planta.push(`<rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${sl}" ${paintSoldaHatch()}/>`);
    planta.push(`<rect x="${panel.x}" y="${panel.y + panel.h - sl}" width="${panel.w}" height="${sl}" ${paintSoldaHatch()}/>`);
  }
  planta.push(sealLabel(top.x + top.w / 2, padT + sl / 2, "SOLDA TRANS. DIANTEIRA", { size: 1.75 }));
  planta.push(sealLabel(top.x + top.w / 2, padT + totalH - sl / 2, "SOLDA TRANS. TRASEIRA", { size: 1.75 }));

  planta.push(
    `<text x="${top.x + top.w / 2}" y="${padT + totalH / 2}" text-anchor="middle" dominant-baseline="middle"
      font-size="2.4" font-family="${FONT}" opacity="0.45" ${paintText(C.panelLabel)}>COMPR. ${round2(prodL)} · PASSO ${round2(totalH)}</text>`
  );

  for (const fx of [h1.x + prodH, top.x + prodW, h2.x + prodH]) {
    planta.push(
      `<line x1="${fx}" y1="${padT}" x2="${fx}" y2="${padT + totalH}" ${paintStroke(C.dobra, 0.4, "2.2 1.6")}/>`
    );
  }
  if (transp) {
    const jx = lapLeft ? transp.x + transp.w : h2.x + prodH;
    planta.push(
      `<line x1="${jx}" y1="${padT}" x2="${jx}" y2="${padT + totalH}" ${paintStroke(C.dobra, 0.45, "2.2 1.6")}/>`
    );
  }

  planta.push(`<rect x="${padL}" y="${padT}" width="${totalW}" height="${totalH}" ${paintStroke(C.corte, 0.7)}/>`);

  const legY = padT + totalH + 14;
  planta.push(`<line x1="${padL}" y1="${legY}" x2="${padL + 10}" y2="${legY}" ${paintStroke(C.corte, 0.7)}/>`);
  planta.push(`<text x="${padL + 12}" y="${legY}" dominant-baseline="middle" font-size="2" font-family="${FONT}" ${paintText(C.corte)}>CORTE / PASSO</text>`);
  planta.push(`<rect x="${padL + 70}" y="${legY - 3}" width="10" height="6" ${paintSoldaHatch()}/>`);
  planta.push(`<text x="${padL + 82}" y="${legY}" dominant-baseline="middle" font-size="2" font-family="${FONT}" ${paintText(C.soldaStroke)}>SOLDAS TRANS. + LONG.</text>`);

  planta.push(`
    <g font-family="${FONT}" ${paintText(C.ink)}>
      <text x="${padL}" y="${svgH - 10}" font-size="2.8" font-weight="700">FLOW PACK · FILME ${round2(totalW)}×${round2(totalH)} · H+W+H+tr · passo L+2×solda · ${isFin ? "FIN" : "LAP"} mm</text>
    </g>
  `);

  const planner = DimPlanner();
  const fs = Math.min(3.0, Math.max(2.3, totalW / 60));
  const stripOff = planner.next("top");
  for (const panel of panels) {
    if (panel.w <= 0.01) continue;
    const name = panel.isTranspasse ? "TRANSP." : panel.label;
    cotas.push(
      dimLine(panel.x, padT, panel.x + panel.w, padT, cotaLabel(name, round2(panel.w)), {
        offset: stripOff,
        outside: true,
        size: fs - 0.2,
        color: panel.isTranspasse ? DIM_COLOR.transpasse : DIM_COLOR.painel,
      })
    );
  }
  cotas.push(
    dimLine(padL, padT, padL + totalW, padT, cotaLabel("LARG. FILME", round2(totalW)), {
      offset: planner.next("top"),
      outside: true,
      size: fs,
      color: DIM_COLOR.geral,
    })
  );
  cotas.push(
    dimLine(padL, padT, padL, padT + totalH, cotaLabel("PASSO", round2(totalH)), {
      offset: planner.next("left"),
      outside: false,
      vertical: true,
      size: fs,
      color: DIM_COLOR.geral,
    })
  );
  cotas.push(
    dimLine(padL, padT + sl, padL, padT + totalH - sl, cotaLabel("COMPR.", round2(prodL)), {
      offset: planner.next("left"),
      outside: false,
      vertical: true,
      size: fs - 0.1,
      color: DIM_COLOR.painel,
      textAt: "auto",
    })
  );
  cotas.push(
    dimLine(padL, padT, padL, padT + sl, cotaLabel("SOLDA", round2(sl)), {
      offset: planner.next("left"),
      outside: false,
      vertical: true,
      size: fs - 0.15,
      color: DIM_COLOR.solda,
      textAt: "auto",
    })
  );

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Plantatec Flow Pack: H|W|H|Transpasse · passo -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
  xmlns:i="http://ns.adobe.com/AdobeIllustrator/10.0/" version="1.1"
  width="${svgW}mm" height="${svgH}mm" viewBox="0 0 ${svgW} ${svgH}"
  color-interpolation="auto">
  <g id="Planta" inkscape:groupmode="layer" inkscape:label="Planta" data-name="Planta">
    ${planta.join("\n")}
  </g>
  <g id="Cotas" inkscape:groupmode="layer" inkscape:label="Cotas" data-name="Cotas">
    ${cotas.join("\n")}
  </g>
</svg>`;

  setMagnetGuides({
    xs: panels.flatMap((pn) => [pn.x, pn.x + pn.w]),
    ys: [padT, padT + sl, padT + totalH / 2, padT + totalH - sl, padT + totalH],
    points: panels.flatMap((pn) => [
      { x: pn.x, y: padT },
      { x: pn.x + pn.w, y: padT + totalH },
    ]),
  });
  return {
    svg,
    resumo: `FLOW PACK · FILME ${round2(totalW)}×${round2(totalH)} · produto ${round2(prodL)}×${round2(prodW)}×${round2(prodH)} mm`,
  };
}
/**
 * Stick Pack — tubo estreito (VFFS):
 * Frente | Lateral | Costas | Lateral | Transpasse
 * Filme = 2×largura + 2×profundidade + transpasse
 * Passo = comprimento + 2×solda transversal
 */
function buildDrawingStickPack(p, d, pads) {
  const { padL, padT, padR, padB } = pads;
  const faceW = d.W;
  const depth = d.sanfona;
  const tr = d.transpasse;
  const sl = d.solda;
  const sd = d.soldaDorsal;
  const isFin = d.tipoSoldaLong === "fin";
  const lapLeft = d.ladoTranspasse !== "direita";
  const pitch = d.stickPitch;
  const totalW = d.stickFilmW;

  let x = padL + (lapLeft && tr > 0.01 ? tr : 0);
  const frente = { id: "frente", label: "FRENTE", sub: "face", x, y: padT, w: faceW, h: pitch };
  x += faceW;
  const lat1 = { id: "lat1", label: "LAT.", sub: "prof.", x, y: padT, w: depth, h: pitch, narrow: true };
  x += depth;
  const costas = { id: "costas", label: "COSTAS", sub: "traseira", x, y: padT, w: faceW, h: pitch };
  x += faceW;
  const lat2 = { id: "lat2", label: "LAT.", sub: "prof.", x, y: padT, w: depth, h: pitch, narrow: true };
  x += depth;

  const transp =
    tr > 0.01
      ? {
          id: "transp",
          label: "TRANSPASSE",
          sub: isFin ? "Fin Seal" : "Lap Seal",
          x: lapLeft ? padL : x,
          y: padT,
          w: tr,
          h: pitch,
          isTranspasse: true,
        }
      : null;

  const body = [frente, lat1, costas, lat2];
  const panels = (lapLeft ? [transp, ...body] : [...body, transp]).filter(Boolean);
  const totalH = pitch;
  const svgW = totalW + padL + padR;
  const svgH = totalH + padT + padB + 28;

  const planta = [];
  const cotas = [];
  planta.push(`<defs>${soldaHatchDefs()}</defs>`);

  for (const panel of panels) {
    if (panel.w <= 0.01) continue;
    if (panel.isTranspasse) {
      planta.push(`
        <rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}"
          fill="${C.transpasse.hex}" fill-opacity="0.2"
          stroke="${C.transpasse.hex}" stroke-width="0.45" stroke-dasharray="2 1.2"/>
      `);
      planta.push(
        sealLabel(panel.x + panel.w / 2, panel.y + panel.h / 2, "TRANSPASSE", {
          rotate: -90,
          size: 1.7,
          fill: C.transpasse,
        })
      );
    } else {
      planta.push(
        `<rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}" ${paintStroke(C.ink, 0.25)}/>`
      );
      const cx = panel.x + panel.w / 2;
      const cy = panel.y + panel.h / 2;
      if (panel.narrow || panel.w < 22) {
        planta.push(
          `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
            font-size="2" font-family="${FONT}" opacity="0.5" transform="rotate(-90 ${cx} ${cy})"
            ${paintText(C.panelLabel)}>${panel.label}</text>`
        );
      } else {
        planta.push(
          `<text x="${cx}" y="${cy - 2}" text-anchor="middle" dominant-baseline="middle"
            font-size="2.6" font-family="${FONT}" opacity="0.5" ${paintText(C.panelLabel)}>${panel.label}</text>`
        );
        planta.push(
          `<text x="${cx}" y="${cy + 3}" text-anchor="middle" dominant-baseline="middle"
            font-size="1.4" font-family="${FONT}" opacity="0.45" ${paintText(C.panelLabel)}>${panel.sub}</text>`
        );
      }
    }
  }

  if (transp && sd > 0.01) {
    const sx = lapLeft ? transp.x + transp.w - sd : transp.x;
    planta.push(`<rect x="${sx}" y="${padT}" width="${sd}" height="${totalH}" ${paintSoldaHatch()}/>`);
    planta.push(
      sealLabel(sx + sd / 2, padT + totalH / 2, isFin ? "SOLDA LONG. · FIN" : "SOLDA LONG. · LAP", {
        rotate: -90,
        size: 1.55,
      })
    );
  }

  for (const panel of panels) {
    if (panel.w <= 0.01) continue;
    planta.push(`<rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${sl}" ${paintSoldaHatch()}/>`);
    planta.push(`<rect x="${panel.x}" y="${panel.y + panel.h - sl}" width="${panel.w}" height="${sl}" ${paintSoldaHatch()}/>`);
  }
  planta.push(sealLabel(frente.x + faceW / 2, padT + sl / 2, "SOLDA SUPERIOR", { size: 1.7 }));
  planta.push(sealLabel(frente.x + faceW / 2, padT + totalH - sl / 2, "SOLDA INFERIOR", { size: 1.7 }));

  planta.push(
    `<text x="${frente.x + faceW / 2}" y="${padT + totalH / 2}" text-anchor="middle" dominant-baseline="middle"
      font-size="2.2" font-family="${FONT}" opacity="0.45" ${paintText(C.panelLabel)}>STICK · ${round2(d.face)} mm</text>`
  );

  for (const fx of [frente.x + faceW, lat1.x + depth, costas.x + faceW, lat2.x + depth]) {
    planta.push(
      `<line x1="${fx}" y1="${padT}" x2="${fx}" y2="${padT + totalH}" ${paintStroke(C.dobra, 0.4, "2.2 1.6")}/>`
    );
  }

  planta.push(`<rect x="${padL}" y="${padT}" width="${totalW}" height="${totalH}" ${paintStroke(C.corte, 0.7)}/>`);

  const legY = padT + totalH + 14;
  planta.push(`<line x1="${padL}" y1="${legY}" x2="${padL + 10}" y2="${legY}" ${paintStroke(C.corte, 0.7)}/>`);
  planta.push(`<text x="${padL + 12}" y="${legY}" dominant-baseline="middle" font-size="2" font-family="${FONT}" ${paintText(C.corte)}>CORTE / PASSO</text>`);
  planta.push(`<rect x="${padL + 70}" y="${legY - 3}" width="10" height="6" ${paintSoldaHatch()}/>`);
  planta.push(`<text x="${padL + 82}" y="${legY}" dominant-baseline="middle" font-size="2" font-family="${FONT}" ${paintText(C.soldaStroke)}>SOLDAS TRANS. + LONG.</text>`);

  planta.push(`
    <g font-family="${FONT}" ${paintText(C.ink)}>
      <text x="${padL}" y="${svgH - 10}" font-size="2.6" font-weight="700">STICK PACK · FILME ${round2(totalW)}×${round2(totalH)} · F ${round2(faceW)} · Prof ${round2(depth)} · ${isFin ? "FIN" : "LAP"} mm</text>
    </g>
  `);

  const planner = DimPlanner();
  const fs = Math.min(2.8, Math.max(2.1, totalW / 50));
  const stripOff = planner.next("top");
  for (const panel of panels) {
    if (panel.w <= 0.01) continue;
    let name = panel.label;
    if (panel.isTranspasse) name = "TRANSP.";
    else if (panel.id === "frente") name = "FRENTE";
    else if (panel.id === "costas") name = "COSTAS";
    else name = "LAT.";
    cotas.push(
      dimLine(panel.x, padT, panel.x + panel.w, padT, cotaLabel(name, round2(panel.w)), {
        offset: stripOff,
        outside: true,
        size: fs - 0.2,
        color: panel.isTranspasse ? DIM_COLOR.transpasse : DIM_COLOR.painel,
      })
    );
  }
  cotas.push(
    dimLine(padL, padT, padL + totalW, padT, cotaLabel("LARG. FILME", round2(totalW)), {
      offset: planner.next("top"),
      outside: true,
      size: fs,
      color: DIM_COLOR.geral,
    })
  );
  cotas.push(
    dimLine(padL, padT, padL, padT + totalH, cotaLabel("PASSO", round2(totalH)), {
      offset: planner.next("left"),
      outside: false,
      vertical: true,
      size: fs,
      color: DIM_COLOR.geral,
    })
  );
  cotas.push(
    dimLine(padL, padT + sl, padL, padT + totalH - sl, cotaLabel("COMPR.", round2(d.face)), {
      offset: planner.next("left"),
      outside: false,
      vertical: true,
      size: fs - 0.1,
      color: DIM_COLOR.painel,
      textAt: "auto",
    })
  );

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Plantatec Stick Pack: F|Lat|C|Lat|Transpasse -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
  xmlns:i="http://ns.adobe.com/AdobeIllustrator/10.0/" version="1.1"
  width="${svgW}mm" height="${svgH}mm" viewBox="0 0 ${svgW} ${svgH}"
  color-interpolation="auto">
  <g id="Planta" inkscape:groupmode="layer" inkscape:label="Planta" data-name="Planta">
    ${planta.join("\n")}
  </g>
  <g id="Cotas" inkscape:groupmode="layer" inkscape:label="Cotas" data-name="Cotas">
    ${cotas.join("\n")}
  </g>
</svg>`;

  setMagnetGuides({
    xs: panels.flatMap((pn) => [pn.x, pn.x + pn.w]),
    ys: [padT, padT + sl, padT + totalH / 2, padT + totalH - sl, padT + totalH],
    points: [
      { x: padL, y: padT },
      { x: padL + totalW, y: padT + totalH },
    ],
  });
  return {
    svg,
    resumo: `STICK PACK · FILME ${round2(totalW)}×${round2(totalH)} · ${round2(faceW)}×${round2(depth)} · compr ${round2(d.face)} mm`,
  };
}

/**
 * Spouted Pouch — Side Gusset / stand-up com bico (spout):
 * ½ Lat | Frente | Lateral | Costas | ½ Lat  (+ transpasse opcional)
 * Área livre / marcação do bico no topo da frente.
 */
function buildDrawingSpouted(p, d, pads) {
  const { padL, padT, padR, padB } = pads;
  const W = d.W;
  const S = d.sanfona;
  const H = d.face;
  const sl = d.solda;
  const tr = d.transpasse;
  const sd = d.soldaDorsal;
  const isFin = d.tipoSoldaLong === "fin";
  const aba = sl;
  const halfS = S / 2;
  const lapLeft = d.ladoTranspasse !== "direita";
  const spoutPos = p.spoutPosicao || "centro";

  let x = padL + (lapLeft && tr > 0.01 ? tr : 0);
  const halfL = { id: "half-l", label: "½ LAT.", x, y: padT, w: halfS, h: H, gusset: true };
  x += halfS;
  const frente = { id: "frente", label: "FRENTE", sub: "arte + bico", x, y: padT, w: W, h: H, boca: "top" };
  x += W;
  const lateral = { id: "lateral", label: "LATERAL", sub: "sanfona", x, y: padT, w: S, h: H, gusset: true, fullGusset: true };
  x += S;
  const verso = { id: "verso", label: "COSTAS", sub: "info", x, y: padT, w: W, h: H, boca: "top" };
  x += W;
  const halfR = { id: "half-r", label: "½ LAT.", x, y: padT, w: halfS, h: H, gusset: true };
  x += halfS;

  const transp =
    tr > 0.01
      ? {
          id: "transp",
          label: "TRANSPASSE",
          x: lapLeft ? padL : x,
          y: padT,
          w: tr,
          h: H,
          isTranspasse: true,
        }
      : null;

  const body = [halfL, frente, lateral, verso, halfR];
  const panels = (lapLeft ? [transp, ...body] : [...body, transp]).filter(Boolean);
  const totalW = tr + 2 * W + 2 * S;
  const totalH = H;
  const svgW = totalW + padL + padR;
  const svgH = totalH + padT + padB + 28;

  const planta = [];
  const cotas = [];
  planta.push(`<defs>${soldaHatchDefs()}</defs>`);

  for (const panel of panels) {
    if (panel.w <= 0.01) continue;
    if (panel.isTranspasse) {
      planta.push(`
        <rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}"
          fill="${C.transpasse.hex}" fill-opacity="0.2"
          stroke="${C.transpasse.hex}" stroke-width="0.45" stroke-dasharray="2 1.2"/>
      `);
    } else {
      planta.push(
        `<rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}" ${paintStroke(C.ink, 0.25)}/>`
      );
      const cx = panel.x + panel.w / 2;
      const cy = panel.y + panel.h / 2;
      const rot = panel.gusset && panel.w < 28 && !panel.fullGusset;
      if (rot) {
        planta.push(
          `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
            font-size="2.2" font-family="${FONT}" opacity="0.5" transform="rotate(-90 ${cx} ${cy})"
            ${paintText(C.panelLabel)}>${panel.label}</text>`
        );
      } else {
        planta.push(
          `<text x="${cx}" y="${cy - (panel.sub ? 2 : 0)}" text-anchor="middle" dominant-baseline="middle"
            font-size="${panel.fullGusset ? 2.6 : 3}" font-family="${FONT}" opacity="0.5" ${paintText(C.panelLabel)}>${panel.label}</text>`
        );
        if (panel.sub) {
          planta.push(
            `<text x="${cx}" y="${cy + 3}" text-anchor="middle" dominant-baseline="middle"
              font-size="1.5" font-family="${FONT}" opacity="0.45" ${paintText(C.panelLabel)}>${panel.sub}</text>`
          );
        }
      }
    }
  }

  if (transp && sd > 0.01) {
    const sx = lapLeft ? transp.x + transp.w - sd : transp.x;
    planta.push(`<rect x="${sx}" y="${padT}" width="${sd}" height="${H}" ${paintSoldaHatch()}/>`);
  }

  for (const panel of panels) {
    if (panel.w <= 0.01) continue;
    planta.push(`<rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${aba}" ${paintSoldaHatch()}/>`);
    planta.push(`<rect x="${panel.x}" y="${panel.y + panel.h - aba}" width="${panel.w}" height="${aba}" ${paintSoldaHatch()}/>`);
  }
  planta.push(sealLabel(frente.x + W / 2, frente.y + aba / 2, "SOLDA SUP. / BICO", { size: 1.8 }));
  planta.push(sealLabel(frente.x + W / 2, frente.y + H - aba / 2, "SOLDA INFERIOR", { size: 1.8 }));

  const foldXs = [
    halfL.x + halfL.w,
    frente.x + W,
    lateral.x + S / 2,
    lateral.x + S,
    verso.x + W,
  ];
  for (const fx of foldXs) {
    planta.push(
      `<line x1="${fx}" y1="${padT}" x2="${fx}" y2="${padT + H}" ${paintStroke(C.dobra, 0.4, "2.2 1.6")}/>`
    );
  }
  planta.push(
    `<text x="${lateral.x + S / 2 + 2}" y="${padT + 12}" text-anchor="start" font-size="1.55" font-family="${FONT}" font-weight="700" ${paintText(C.dobra)}>DOBRA SANFONA</text>`
  );

  // Spout marker
  const spoutR = Math.max(4, Math.min(12, W * 0.06));
  let spoutX = frente.x + W / 2;
  if (spoutPos === "canto-esquerdo") spoutX = frente.x + sl + spoutR + 4;
  else if (spoutPos === "canto-direito") spoutX = frente.x + W - sl - spoutR - 4;
  else if (spoutPos === "lateral") spoutX = frente.x + W - sl - spoutR - 2;
  const spoutY = padT + aba + spoutR + 3;
  const freeR = spoutR + Math.max(3, p.spoutLivre || 5);
  planta.push(`<circle cx="${spoutX}" cy="${spoutY}" r="${freeR}" ${paintStroke(C.chapeu, 0.35, "1.6 1.2")}/>`);
  planta.push(`<circle cx="${spoutX}" cy="${spoutY}" r="${spoutR}" ${paintStroke(C.chapeu, 0.5)}/>`);
  planta.push(`<circle cx="${spoutX}" cy="${spoutY}" r="${Math.max(1.2, spoutR * 0.35)}" ${paintFill(C.chapeu, 0.25)}/>`);
  planta.push(
    `<text x="${spoutX}" y="${spoutY + freeR + 3.5}" text-anchor="middle" font-size="1.8" font-family="${FONT}" font-weight="700" ${paintText(C.chapeu)}>SPOUT · ÁREA LIVRE</text>`
  );

  if (p.temZipper) drawZipper(planta, frente, d);
  if (p.temCorte) drawRasgo(planta, frente, d);
  drawSuspension(planta, frente, p, d);

  planta.push(`<rect x="${padL}" y="${padT}" width="${totalW}" height="${totalH}" ${paintStroke(C.corte, 0.7)}/>`);

  const legY = padT + totalH + 14;
  planta.push(`<line x1="${padL}" y1="${legY}" x2="${padL + 10}" y2="${legY}" ${paintStroke(C.corte, 0.7)}/>`);
  planta.push(`<text x="${padL + 12}" y="${legY}" dominant-baseline="middle" font-size="2" font-family="${FONT}" ${paintText(C.corte)}>CORTE EXTERNO</text>`);
  planta.push(`<circle cx="${padL + 85}" cy="${legY}" r="3" ${paintStroke(C.chapeu, 0.45)}/>`);
  planta.push(`<text x="${padL + 92}" y="${legY}" dominant-baseline="middle" font-size="2" font-family="${FONT}" ${paintText(C.chapeu)}>SPOUT</text>`);

  planta.push(`
    <g font-family="${FONT}" ${paintText(C.ink)}>
      <text x="${padL}" y="${svgH - 10}" font-size="2.7" font-weight="700">SPOUTED POUCH · FILME ${round2(totalW)}×${round2(H)} · F ${round2(W)} · Lat ${round2(S)} · bico ${spoutPos} mm</text>
    </g>
  `);

  const planner = DimPlanner();
  const fs = Math.min(3.0, Math.max(2.3, totalW / 70));
  const stripOff = planner.next("top");
  for (const panel of panels) {
    if (panel.w <= 0.01) continue;
    let name = panel.label;
    if (panel.isTranspasse) name = "TRANSP.";
    else if (panel.id === "frente") name = "FRENTE";
    else if (panel.id === "verso") name = "COSTAS";
    else if (panel.id === "lateral") name = "LATERAL";
    else name = "½ LAT.";
    cotas.push(
      dimLine(panel.x, padT, panel.x + panel.w, padT, cotaLabel(name, round2(panel.w)), {
        offset: stripOff,
        outside: true,
        size: fs - 0.2,
        color: panel.isTranspasse ? DIM_COLOR.transpasse : DIM_COLOR.painel,
      })
    );
  }
  cotas.push(
    dimLine(padL, padT, padL + totalW, padT, cotaLabel("LARG. FILME", round2(totalW)), {
      offset: planner.next("top"),
      outside: true,
      size: fs,
      color: DIM_COLOR.geral,
    })
  );
  cotas.push(
    dimLine(padL, padT, padL, padT + H, cotaLabel("ALTURA", round2(H)), {
      offset: planner.next("left"),
      outside: false,
      vertical: true,
      size: fs,
      color: DIM_COLOR.geral,
    })
  );

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Plantatec Spouted Pouch -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
  xmlns:i="http://ns.adobe.com/AdobeIllustrator/10.0/" version="1.1"
  width="${svgW}mm" height="${svgH}mm" viewBox="0 0 ${svgW} ${svgH}"
  color-interpolation="auto">
  <g id="Planta" inkscape:groupmode="layer" inkscape:label="Planta" data-name="Planta">
    ${planta.join("\n")}
  </g>
  <g id="Cotas" inkscape:groupmode="layer" inkscape:label="Cotas" data-name="Cotas">
    ${cotas.join("\n")}
  </g>
</svg>`;

  collectMagnetGuidesSideGusset(padL, padT, totalW, totalH, W, S, H, sl, tr, lapLeft);
  return {
    svg,
    resumo: `SPOUTED · FILME ${round2(totalW)}×${round2(H)} · F ${round2(W)} · Lat ${round2(S)} · bico ${spoutPos} mm`,
  };
}

/**
 * Tubo plano / almofada (Pillow) / 2 soldas — planta horizontal:
 * Transpasse | Frente | Costas  (ou invertido pelo lado do transpasse)
 * - Solda longitudinal (dorsal) dentro do transpasse — Lap ou Fin Seal
 * - Soldas transversais superior e inferior
 * - Sem sanfona / sem laterais expansíveis
 * Filme = frente + costas + transpasse
 */
function buildDrawing2Side(p, d, pads) {
  const { padL, padT, padR, padB } = pads;
  const W = d.W;
  const H = d.face;
  const sl = d.solda;
  const tr = d.transpasse;
  const sd = d.soldaDorsal;
  const isFin = d.tipoSoldaLong === "fin";
  const isAlmofada = p.tipoEmbalagem === "almofada";
  const isFinSeal = p.tipoEmbalagem === "finseal";
  const isLapSeal = p.tipoEmbalagem === "lapseal";
  const lapLeft = d.ladoTranspasse !== "direita";
  const nomeTipo = isFinSeal
    ? "FIN SEAL"
    : isLapSeal
      ? "LAP SEAL"
      : isAlmofada
        ? "ALMOFADA"
        : "2 SOLDAS";

  let x = padL + (lapLeft && tr > 0.01 ? tr : 0);
  const halfW = W / 2;
  // Almofada / pillow: costas dividida nas laterais, frente centralizada
  // ½ Costas | Frente | ½ Costas | Transpasse
  const costasEsq = {
    id: "costas-esq",
    label: "½ COSTAS",
    sub: "traseira esq.",
    x,
    y: padT,
    w: halfW,
    h: H,
    boca: "top",
    narrow: true,
  };
  x += halfW;
  const frente = {
    id: "frente",
    label: "FRENTE",
    sub: "marca · produto · peso",
    x,
    y: padT,
    w: W,
    h: H,
    boca: "top",
  };
  x += W;
  const costasDir = {
    id: "costas-dir",
    label: "½ COSTAS",
    sub: "info · ingredientes",
    x,
    y: padT,
    w: halfW,
    h: H,
    boca: "top",
    narrow: true,
  };
  x += halfW;

  const transp =
    tr > 0.01
      ? {
          id: "transp",
          label: "TRANSPASSE",
          sub: lapLeft ? "início do filme" : "fim do filme",
          x: lapLeft ? padL : x,
          y: padT,
          w: tr,
          h: H,
          isTranspasse: true,
        }
      : null;

  const body = [costasEsq, frente, costasDir];
  const panels = (lapLeft ? [transp, ...body] : [...body, transp]).filter(Boolean);
  const totalW = tr + 2 * W;
  const totalH = H;
  const svgW = totalW + padL + padR;
  const svgH = totalH + padT + padB + 28;

  const planta = [];
  const cotas = [];

  planta.push(`<defs>${soldaHatchDefs()}</defs>`);

  for (const panel of panels) {
    if (panel.w <= 0.01) continue;
    if (panel.isTranspasse) {
      planta.push(`
        <rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}"
          fill="${C.transpasse.hex}" fill-opacity="0.2"
          stroke="${C.transpasse.hex}" stroke-width="0.45" stroke-dasharray="2 1.2"/>
      `);
      planta.push(
        sealLabel(panel.x + panel.w / 2, panel.y + panel.h / 2 - 8, "TRANSPASSE", {
          rotate: -90,
          size: 1.85,
          fill: C.transpasse,
        })
      );
      planta.push(
        `<text x="${panel.x + panel.w / 2}" y="${panel.y + panel.h / 2 + 10}" text-anchor="middle" dominant-baseline="middle"
          font-size="1.3" font-family="${FONT}" ${paintText(C.transpasse)}>${panel.sub}</text>`
      );
    } else {
      planta.push(
        `<rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}" ${paintStroke(C.ink, 0.25)}/>`
      );
      const cx = panel.x + panel.w / 2;
      const cy = panel.y + panel.h / 2;
      if (panel.narrow || panel.w < 40) {
        planta.push(
          `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
            font-size="2.2" font-family="${FONT}" opacity="0.5" transform="rotate(-90 ${cx} ${cy})"
            ${paintText(C.panelLabel)}>${panel.label}</text>`
        );
      } else {
        planta.push(
          `<text x="${cx}" y="${cy - (panel.sub ? 2.2 : 0)}" text-anchor="middle" dominant-baseline="middle"
            font-size="3.2" font-family="${FONT}" opacity="0.5" ${paintText(C.panelLabel)}>${panel.label}</text>`
        );
        if (panel.sub) {
          planta.push(
            `<text x="${cx}" y="${cy + 3.2}" text-anchor="middle" dominant-baseline="middle"
              font-size="1.55" font-family="${FONT}" opacity="0.45" ${paintText(C.panelLabel)}>${panel.sub}</text>`
          );
        }
      }
    }
  }

  // Solda longitudinal (dorsal) — efetiva, dentro do transpasse (une as ½ costas)
  if (transp && sd > 0.01) {
    const sx = lapLeft ? transp.x + transp.w - sd : transp.x;
    planta.push(`<rect x="${sx}" y="${padT}" width="${sd}" height="${H}" ${paintSolda(0.25)}/>`);
    planta.push(`<rect x="${sx}" y="${padT}" width="${sd}" height="${H}" ${paintSoldaHatch()}/>`);
    const longLabel = isFin ? "SOLDA DORSAL · FIN" : "SOLDA DORSAL · LAP";
    planta.push(sealLabel(sx + sd / 2, padT + H / 2, longLabel, { rotate: -90, size: 1.75 }));
    if (isFin) {
      // Barbatana: filete além da junção (indicação esquemática)
      const jx = lapLeft ? transp.x + transp.w : transp.x;
      const finOut = Math.min(3.5, sd * 0.35);
      const finX = lapLeft ? jx : jx - finOut;
      planta.push(
        `<rect x="${finX}" y="${padT + sl}" width="${finOut}" height="${Math.max(1, H - 2 * sl)}"
          ${paintStroke(C.soldaStroke, 0.55)} fill="none"/>`
      );
      planta.push(
        `<text x="${finX + finOut / 2}" y="${padT + 10}" text-anchor="middle" font-size="1.35" font-family="${FONT}" font-weight="700" ${paintText(C.soldaStroke)}>FIN</text>`
      );
    }
  }

  // Soldas transversais superior e inferior (toda a largura do filme)
  for (const panel of panels) {
    if (panel.w <= 0.01) continue;
    planta.push(`<rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${sl}" ${paintSolda(0.25)}/>`);
    planta.push(`<rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${sl}" ${paintSoldaHatch()}/>`);
    planta.push(`<rect x="${panel.x}" y="${panel.y + panel.h - sl}" width="${panel.w}" height="${sl}" ${paintSolda(0.25)}/>`);
    planta.push(`<rect x="${panel.x}" y="${panel.y + panel.h - sl}" width="${panel.w}" height="${sl}" ${paintSoldaHatch()}/>`);
  }
  planta.push(sealLabel(frente.x + frente.w / 2, frente.y + sl / 2, "SOLDA SUPERIOR", { size: 2.0 }));
  planta.push(sealLabel(frente.x + frente.w / 2, frente.y + frente.h - sl / 2, "SOLDA INFERIOR", { size: 2.0 }));

  // Dobras: ½ costas|frente|½ costas + junção do transpasse
  const foldXs = [
    { x: costasEsq.x + halfW, label: "DOBRA" },
    { x: frente.x + W, label: "DOBRA" },
  ];
  if (transp) {
    if (lapLeft) foldXs.unshift({ x: transp.x + transp.w, label: "JUNÇÃO / SOLDA LONG." });
    else foldXs.push({ x: costasDir.x + halfW, label: "JUNÇÃO / SOLDA LONG." });
  }
  for (const f of foldXs) {
    planta.push(
      `<line x1="${f.x}" y1="${padT}" x2="${f.x}" y2="${padT + H}" ${paintStroke(C.dobra, 0.45, "2.2 1.6")}/>`
    );
    if (f.label) {
      planta.push(
        `<text x="${f.x + 2.2}" y="${padT + 14}" text-anchor="start" font-size="1.55" font-family="${FONT}" font-weight="700" ${paintText(C.dobra)}>${f.label}</text>`
      );
    }
  }

  if (p.temZipper) drawZipper(planta, frente, d);
  if (p.temCorte) drawRasgo(planta, frente, d);
  drawSuspension(planta, frente, p, d);

  if (p.temFotocelula) drawFotocelula(planta, p, d, padL, padT, totalW, totalH);

  planta.push(`<rect x="${padL}" y="${padT}" width="${totalW}" height="${totalH}" ${paintStroke(C.corte, 0.7)}/>`);

  const legY = padT + totalH + 14;
  const legX = padL;
  planta.push(`<line x1="${legX}" y1="${legY}" x2="${legX + 10}" y2="${legY}" ${paintStroke(C.corte, 0.7)}/>`);
  planta.push(`<text x="${legX + 12}" y="${legY}" dominant-baseline="middle" font-size="2" font-family="${FONT}" ${paintText(C.corte)}>CORTE EXTERNO</text>`);
  planta.push(`<line x1="${legX + 55}" y1="${legY}" x2="${legX + 65}" y2="${legY}" ${paintStroke(C.dobra, 0.45, "2 1.5")}/>`);
  planta.push(`<text x="${legX + 67}" y="${legY}" dominant-baseline="middle" font-size="2" font-family="${FONT}" ${paintText(C.dobra)}>DOBRA</text>`);
  planta.push(`<rect x="${legX + 100}" y="${legY - 3}" width="10" height="6" ${paintSolda(0.3)}/>`);
  planta.push(
    `<text x="${legX + 112}" y="${legY}" dominant-baseline="middle" font-size="2" font-family="${FONT}" ${paintText(C.soldaStroke)}>SOLDAS SUP/INF + DORSAL</text>`
  );
  if (tr > 0.01) {
    planta.push(`<line x1="${legX + 220}" y1="${legY}" x2="${legX + 230}" y2="${legY}" ${paintStroke(C.transpasse, 0.4, "2 1.2")}/>`);
    planta.push(
      `<text x="${legX + 232}" y="${legY}" dominant-baseline="middle" font-size="2" font-family="${FONT}" ${paintText(C.transpasse)}>TRANSPASSE (${isFin ? "FIN" : "LAP"})</text>`
    );
  }

  const longInfo =
    tr > 0
      ? ` · TRANSP. ${round2(tr)} ${lapLeft ? "ESQ" : "DIR"} · DORSAL ${round2(sd)} ${isFin ? "FIN" : "LAP"}`
      : "";
  planta.push(`
    <g font-family="${FONT}" ${paintText(C.ink)}>
      <text x="${padL}" y="${svgH - 10}" font-size="2.8" font-weight="700">${nomeTipo} · FILME ${round2(totalW)}×${round2(H)} · F/C ${round2(W)} · SUP/INF ${round2(sl)}${longInfo} mm</text>
    </g>
  `);

  const planner = DimPlanner();
  const fs = Math.min(3.0, Math.max(2.4, totalW / 70));
  const rx = padL + totalW;
  const stripOff = planner.next("top");

  for (const panel of panels) {
    if (panel.w <= 0.01) continue;
    let name = panel.label;
    if (panel.isTranspasse) name = "TRANSP.";
    else if (panel.id === "frente") name = "FRENTE";
    else if (panel.id === "costas-esq") name = "½ COSTAS E";
    else if (panel.id === "costas-dir") name = "½ COSTAS D";
    else name = "COSTAS";
    const color = panel.isTranspasse ? DIM_COLOR.transpasse : DIM_COLOR.painel;
    cotas.push(
      dimLine(panel.x, padT, panel.x + panel.w, padT, cotaLabel(name, round2(panel.w)), {
        offset: stripOff,
        outside: true,
        size: fs - 0.2,
        color,
      })
    );
  }

  cotas.push(
    dimLine(padL, padT, rx, padT, cotaLabel("LARG. FILME", round2(totalW)), {
      offset: planner.next("top"),
      outside: true,
      size: fs,
      color: DIM_COLOR.geral,
    })
  );
  cotas.push(
    dimLine(padL, padT, padL, padT + H, cotaLabel("ALTURA", round2(H)), {
      offset: planner.next("left"),
      outside: false,
      vertical: true,
      size: fs,
      color: DIM_COLOR.geral,
    })
  );
  cotas.push(
    dimLine(padL, padT, padL, padT + sl, cotaLabel("SOLDA SUP/INF", round2(sl)), {
      offset: planner.next("left"),
      outside: false,
      vertical: true,
      size: fs - 0.15,
      color: DIM_COLOR.solda,
      textAt: "auto",
    })
  );
  if (transp && sd > 0.01) {
    const sx = lapLeft ? transp.x + transp.w - sd : transp.x;
    cotas.push(
      dimLine(sx, padT + 22, sx + sd, padT + 22, cotaLabel("DORSAL", round2(sd)), {
        offset: planner.next("top"),
        outside: true,
        size: fs - 0.2,
        color: DIM_COLOR.solda,
        labelBelow: true,
      })
    );
  }

  if (p.temZipper) {
    const yStart = frente.y + d.distZip;
    const yEnd = yStart + d.zipW;
    cotas.push(
      dimLine(rx, frente.y, rx, yStart, cotaLabel("ZIPPER", round2(d.distZip)), {
        offset: planner.next("right"),
        outside: true,
        vertical: true,
        size: fs - 0.1,
        color: DIM_COLOR.zipper,
        textAt: "auto",
      })
    );
    cotas.push(
      dimLine(rx, yStart, rx, yEnd, cotaLabel("ZIPPER", round2(d.zipW), d.zipW, { sub: "LARG" }), {
        offset: planner.next("right"),
        outside: true,
        vertical: true,
        size: fs - 0.1,
        color: DIM_COLOR.zipper,
        textAt: "auto",
      })
    );
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Plantatec ${nomeTipo}: ½Costas | Frente | ½Costas | Transpasse · solda dorsal ${isFin ? "Fin" : "Lap"} -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
  xmlns:i="http://ns.adobe.com/AdobeIllustrator/10.0/" version="1.1"
  width="${svgW}mm" height="${svgH}mm" viewBox="0 0 ${svgW} ${svgH}"
  color-interpolation="auto">
  <g id="Planta" inkscape:groupmode="layer" inkscape:label="Planta" data-name="Planta">
    ${planta.join("\n")}
  </g>
  <g id="Cotas" inkscape:groupmode="layer" inkscape:label="Cotas" data-name="Cotas">
    ${cotas.join("\n")}
  </g>
</svg>`;

  collectMagnetGuides2Side(padL, padT, totalW, totalH, W, H, sl, tr, lapLeft, sd);
  return {
    svg,
    resumo: `${nomeTipo} · FILME ${round2(totalW)}×${round2(H)} · F/C ${round2(W)}${tr > 0 ? ` · transp ${round2(tr)} · dorsal ${round2(sd)} ${isFin ? "fin" : "lap"}` : ""} mm`,
  };
}

/**
 * Bottom Gusset — tubo / almofada com sanfona só no fundo:
 * Transpasse | Frente | Costas  (+ faixa inferior de sanfona)
 * Sem laterais expansíveis; expansão via dobras horizontais no fundo.
 */
function buildDrawingBottomGusset(p, d, pads) {
  const { padL, padT, padR, padB } = pads;
  const W = d.W;
  const H = d.face;
  const G = d.sanfona;
  const sl = d.solda;
  const tr = d.transpasse;
  const sd = d.soldaDorsal;
  const isFin = d.tipoSoldaLong === "fin";
  const lapLeft = d.ladoTranspasse !== "direita";
  const aba = sl;

  let x = padL + (lapLeft && tr > 0.01 ? tr : 0);
  const frente = {
    id: "frente",
    label: "FRENTE",
    sub: "arte principal",
    x,
    y: padT,
    w: W,
    h: H,
    boca: "top",
  };
  x += W;
  const verso = {
    id: "verso",
    label: "COSTAS",
    sub: "traseira",
    x,
    y: padT,
    w: W,
    h: H,
    boca: "top",
  };
  x += W;

  const transp =
    tr > 0.01
      ? {
          id: "transp",
          label: "TRANSPASSE",
          sub: lapLeft ? "início do filme" : "fim do filme",
          x: lapLeft ? padL : x,
          y: padT,
          w: tr,
          h: H,
          isTranspasse: true,
        }
      : null;

  const body = [frente, verso];
  const panels = (lapLeft ? [transp, ...body] : [...body, transp]).filter(Boolean);
  const totalW = tr + 2 * W;
  const totalH = H + G;
  const svgW = totalW + padL + padR;
  const svgH = totalH + padT + padB + 28;
  const gy = padT + H;

  const planta = [];
  const cotas = [];

  planta.push(`<defs>${soldaHatchDefs()}</defs>`);

  for (const panel of panels) {
    if (panel.w <= 0.01) continue;
    if (panel.isTranspasse) {
      planta.push(`
        <rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}"
          fill="${C.transpasse.hex}" fill-opacity="0.2"
          stroke="${C.transpasse.hex}" stroke-width="0.45" stroke-dasharray="2 1.2"/>
      `);
      planta.push(
        sealLabel(panel.x + panel.w / 2, panel.y + panel.h / 2, "TRANSPASSE", {
          rotate: -90,
          size: 1.85,
          fill: C.transpasse,
        })
      );
    } else {
      planta.push(
        `<rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}" ${paintStroke(C.ink, 0.25)}/>`
      );
      const cx = panel.x + panel.w / 2;
      const cy = panel.y + panel.h / 2;
      planta.push(
        `<text x="${cx}" y="${cy - 2.2}" text-anchor="middle" dominant-baseline="middle"
          font-size="3.2" font-family="${FONT}" opacity="0.5" ${paintText(C.panelLabel)}>${panel.label}</text>`
      );
      planta.push(
        `<text x="${cx}" y="${cy + 3.2}" text-anchor="middle" dominant-baseline="middle"
          font-size="1.55" font-family="${FONT}" opacity="0.45" ${paintText(C.panelLabel)}>${panel.sub}</text>`
      );
    }
  }

  // Faixa de sanfona inferior (corpo → fundo)
  planta.push(`<rect x="${padL}" y="${gy}" width="${totalW}" height="${G}" ${paintStroke(C.ink, 0.3)}/>`);
  planta.push(
    `<text x="${frente.x + W / 2}" y="${gy + G / 2 + 4}" text-anchor="middle" dominant-baseline="middle"
      font-size="2.6" font-family="${FONT}" opacity="0.5" ${paintText(C.panelLabel)}>SANFONA INFERIOR</text>`
  );

  // Solda longitudinal no transpasse (corpo)
  if (transp && sd > 0.01) {
    const sx = lapLeft ? transp.x + transp.w - sd : transp.x;
    planta.push(`<rect x="${sx}" y="${padT}" width="${sd}" height="${H}" ${paintSoldaHatch()}/>`);
    planta.push(
      sealLabel(sx + sd / 2, padT + H / 2, isFin ? "SOLDA LONG. · FIN" : "SOLDA LONG. · LAP", {
        rotate: -90,
        size: 1.7,
      })
    );
  }

  // Solda superior (boca); solda inferior na base da sanfona
  for (const panel of panels) {
    if (panel.w <= 0.01) continue;
    planta.push(`<rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${aba}" ${paintSoldaHatch()}/>`);
  }
  planta.push(`<rect x="${padL}" y="${gy + G - aba}" width="${totalW}" height="${aba}" ${paintSoldaHatch()}/>`);
  planta.push(sealLabel(frente.x + W / 2, frente.y + aba / 2, "SOLDA SUPERIOR", { size: 1.9 }));
  planta.push(sealLabel(frente.x + W / 2, gy + G - aba / 2, "SOLDA INFERIOR", { size: 1.9 }));

  // Dobras verticais do tubo
  const foldXs = [{ x: frente.x + W, label: "DOBRA LATERAL" }];
  if (transp) {
    if (lapLeft) foldXs.unshift({ x: transp.x + transp.w, label: "JUNÇÃO / SOLDA LONG." });
    else foldXs.push({ x: verso.x + W, label: "JUNÇÃO / SOLDA LONG." });
  }
  for (const f of foldXs) {
    planta.push(
      `<line x1="${f.x}" y1="${padT}" x2="${f.x}" y2="${padT + totalH}" ${paintStroke(C.dobra, 0.45, "2.2 1.6")}/>`
    );
    if (f.label) {
      planta.push(
        `<text x="${f.x + 2.2}" y="${padT + 14}" text-anchor="start" font-size="1.55" font-family="${FONT}" font-weight="700" ${paintText(C.dobra)}>${f.label}</text>`
      );
    }
  }

  // Dobras horizontais da sanfona de fundo
  planta.push(
    `<line x1="${padL}" y1="${gy}" x2="${padL + totalW}" y2="${gy}" ${paintStroke(C.dobra, 0.55, "3 1.5")}/>`
  );
  planta.push(
    `<text x="${frente.x + W / 2}" y="${gy + 4.2}" text-anchor="middle" font-size="1.65" font-family="${FONT}" font-weight="700" ${paintText(C.dobra)}>DOBRA FUNDO (VAZIO → PARA DENTRO)</text>`
  );
  const midG = gy + G / 2;
  planta.push(
    `<line x1="${padL}" y1="${midG}" x2="${padL + totalW}" y2="${midG}" ${paintStroke(C.dobra, 0.4, "2 1.8")}/>`
  );
  planta.push(
    `<text x="${verso.x + W / 2}" y="${midG - 2}" text-anchor="middle" font-size="1.5" font-family="${FONT}" font-weight="700" ${paintText(C.dobra)}>DOBRA CENTRAL SANFONA</text>`
  );

  // Esquema de abertura da sanfona sob frente e costas
  const drawGussetOpen = (px, pw) => {
    const mid = px + pw / 2;
    planta.push(
      `<path d="M${px},${gy} L${mid},${gy + G} L${px + pw},${gy}" fill="none" ${paintStroke(C.dobra, 0.35, "2 1.4")}/>`
    );
    planta.push(
      `<path d="M${px},${gy + G} L${mid},${gy} L${px + pw},${gy + G}" fill="none" ${paintStroke(C.dobra, 0.3, "1.8 1.6")}/>`
    );
  };
  drawGussetOpen(frente.x, W);
  drawGussetOpen(verso.x, W);

  if (p.temZipper) drawZipper(planta, frente, d);
  if (p.temCorte) drawRasgo(planta, frente, d);
  drawSuspension(planta, frente, p, d);

  if (p.temFotocelula) drawFotocelula(planta, p, d, padL, padT, totalW, totalH);

  planta.push(`<rect x="${padL}" y="${padT}" width="${totalW}" height="${totalH}" ${paintStroke(C.corte, 0.7)}/>`);

  const legY = padT + totalH + 14;
  const legX = padL;
  planta.push(`<line x1="${legX}" y1="${legY}" x2="${legX + 10}" y2="${legY}" ${paintStroke(C.corte, 0.7)}/>`);
  planta.push(`<text x="${legX + 12}" y="${legY}" dominant-baseline="middle" font-size="2" font-family="${FONT}" ${paintText(C.corte)}>CORTE EXTERNO</text>`);
  planta.push(`<line x1="${legX + 55}" y1="${legY}" x2="${legX + 65}" y2="${legY}" ${paintStroke(C.dobra, 0.45, "2 1.5")}/>`);
  planta.push(`<text x="${legX + 67}" y="${legY}" dominant-baseline="middle" font-size="2" font-family="${FONT}" ${paintText(C.dobra)}>DOBRA / FUNDO</text>`);
  planta.push(`<rect x="${legX + 115}" y="${legY - 3}" width="10" height="6" ${paintSoldaHatch()}/>`);
  planta.push(`<text x="${legX + 127}" y="${legY}" dominant-baseline="middle" font-size="2" font-family="${FONT}" ${paintText(C.soldaStroke)}>SOLDA SUP/INF</text>`);
  if (tr > 0.01) {
    planta.push(`<line x1="${legX + 190}" y1="${legY}" x2="${legX + 200}" y2="${legY}" ${paintStroke(C.transpasse, 0.4, "2 1.2")}/>`);
    planta.push(
      `<text x="${legX + 202}" y="${legY}" dominant-baseline="middle" font-size="2" font-family="${FONT}" ${paintText(C.transpasse)}>TRANSPASSE (${isFin ? "FIN" : "LAP"})</text>`
    );
  }

  planta.push(`
    <g font-family="${FONT}" ${paintText(C.ink)}>
      <text x="${padL}" y="${svgH - 10}" font-size="2.8" font-weight="700">BOTTOM GUSSET · FILME ${round2(totalW)}×${round2(totalH)} · F/C ${round2(W)} · Sanf.inf ${round2(G)} · SL ${round2(sl)}${tr > 0 ? ` · TRANSP. ${round2(tr)}` : ""} mm</text>
    </g>
  `);

  const planner = DimPlanner();
  const fs = Math.min(3.0, Math.max(2.4, totalW / 70));
  const rx = padL + totalW;
  const stripOff = planner.next("top");

  for (const panel of panels) {
    if (panel.w <= 0.01) continue;
    let name = panel.label;
    if (panel.isTranspasse) name = "TRANSP.";
    else if (panel.id === "frente") name = "FRENTE";
    else name = "COSTAS";
    const color = panel.isTranspasse ? DIM_COLOR.transpasse : DIM_COLOR.painel;
    cotas.push(
      dimLine(panel.x, padT, panel.x + panel.w, padT, cotaLabel(name, round2(panel.w)), {
        offset: stripOff,
        outside: true,
        size: fs - 0.2,
        color,
      })
    );
  }

  cotas.push(
    dimLine(padL, padT, rx, padT, cotaLabel("LARG. FILME", round2(totalW)), {
      offset: planner.next("top"),
      outside: true,
      size: fs,
      color: DIM_COLOR.geral,
    })
  );
  cotas.push(
    dimLine(padL, padT, padL, padT + H, cotaLabel("ALTURA", round2(H)), {
      offset: planner.next("left"),
      outside: false,
      vertical: true,
      size: fs,
      color: DIM_COLOR.geral,
    })
  );
  cotas.push(
    dimLine(padL, gy, padL, gy + G, cotaLabel("SANF. INF.", round2(G)), {
      offset: planner.next("left"),
      outside: false,
      vertical: true,
      size: fs - 0.1,
      color: DIM_COLOR.painel,
      textAt: "auto",
    })
  );
  cotas.push(
    dimLine(padL, padT, padL, padT + totalH, cotaLabel("ALT. TOTAL", round2(totalH)), {
      offset: planner.next("left"),
      outside: false,
      vertical: true,
      size: fs,
      color: DIM_COLOR.geral,
    })
  );
  cotas.push(
    dimLine(padL, padT, padL, padT + aba, cotaLabel("SOLDA", round2(aba)), {
      offset: planner.next("left"),
      outside: false,
      vertical: true,
      size: fs - 0.15,
      color: DIM_COLOR.solda,
      textAt: "auto",
    })
  );

  if (p.temZipper) {
    const yStart = frente.y + d.distZip;
    const yEnd = yStart + d.zipW;
    cotas.push(
      dimLine(rx, frente.y, rx, yStart, cotaLabel("ZIPPER", round2(d.distZip)), {
        offset: planner.next("right"),
        outside: true,
        vertical: true,
        size: fs - 0.1,
        color: DIM_COLOR.zipper,
        textAt: "auto",
      })
    );
    cotas.push(
      dimLine(rx, yStart, rx, yEnd, cotaLabel("ZIPPER", round2(d.zipW), d.zipW, { sub: "LARG" }), {
        offset: planner.next("right"),
        outside: true,
        vertical: true,
        size: fs - 0.1,
        color: DIM_COLOR.zipper,
        textAt: "auto",
      })
    );
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Plantatec Bottom Gusset: Transpasse|Frente|Costas + sanfona inferior -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
  xmlns:i="http://ns.adobe.com/AdobeIllustrator/10.0/" version="1.1"
  width="${svgW}mm" height="${svgH}mm" viewBox="0 0 ${svgW} ${svgH}"
  color-interpolation="auto">
  <g id="Planta" inkscape:groupmode="layer" inkscape:label="Planta" data-name="Planta">
    ${planta.join("\n")}
  </g>
  <g id="Cotas" inkscape:groupmode="layer" inkscape:label="Cotas" data-name="Cotas">
    ${cotas.join("\n")}
  </g>
</svg>`;

  collectMagnetGuidesBottomGusset(padL, padT, totalW, totalH, W, H, G, sl, tr, lapLeft);
  return {
    svg,
    resumo: `BOTTOM GUSSET · FILME ${round2(totalW)}×${round2(totalH)} · F/C ${round2(W)} · sanf.inf ${round2(G)}${tr > 0 ? ` · transp ${round2(tr)}` : ""} mm`,
  };
}

/**
 * 4 soldas (Quad-Seal) e Flat Bottom (Box Pouch) — planta horizontal:
 * [Transpasse?] | Lateral | Frente | Lateral | Verso
 * Flat Bottom: + região inferior de fundo plano (dobras de base)
 */
function buildDrawing4Side(p, d, pads) {
  const { padL, padT, padR, padB } = pads;
  const W = d.W;
  const S = d.sanfona;
  const H = d.face;
  const sl = d.solda;
  const tr = d.transpasse;
  const aba = sl;
  const isFB = p.tipoEmbalagem === "flatbottom";
  const B = isFB ? d.fundo : 0;
  const lapLeft = d.ladoTranspasse !== "direita";
  const nomeTipo = isFB ? "FLAT BOTTOM" : "4 SOLDAS";

  // Lateral | Frente | Lateral | Verso (+ transpasse numa extremidade)
  let x = padL + (lapLeft && tr > 0.01 ? tr : 0);

  const latEsq = {
    id: "lat-esq",
    label: "LATERAL",
    sub: "sanfona esq",
    x,
    y: padT,
    w: S,
    h: H,
    gusset: true,
    fullGusset: true,
  };
  x += S;
  const frente = {
    id: "frente",
    label: "FRENTE",
    sub: "arte principal",
    x,
    y: padT,
    w: W,
    h: H,
    boca: "top",
  };
  x += W;
  const latDir = {
    id: "lat-dir",
    label: "LATERAL",
    sub: "sanfona dir",
    x,
    y: padT,
    w: S,
    h: H,
    gusset: true,
    fullGusset: true,
  };
  x += S;
  const verso = {
    id: "verso",
    label: "VERSO",
    sub: "info / código",
    x,
    y: padT,
    w: W,
    h: H,
    boca: "top",
  };
  x += W;

  const transp =
    tr > 0.01
      ? {
          id: "transp",
          label: "TRANSPASSE",
          sub: lapLeft ? "início do filme" : "fim do filme",
          x: lapLeft ? padL : x,
          y: padT,
          w: tr,
          h: H,
          isTranspasse: true,
        }
      : null;

  const body = [latEsq, frente, latDir, verso];
  const panels = (lapLeft ? [transp, ...body] : [...body, transp]).filter(Boolean);
  const totalW = tr + 2 * W + 2 * S;
  const totalH = H + B;
  const svgW = totalW + padL + padR;
  const svgH = totalH + padT + padB + 28;

  const planta = [];
  const cotas = [];

  planta.push(`<defs>${soldaHatchDefs()}</defs>`);

  for (const panel of panels) {
    if (panel.w <= 0.01) continue;
    if (panel.isTranspasse) {
      planta.push(`
        <rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}"
          fill="${C.transpasse.hex}" fill-opacity="0.2"
          stroke="${C.transpasse.hex}" stroke-width="0.45" stroke-dasharray="2 1.2"/>
      `);
      planta.push(
        sealLabel(panel.x + panel.w / 2, panel.y + panel.h / 2 - 2, "TRANSPASSE", {
          rotate: -90,
          size: 1.9,
          fill: C.transpasse,
        })
      );
      planta.push(
        `<text x="${panel.x + panel.w / 2}" y="${panel.y + panel.h / 2 + 6}" text-anchor="middle" dominant-baseline="middle"
          font-size="1.4" font-family="${FONT}" ${paintText(C.transpasse)}>${panel.sub}</text>`
      );
    } else {
      planta.push(
        `<rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}" ${paintStroke(C.ink, 0.25)}/>`
      );
      const cx = panel.x + panel.w / 2;
      const cy = panel.y + panel.h / 2;
      const rot = panel.gusset && panel.w < 28 && !panel.fullGusset;
      if (rot) {
        planta.push(
          `<text x="${cx}" y="${cy - 2}" text-anchor="middle" dominant-baseline="middle"
            font-size="2.4" font-family="${FONT}" opacity="0.55" transform="rotate(-90 ${cx} ${cy - 2})"
            ${paintText(C.panelLabel)}>${panel.label}</text>`
        );
        if (panel.sub) {
          planta.push(
            `<text x="${cx}" y="${cy + 4}" text-anchor="middle" dominant-baseline="middle"
              font-size="1.5" font-family="${FONT}" opacity="0.5" transform="rotate(-90 ${cx} ${cy + 4})"
              ${paintText(C.panelLabel)}>${panel.sub}</text>`
          );
        }
      } else {
        planta.push(
          `<text x="${cx}" y="${cy - (panel.sub ? 2.2 : 0)}" text-anchor="middle" dominant-baseline="middle"
            font-size="${panel.fullGusset ? 2.6 : 3.2}" font-family="${FONT}" opacity="0.5" ${paintText(C.panelLabel)}>${panel.label}</text>`
        );
        if (panel.sub) {
          planta.push(
            `<text x="${cx}" y="${cy + 3.2}" text-anchor="middle" dominant-baseline="middle"
              font-size="1.7" font-family="${FONT}" opacity="0.45" ${paintText(C.panelLabel)}>${panel.sub}</text>`
          );
        }
      }
    }
  }

  // —— 4 soldas verticais nas quinas (corpo) ——
  const vertSeals = [
    { foldX: frente.x, label: "SOLDA 1" },
    { foldX: frente.x + W, label: "SOLDA 2" },
    { foldX: verso.x, label: "SOLDA 3" },
    { foldX: verso.x + W, label: "SOLDA 4" },
  ];
  for (const vs of vertSeals) {
    const sx = vs.foldX - sl / 2;
    planta.push(`<rect x="${sx}" y="${padT}" width="${sl}" height="${H}" ${paintSolda(0.3)}/>`);
    planta.push(`<rect x="${sx}" y="${padT}" width="${sl}" height="${H}" ${paintSoldaHatch()}/>`);
    planta.push(sealLabel(vs.foldX, padT + H / 2, vs.label, { rotate: -90, size: 2.0 }));
  }
  planta.push(
    `<text x="${frente.x}" y="${padT + 6}" text-anchor="middle" font-size="1.55" font-family="${FONT}" ${paintText(C.soldaStroke)}>SEM IMPRESSÃO</text>`
  );

  // Aba superior (sempre); aba inferior só no Quad-Seal (Flat Bottom usa região de fundo)
  for (const panel of panels) {
    if (panel.w <= 0.01) continue;
    planta.push(`<rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${aba}" ${paintSolda(0.25)}/>`);
    planta.push(`<rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${aba}" ${paintSoldaHatch()}/>`);
    if (!isFB) {
      planta.push(`<rect x="${panel.x}" y="${panel.y + panel.h - aba}" width="${panel.w}" height="${aba}" ${paintSolda(0.25)}/>`);
      planta.push(`<rect x="${panel.x}" y="${panel.y + panel.h - aba}" width="${panel.w}" height="${aba}" ${paintSoldaHatch()}/>`);
    }
  }
  planta.push(sealLabel(frente.x + frente.w / 2, frente.y + aba / 2, "ABA SUPERIOR", { size: 1.9 }));
  if (!isFB) {
    planta.push(sealLabel(frente.x + frente.w / 2, frente.y + frente.h - aba / 2, "ABA INFERIOR", { size: 1.9 }));
  }

  // —— Dobras: Lat|F|Lat|V (+ junção do transpasse) ——
  const foldXs = [
    { x: latEsq.x + latEsq.w },
    { x: frente.x + frente.w },
    { x: latDir.x + latDir.w },
    { x: verso.x + verso.w },
  ];
  if (transp) {
    if (lapLeft) foldXs.unshift({ x: transp.x + transp.w });
  }
  for (const f of foldXs) {
    planta.push(
      `<line x1="${f.x}" y1="${padT}" x2="${f.x}" y2="${padT + H}" ${paintStroke(C.dobra, 0.45, "2.2 1.6")}/>`
    );
  }
  planta.push(
    `<text x="${latEsq.x + S / 2}" y="${padT + 12}" text-anchor="middle" font-size="1.55" font-family="${FONT}" font-weight="700" ${paintText(C.dobra)}>LAT. ESQ.</text>`
  );
  planta.push(
    `<text x="${latDir.x + S / 2}" y="${padT + 12}" text-anchor="middle" font-size="1.55" font-family="${FONT}" font-weight="700" ${paintText(C.dobra)}>LAT. DIR.</text>`
  );

  // —— Flat Bottom: região de fundo plano ——
  if (isFB && B > 0.01) {
    const fy = padT + H;
    planta.push(`<rect x="${padL}" y="${fy}" width="${totalW}" height="${B}" ${paintStroke(C.ink, 0.3)}/>`);

    for (const f of foldXs) {
      planta.push(
        `<line x1="${f.x}" y1="${fy}" x2="${f.x}" y2="${fy + B}" ${paintStroke(C.dobra, 0.4, "2.2 1.6")}/>`
      );
    }

    planta.push(
      `<line x1="${padL}" y1="${fy}" x2="${padL + totalW}" y2="${fy}" ${paintStroke(C.dobra, 0.55, "3 1.5")}/>`
    );
    planta.push(
      `<text x="${frente.x + W / 2}" y="${fy + 4}" text-anchor="middle" font-size="1.7" font-family="${FONT}" font-weight="700" ${paintText(C.dobra)}>DOBRA FUNDO</text>`
    );

    const midFy = fy + B / 2;
    planta.push(
      `<line x1="${padL}" y1="${midFy}" x2="${padL + totalW}" y2="${midFy}" ${paintStroke(C.dobra, 0.4, "2 1.8")}/>`
    );
    planta.push(
      `<text x="${verso.x + W / 2}" y="${midFy - 2}" text-anchor="middle" font-size="1.55" font-family="${FONT}" font-weight="700" ${paintText(C.dobra)}>DOBRA CENTRAL BASE</text>`
    );

    const drawBottomDiamond = (px, pw) => {
      const mid = px + pw / 2;
      planta.push(
        `<path d="M${px},${fy} L${mid},${fy + B} L${px + pw},${fy}" fill="none" ${paintStroke(C.dobra, 0.4, "2 1.4")}/>`
      );
      planta.push(
        `<path d="M${px},${fy + B} L${mid},${fy} L${px + pw},${fy + B}" fill="none" ${paintStroke(C.dobra, 0.35, "1.8 1.6")}/>`
      );
    };
    drawBottomDiamond(frente.x, W);
    drawBottomDiamond(verso.x, W);

    for (const g of [latEsq, latDir]) {
      if (g.w <= 0.01) continue;
      const gx = g.x + g.w / 2;
      planta.push(
        `<path d="M${g.x},${fy} L${gx},${fy + Math.min(B * 0.55, S * 0.5)} L${g.x + g.w},${fy} Z"
          fill="none" ${paintStroke(C.dobra, 0.35, "1.6 1.4")}/>`
      );
    }

    planta.push(`<rect x="${padL}" y="${fy + B - aba}" width="${totalW}" height="${aba}" ${paintSolda(0.25)}/>`);
    planta.push(`<rect x="${padL}" y="${fy + B - aba}" width="${totalW}" height="${aba}" ${paintSoldaHatch()}/>`);
    planta.push(sealLabel(frente.x + W / 2, fy + B - aba / 2, "SOLDA BASE / FUNDO", { size: 1.85 }));

    planta.push(
      `<text x="${frente.x + W / 2}" y="${fy + B / 2 + 5}" text-anchor="middle" dominant-baseline="middle"
        font-size="2.8" font-family="${FONT}" opacity="0.5" ${paintText(C.panelLabel)}>FUNDO · BASE PLANA</text>`
    );
  }

  // Acessórios no painel frontal
  if (p.temZipper) drawZipper(planta, frente, d);
  if (p.temCorte) drawRasgo(planta, frente, d);
  drawSuspension(planta, frente, p, d);
  drawValvula(planta, frente, p);

  if (p.temFotocelula) drawFotocelula(planta, p, d, padL, padT, totalW, totalH);

  planta.push(`<rect x="${padL}" y="${padT}" width="${totalW}" height="${totalH}" ${paintStroke(C.corte, 0.7)}/>`);

  const legY = padT + totalH + 14;
  const legX = padL;
  planta.push(`<line x1="${legX}" y1="${legY}" x2="${legX + 10}" y2="${legY}" ${paintStroke(C.corte, 0.7)}/>`);
  planta.push(`<text x="${legX + 12}" y="${legY}" dominant-baseline="middle" font-size="2" font-family="${FONT}" ${paintText(C.corte)}>CORTE EXTERNO</text>`);
  planta.push(`<line x1="${legX + 55}" y1="${legY}" x2="${legX + 65}" y2="${legY}" ${paintStroke(C.dobra, 0.45, "2 1.5")}/>`);
  planta.push(
    `<text x="${legX + 67}" y="${legY}" dominant-baseline="middle" font-size="2" font-family="${FONT}" ${paintText(C.dobra)}>${isFB ? "DOBRA / FUNDO" : "DOBRA / SANFONA"}</text>`
  );
  planta.push(`<rect x="${legX + 120}" y="${legY - 3}" width="10" height="6" ${paintSoldaHatch()}/>`);
  planta.push(`<text x="${legX + 132}" y="${legY}" dominant-baseline="middle" font-size="2" font-family="${FONT}" ${paintText(C.soldaStroke)}>SOLDA (SEM IMPRESSÃO)</text>`);
  if (tr > 0.01) {
    planta.push(`<line x1="${legX + 210}" y1="${legY}" x2="${legX + 220}" y2="${legY}" ${paintStroke(C.transpasse, 0.4, "2 1.2")}/>`);
    planta.push(`<text x="${legX + 222}" y="${legY}" dominant-baseline="middle" font-size="2" font-family="${FONT}" ${paintText(C.transpasse)}>TRANSPASSE (LAP)</text>`);
  }

  const fundoInfo = isFB ? ` · Fundo ${round2(B)}` : "";
  planta.push(`
    <g font-family="${FONT}" ${paintText(C.ink)}>
      <text x="${padL}" y="${svgH - 10}" font-size="2.8" font-weight="700">${nomeTipo} · FILME ${round2(totalW)}×${round2(totalH)} · F ${round2(W)} · Lat ${round2(S)} · SL ${round2(sl)}${fundoInfo}${tr > 0 ? ` · TRANSP. ${round2(tr)} ${lapLeft ? "ESQ" : "DIR"}` : ""} mm</text>
    </g>
  `);

  const planner = DimPlanner();
  const fs = Math.min(3.0, Math.max(2.4, totalW / 70));
  const rx = padL + totalW;
  const stripOff = planner.next("top");

  for (const panel of panels) {
    if (panel.w <= 0.01) continue;
    let name = panel.label;
    if (panel.isTranspasse) name = "TRANSP.";
    else if (panel.id === "frente") name = "FRENTE";
    else if (panel.id === "verso") name = "VERSO";
    else if (panel.id === "lat-esq") name = "LAT. ESQ.";
    else if (panel.id === "lat-dir") name = "LAT. DIR.";
    else name = "LATERAL";
    const color = panel.isTranspasse ? DIM_COLOR.transpasse : DIM_COLOR.painel;
    cotas.push(
      dimLine(panel.x, padT, panel.x + panel.w, padT, cotaLabel(name, round2(panel.w)), {
        offset: stripOff,
        outside: true,
        size: fs - 0.2,
        color,
      })
    );
  }

  cotas.push(
    dimLine(padL, padT, rx, padT, cotaLabel("LARG. FILME", round2(totalW)), {
      offset: planner.next("top"),
      outside: true,
      size: fs,
      color: DIM_COLOR.geral,
    })
  );
  cotas.push(
    dimLine(padL, padT, padL, padT + H, cotaLabel("ALTURA", round2(H)), {
      offset: planner.next("left"),
      outside: false,
      vertical: true,
      size: fs,
      color: DIM_COLOR.geral,
    })
  );
  if (isFB && B > 0.01) {
    cotas.push(
      dimLine(padL, padT + H, padL, padT + H + B, cotaLabel("FUNDO", round2(B)), {
        offset: planner.next("left"),
        outside: false,
        vertical: true,
        size: fs - 0.1,
        color: DIM_COLOR.painel,
        textAt: "auto",
      })
    );
    cotas.push(
      dimLine(padL, padT, padL, padT + totalH, cotaLabel("ALT. TOTAL", round2(totalH)), {
        offset: planner.next("left"),
        outside: false,
        vertical: true,
        size: fs,
        color: DIM_COLOR.geral,
      })
    );
  }
  cotas.push(
    dimLine(frente.x - sl / 2, padT + 18, frente.x + sl / 2, padT + 18, cotaLabel("SOLDA VERT.", round2(sl)), {
      offset: planner.next("left"),
      outside: false,
      size: fs - 0.15,
      color: DIM_COLOR.solda,
      labelBelow: true,
    })
  );
  cotas.push(
    dimLine(padL, padT, padL, padT + aba, cotaLabel("ABA", round2(aba)), {
      offset: planner.next("left"),
      outside: false,
      vertical: true,
      size: fs - 0.15,
      color: DIM_COLOR.solda,
      textAt: "auto",
    })
  );

  if (p.temValvula) {
    const { cx, cy, r, rLivre } = valveCenter(frente, p);
    cotas.push(
      dimLine(frente.x, cy, cx, cy, cotaLabel("VÁLVULA X", round2(cx - frente.x)), {
        offset: planner.next("top"),
        outside: true,
        size: fs - 0.15,
        color: DIM_COLOR.valvula,
      })
    );
    cotas.push(
      dimLine(cx, frente.y, cx, cy, cotaLabel("VÁLVULA Y", round2(cy - frente.y)), {
        offset: planner.next("right"),
        outside: true,
        vertical: true,
        size: fs - 0.15,
        color: DIM_COLOR.valvula,
        textAt: "auto",
      })
    );
    cotas.push(
      dimLine(cx - r, cy, cx + r, cy, cotaLabel("VÁLVULA Ø", round2(p.valvulaDiametro)), {
        offset: planner.next("bottom"),
        outside: true,
        size: fs - 0.15,
        color: DIM_COLOR.valvula,
        labelBelow: true,
      })
    );
    if (p.valvulaLivre > 0 && rLivre > r) {
      cotas.push(
        dimLine(cx, cy - rLivre, cx, cy - r, cotaLabel("ÁREA LIVRE", round2(p.valvulaLivre)), {
          offset: planner.next("right"),
          outside: true,
          vertical: true,
          size: fs - 0.2,
          color: DIM_COLOR.valvula,
          textAt: "auto",
        })
      );
    }
  }

  if (p.temZipper) {
    const yStart = frente.y + d.distZip;
    const yEnd = yStart + d.zipW;
    cotas.push(
      dimLine(rx, frente.y, rx, yStart, cotaLabel("ZIPPER", round2(d.distZip)), {
        offset: planner.next("right"),
        outside: true,
        vertical: true,
        size: fs - 0.1,
        color: DIM_COLOR.zipper,
        textAt: "auto",
      })
    );
    cotas.push(
      dimLine(rx, yStart, rx, yEnd, cotaLabel("ZIPPER", round2(d.zipW), d.zipW, { sub: "LARG" }), {
        offset: planner.next("right"),
        outside: true,
        vertical: true,
        size: fs - 0.1,
        color: DIM_COLOR.zipper,
        textAt: "auto",
      })
    );
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Plantatec ${nomeTipo}: Lat|Frente|Lat|Verso + Transpasse · 4 soldas de quina · CMYK -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
  xmlns:i="http://ns.adobe.com/AdobeIllustrator/10.0/" version="1.1"
  width="${svgW}mm" height="${svgH}mm" viewBox="0 0 ${svgW} ${svgH}"
  color-interpolation="auto">
  <g id="Planta" inkscape:groupmode="layer" inkscape:label="Planta" data-name="Planta">
    ${planta.join("\n")}
  </g>
  <g id="Cotas" inkscape:groupmode="layer" inkscape:label="Cotas" data-name="Cotas">
    ${cotas.join("\n")}
  </g>
</svg>`;

  collectMagnetGuides4Side(padL, padT, totalW, totalH, W, S, H, sl, tr, lapLeft, B);
  return {
    svg,
    resumo: `${nomeTipo} · FILME ${round2(totalW)}×${round2(totalH)} · F ${round2(W)} · Lat ${round2(S)}${isFB ? ` · fundo ${round2(B)}` : ""}${tr > 0 ? ` · transp ${round2(tr)} ${lapLeft ? "esq" : "dir"}` : ""} mm`,
  };
}

/**
 * Side Gusset Bag — planta horizontal:
 * [Transpasse?] | ½ Lat | Frente | Lateral completa | Costas | ½ Lat
 * Diferente do Quad-Seal: uma sanfona inteira entre frente e costas (não ½+½ no centro).
 * Soldas: superior + inferior (+ longitudinal opcional no transpasse).
 */
function buildDrawingSideGusset(p, d, pads) {
  const { padL, padT, padR, padB } = pads;
  const W = d.W;
  const S = d.sanfona;
  const H = d.face;
  const sl = d.solda;
  const tr = d.transpasse;
  const sd = d.soldaDorsal;
  const isFin = d.tipoSoldaLong === "fin";
  const aba = sl;
  const halfS = S / 2;
  const lapLeft = d.ladoTranspasse !== "direita";

  let x = padL + (lapLeft && tr > 0.01 ? tr : 0);

  const halfL = {
    id: "half-l",
    label: "½ LAT.",
    sub: "sanfona esq",
    x,
    y: padT,
    w: halfS,
    h: H,
    gusset: true,
  };
  x += halfS;
  const frente = {
    id: "frente",
    label: "FRENTE",
    sub: "arte principal",
    x,
    y: padT,
    w: W,
    h: H,
    boca: "top",
  };
  x += W;
  const lateral = {
    id: "lateral",
    label: "LATERAL",
    sub: "sanfona completa",
    x,
    y: padT,
    w: S,
    h: H,
    gusset: true,
    fullGusset: true,
  };
  x += S;
  const verso = {
    id: "verso",
    label: "COSTAS",
    sub: "info / código",
    x,
    y: padT,
    w: W,
    h: H,
    boca: "top",
  };
  x += W;
  const halfR = {
    id: "half-r",
    label: "½ LAT.",
    sub: "sanfona dir",
    x,
    y: padT,
    w: halfS,
    h: H,
    gusset: true,
  };
  x += halfS;

  const transp =
    tr > 0.01
      ? {
          id: "transp",
          label: "TRANSPASSE",
          sub: lapLeft ? "início do filme" : "fim do filme",
          x: lapLeft ? padL : x,
          y: padT,
          w: tr,
          h: H,
          isTranspasse: true,
        }
      : null;

  const body = [halfL, frente, lateral, verso, halfR];
  const panels = (lapLeft ? [transp, ...body] : [...body, transp]).filter(Boolean);
  const totalW = tr + 2 * W + 2 * S;
  const totalH = H;
  const svgW = totalW + padL + padR;
  const svgH = totalH + padT + padB + 28;

  const planta = [];
  const cotas = [];

  planta.push(`<defs>${soldaHatchDefs()}</defs>`);

  for (const panel of panels) {
    if (panel.w <= 0.01) continue;
    if (panel.isTranspasse) {
      planta.push(`
        <rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}"
          fill="${C.transpasse.hex}" fill-opacity="0.2"
          stroke="${C.transpasse.hex}" stroke-width="0.45" stroke-dasharray="2 1.2"/>
      `);
      planta.push(
        sealLabel(panel.x + panel.w / 2, panel.y + panel.h / 2 - 2, "TRANSPASSE", {
          rotate: -90,
          size: 1.85,
          fill: C.transpasse,
        })
      );
    } else {
      planta.push(
        `<rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}" ${paintStroke(C.ink, 0.25)}/>`
      );
      const cx = panel.x + panel.w / 2;
      const cy = panel.y + panel.h / 2;
      const rot = panel.gusset && panel.w < 28 && !panel.fullGusset;
      if (rot) {
        planta.push(
          `<text x="${cx}" y="${cy - 2}" text-anchor="middle" dominant-baseline="middle"
            font-size="2.3" font-family="${FONT}" opacity="0.55" transform="rotate(-90 ${cx} ${cy - 2})"
            ${paintText(C.panelLabel)}>${panel.label}</text>`
        );
      } else {
        planta.push(
          `<text x="${cx}" y="${cy - (panel.sub ? 2.2 : 0)}" text-anchor="middle" dominant-baseline="middle"
            font-size="${panel.fullGusset ? 2.8 : 3.2}" font-family="${FONT}" opacity="0.5" ${paintText(C.panelLabel)}>${panel.label}</text>`
        );
        if (panel.sub) {
          planta.push(
            `<text x="${cx}" y="${cy + 3.2}" text-anchor="middle" dominant-baseline="middle"
              font-size="1.55" font-family="${FONT}" opacity="0.45" ${paintText(C.panelLabel)}>${panel.sub}</text>`
          );
        }
      }
    }
  }

  // Solda longitudinal opcional (dentro do transpasse)
  if (transp && sd > 0.01) {
    const sx = lapLeft ? transp.x + transp.w - sd : transp.x;
    planta.push(`<rect x="${sx}" y="${padT}" width="${sd}" height="${H}" ${paintSoldaHatch()}/>`);
    planta.push(
      sealLabel(sx + sd / 2, padT + H / 2, isFin ? "SOLDA LONG. · FIN" : "SOLDA LONG. · LAP", {
        rotate: -90,
        size: 1.7,
      })
    );
  }

  // Soldas superior e inferior (estrutura Side Gusset)
  for (const panel of panels) {
    if (panel.w <= 0.01) continue;
    planta.push(`<rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${aba}" ${paintSoldaHatch()}/>`);
    planta.push(`<rect x="${panel.x}" y="${panel.y + panel.h - aba}" width="${panel.w}" height="${aba}" ${paintSoldaHatch()}/>`);
  }
  planta.push(sealLabel(frente.x + W / 2, frente.y + aba / 2, "SOLDA SUPERIOR", { size: 1.9 }));
  planta.push(sealLabel(frente.x + W / 2, frente.y + H - aba / 2, "SOLDA INFERIOR", { size: 1.9 }));

  // Dobras: ½|Frente, Frente|Lateral, centro da lateral, Lateral|Costas, Costas|½
  const foldXs = [
    { x: halfL.x + halfL.w, label: null },
    { x: frente.x + W, label: null },
    { x: lateral.x + S / 2, label: "DOBRA SANFONA", centro: true },
    { x: lateral.x + S, label: null },
    { x: verso.x + W, label: null },
  ];
  if (transp) {
    if (lapLeft) foldXs.unshift({ x: transp.x + transp.w, label: null });
    else foldXs.push({ x: halfR.x + halfR.w, label: null });
  }
  for (const f of foldXs) {
    if (f.centro) {
      planta.push(
        `<line x1="${f.x}" y1="${padT}" x2="${f.x}" y2="${padT + H}" ${paintStroke(C.dobra, 0.7, "4 1.4")}/>`
      );
      planta.push(
        `<text x="${f.x + 2.2}" y="${padT + 14}" text-anchor="start" font-size="1.6" font-family="${FONT}" font-weight="700" ${paintText(C.dobra)}>${f.label}</text>`
      );
    } else {
      planta.push(
        `<line x1="${f.x}" y1="${padT}" x2="${f.x}" y2="${padT + H}" ${paintStroke(C.dobra, 0.4, "2.2 1.6")}/>`
      );
    }
  }

  // “Olho” / expansão esquemática na lateral completa
  const eyeY1 = padT + H * 0.28;
  const eyeY2 = padT + H * 0.72;
  const eyeMid = lateral.x + S / 2;
  planta.push(
    `<path d="M${lateral.x + 2},${eyeY1} Q${eyeMid},${(eyeY1 + eyeY2) / 2 - S * 0.12} ${lateral.x + S - 2},${eyeY1}"
      fill="none" ${paintStroke(C.dobra, 0.35, "1.8 1.5")}/>`
  );
  planta.push(
    `<path d="M${lateral.x + 2},${eyeY2} Q${eyeMid},${(eyeY1 + eyeY2) / 2 + S * 0.12} ${lateral.x + S - 2},${eyeY2}"
      fill="none" ${paintStroke(C.dobra, 0.35, "1.8 1.5")}/>`
  );

  if (p.temZipper) drawZipper(planta, frente, d);
  if (p.temCorte) drawRasgo(planta, frente, d);
  drawSuspension(planta, frente, p, d);
  drawValvula(planta, frente, p);

  if (p.temFotocelula) drawFotocelula(planta, p, d, padL, padT, totalW, totalH);

  planta.push(`<rect x="${padL}" y="${padT}" width="${totalW}" height="${totalH}" ${paintStroke(C.corte, 0.7)}/>`);

  const legY = padT + totalH + 14;
  const legX = padL;
  planta.push(`<line x1="${legX}" y1="${legY}" x2="${legX + 10}" y2="${legY}" ${paintStroke(C.corte, 0.7)}/>`);
  planta.push(`<text x="${legX + 12}" y="${legY}" dominant-baseline="middle" font-size="2" font-family="${FONT}" ${paintText(C.corte)}>CORTE EXTERNO</text>`);
  planta.push(`<line x1="${legX + 55}" y1="${legY}" x2="${legX + 65}" y2="${legY}" ${paintStroke(C.dobra, 0.45, "2 1.5")}/>`);
  planta.push(`<text x="${legX + 67}" y="${legY}" dominant-baseline="middle" font-size="2" font-family="${FONT}" ${paintText(C.dobra)}>DOBRA / SANFONA</text>`);
  planta.push(`<rect x="${legX + 120}" y="${legY - 3}" width="10" height="6" ${paintSoldaHatch()}/>`);
  planta.push(`<text x="${legX + 132}" y="${legY}" dominant-baseline="middle" font-size="2" font-family="${FONT}" ${paintText(C.soldaStroke)}>SOLDA SUP/INF</text>`);
  if (tr > 0.01) {
    planta.push(`<line x1="${legX + 195}" y1="${legY}" x2="${legX + 205}" y2="${legY}" ${paintStroke(C.transpasse, 0.4, "2 1.2")}/>`);
    planta.push(
      `<text x="${legX + 207}" y="${legY}" dominant-baseline="middle" font-size="2" font-family="${FONT}" ${paintText(C.transpasse)}>TRANSPASSE (${isFin ? "FIN" : "LAP"})</text>`
    );
  }

  planta.push(`
    <g font-family="${FONT}" ${paintText(C.ink)}>
      <text x="${padL}" y="${svgH - 10}" font-size="2.8" font-weight="700">SIDE GUSSET · FILME ${round2(totalW)}×${round2(H)} · F ${round2(W)} · Lat ${round2(S)} (½=${round2(halfS)}) · SL ${round2(sl)}${tr > 0 ? ` · TRANSP. ${round2(tr)}` : ""} mm</text>
    </g>
  `);

  const planner = DimPlanner();
  const fs = Math.min(3.0, Math.max(2.4, totalW / 70));
  const rx = padL + totalW;
  const stripOff = planner.next("top");

  for (const panel of panels) {
    if (panel.w <= 0.01) continue;
    let name = panel.label;
    if (panel.isTranspasse) name = "TRANSP.";
    else if (panel.id === "frente") name = "FRENTE";
    else if (panel.id === "verso") name = "COSTAS";
    else if (panel.id === "lateral") name = "LATERAL";
    else name = "½ LAT.";
    const color = panel.isTranspasse ? DIM_COLOR.transpasse : DIM_COLOR.painel;
    cotas.push(
      dimLine(panel.x, padT, panel.x + panel.w, padT, cotaLabel(name, round2(panel.w)), {
        offset: stripOff,
        outside: true,
        size: fs - 0.2,
        color,
      })
    );
  }

  cotas.push(
    dimLine(padL, padT, rx, padT, cotaLabel("LARG. FILME", round2(totalW)), {
      offset: planner.next("top"),
      outside: true,
      size: fs,
      color: DIM_COLOR.geral,
    })
  );
  cotas.push(
    dimLine(padL, padT, padL, padT + H, cotaLabel("ALTURA", round2(H)), {
      offset: planner.next("left"),
      outside: false,
      vertical: true,
      size: fs,
      color: DIM_COLOR.geral,
    })
  );
  cotas.push(
    dimLine(padL, padT, padL, padT + aba, cotaLabel("SOLDA", round2(aba)), {
      offset: planner.next("left"),
      outside: false,
      vertical: true,
      size: fs - 0.15,
      color: DIM_COLOR.solda,
      textAt: "auto",
    })
  );

  if (p.temValvula) {
    const { cx, cy, r, rLivre } = valveCenter(frente, p);
    cotas.push(
      dimLine(frente.x, cy, cx, cy, cotaLabel("VÁLVULA X", round2(cx - frente.x)), {
        offset: planner.next("top"),
        outside: true,
        size: fs - 0.15,
        color: DIM_COLOR.valvula,
      })
    );
    cotas.push(
      dimLine(cx, frente.y, cx, cy, cotaLabel("VÁLVULA Y", round2(cy - frente.y)), {
        offset: planner.next("right"),
        outside: true,
        vertical: true,
        size: fs - 0.15,
        color: DIM_COLOR.valvula,
        textAt: "auto",
      })
    );
    cotas.push(
      dimLine(cx - r, cy, cx + r, cy, cotaLabel("VÁLVULA Ø", round2(p.valvulaDiametro)), {
        offset: planner.next("bottom"),
        outside: true,
        size: fs - 0.15,
        color: DIM_COLOR.valvula,
        labelBelow: true,
      })
    );
    if (p.valvulaLivre > 0 && rLivre > r) {
      cotas.push(
        dimLine(cx, cy - rLivre, cx, cy - r, cotaLabel("ÁREA LIVRE", round2(p.valvulaLivre)), {
          offset: planner.next("right"),
          outside: true,
          vertical: true,
          size: fs - 0.2,
          color: DIM_COLOR.valvula,
          textAt: "auto",
        })
      );
    }
  }

  if (p.temZipper) {
    const yStart = frente.y + d.distZip;
    const yEnd = yStart + d.zipW;
    cotas.push(
      dimLine(rx, frente.y, rx, yStart, cotaLabel("ZIPPER", round2(d.distZip)), {
        offset: planner.next("right"),
        outside: true,
        vertical: true,
        size: fs - 0.1,
        color: DIM_COLOR.zipper,
        textAt: "auto",
      })
    );
    cotas.push(
      dimLine(rx, yStart, rx, yEnd, cotaLabel("ZIPPER", round2(d.zipW), d.zipW, { sub: "LARG" }), {
        offset: planner.next("right"),
        outside: true,
        vertical: true,
        size: fs - 0.1,
        color: DIM_COLOR.zipper,
        textAt: "auto",
      })
    );
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Plantatec Side Gusset: ½|Frente|Lateral|Costas|½ · sem 4 soldas de quina -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
  xmlns:i="http://ns.adobe.com/AdobeIllustrator/10.0/" version="1.1"
  width="${svgW}mm" height="${svgH}mm" viewBox="0 0 ${svgW} ${svgH}"
  color-interpolation="auto">
  <g id="Planta" inkscape:groupmode="layer" inkscape:label="Planta" data-name="Planta">
    ${planta.join("\n")}
  </g>
  <g id="Cotas" inkscape:groupmode="layer" inkscape:label="Cotas" data-name="Cotas">
    ${cotas.join("\n")}
  </g>
</svg>`;

  collectMagnetGuidesSideGusset(padL, padT, totalW, totalH, W, S, H, sl, tr, lapLeft);
  return {
    svg,
    resumo: `SIDE GUSSET · FILME ${round2(totalW)}×${round2(H)} · F ${round2(W)} · Lat ${round2(S)}${tr > 0 ? ` · transp ${round2(tr)}` : ""} mm`,
  };
}

/** Centro: X a partir da borda esquerda do painel (0 = centro); Y a partir do topo */
function valveCenter(frente, p) {
  const cy = frente.y + Math.max(0, p.valvulaY);
  const cx = p.valvulaX > 0 ? frente.x + p.valvulaX : frente.x + frente.w / 2;
  const r = Math.max(0.5, p.valvulaDiametro / 2);
  const rLivre = r + Math.max(0, p.valvulaLivre);
  return { cx, cy, r, rLivre };
}

function drawValvula(planta, frente, p) {
  if (!p.temValvula || (p.tipoEmbalagem !== "4side" && p.tipoEmbalagem !== "flatbottom" && p.tipoEmbalagem !== "sidegusset")) return;
  const { cx, cy, r, rLivre } = valveCenter(frente, p);
  if (rLivre > r + 0.01) {
    planta.push(`<circle cx="${cx}" cy="${cy}" r="${rLivre}" ${paintStroke(C.chapeu, 0.35, "1.6 1.2")}/>`);
  }
  planta.push(`<circle cx="${cx}" cy="${cy}" r="${r}" ${paintStroke(C.chapeu, 0.45)}/>`);
  planta.push(`<circle cx="${cx}" cy="${cy}" r="${Math.max(0.6, r * 0.28)}" ${paintStroke(C.chapeu, 0.3)}/>`);
  const tick = Math.min(2.2, r * 0.45);
  planta.push(`<line x1="${cx - tick}" y1="${cy}" x2="${cx + tick}" y2="${cy}" ${paintStroke(C.chapeu, 0.28)}/>`);
  planta.push(`<line x1="${cx}" y1="${cy - tick}" x2="${cx}" y2="${cy + tick}" ${paintStroke(C.chapeu, 0.28)}/>`);
  const labelY = cy + rLivre + 3.6;
  planta.push(
    `<text x="${cx}" y="${labelY}" text-anchor="middle" font-size="1.9" font-family="${FONT}" font-weight="700" ${paintText(C.chapeu)}>VÁLVULA Ø${round2(p.valvulaDiametro)} · SEM IMPRESSÃO</text>`
  );
  if (p.valvulaLivre > 0) {
    planta.push(
      `<text x="${cx}" y="${labelY + 2.8}" text-anchor="middle" font-size="1.65" font-family="${FONT}" ${paintText(C.chapeu)}>ÁREA LIVRE +${round2(p.valvulaLivre)} mm</text>`
    );
  }
}

function drawZipper(planta, panel, d) {
  let y1;
  let y2;
  if (panel.boca === "top") {
    y1 = panel.y + d.distZip;
    y2 = y1 + d.zipW;
  } else {
    y2 = panel.y + panel.h - d.distZip;
    y1 = y2 - d.zipW;
  }
  const midY = (y1 + y2) / 2;
  const cx = panel.x + panel.w / 2;
  const band = Math.max(1.2, y2 - y1);

  // Faixa zipper (1 cor @ 50%)
  planta.push(`<rect x="${panel.x}" y="${y1}" width="${panel.w}" height="${band}" ${paintZipper(0.4)}/>`);
  planta.push(`<line x1="${panel.x}" y1="${midY}" x2="${panel.x + panel.w}" y2="${midY}" ${paintStroke(C.zipper, 0.35, "1.2 1.1")}/>`);
  planta.push(
    `<text x="${cx}" y="${midY}" text-anchor="middle" dominant-baseline="middle" font-size="2.6" font-family="${FONT}" font-weight="700" ${paintText(C.zipper)}>ZIPPER</text>`
  );
}

function drawRasgo(planta, panel, d) {
  const cy = panel.boca === "top" ? panel.y + d.distCorte : panel.y + panel.h - d.distCorte;
  const n = 2.8;
  const red = C.picote;
  planta.push(`<line x1="${panel.x}" y1="${cy}" x2="${panel.x + panel.w}" y2="${cy}" ${paintStroke(red, 0.5, "0.9 1.4")}/>`);
  planta.push(`<path d="M${panel.x},${cy - n} L${panel.x + n},${cy} L${panel.x},${cy + n}" ${paintStroke(red, 0.6)}/>`);
  planta.push(`<path d="M${panel.x + panel.w},${cy - n} L${panel.x + panel.w - n},${cy} L${panel.x + panel.w},${cy + n}" ${paintStroke(red, 0.6)}/>`);
  planta.push(
    `<text x="${panel.x + panel.w + 3}" y="${cy}" text-anchor="start" dominant-baseline="middle"
      font-size="2.6" font-family="${FONT}" font-weight="700" ${paintText(red)}>PICOTE</text>`
  );
}

function drawSuspension(planta, panel, p, d) {
  if (p.suspensao === "nenhuma") return;
  const cx = panel.x + panel.w / 2;
  const towardBottom = panel.boca === "bottom";
  if (p.suspensao === "chapeu") {
    const domeY = towardBottom ? panel.y + panel.h - d.distSusp : panel.y + d.distSusp;
    planta.push(`<path d="${pathChapeu(cx, domeY, towardBottom)}" ${paintStroke(C.chapeu, 0.45)}/>`);
    const labelY = towardBottom ? domeY - CHAPEU_H / 2 : domeY + CHAPEU_H / 2;
    planta.push(
      `<text x="${panel.x - 3}" y="${labelY}" text-anchor="end" dominant-baseline="middle"
        font-size="2.3" font-family="${FONT}" font-weight="700" ${paintText(C.chapeu)}>CHAPÉU</text>`
    );
  } else {
    const r = p.diametroFuro / 2;
    const cy = towardBottom ? panel.y + panel.h - d.distSusp - r : panel.y + d.distSusp + r;
    planta.push(`<circle cx="${cx}" cy="${cy}" r="${r}" ${paintStroke(C.chapeu, 0.45)}/>`);
    planta.push(
      `<text x="${panel.x - 3}" y="${cy}" text-anchor="end" dominant-baseline="middle"
        font-size="2.3" font-family="${FONT}" font-weight="700" ${paintText(C.chapeu)}>FURO</text>`
    );
  }
}

function fotoDims(p) {
  return {
    fw: Math.max(1, p.fotoLargura),
    fh: Math.max(1, p.fotoAltura),
  };
}

/** Posição da fotocélula no filme (ox/oy = origem do corte, filmW/H = área). */
function fotoPlacement(p, ox, oy, filmW, filmH) {
  const { fw, fh } = fotoDims(p);
  const left = p.fotoPosicao.includes("esquerdo");
  const top = p.fotoPosicao.includes("cima");
  const distLat = Math.max(0, Math.min(Number(p.fotoDistLateral) || 0, Math.max(0, filmW - fw)));
  const distVert = Math.max(0, Math.min(Number(p.fotoDistVertical) || 0, Math.max(0, filmH - fh)));
  const fx = left ? ox + distLat : ox + filmW - fw - distLat;
  const fy = top ? oy + distVert : oy + filmH - fh - distVert;
  return { fw, fh, left, top, distLat, distVert, fx, fy };
}

function drawFotocelula(planta, p, _d, ox, oy, filmW, filmH) {
  if (!p.temFotocelula) return;
  const { fw, fh, top, fx, fy } = fotoPlacement(p, ox, oy, filmW, filmH);
  planta.push(`<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" ${paintFill(C.foto)}/>`);
  const labelY = top ? fy + fh + 3.8 : fy - 3.2;
  planta.push(
    `<text x="${fx + fw / 2}" y="${labelY}" text-anchor="middle" dominant-baseline="middle"
      font-size="2.2" font-family="${FONT}" font-weight="700" ${paintText(DIM_COLOR.foto)}>FOTO ${round2(fw)}×${round2(fh)}</text>`
  );
}

function computePads(p) {
  const gap = 22;
  let right = 1;
  let top = 1;
  let bottom = 1;
  let left = 2; // painéis + solda
  if (p.cantos === "arredondado") top += 1;
  if (p.suspensao === "chapeu") right += 2;
  else if (p.suspensao === "furo") right += 2;
  if (p.temZipper) right += 2;
  if (p.temCorte) right += 1;
  if (p.temValvula && (p.tipoEmbalagem === "4side" || p.tipoEmbalagem === "flatbottom" || p.tipoEmbalagem === "sidegusset")) right += 2;
  if (
    p.tipoEmbalagem === "4side" ||
    p.tipoEmbalagem === "flatbottom" ||
    p.tipoEmbalagem === "sidegusset" ||
    p.tipoEmbalagem === "spouted" ||
    p.tipoEmbalagem === "stickpack"
  ) {
    right += 2;
    left += 1;
    top += 1;
  }
  if (p.tipoEmbalagem === "flatbottom" || p.tipoEmbalagem === "bottomgusset") bottom += 2;
  if (p.temFotocelula) {
    right += 1;
    if (p.fotoPosicao.includes("baixo")) bottom += 2;
    else top += 2;
  }
  return {
    padL: 44 + left * gap + 28,
    padR: 56 + right * gap + 48,
    padT: 34 + top * 14 + 18,
    padB: 48 + bottom * 16,
  };
}

function buildCotas(p, d, geo) {
  const { padL, padT, totalW, totalH, frente, sanfona, verso } = geo;
  const cotas = [];
  const planner = DimPlanner();
  const fs = Math.min(3.0, Math.max(2.55, totalW / 40));
  const rx = padL + totalW;

  cotas.push(
    dimLine(padL, padT, rx, padT, cotaLabel("LARGURA", round2(totalW)), {
      offset: planner.next("top"),
      outside: true,
      size: fs,
      color: DIM_COLOR.geral,
    })
  );

  if (d.cornerR > 0) {
    cotas.push(
      dimLine(padL, padT, padL + d.cornerR, padT, cotaLabel("CANTO", `Ø${CORNER_DIAM}`), {
        offset: planner.next("top"),
        outside: true,
        size: fs - 0.15,
        color: DIM_COLOR.canto,
      })
    );
  }

  // SOLDA — totalmente à esquerda, abaixo da zona do canto (não encosta na borda)
  const soldaY = padT + Math.max(22, d.cornerR + 14);
  cotas.push(
    dimLine(padL, soldaY, padL + d.solda, soldaY, cotaLabel("SOLDA LAT.", round2(d.solda)), {
      offset: planner.next("left"),
      outside: false,
      size: fs - 0.1,
      color: DIM_COLOR.solda,
      labelBelow: true,
    })
  );

  if (p.tipoEmbalagem === "4side") {
    cotas.push(
      dimLine(padL, padT, padL, padT + d.solda, cotaLabel("SOLDA SUP.", round2(d.solda)), {
        offset: planner.next("left"),
        outside: false,
        vertical: true,
        size: fs - 0.15,
        color: DIM_COLOR.solda,
        textAt: "auto",
      })
    );
  }

  const offPanel = planner.next("left");
  cotas.push(
    dimLine(padL, padT, padL, padT + d.face, cotaLabel("FRENTE", round2(d.face)), {
      offset: offPanel,
      outside: false,
      vertical: true,
      size: fs,
      color: DIM_COLOR.painel,
    })
  );
  cotas.push(
    dimLine(padL, sanfona.y, padL, sanfona.y + d.sanfona, cotaLabel("SANFONA", round2(d.sanfona)), {
      offset: offPanel,
      outside: false,
      vertical: true,
      size: fs,
      color: DIM_COLOR.painel,
    })
  );
  cotas.push(
    dimLine(padL, verso.y, padL, verso.y + d.face, cotaLabel("VERSO", round2(d.face)), {
      offset: offPanel,
      outside: false,
      vertical: true,
      size: fs,
      color: DIM_COLOR.painel,
    })
  );

  cotas.push(
    dimLine(rx, padT, rx, padT + totalH, cotaLabel("ALTURA", round2(totalH)), {
      offset: planner.next("right"),
      outside: true,
      vertical: true,
      size: fs,
      color: DIM_COLOR.geral,
    })
  );

  // Acessórios à direita — faixas largas + texto no extremo (evita empilhar no meio)
  if (p.suspensao === "chapeu") {
    const yStart = frente.y + d.distSusp;
    const yEnd = yStart + CHAPEU_H;
    cotas.push(
      dimLine(rx, frente.y, rx, yStart, cotaLabel("CHAPÉU", round2(d.distSusp)), {
        offset: planner.next("right"),
        outside: true,
        vertical: true,
        size: fs - 0.1,
        color: DIM_COLOR.chapeu,
        textAt: "auto",
      })
    );
    cotas.push(
      dimLine(rx, yStart, rx, yEnd, cotaLabel("CHAPÉU", `${CHAPEU_W}×${CHAPEU_H}`), {
        offset: planner.next("right"),
        outside: true,
        vertical: true,
        size: fs - 0.1,
        color: DIM_COLOR.chapeu,
        textAt: "auto",
      })
    );
  } else if (p.suspensao === "furo") {
    const yInicio = frente.y + d.distSusp;
    const yFim = yInicio + p.diametroFuro;
    cotas.push(
      dimLine(rx, frente.y, rx, yInicio, cotaLabel("FURO", round2(d.distSusp)), {
        offset: planner.next("right"),
        outside: true,
        vertical: true,
        size: fs - 0.1,
        color: DIM_COLOR.furo,
        textAt: "auto",
      })
    );
    cotas.push(
      dimLine(rx, yInicio, rx, yFim, cotaLabel("Ø FURO", round2(p.diametroFuro)), {
        offset: planner.next("right"),
        outside: true,
        vertical: true,
        size: fs - 0.1,
        color: DIM_COLOR.furo,
        textAt: "auto",
      })
    );
  }

  if (p.temCorte) {
    const yStart = frente.y + d.distCorte;
    cotas.push(
      dimLine(rx, frente.y, rx, yStart, cotaLabel("PICOTE", round2(d.distCorte)), {
        offset: planner.next("right"),
        outside: true,
        vertical: true,
        size: fs - 0.1,
        color: DIM_COLOR.picote,
        textAt: "auto",
      })
    );
  }

  if (p.temZipper) {
    const yStart = frente.y + d.distZip;
    const yEnd = yStart + d.zipW;
    cotas.push(
      dimLine(rx, frente.y, rx, yStart, cotaLabel("ZIPPER", round2(d.distZip)), {
        offset: planner.next("right"),
        outside: true,
        vertical: true,
        size: fs - 0.1,
        color: DIM_COLOR.zipper,
        textAt: "auto",
      })
    );
    cotas.push(
      dimLine(rx, yStart, rx, yEnd, cotaLabel("ZIPPER", round2(d.zipW), d.zipW, { sub: "LARG" }), {
        offset: planner.next("right"),
        outside: true,
        vertical: true,
        size: fs - 0.1,
        color: DIM_COLOR.zipper,
        textAt: "auto",
      })
    );
  }

  if (p.temValvula && p.tipoEmbalagem === "4side") {
    const { cx, cy, r, rLivre } = valveCenter(frente, p);
    const xDist = round2(cx - padL);
    const yDist = round2(cy - frente.y);
    cotas.push(
      dimLine(padL, cy, cx, cy, cotaLabel("VÁLVULA X", xDist), {
        offset: planner.next("top"),
        outside: true,
        size: fs - 0.15,
        color: DIM_COLOR.valvula,
        labelBelow: false,
      })
    );
    cotas.push(
      dimLine(cx, frente.y, cx, cy, cotaLabel("VÁLVULA Y", yDist), {
        offset: planner.next("right"),
        outside: true,
        vertical: true,
        size: fs - 0.15,
        color: DIM_COLOR.valvula,
        textAt: "auto",
      })
    );
    cotas.push(
      dimLine(cx - r, cy, cx + r, cy, cotaLabel("VÁLVULA Ø", round2(p.valvulaDiametro)), {
        offset: planner.next("bottom"),
        outside: true,
        size: fs - 0.15,
        color: DIM_COLOR.valvula,
        labelBelow: true,
      })
    );
    if (p.valvulaLivre > 0 && rLivre > r) {
      cotas.push(
        dimLine(cx, cy - rLivre, cx, cy - r, cotaLabel("ÁREA LIVRE", round2(p.valvulaLivre)), {
          offset: planner.next("right"),
          outside: true,
          vertical: true,
          size: fs - 0.2,
          color: DIM_COLOR.valvula,
          textAt: "auto",
        })
      );
    }
  }

  if (p.temFotocelula) {
    const { fw, fh, left, top, distLat, distVert, fx, fy } = fotoPlacement(p, padL, padT, totalW, totalH);

    // Largura da foto: FOTO / L / valor — "L" abaixo do nome
    const yFotoL = top ? fy : fy + fh;
    cotas.push(
      dimLine(fx, yFotoL, fx + fw, yFotoL, cotaLabel("FOTO", round2(fw), fw, { sub: "L" }), {
        offset: planner.next(top ? "top" : "bottom"),
        outside: top,
        size: fs - 0.1,
        color: DIM_COLOR.foto,
        labelBelow: !top,
      })
    );
    // Altura da foto: "A" abaixo do nome
    cotas.push(
      dimLine(left ? fx : fx + fw, fy, left ? fx : fx + fw, fy + fh, cotaLabel("FOTO", round2(fh), fh, { sub: "A" }), {
        offset: planner.next(left ? "left" : "right"),
        outside: !left,
        vertical: true,
        size: fs - 0.1,
        color: DIM_COLOR.foto,
        textAt: "auto",
      })
    );
    // Distância da lateral (quando > 0)
    if (distLat > 0.05) {
      const edgeX = left ? padL : padL + totalW;
      const markEdgeX = left ? fx : fx + fw;
      const yDist = fy + fh / 2;
      cotas.push(
        dimLine(edgeX, yDist, markEdgeX, yDist, cotaLabel("FOTO", round2(distLat), distLat, { sub: "LAT" }), {
          offset: planner.next(top ? "top" : "bottom"),
          outside: false,
          size: fs - 0.15,
          color: DIM_COLOR.foto,
          labelBelow: !top,
        })
      );
    }
    // Distância de cima/baixo (quando > 0)
    if (distVert > 0.05) {
      const edgeY = top ? padT : padT + totalH;
      const markEdgeY = top ? fy : fy + fh;
      const xDist = fx + fw / 2;
      cotas.push(
        dimLine(xDist, edgeY, xDist, markEdgeY, cotaLabel("FOTO", round2(distVert), distVert, { sub: top ? "SUP" : "INF" }), {
          offset: planner.next(left ? "left" : "right"),
          outside: false,
          vertical: true,
          size: fs - 0.15,
          color: DIM_COLOR.foto,
          textAt: "auto",
        })
      );
    }
  }

  return cotas;
}

function emptyWelcomeSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="320mm" height="160mm" viewBox="0 0 320 160">
  <rect width="100%" height="100%" ${paintFill(C.paper)}/>
  <text x="160" y="48" text-anchor="middle" font-size="4.8" font-family="${FONT}" font-weight="700" letter-spacing="0.4" ${paintText(C.soldaStroke)}>PLANTATEC</text>
  <text x="160" y="72" text-anchor="middle" font-size="5.6" font-family="${FONT}" font-weight="700" ${paintText(C.ink)}>A engenharia da sua embalagem, automatizada.</text>
  <text x="160" y="90" text-anchor="middle" font-size="3.55" font-family="${FONT}" ${paintText(C.dimMuted)}>Transforme dados em gabaritos técnicos em segundos.</text>
  <text x="160" y="102" text-anchor="middle" font-size="3.55" font-family="${FONT}" ${paintText(C.dimMuted)}>Qualidade industrial com exportação de arquivos prontos para aplicação de arte.</text>
  <text x="160" y="130" text-anchor="middle" font-size="3.3" font-family="${FONT}" font-weight="700" ${paintText(C.soldaStroke)}>Para iniciar, preencha os campos abaixo:</text>
</svg>`;
}

function adjustMeasuresSvg(p = {}) {
  if (p.tipoEmbalagem === "4side") {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300mm" height="100mm" viewBox="0 0 300 100">
  <rect width="100%" height="100%" ${paintFill(C.paper)}/>
  <text x="150" y="42" text-anchor="middle" font-size="5.5" font-family="${FONT}" font-weight="700" ${paintText(C.ink)}>Ajuste as medidas</text>
  <text x="150" y="60" text-anchor="middle" font-size="3.8" font-family="${FONT}" ${paintText(C.dimMuted)}>4 soldas: Lateral | Frente | Lateral | Verso + Transpasse</text>
  <text x="150" y="74" text-anchor="middle" font-size="3.4" font-family="${FONT}" ${paintText(C.dimMuted)}>Largura precisa ser maior que 2 × solda lateral</text>
</svg>`;
  }
  if (p.tipoEmbalagem === "flatbottom") {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300mm" height="100mm" viewBox="0 0 300 100">
  <rect width="100%" height="100%" ${paintFill(C.paper)}/>
  <text x="150" y="42" text-anchor="middle" font-size="5.5" font-family="${FONT}" font-weight="700" ${paintText(C.ink)}>Ajuste as medidas</text>
  <text x="150" y="60" text-anchor="middle" font-size="3.8" font-family="${FONT}" ${paintText(C.dimMuted)}>Flat Bottom: Lateral | Frente | Lateral | Verso + fundo</text>
  <text x="150" y="74" text-anchor="middle" font-size="3.4" font-family="${FONT}" ${paintText(C.dimMuted)}>Informe altura, largura, sanfona lateral e profundidade do fundo</text>
</svg>`;
  }
  if (p.tipoEmbalagem === "sidegusset") {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300mm" height="100mm" viewBox="0 0 300 100">
  <rect width="100%" height="100%" ${paintFill(C.paper)}/>
  <text x="150" y="42" text-anchor="middle" font-size="5.5" font-family="${FONT}" font-weight="700" ${paintText(C.ink)}>Ajuste as medidas</text>
  <text x="150" y="60" text-anchor="middle" font-size="3.8" font-family="${FONT}" ${paintText(C.dimMuted)}>Side Gusset: ½ Lat | Frente | Lateral | Costas | ½ Lat</text>
  <text x="150" y="74" text-anchor="middle" font-size="3.4" font-family="${FONT}" ${paintText(C.dimMuted)}>Informe altura, largura e profundidade da sanfona lateral</text>
</svg>`;
  }
  if (p.tipoEmbalagem === "bottomgusset") {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300mm" height="100mm" viewBox="0 0 300 100">
  <rect width="100%" height="100%" ${paintFill(C.paper)}/>
  <text x="150" y="42" text-anchor="middle" font-size="5.5" font-family="${FONT}" font-weight="700" ${paintText(C.ink)}>Ajuste as medidas</text>
  <text x="150" y="60" text-anchor="middle" font-size="3.8" font-family="${FONT}" ${paintText(C.dimMuted)}>Bottom Gusset: Transpasse | Frente | Costas + sanfona inferior</text>
  <text x="150" y="74" text-anchor="middle" font-size="3.4" font-family="${FONT}" ${paintText(C.dimMuted)}>Informe altura do corpo e profundidade da sanfona de fundo</text>
</svg>`;
  }
  if (p.tipoEmbalagem === "2side") {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300mm" height="100mm" viewBox="0 0 300 100">
  <rect width="100%" height="100%" ${paintFill(C.paper)}/>
  <text x="150" y="42" text-anchor="middle" font-size="5.5" font-family="${FONT}" font-weight="700" ${paintText(C.ink)}>Ajuste as medidas</text>
  <text x="150" y="60" text-anchor="middle" font-size="3.8" font-family="${FONT}" ${paintText(C.dimMuted)}>2 soldas: altura = painel · largura = frente = costas</text>
  <text x="150" y="74" text-anchor="middle" font-size="3.4" font-family="${FONT}" ${paintText(C.dimMuted)}>Filme = frente + costas + transpasse · sem sanfona</text>
</svg>`;
  }
  if (p.tipoEmbalagem === "almofada") {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300mm" height="100mm" viewBox="0 0 300 100">
  <rect width="100%" height="100%" ${paintFill(C.paper)}/>
  <text x="150" y="42" text-anchor="middle" font-size="5.5" font-family="${FONT}" font-weight="700" ${paintText(C.ink)}>Ajuste as medidas</text>
  <text x="150" y="60" text-anchor="middle" font-size="3.8" font-family="${FONT}" ${paintText(C.dimMuted)}>Almofada: Transpasse | Frente | Costas</text>
  <text x="150" y="74" text-anchor="middle" font-size="3.4" font-family="${FONT}" ${paintText(C.dimMuted)}>Solda dorsal (Lap/Fin) + superior + inferior · sem sanfona</text>
</svg>`;
  }
  if (p.tipoEmbalagem === "3side") {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300mm" height="100mm" viewBox="0 0 300 100">
  <rect width="100%" height="100%" ${paintFill(C.paper)}/>
  <text x="150" y="42" text-anchor="middle" font-size="5.5" font-family="${FONT}" font-weight="700" ${paintText(C.ink)}>Ajuste as medidas</text>
  <text x="150" y="60" text-anchor="middle" font-size="3.8" font-family="${FONT}" ${paintText(C.dimMuted)}>3 soldas: altura = painel · largura = frente = costas</text>
  <text x="150" y="74" text-anchor="middle" font-size="3.4" font-family="${FONT}" ${paintText(C.dimMuted)}>Soldas lat. + inferior · boca aberta · sem transpasse / sanfona</text>
</svg>`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300mm" height="100mm" viewBox="0 0 300 100">
  <rect width="100%" height="100%" ${paintFill(C.paper)}/>
  <text x="150" y="42" text-anchor="middle" font-size="5.5" font-family="${FONT}" font-weight="700" ${paintText(C.ink)}>Ajuste fino nas medidas</text>
  <text x="150" y="60" text-anchor="middle" font-size="3.8" font-family="${FONT}" ${paintText(C.dimMuted)}>A sanfona deve ser menor que a altura total</text>
  <text x="150" y="74" text-anchor="middle" font-size="3.4" font-family="${FONT}" ${paintText(C.dimMuted)}>Frente e verso = (altura − sanfona) ÷ 2</text>
</svg>`;
}

function buildDrawing(p) {
  const d = derive(p);
  const awaitingInput =
    p.alturaTotal <= 0 ||
    p.largura <= 0 ||
    ((p.tipoEmbalagem === "flowpack" || p.tipoEmbalagem === "stickpack") && p.sanfona <= 0);

  if (awaitingInput) {
    setMagnetGuides({});
    return {
      svg: emptyWelcomeSvg(),
      resumo: "—",
    };
  }

  if (!d.ok || d.face <= 0) {
    setMagnetGuides({});
    const flat = [
      "2side",
      "almofada",
      "finseal",
      "lapseal",
      "flowpack",
      "stickpack",
      "3side",
      "sachet3",
      "sachet4",
      "vacuum3",
      "vacuum4",
      "flatbottom",
      "sidegusset",
      "spouted",
      "bottomgusset",
    ].includes(p.tipoEmbalagem);
    return {
      svg: adjustMeasuresSvg(p),
      resumo:
        p.tipoEmbalagem === "flatbottom"
          ? "Ajuste altura, largura, sanfona e fundo"
          : p.tipoEmbalagem === "flowpack"
            ? "Ajuste comprimento, largura e altura do produto"
            : p.tipoEmbalagem === "stickpack"
              ? "Ajuste comprimento, largura e profundidade"
              : p.tipoEmbalagem === "sidegusset" ||
                  p.tipoEmbalagem === "bottomgusset" ||
                  p.tipoEmbalagem === "spouted"
                ? "Ajuste altura, largura e sanfona"
                : flat
                  ? "Ajuste altura e largura"
                  : "Ajuste altura e sanfona",
    };
  }

  const pads = computePads(p);

  if (p.tipoEmbalagem === "4side" || p.tipoEmbalagem === "flatbottom") {
    return buildDrawing4Side(p, d, pads);
  }
  if (p.tipoEmbalagem === "sidegusset") {
    return buildDrawingSideGusset(p, d, pads);
  }
  if (p.tipoEmbalagem === "spouted") {
    return buildDrawingSpouted(p, d, pads);
  }
  if (p.tipoEmbalagem === "bottomgusset") {
    return buildDrawingBottomGusset(p, d, pads);
  }
  if (p.tipoEmbalagem === "flowpack") {
    return buildDrawingFlowPack(p, d, pads);
  }
  if (p.tipoEmbalagem === "stickpack") {
    return buildDrawingStickPack(p, d, pads);
  }
  if (
    p.tipoEmbalagem === "2side" ||
    p.tipoEmbalagem === "almofada" ||
    p.tipoEmbalagem === "finseal" ||
    p.tipoEmbalagem === "lapseal"
  ) {
    return buildDrawing2Side(p, d, pads);
  }
  if (
    p.tipoEmbalagem === "3side" ||
    p.tipoEmbalagem === "sachet3" ||
    p.tipoEmbalagem === "sachet4" ||
    p.tipoEmbalagem === "vacuum3" ||
    p.tipoEmbalagem === "vacuum4"
  ) {
    return buildDrawing3Side(p, d, pads);
  }

  const { padL, padT, padR, padB } = pads;

  const frente = { id: "frente", label: "FRENTE", x: padL, y: padT, w: d.W, h: d.face, boca: "top" };
  const sanfona = { id: "sanfona", label: "SANFONA", x: padL, y: padT + d.face, w: d.W, h: d.sanfona, gusset: true };
  const verso = { id: "verso", label: "VERSO", x: padL, y: padT + d.face + d.sanfona, w: d.W, h: d.face, boca: "bottom" };

  const totalW = d.W;
  const totalH = d.face * 2 + d.sanfona;
  const svgW = totalW + padL + padR;
  const svgH = totalH + padT + padB;
  const r = d.cornerR;

  const planta = [];
  const cotas = [];

  planta.push(`<defs>${soldaHatchDefs()}</defs>`);
  planta.push(pouchDefs(padL, padT, totalW, totalH, r));
  planta.push(`<path d="${roundedRectPath(padL, padT, totalW, totalH, r)}" ${paintStroke(C.ink, 0.65)}/>`);

  planta.push(`<g clip-path="url(#clip-pouch)">`);
  for (const panel of [frente, sanfona, verso]) {
    planta.push(
      `<rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}" ${paintStroke(C.ink, 0.3)}/>`
    );
    planta.push(
      `<text x="${panel.x + panel.w / 2}" y="${panel.y + panel.h / 2}" text-anchor="middle" dominant-baseline="middle" font-size="3.6" font-family="${FONT}" opacity="0.55" ${paintText(C.panelLabel)}>${panel.label}</text>`
    );
  }

  if (p.tipoEmbalagem === "doyen") drawDoyenSeals(planta, frente, sanfona, verso, d);
  else if (p.tipoEmbalagem === "k-skirt") drawKSkirtSeals(planta, frente, sanfona, verso, d);

  for (const panel of [frente, verso]) {
    drawSuspension(planta, panel, p, d);
    if (p.temZipper) drawZipper(planta, panel, d);
    if (p.temCorte) drawRasgo(planta, panel, d);
  }
  drawValvula(planta, frente, p);
  planta.push(`</g>`);

  drawFotocelula(planta, p, d, padL, padT, totalW, totalH);
  planta.push(`<path d="${roundedRectPath(padL, padT, totalW, totalH, r)}" ${paintStroke(C.ink, 0.65)}/>`);

  // BOCA acima/abaixo da lâmina — não sobrepõe canto nem solda
  planta.push(`<text x="${padL + totalW / 2}" y="${padT - 3.5}" text-anchor="middle" font-size="2.4" font-family="${FONT}" font-weight="700" ${paintText(C.dimMuted)}>BOCA</text>`);
  planta.push(`<text x="${padL + totalW / 2}" y="${padT + totalH + 5}" text-anchor="middle" font-size="2.4" font-family="${FONT}" font-weight="700" ${paintText(C.dimMuted)}>BOCA</text>`);
  planta.push(`<text x="${padL - 5}" y="${sanfona.y + sanfona.h / 2}" text-anchor="end" font-size="2.3" font-family="${FONT}" font-weight="700" ${paintText(C.dimMuted)}>FUNDO</text>`);

  const tipoNome = {
    "2side": "2 SOLDAS",
    "3side": "3 SOLDAS",
    "4side": "4 SOLDAS",
    doyen: "DOYEN / SOLDA EM U",
    "k-skirt": "K-SKIRT / SOLDA EM K",
  }[p.tipoEmbalagem];
  planta.push(`
    <g font-family="${FONT}" ${paintText(C.ink)}>
      <text x="${padL}" y="${svgH - 12}" font-size="2.8" font-weight="700">${tipoNome} · ${round2(d.W)}×${round2(totalH)} mm</text>
    </g>
  `);

  cotas.push(
    ...buildCotas(p, d, { padL, padT, totalW, totalH, frente, sanfona, verso })
  );

  collectMagnetGuidesFromStack(padL, padT, totalW, totalH, d, frente, sanfona, verso, p);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Plantatec: planta técnica em SVG (cores hex — abra no Illustrator e converta p/ CMYK se precisar). Sem fundo / preenchimento de painéis. -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
  xmlns:i="http://ns.adobe.com/AdobeIllustrator/10.0/" version="1.1"
  width="${svgW}mm" height="${svgH}mm" viewBox="0 0 ${svgW} ${svgH}"
  color-interpolation="auto">
  <g id="Planta" inkscape:groupmode="layer" inkscape:label="Planta" data-name="Planta">
    ${planta.join("\n")}
  </g>
  <g id="Cotas" inkscape:groupmode="layer" inkscape:label="Cotas" data-name="Cotas">
    ${cotas.join("\n")}
  </g>
</svg>`;

  return { svg, resumo: `${tipoNome} · ${round2(totalW)}×${round2(totalH)} mm` };
}

function updateFotoQuinaPreviews(p) {
  const grid = $(".foto-quina-grid");
  if (!grid) return;
  const fw = Math.max(0.1, Number(p?.fotoLargura) || 5);
  const fh = Math.max(0.1, Number(p?.fotoAltura) || 10);
  const distLat = Math.max(0, Number(p?.fotoDistLateral) || 0);
  const distVert = Math.max(0, Number(p?.fotoDistVertical) || 0);
  // Moldura da embalagem no ícone (viewBox 48×36)
  const ox = 6;
  const oy = 4;
  const ow = 36;
  const oh = 28;
  const maxW = ow * 0.48;
  const maxH = oh * 0.58;
  const scale = Math.min(maxW / fw, maxH / fh);
  const mw = Math.max(2.2, fw * scale);
  const mh = Math.max(2.2, fh * scale);
  const distPxX = Math.min(distLat * scale, Math.max(0, ow - mw));
  const distPxY = Math.min(distVert * scale, Math.max(0, oh - mh));

  grid.querySelectorAll(".foto-quina").forEach((label) => {
    const input = label.querySelector('input[name="fotoPosicao"]');
    const mark = label.querySelector(".foto-quina-mark");
    if (!input || !mark) return;
    const left = input.value.includes("esquerdo");
    const top = input.value.includes("cima");
    const x = left ? ox + distPxX : ox + ow - mw - distPxX;
    const y = top ? oy + distPxY : oy + oh - mh - distPxY;
    mark.setAttribute("x", String(round2(x)));
    mark.setAttribute("y", String(round2(y)));
    mark.setAttribute("width", String(round2(mw)));
    mark.setAttribute("height", String(round2(mh)));
  });
}

function updateDependentFields(p) {
  const hasSusp = p.suspensao === "chapeu" || p.suspensao === "furo";
  const is4side = p.tipoEmbalagem === "4side";
  const isFlatBottom = p.tipoEmbalagem === "flatbottom";
  const isSideGusset = p.tipoEmbalagem === "sidegusset";
  const isBottomGusset = p.tipoEmbalagem === "bottomgusset";
  const isSpouted = p.tipoEmbalagem === "spouted";
  const isStickPack = p.tipoEmbalagem === "stickpack";
  const isGusset = is4side || isFlatBottom || isSideGusset || isSpouted;
  const is2side = p.tipoEmbalagem === "2side";
  const isAlmofada = p.tipoEmbalagem === "almofada";
  const isFinSeal = p.tipoEmbalagem === "finseal";
  const isLapSeal = p.tipoEmbalagem === "lapseal";
  const isFlowPack = p.tipoEmbalagem === "flowpack";
  const isPillow = is2side || isAlmofada || isFinSeal || isLapSeal;
  const is3side = p.tipoEmbalagem === "3side";
  const isSachet = p.tipoEmbalagem === "sachet3" || p.tipoEmbalagem === "sachet4";
  const isVacuum = p.tipoEmbalagem === "vacuum3" || p.tipoEmbalagem === "vacuum4";
  const isFlatSheet = is3side || isSachet || isVacuum;
  const showTransp = isGusset || isPillow || isBottomGusset || isFlowPack || isStickPack;
  const showSoldaLong = isPillow || isSideGusset || isBottomGusset || isFlowPack || isStickPack || isSpouted;
  const noSanfona = (isPillow || isFlatSheet) && !isFlowPack && !isStickPack;
  const panelLayout =
    isGusset || isPillow || isFlatSheet || isBottomGusset || isFlowPack || isStickPack;
  $("#suspensaoOpts")?.classList.toggle("hidden", !hasSusp);
  $("#wrapDiametro")?.classList.toggle("hidden", p.suspensao !== "furo");
  $("#fotocelulaOpts")?.classList.toggle("hidden", !p.temFotocelula);
  updateFotoQuinaPreviews(p);
  $("#zipperOpts")?.classList.toggle("hidden", !p.temZipper);
  $("#corteOpts")?.classList.toggle("hidden", !p.temCorte);
  $("#boxValvula")?.classList.toggle("hidden", !(is4side || isFlatBottom || isSideGusset));
  $("#valvulaOpts")?.classList.toggle(
    "hidden",
    !(is4side || isFlatBottom || isSideGusset) || !p.temValvula
  );
  $("#boxSpout")?.classList.toggle("hidden", !isSpouted);
  $("#wrapTranspasse")?.classList.toggle("hidden", !showTransp);
  $("#wrapLadoTranspasse")?.classList.toggle("hidden", !showTransp);
  $("#wrapSoldaDorsal")?.classList.toggle("hidden", !showSoldaLong);
  $("#wrapTipoSoldaLong")?.classList.toggle("hidden", !showSoldaLong || isFinSeal || isLapSeal);
  $("#wrapSanfona")?.classList.toggle("hidden", noSanfona);
  $("#wrapFundo")?.classList.toggle("hidden", !isFlatBottom);
  $("#wrapDistU")?.classList.add("hidden");

  const selLong = $("select[name=tipoSoldaLong]");
  if (selLong) {
    if (isFinSeal) selLong.value = "fin";
    if (isLapSeal) selLong.value = "lap";
  }

  const lblAlt = $("#lblAltura");
  const lblLar = $("#lblLargura");
  const lblSan = $("#lblSanfona");
  const lblSolda = $("#lblSolda");
  if (lblAlt) {
    lblAlt.textContent = isFlowPack || isStickPack
      ? "Comprimento"
      : panelLayout
        ? "Altura (painel)"
        : "Altura total";
  }
  if (lblLar) {
    lblLar.textContent = isFlowPack
      ? "Largura (produto)"
      : isStickPack
        ? "Largura (face)"
        : panelLayout
          ? "Largura frontal"
          : "Largura";
  }
  if (lblSan) {
    lblSan.textContent = isFlowPack
      ? "Altura (produto)"
      : isStickPack
        ? "Profundidade"
        : isBottomGusset
          ? "Sanfona inferior"
          : isGusset
            ? "Prof. sanfona lat."
            : "Sanfona";
  }
  if (lblSolda) {
    lblSolda.textContent = isFlowPack || isStickPack
      ? "Solda transversal"
      : isPillow || isSideGusset || isBottomGusset || isSpouted
        ? "Solda (sup/inf)"
        : isFlatSheet
          ? "Solda (lat/inf)"
          : "Solda lateral";
  }

  const distLbl = $("#lblDistSusp");
  if (distLbl) {
    distLbl.textContent = p.suspensao === "furo" ? "Dist. furo → boca" : "Dist. da boca";
  }

  const d = derive(p);
  const calc = $("#calcFaces");
  if (calc) {
    const awaitingInput =
      p.alturaTotal <= 0 ||
      p.largura <= 0 ||
      ((isFlowPack || isStickPack) && p.sanfona <= 0);
    if (awaitingInput) {
      calc.style.color = "";
      calc.textContent = "";
      calc.hidden = true;
    } else if (!d.ok || d.face <= 0) {
      calc.hidden = false;
      calc.style.color = "#ff7a6e";
      calc.textContent = isFlowPack
        ? "Informe comprimento, largura e altura do produto"
        : isStickPack
          ? "Informe comprimento, largura e profundidade"
          : isFlatBottom
            ? "Informe sanfona lateral e fundo (base) válidos"
            : isBottomGusset
              ? "Informe sanfona inferior válida"
              : isSideGusset || isSpouted
                ? "Informe sanfona lateral (profundidade) válida"
                : is4side
                  ? "Largura precisa ser maior que 2 × solda lateral"
                  : isFlatSheet
                    ? "Largura precisa ser maior que 2 × solda"
                    : isPillow
                      ? "Informe altura e largura válidas"
                      : "A sanfona precisa ser menor que a altura total";
    } else {
      calc.hidden = false;
      calc.style.color = "";
      const transpSide = d.ladoTranspasse === "direita" ? "DIR" : "ESQ";
      const longMode = d.tipoSoldaLong === "fin" ? "FIN" : "LAP";
      calc.textContent = isFlowPack
        ? `Filme ${round2(d.flowFilmW)} · Passo ${round2(d.flowPitch)} · Produto ${round2(d.face)}×${round2(d.W)}×${round2(d.sanfona)} · Transp ${round2(d.transpasse)} ${longMode} · Solda ${d.solda}`
        : isStickPack
          ? `Filme ${round2(d.stickFilmW)} · Passo ${round2(d.stickPitch)} · F ${round2(d.W)} · Prof ${round2(d.sanfona)} · Compr ${round2(d.face)} · Transp ${round2(d.transpasse)} ${longMode} · Solda ${d.solda}`
          : isBottomGusset
            ? `Filme ${round2(d.transpasse + 2 * d.W)}×${round2(d.face + d.sanfona)} · F/C ${round2(d.W)} · Sanf.inf ${round2(d.sanfona)}${d.transpasse > 0 ? ` · Transp ${round2(d.transpasse)} ${transpSide} · Long ${round2(d.soldaDorsal)} ${longMode}` : ""} · Solda ${d.solda}`
            : isSideGusset || isSpouted
              ? `Filme ${round2(d.transpasse + 2 * d.W + 2 * d.sanfona)} · ½ ${round2(d.sanfona / 2)} · F ${round2(d.W)} · Lat ${round2(d.sanfona)} · C ${round2(d.W)} · ½ ${round2(d.sanfona / 2)}${d.transpasse > 0 ? ` · Transp ${round2(d.transpasse)} ${transpSide} · Long ${round2(d.soldaDorsal)} ${longMode}` : ""}${isSpouted ? ` · Bico ${p.spoutPosicao || "centro"}` : ""} · Solda ${d.solda}`
              : isFlatBottom
                ? `Filme ${round2(d.transpasse + 2 * d.W + 2 * d.sanfona)}×${round2(d.face + d.fundo)} · F ${round2(d.W)} · Lat ${round2(d.sanfona)} (½=${round2(d.sanfona / 2)}) · Fundo ${round2(d.fundo)} · SL ${d.solda}${d.transpasse > 0 ? ` · Transp ${round2(d.transpasse)} ${transpSide}` : ""}`
                : is4side
                  ? `Filme ${round2(d.transpasse + 2 * d.W + 2 * d.sanfona)} · Lat|F|Lat|V · F ${round2(d.W)} · Lat ${round2(d.sanfona)} · 4 soldas · Transp ${round2(d.transpasse)} ${transpSide} · SL ${d.solda}`
                  : isPillow
                    ? `Filme ${round2(d.transpasse + 2 * d.W)} · ½C|F|½C · F ${round2(d.W)} · Transp ${round2(d.transpasse)} ${transpSide} · Dorsal ${round2(d.soldaDorsal)} ${longMode} · Sup/Inf ${d.solda}`
                    : isFlatSheet
                      ? `Arte ${round2(2 * d.W)} · F/C ${round2(d.W)}×${round2(d.face)} · Solda ${d.solda} · sem transpasse${isVacuum ? " · vácuo" : ""}`
                      : `Frente ${round2(d.face)} · Sanfona ${round2(d.sanfona)} · Verso ${round2(d.face)} · Largura ${round2(d.W)} · SL ${d.solda}`;
    }
  }
}

/** Zoom do usuário: 1 = planta inteira cabendo na tela (sempre centralizada) */
let userZoom = 1;
let artW = 200;
let artH = 200;
let panX = 0;
let panY = 0;
const ZOOM_MIN = 1;
const ZOOM_MAX = 5;
const ZOOM_STEP = 0.25;

/** Ímãs da régua: bordas, dobras, soldas */
let magnetGuides = { xs: [], ys: [], points: [] };

function setMagnetGuides({ xs = [], ys = [], points = [] } = {}) {
  const uniq = (arr) =>
    [...new Set(arr.map((v) => round2(v)).filter((v) => Number.isFinite(v)))].sort((a, b) => a - b);
  magnetGuides = {
    xs: uniq(xs),
    ys: uniq(ys),
    points: points
      .filter((p) => Number.isFinite(p?.x) && Number.isFinite(p?.y))
      .map((p) => ({ x: round2(p.x), y: round2(p.y) })),
  };
}

function magnetThresholdMm() {
  const { dispW } = displaySizeForArt();
  const pxPerMm = artW > 0 ? dispW / artW : 1;
  return Math.max(1.2, 10 / Math.max(pxPerMm, 0.01));
}

function snapToMagnets(pt) {
  const thr = magnetThresholdMm();
  let bestPt = null;
  let bestD = thr * 1.35;
  for (const p of magnetGuides.points) {
    const d = Math.hypot(pt.x - p.x, pt.y - p.y);
    if (d < bestD) {
      bestD = d;
      bestPt = p;
    }
  }
  if (bestPt) return { x: bestPt.x, y: bestPt.y, snappedX: true, snappedY: true };

  let x = pt.x;
  let y = pt.y;
  let snappedX = false;
  let snappedY = false;
  let bestDx = thr;
  for (const gx of magnetGuides.xs) {
    const d = Math.abs(pt.x - gx);
    if (d < bestDx) {
      bestDx = d;
      x = gx;
      snappedX = true;
    }
  }
  let bestDy = thr;
  for (const gy of magnetGuides.ys) {
    const d = Math.abs(pt.y - gy);
    if (d < bestDy) {
      bestDy = d;
      y = gy;
      snappedY = true;
    }
  }
  return { x, y, snappedX, snappedY };
}

function collectMagnetGuidesFromStack(padL, padT, totalW, totalH, d, frente, sanfona, verso, p) {
  const sl = d.solda;
  const xs = [padL, padL + sl, padL + totalW / 2, padL + totalW - sl, padL + totalW];
  const ys = [
    padT,
    padT + sl,
    frente.y + frente.h,
    sanfona.y + sanfona.h / 2,
    verso.y,
    padT + totalH - sl,
    padT + totalH,
  ];
  if (p?.temZipper) {
    ys.push(frente.y + d.distZip, frente.y + d.distZip + (d.zipW || 0));
    ys.push(verso.y + verso.h - d.distZip - (d.zipW || 0), verso.y + verso.h - d.distZip);
  }
  if (p?.temCorte) {
    ys.push(frente.y + d.distCorte);
    ys.push(verso.y + verso.h - d.distCorte);
  }
  const points = [];
  for (const x of xs) {
    for (const y of [padT, frente.y + frente.h, verso.y, padT + totalH]) {
      points.push({ x, y });
    }
  }
  setMagnetGuides({ xs, ys, points });
}

function collectMagnetGuides3Side(padL, padT, totalW, totalH, W, H, sl) {
  const xs = [
    padL,
    padL + sl,
    padL + W - sl,
    padL + W,
    padL + W + sl,
    padL + 2 * W - sl,
    padL + 2 * W,
  ];
  const ys = [padT, padT + H / 2, padT + H - sl, padT + H];
  const points = [];
  for (const x of [padL, padL + W, padL + 2 * W]) {
    for (const y of [padT, padT + H]) points.push({ x, y });
  }
  setMagnetGuides({ xs, ys, points });
}

function collectMagnetGuidesBottomGusset(padL, padT, totalW, totalH, W, H, G, sl, tr = 0, lapLeft = true) {
  const bodyStart = padL + (lapLeft && tr > 0 ? tr : 0);
  const folds = [padL];
  if (lapLeft && tr > 0) folds.push(padL + tr);
  folds.push(bodyStart + W, bodyStart + 2 * W);
  if (!lapLeft && tr > 0) folds.push(padL + totalW);
  const xs = [...folds];
  const ys = [padT, padT + sl, padT + H / 2, padT + H, padT + H + G / 2, padT + H + G];
  const points = [];
  for (const x of folds) {
    for (const y of [padT, padT + H, padT + H + G]) points.push({ x, y });
  }
  setMagnetGuides({ xs, ys, points });
}

function collectMagnetGuides2Side(padL, padT, totalW, totalH, W, H, sl, tr = 0, lapLeft = true, sd = 0) {
  const bodyStart = padL + (lapLeft && tr > 0 ? tr : 0);
  const halfW = W / 2;
  const folds = [padL];
  if (lapLeft && tr > 0) folds.push(padL + tr);
  // ½ costas | frente | ½ costas
  folds.push(bodyStart + halfW, bodyStart + halfW + W, bodyStart + 2 * W);
  if (!lapLeft && tr > 0) folds.push(padL + totalW);
  const xs = [...folds, bodyStart, bodyStart + halfW + W / 2, bodyStart + 2 * W];
  if (tr > 0 && sd > 0) {
    const sx = lapLeft ? padL + tr - sd : padL + totalW - tr;
    xs.push(sx, sx + sd);
  }
  const ys = [padT - 5, padT, padT + sl, padT + H / 2, padT + H - sl, padT + H, padT + H + 5];
  const points = [];
  for (const x of folds) {
    for (const y of [padT, padT + H]) points.push({ x, y });
  }
  setMagnetGuides({ xs, ys, points });
}

function collectMagnetGuidesSideGusset(padL, padT, totalW, totalH, W, S, H, sl, tr = 0, lapLeft = true) {
  const halfS = S / 2;
  const bodyStart = padL + (lapLeft && tr > 0 ? tr : 0);
  const folds = [padL];
  if (lapLeft && tr > 0) folds.push(padL + tr);
  folds.push(
    bodyStart + halfS,
    bodyStart + halfS + W,
    bodyStart + halfS + W + S / 2, // dobra centro lateral
    bodyStart + halfS + W + S,
    bodyStart + halfS + W + S + W,
    bodyStart + 2 * W + 2 * S
  );
  if (!lapLeft && tr > 0) folds.push(padL + totalW);
  const xs = [...folds];
  const ys = [padT, padT + sl, padT + H / 2, padT + H - sl, padT + H];
  const points = [];
  for (const x of folds) {
    for (const y of [padT, padT + H]) points.push({ x, y });
  }
  setMagnetGuides({ xs, ys, points });
}

function collectMagnetGuides4Side(padL, padT, totalW, totalH, W, S, H, sl, tr = 0, lapLeft = true, fundo = 0) {
  const bodyStart = padL + (lapLeft && tr > 0 ? tr : 0);
  const folds = [padL];
  if (lapLeft && tr > 0) folds.push(padL + tr);
  // Lat | Frente | Lat | Verso
  folds.push(
    bodyStart + S,
    bodyStart + S + W,
    bodyStart + S + W + S,
    bodyStart + S + W + S + W
  );
  if (!lapLeft && tr > 0) folds.push(padL + totalW);
  const frenteX = bodyStart + S;
  const versoX = bodyStart + S + W + S;
  const xs = [
    ...folds,
    frenteX - sl / 2,
    frenteX,
    frenteX + sl / 2,
    frenteX + W - sl / 2,
    frenteX + W,
    frenteX + W + sl / 2,
    versoX - sl / 2,
    versoX,
    versoX + sl / 2,
    versoX + W - sl / 2,
    versoX + W,
    versoX + W + sl / 2,
  ];
  const ys = [padT, padT + 18, padT + H / 2, padT + H];
  if (fundo > 0) {
    ys.push(padT + H + fundo / 2, padT + H + fundo);
  }
  const points = [];
  for (const x of folds) {
    for (const y of [padT, padT + H, ...(fundo > 0 ? [padT + H + fundo] : [])]) points.push({ x, y });
  }
  setMagnetGuides({ xs, ys, points });
}

/** Ferramenta ativa: "hand" (padrão) | "zoom" | "measure" */
let activeTool = "hand";
let isPanning = false;
let panLastX = 0;
let panLastY = 0;
let altHeld = false;
/** Espaço: mão temporária (solte volta à ferramenta anterior) */
let spaceHand = false;

/** Régua: medição em mm no espaço da planta */
let isMeasuring = false;
let measureStart = null; // { x, y } em mm
let measureEnd = null;

function readArtSize(svg) {
  const vb = svg.viewBox?.baseVal;
  const w = vb?.width || parseFloat(String(svg.getAttribute("width") || "200")) || 200;
  const h = vb?.height || parseFloat(String(svg.getAttribute("height") || "200")) || 200;
  return { w, h };
}

function parseSvgSizeFromMarkup(markup) {
  const vb = markup.match(/viewBox=["']([^"']+)["']/i);
  if (vb) {
    const parts = vb[1].trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
      return { w: parts[2], h: parts[3] };
    }
  }
  const w = parseFloat((markup.match(/\bwidth=["']([\d.]+)/i) || [])[1] || "200");
  const h = parseFloat((markup.match(/\bheight=["']([\d.]+)/i) || [])[1] || "200");
  return { w: w || 200, h: h || 200 };
}

function snapDevicePx(n) {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  return Math.round(n * dpr) / dpr;
}

function displaySizeForArt() {
  const canvas = $("#canvas");
  if (!canvas) return { dispW: artW, dispH: artH, fit: 1 };
  // Menos margem = planta maior e traços mais nítidos na tela
  const pad = 8;
  const cw = Math.max(48, canvas.clientWidth - pad * 2);
  const ch = Math.max(48, canvas.clientHeight - pad * 2);
  const fit = Math.min(cw / artW, ch / artH);
  const scale = fit * userZoom;
  // Alinha ao pixel do monitor (HiDPI) — reduz bordas “borradas”
  const dispW = snapDevicePx(artW * scale);
  const dispH = snapDevicePx(artH * scale);
  return { dispW, dispH, fit };
}

function stageTransformCss() {
  const x = snapDevicePx(panX);
  const y = snapDevicePx(panY);
  return `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
}

function applyViewTransform() {
  const stage = $("#previewStage");
  const svg = $("#preview");
  const label = $("#btnZoomReset");
  if (!stage) return;

  if (userZoom <= 1.001) {
    userZoom = 1;
    panX = 0;
    panY = 0;
  }

  const { dispW, dispH } = displaySizeForArt();
  stage.style.width = `${dispW}px`;
  stage.style.height = `${dispH}px`;
  stage.style.transform = stageTransformCss();
  if (svg) {
    svg.style.width = `${dispW}px`;
    svg.style.height = `${dispH}px`;
    svg.setAttribute("shape-rendering", "geometricPrecision");
    svg.setAttribute("text-rendering", "geometricPrecision");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  }
  if (label) label.textContent = `${Math.round(userZoom * 100)}%`;
}

function fitViewNow() {
  const svg = $("#preview");
  if (svg) {
    const size = readArtSize(svg);
    artW = size.w;
    artH = size.h;
  }
  if (userZoom <= 1.001) {
    userZoom = 1;
    panX = 0;
    panY = 0;
  }
  applyViewTransform();
}

function scheduleFit() {
  requestAnimationFrame(() => fitViewNow());
}

function setPreviewZoom(next) {
  const target = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(next * 100) / 100));
  if (target <= 1.001) {
    resetViewToFit();
    return;
  }

  const { dispW: oldW, dispH: oldH } = displaySizeForArt();
  userZoom = target;
  const { dispW: newW, dispH: newH } = displaySizeForArt();
  // Mantém o centro da arte fixo: o deslocamento em px acompanha a escala
  if (oldW > 0.01) panX *= newW / oldW;
  if (oldH > 0.01) panY *= newH / oldH;
  applyViewTransform();
}

function resetViewToFit() {
  userZoom = 1;
  panX = 0;
  panY = 0;
  fitViewNow();
}

function isHandTool() {
  return spaceHand || activeTool === "hand";
}

function clearMeasure() {
  isMeasuring = false;
  measureStart = null;
  measureEnd = null;
  const overlay = $("#measureOverlay");
  if (overlay) overlay.innerHTML = "";
  updateMeasureReadout();
}

/** Esconde o overlay sem apagar a medição (troca de ferramenta). */
function hideMeasureOverlay() {
  isMeasuring = false;
  const overlay = $("#measureOverlay");
  if (overlay) overlay.innerHTML = "";
  updateMeasureReadout();
}

function setActiveTool(tool) {
  if (tool === "zoom") activeTool = "zoom";
  else if (tool === "measure") activeTool = "measure";
  else activeTool = "hand";

  const canvas = $("#canvas");
  const hand = $("#toolHand");
  const zoom = $("#toolZoom");
  const measure = $("#toolMeasure");
  canvas?.classList.toggle("tool-zoom", activeTool === "zoom" && !spaceHand);
  canvas?.classList.toggle("tool-measure", activeTool === "measure" && !spaceHand);
  canvas?.classList.toggle("tool-space-hand", spaceHand);
  canvas?.classList.toggle("is-zoom-out", activeTool === "zoom" && altHeld && !spaceHand);
  if (hand) {
    hand.classList.toggle("active", activeTool === "hand");
    hand.setAttribute("aria-pressed", activeTool === "hand" ? "true" : "false");
  }
  if (zoom) {
    zoom.classList.toggle("active", activeTool === "zoom");
    zoom.setAttribute("aria-pressed", activeTool === "zoom" ? "true" : "false");
  }
  if (measure) {
    measure.classList.toggle("active", activeTool === "measure");
    measure.setAttribute("aria-pressed", activeTool === "measure" ? "true" : "false");
  }
  if (activeTool === "measure") {
    if (measureStart && measureEnd) drawMeasureOverlay();
    else updateMeasureReadout();
  } else {
    hideMeasureOverlay();
  }
  if (isHandTool() && !isPanning) {
    canvas?.classList.remove("is-panning");
  }
}

function refreshToolCursor() {
  const canvas = $("#canvas");
  if (!canvas) return;
  canvas.classList.toggle("tool-zoom", activeTool === "zoom" && !spaceHand);
  canvas.classList.toggle("tool-measure", activeTool === "measure" && !spaceHand);
  canvas.classList.toggle("tool-space-hand", spaceHand);
  canvas.classList.toggle("is-zoom-out", activeTool === "zoom" && altHeld && !spaceHand);
  canvas.classList.toggle("is-panning", isPanning);
}

function clientToArtMm(clientX, clientY, { snap = true, shiftKey = false } = {}) {
  const stage = $("#previewStage");
  if (!stage || artW <= 0 || artH <= 0) return null;
  const rect = stage.getBoundingClientRect();
  if (rect.width < 0.5 || rect.height < 0.5) return null;
  let pt = {
    x: ((clientX - rect.left) / rect.width) * artW,
    y: ((clientY - rect.top) / rect.height) * artH,
    snappedX: false,
    snappedY: false,
  };
  if (snap && activeTool === "measure") {
    const snapped = snapToMagnets(pt);
    pt = { ...pt, ...snapped };
  }
  if (shiftKey && measureStart) {
    const adx = Math.abs(pt.x - measureStart.x);
    const ady = Math.abs(pt.y - measureStart.y);
    if (adx >= ady) {
      pt.y = measureStart.y;
      pt.snappedY = true;
    } else {
      pt.x = measureStart.x;
      pt.snappedX = true;
    }
  }
  return pt;
}

function updateMeasureReadout() {
  const readout = $("#measureReadout");
  if (!readout) return;
  if (activeTool !== "measure") {
    readout.hidden = true;
    return;
  }
  readout.hidden = false;
  if (!measureStart || !measureEnd) {
    readout.innerHTML = `<strong>—</strong>ímã nas bordas · Shift trava`;
    return;
  }
  const dx = measureEnd.x - measureStart.x;
  const dy = measureEnd.y - measureStart.y;
  const dist = Math.hypot(dx, dy);
  const mag =
    measureStart.snappedX || measureStart.snappedY || measureEnd.snappedX || measureEnd.snappedY
      ? " · ímã"
      : "";
  readout.innerHTML = `<strong>${round2(dist)} mm</strong>Δx ${round2(dx)} · Δy ${round2(dy)}${mag}`;
}

function drawMeasureOverlay() {
  const overlay = $("#measureOverlay");
  if (!overlay) return;
  overlay.setAttribute("viewBox", `0 0 ${artW} ${artH}`);
  if (!measureStart || !measureEnd) {
    overlay.innerHTML = "";
    updateMeasureReadout();
    return;
  }
  const x1 = measureStart.x;
  const y1 = measureStart.y;
  const x2 = measureEnd.x;
  const y2 = measureEnd.y;
  const dist = Math.hypot(x2 - x1, y2 - y1);
  const fontSize = Math.max(2.0, Math.min(artW, artH) * 0.014);
  const cross = Math.max(1.6, fontSize * 0.85);
  const snapCol = "#2a9d8f";
  const c1 = measureStart.snappedX || measureStart.snappedY ? snapCol : "#e85d04";
  const c2 = measureEnd.snappedX || measureEnd.snappedY ? snapCol : "#e85d04";

  // Texto deslocado perpendicular à linha (fora do caminho da régua)
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.max(0.01, Math.hypot(dx, dy));
  const nx = -dy / len;
  const ny = dx / len;
  const offset = Math.max(4.5, fontSize * 2.2);
  let lx = (x1 + x2) / 2 + nx * offset;
  let ly = (y1 + y2) / 2 + ny * offset;
  const pad = fontSize * 2.5;
  lx = Math.min(artW - pad, Math.max(pad, lx));
  ly = Math.min(artH - pad, Math.max(pad, ly));
  const label = `${round2(dist)} mm`;
  const boxW = Math.max(fontSize * (label.length * 0.62), fontSize * 5.5);
  const boxH = fontSize * 1.45;

  let guides = "";
  if (measureEnd.snappedX) {
    guides += `<line x1="${x2}" y1="0" x2="${x2}" y2="${artH}" stroke="${snapCol}" stroke-width="0.2" stroke-dasharray="1 1.5" opacity="0.7"/>`;
  }
  if (measureEnd.snappedY) {
    guides += `<line x1="0" y1="${y2}" x2="${artW}" y2="${y2}" stroke="${snapCol}" stroke-width="0.2" stroke-dasharray="1 1.5" opacity="0.7"/>`;
  }

  overlay.innerHTML = `
    ${guides}
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#e85d04" stroke-width="0.4" stroke-dasharray="1.6 1.1"/>
    <line x1="${x1 - cross}" y1="${y1}" x2="${x1 + cross}" y2="${y1}" stroke="${c1}" stroke-width="0.35"/>
    <line x1="${x1}" y1="${y1 - cross}" x2="${x1}" y2="${y1 + cross}" stroke="${c1}" stroke-width="0.35"/>
    <line x1="${x2 - cross}" y1="${y2}" x2="${x2 + cross}" y2="${y2}" stroke="${c2}" stroke-width="0.35"/>
    <line x1="${x2}" y1="${y2 - cross}" x2="${x2}" y2="${y2 + cross}" stroke="${c2}" stroke-width="0.35"/>
    <circle cx="${x1}" cy="${y1}" r="0.55" fill="${c1}"/>
    <circle cx="${x2}" cy="${y2}" r="0.55" fill="${c2}"/>
    <rect x="${lx - boxW / 2}" y="${ly - boxH / 2}" width="${boxW}" height="${boxH}"
      rx="0.4" fill="#1a1f1c" fill-opacity="0.82" stroke="#e85d04" stroke-width="0.18"/>
    <text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle"
      font-size="${fontSize}" font-family="IBM Plex Mono, monospace" fill="#ffd6a5">${label}</text>
  `;
  updateMeasureReadout();
}

let renderTimer = null;

function render() {
  const form = $("#form");
  const p = readForm(form);
  updateDependentFields(p);
  const { svg, resumo } = buildDrawing(p);
  const markup = svg.replace(/^<\?xml[^>]*>\s*/i, "").replace("<svg", '<svg id="preview"');

  // Mantém zoom/pan do usuário ao editar medidas (só o botão Fit zera a vista)
  const keepZoom = userZoom;
  const keepPanX = panX;
  const keepPanY = panY;

  const size = parseSvgSizeFromMarkup(markup);
  artW = size.w;
  artH = size.h;
  userZoom = keepZoom;
  panX = keepPanX;
  panY = keepPanY;

  const { dispW, dispH } = displaySizeForArt();

  const stage = $("#previewStage");
  if (stage) {
    stage.style.width = `${dispW}px`;
    stage.style.height = `${dispH}px`;
    stage.style.transform = stageTransformCss();

    const wrap = document.createElement("div");
    wrap.innerHTML = markup;
    const newSvg = wrap.firstElementChild;
    if (newSvg) {
      newSvg.style.width = `${dispW}px`;
      newSvg.style.height = `${dispH}px`;
      newSvg.setAttribute("shape-rendering", "geometricPrecision");
      newSvg.setAttribute("text-rendering", "geometricPrecision");
      newSvg.setAttribute("preserveAspectRatio", "xMidYMid meet");
      const old = $("#preview");
      if (old) old.replaceWith(newSvg);
      else stage.appendChild(newSvg);
    }
  }

  const resumoEl = $("#resumo");
  if (resumoEl) resumoEl.textContent = resumo;
  const label = $("#btnZoomReset");
  if (label) label.textContent = `${Math.round(userZoom * 100)}%`;
  if (measureStart && measureEnd) drawMeasureOverlay();
  return svg;
}

/** Debounce: digitação contínua não redesenha a cada tecla */
function requestRender(immediate = false) {
  if (immediate) {
    if (renderTimer) {
      clearTimeout(renderTimer);
      renderTimer = null;
    }
    render();
    return;
  }
  if (renderTimer) clearTimeout(renderTimer);
  renderTimer = setTimeout(() => {
    renderTimer = null;
    render();
  }, 45);
}

function isTypingTarget(el) {
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

function setupPreviewNavigation() {
  const canvas = $("#canvas");
  if (!canvas) return;

  setActiveTool("hand");

  const updatePanCursor = () => refreshToolCursor();

  $("#toolHand")?.addEventListener("click", () => setActiveTool("hand"));
  $("#toolZoom")?.addEventListener("click", () => setActiveTool("zoom"));
  $("#toolMeasure")?.addEventListener("click", () => setActiveTool("measure"));
  $("#btnFitView")?.addEventListener("click", () => resetViewToFit());

  window.addEventListener("keydown", (ev) => {
    if (ev.key === "Alt") {
      altHeld = true;
      updatePanCursor();
    }
    // Espaço = mão temporária (só enquanto pressionado)
    if (ev.code === "Space" && !isTypingTarget(ev.target)) {
      ev.preventDefault();
      if (!ev.repeat && !spaceHand) {
        spaceHand = true;
        updatePanCursor();
      }
    }
    if ((ev.key === "h" || ev.key === "H") && !isTypingTarget(ev.target)) setActiveTool("hand");
    if ((ev.key === "z" || ev.key === "Z") && !isTypingTarget(ev.target) && !ev.ctrlKey) setActiveTool("zoom");
    if ((ev.key === "m" || ev.key === "M") && !isTypingTarget(ev.target) && !ev.ctrlKey) setActiveTool("measure");
    if (ev.key === "Escape" && activeTool === "measure") clearMeasure();
    if ((ev.key === "0" || ev.key === "Fit") && !isTypingTarget(ev.target) && (ev.ctrlKey || ev.metaKey)) {
      ev.preventDefault();
      resetViewToFit();
    }
  });

  window.addEventListener("keyup", (ev) => {
    if (ev.key === "Alt") {
      altHeld = false;
      updatePanCursor();
    }
    if (ev.code === "Space") {
      if (spaceHand) {
        spaceHand = false;
        if (isPanning) isPanning = false;
        updatePanCursor();
      }
    }
  });

  window.addEventListener("blur", () => {
    altHeld = false;
    spaceHand = false;
    isPanning = false;
    isMeasuring = false;
    updatePanCursor();
  });

  canvas.addEventListener("mousedown", (ev) => {
    if (ev.target.closest?.(".canvas-tools")) return;

    // Impede a barra piscante (caret) / seleção de texto ao clicar na planta
    const ae = document.activeElement;
    if (ae && isTypingTarget(ae)) ae.blur();
    window.getSelection()?.removeAllRanges();

    // Lupa: clique amplia / Alt+clique reduz (sempre pelo centro)
    if (!spaceHand && activeTool === "zoom" && ev.button === 0) {
      ev.preventDefault();
      if (altHeld || ev.altKey) setPreviewZoom(userZoom - ZOOM_STEP);
      else setPreviewZoom(userZoom + ZOOM_STEP);
      return;
    }

    // Régua: clicar e arrastar (com ímã)
    if (!spaceHand && activeTool === "measure" && ev.button === 0) {
      ev.preventDefault();
      const pt = clientToArtMm(ev.clientX, ev.clientY, { shiftKey: ev.shiftKey });
      if (!pt) return;
      isMeasuring = true;
      measureStart = pt;
      measureEnd = pt;
      drawMeasureOverlay();
      return;
    }

    // Mão (selecionada ou Espaço temporário) ou botão do meio
    if ((isHandTool() && ev.button === 0) || ev.button === 1) {
      ev.preventDefault();
      isPanning = true;
      panLastX = ev.clientX;
      panLastY = ev.clientY;
      updatePanCursor();
    }
  });

  window.addEventListener("mousemove", (ev) => {
    if (isMeasuring && measureStart) {
      const pt = clientToArtMm(ev.clientX, ev.clientY, { shiftKey: ev.shiftKey });
      if (!pt) return;
      measureEnd = pt;
      drawMeasureOverlay();
      return;
    }
    if (!isPanning) return;
    panX += ev.clientX - panLastX;
    panY += ev.clientY - panLastY;
    panLastX = ev.clientX;
    panLastY = ev.clientY;
    applyViewTransform();
  });

  window.addEventListener("mouseup", () => {
    if (isMeasuring) {
      isMeasuring = false;
      drawMeasureOverlay();
      return;
    }
    if (!isPanning) return;
    isPanning = false;
    updatePanCursor();
  });

  canvas.addEventListener(
    "wheel",
    (ev) => {
      ev.preventDefault();
      const dir = ev.deltaY < 0 ? 1 : -1;
      setPreviewZoom(userZoom + dir * ZOOM_STEP);
    },
    { passive: false }
  );

  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(() => scheduleFit());
    ro.observe(canvas);
  } else {
    window.addEventListener("resize", () => scheduleFit());
  }
}

let licenseState = { unlocked: true, blocked: false, uses: 0, max_uses: 1000, remaining: null };

function hasLicenseApi() {
  return Boolean(window.pywebview?.api?.get_license);
}

function applyLicenseUi(status) {
  licenseState = status || licenseState;
  const gate = $("#licenseGate");
  const chip = $("#licenseChip");
  const blocked = Boolean(licenseState.blocked);

  if (gate) {
    gate.classList.toggle("hidden", !blocked);
    gate.setAttribute("aria-hidden", blocked ? "false" : "true");
  }

  if (chip) {
    if (!hasLicenseApi()) {
      chip.hidden = true;
    } else if (licenseState.unlocked) {
      chip.hidden = false;
      chip.textContent = "Licença liberada";
    } else {
      chip.hidden = false;
      const left = licenseState.remaining ?? Math.max(0, (licenseState.max_uses || 0) - (licenseState.uses || 0));
      chip.textContent = `Usos restantes: ${left} / ${licenseState.max_uses}`;
    }
  }

  const btn = $("#btnExport");
  if (btn) btn.disabled = blocked;
  const btnPdf = $("#btnExportPdf");
  if (btnPdf) btnPdf.disabled = blocked;
}

async function refreshLicense() {
  if (!hasLicenseApi()) {
    applyLicenseUi({ unlocked: true, blocked: false, uses: 0, max_uses: 1000, remaining: null });
    return licenseState;
  }
  const status = await window.pywebview.api.get_license();
  applyLicenseUi(status);
  return status;
}

async function unlockLicense() {
  const input = $("#licensePassword");
  const err = $("#licenseError");
  const password = input?.value || "";
  if (err) {
    err.hidden = true;
    err.textContent = "";
  }
  if (!window.pywebview?.api?.activate) return;

  const result = await window.pywebview.api.activate(password);
  if (!result?.ok) {
    if (err) {
      err.hidden = false;
      err.textContent = result?.message || "Senha incorreta.";
    }
    applyLicenseUi(result);
    return;
  }
  if (input) input.value = "";
  applyLicenseUi(result);
}

function parseSvgSizeMm(svg) {
  const wAttr = svg.match(/\bwidth=["']([\d.]+)\s*mm["']/i);
  const hAttr = svg.match(/\bheight=["']([\d.]+)\s*mm["']/i);
  if (wAttr && hAttr) return { w: parseFloat(wAttr[1]), h: parseFloat(hAttr[1]) };
  const vb = svg.match(/viewBox=["']\s*([-\d.]+)\s+([-\d.]+)\s+([\d.]+)\s+([\d.]+)\s*["']/i);
  if (vb) return { w: parseFloat(vb[3]), h: parseFloat(vb[4]) };
  return { w: 210, h: 297 };
}

function assetUrl(rel) {
  try {
    return new URL(rel, window.location.href).href;
  } catch (_) {
    return rel;
  }
}

let cachedTechFont = null;

async function loadTechFont() {
  if (cachedTechFont) return cachedTechFont;
  await loadScriptOnce(assetUrl("vendor/opentype.min.js"));
  const ot = window.opentype;
  if (!ot?.parse) throw new Error("opentype.js não disponível");
  const res = await fetch(assetUrl("fonts/IBMPlexMono-Regular.ttf"));
  if (!res.ok) throw new Error("Fonte técnica não encontrada");
  cachedTechFont = ot.parse(await res.arrayBuffer());
  return cachedTechFont;
}

function convertTextNodeToPath(font, textEl) {
  const raw = (textEl.textContent || "").replace(/\s+/g, " ").trim();
  if (!raw) return null;

  const x = parseFloat(textEl.getAttribute("x") || "0");
  const y = parseFloat(textEl.getAttribute("y") || "0");
  const size = parseFloat(textEl.getAttribute("font-size") || "3");
  const anchor = textEl.getAttribute("text-anchor") || "start";
  const baseline = textEl.getAttribute("dominant-baseline") || "auto";
  const fill = textEl.getAttribute("fill") || "#1a1a1a";
  const opacity = textEl.getAttribute("opacity") || textEl.getAttribute("fill-opacity");
  const transform = textEl.getAttribute("transform");
  const fontWeight = textEl.getAttribute("font-weight");

  let startX = x;
  const adv = font.getAdvanceWidth(raw, size);
  if (anchor === "middle") startX = x - adv / 2;
  else if (anchor === "end") startX = x - adv;

  let baselineY = y;
  if (baseline === "middle" || baseline === "central" || baseline === "center") {
    const asc = (font.ascender / font.unitsPerEm) * size;
    const desc = (font.descender / font.unitsPerEm) * size;
    baselineY = y + (asc + desc) / 2;
  }

  const path = font.getPath(raw, startX, baselineY, size, { kerning: true });
  const d = path.toPathData(3);
  if (!d) return null;

  const pathEl = textEl.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "path");
  pathEl.setAttribute("d", d);
  pathEl.setAttribute("fill", fill);
  pathEl.setAttribute("stroke", "none");
  if (opacity != null && opacity !== "") pathEl.setAttribute("opacity", String(opacity));
  if (transform) pathEl.setAttribute("transform", transform);
  if (fontWeight === "700" || fontWeight === "bold") {
    pathEl.setAttribute("stroke", fill);
    pathEl.setAttribute("stroke-width", String(Math.max(0.04, size * 0.035)));
    pathEl.setAttribute("stroke-linejoin", "round");
  }
  return pathEl;
}

/** SVG de exportação: cores só em atributos + textos convertidos em curvas (sem fonte). */
async function prepareExportSvg(svgMarkup) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgMarkup, "image/svg+xml");
  if (doc.querySelector("parsererror")) return svgMarkup;
  const svg = doc.documentElement;

  svg.querySelectorAll("[style]").forEach((el) => el.removeAttribute("style"));
  svg.querySelectorAll("[data-cmyk]").forEach((el) => el.removeAttribute("data-cmyk"));

  try {
    const font = await loadTechFont();
    for (const t of [...svg.querySelectorAll("text")]) {
      try {
        const pathEl = convertTextNodeToPath(font, t);
        if (pathEl) t.parentNode.replaceChild(pathEl, t);
        else t.remove();
      } catch (err) {
        console.warn("Texto não vetorizado:", err);
      }
    }
  } catch (err) {
    console.warn("Export sem curvas de texto:", err);
  }

  svg.querySelectorAll("[font-family]").forEach((el) => el.removeAttribute("font-family"));
  svg.querySelectorAll("[font-size]").forEach((el) => {
    if (el.tagName.toLowerCase() !== "text") el.removeAttribute("font-size");
  });
  svg.querySelectorAll("[font-weight]").forEach((el) => {
    if (el.tagName.toLowerCase() !== "text") el.removeAttribute("font-weight");
  });

  const body = new XMLSerializer().serializeToString(svg);
  return body.includes("<?xml") ? body : `<?xml version="1.0" encoding="UTF-8"?>\n${body}`;
}

function loadScriptOnce(src) {
  const key = `__pt_script_${src}`;
  if (window[key]) return window[key];
  window[key] = new Promise((resolve, reject) => {
    const existing = [...document.querySelectorAll("script[data-plantatec-src]")].find((el) => el.dataset.plantatecSrc === src);
    if (existing) {
      if (existing.dataset.loaded === "1") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Falha ao carregar biblioteca PDF")));
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.dataset.plantatecSrc = src;
    s.onload = () => {
      s.dataset.loaded = "1";
      resolve();
    };
    s.onerror = () => reject(new Error("Falha ao carregar biblioteca PDF"));
    document.head.appendChild(s);
  });
  return window[key];
}

async function ensurePdfLibs() {
  await loadScriptOnce("https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js");
  await loadScriptOnce("https://cdn.jsdelivr.net/npm/svg2pdf.js@2.2.4/dist/svg2pdf.umd.min.js");
  if (!window.jspdf?.jsPDF) throw new Error("jsPDF não carregou");
}

async function downloadPdfBrowser(svgMarkup, filename) {
  await ensurePdfLibs();
  const { w, h } = parseSvgSizeMm(svgMarkup);
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: w >= h ? "landscape" : "portrait",
    unit: "mm",
    format: [w, h],
    compress: true,
  });

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgMarkup, "image/svg+xml");
  if (doc.querySelector("parsererror")) throw new Error("SVG inválido para PDF");
  const svgEl = doc.documentElement;
  const host = document.createElement("div");
  host.style.cssText =
    "position:fixed;left:-99999px;top:0;width:0;height:0;overflow:hidden;opacity:0;pointer-events:none";
  host.appendChild(svgEl);
  document.body.appendChild(host);
  try {
    await pdf.svg(svgEl, { x: 0, y: 0, width: w, height: h });
    pdf.save(filename);
  } finally {
    host.remove();
  }
}

async function exportDrawing(format) {
  try {
    if (licenseState.blocked) {
      applyLicenseUi(licenseState);
      return;
    }

    const p = readForm($("#form"));
    if (p.alturaTotal <= 0 || p.largura <= 0) {
      alert("Preencha as medidas antes de exportar.");
      return;
    }

    const raw = render();
    const svg = await prepareExportSvg(raw);
    const base = `planta-${p.tipoEmbalagem}-${p.largura}x${p.alturaTotal}`;

    if (format === "pdf") {
      if (window.pywebview?.api?.save_pdf) {
        const result = await window.pywebview.api.save_pdf(svg, `${base}.pdf`);
        if (result && typeof result === "object") {
          applyLicenseUi(result);
          if (result.message && !result.ok && !result.cancelled) alert(result.message);
          return;
        }
        return;
      }
      try {
        await downloadPdfBrowser(svg, `${base}.pdf`);
      } catch (err) {
        console.error(err);
        alert("Não foi possível gerar o PDF no navegador: " + (err.message || err));
      }
      return;
    }

    // SVG
    const filename = `${base}.svg`;
    if (window.pywebview?.api?.save_svg) {
      const result = await window.pywebview.api.save_svg(svg, filename);
      if (result && typeof result === "object") {
        applyLicenseUi(result);
        return;
      }
      if (!result) return;
      await refreshLicense();
      return;
    }

    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  } catch (err) {
    alert("Erro ao exportar: " + (err.message || err));
  }
}

async function exportSvg() {
  return exportDrawing("svg");
}

async function exportPdf() {
  return exportDrawing("pdf");
}

/** F5 / novo acesso: começa limpo (sem lembrar sessão anterior). */
function clearSessionPrefs() {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("plantatec_")) localStorage.removeItem(key);
    }
  } catch (_) {}
}

async function init() {
  try {
    clearSessionPrefs();
    const form = $("#form");
    form.addEventListener("input", () => {
      updateDependentFields(readForm(form));
      requestRender(false);
    });
    form.addEventListener("change", () => {
      updateDependentFields(readForm(form));
      requestRender(true);
    });
    $("#btnExport").addEventListener("click", exportSvg);
    $("#btnExportPdf")?.addEventListener("click", exportPdf);
    $("#btnFotoInvert")?.addEventListener("click", () => {
      const a = form.querySelector('[name="fotoLargura"]');
      const b = form.querySelector('[name="fotoAltura"]');
      if (!a || !b) return;
      const tmp = a.value;
      a.value = b.value;
      b.value = tmp;
      updateDependentFields(readForm(form));
      requestRender(true);
    });
    $("#btnReset").addEventListener("click", () => {
      form.reset();
      updateDependentFields(readForm(form));
      updateFotoQuinaPreviews(readForm(form));
      requestRender(true);
    });
    $("#btnUnlock")?.addEventListener("click", unlockLicense);
    $("#licensePassword")?.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        unlockLicense();
      }
    });

    $("#btnZoomIn")?.addEventListener("click", () => setPreviewZoom(userZoom + ZOOM_STEP));
    $("#btnZoomOut")?.addEventListener("click", () => setPreviewZoom(userZoom - ZOOM_STEP));
    $("#btnZoomReset")?.addEventListener("click", () => resetViewToFit());

    const dockEl = $("#dock");

    const dockHeightLimits = () => {
      const vh = window.innerHeight || 800;
      return { min: 120, max: Math.max(180, Math.floor(vh * 0.72)) };
    };

    const measureDockContentHeight = () => {
      if (!dockEl) return 280;
      const form = $("#form");
      const handleEl = $("#dockResizeHandle");
      const barEl = $(".dock-bar");
      const styles = getComputedStyle(dockEl);
      const padY = (parseFloat(styles.paddingTop) || 0) + (parseFloat(styles.paddingBottom) || 0);
      const chrome =
        (handleEl?.offsetHeight || 0) + (barEl?.offsetHeight || 0) + padY;
      if (!form) return chrome + 200;
      const prevOverflow = form.style.overflowY;
      const prevFlex = form.style.flex;
      form.style.overflowY = "visible";
      form.style.flex = "0 0 auto";
      const formH = form.scrollHeight;
      form.style.overflowY = prevOverflow;
      form.style.flex = prevFlex;
      return Math.ceil(chrome + formH + 2);
    };

    const applyDockHeight = (px, { fit = true } = {}) => {
      if (!dockEl) return;
      const { min, max } = dockHeightLimits();
      const h = Math.min(max, Math.max(min, Math.round(px)));
      dockEl.style.setProperty("--dock-h", `${h}px`);
      if (fit) {
        requestAnimationFrame(() => {
          try {
            resetViewToFit();
          } catch (_) {
            window.dispatchEvent(new Event("resize"));
          }
        });
      }
    };

    const fitDockToContent = ({ fitPreview = true } = {}) => {
      applyDockHeight(measureDockContentHeight(), { fit: fitPreview });
    };

    const resetDockHeight = () => {
      fitDockToContent({ fitPreview: true });
    };

    const setDockCollapsed = (collapsed) => {
      document.querySelector(".app")?.classList.toggle("dock-collapsed", collapsed);
      const label = collapsed ? "Mostrar dados ▴" : "Minimizar ▾";
      for (const id of ["btnToggleDock", "btnMinimizeDock"]) {
        const btn = $(`#${id}`);
        if (!btn) continue;
        btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
        btn.textContent = label;
      }
      const expand = $("#btnExpandDock");
      if (expand) expand.hidden = !collapsed;
      // Ao reabrir após minimizar, restaura a altura padrão do painel
      if (!collapsed) resetDockHeight();
      else {
        requestAnimationFrame(() => {
          try {
            resetViewToFit();
          } catch (_) {
            window.dispatchEvent(new Event("resize"));
          }
        });
      }
    };
    const toggleDock = () => {
      const collapsed = document.querySelector(".app")?.classList.contains("dock-collapsed");
      setDockCollapsed(!collapsed);
    };
    $("#btnToggleDock")?.addEventListener("click", toggleDock);
    $("#btnMinimizeDock")?.addEventListener("click", toggleDock);
    $("#btnExpandDock")?.addEventListener("click", () => setDockCollapsed(false));

    // Altura inicial: encaixa o conteúdo para não rolar
    requestAnimationFrame(() => fitDockToContent({ fitPreview: false }));

    // Arrastar a alça superior para redimensionar o painel
    const handle = $("#dockResizeHandle");
    if (handle && dockEl) {
      let dragging = false;
      const onMove = (clientY) => {
        if (!dragging) return;
        const appH = document.querySelector(".app")?.clientHeight || window.innerHeight;
        const next = appH - clientY;
        applyDockHeight(next, { fit: true });
      };
      const stop = () => {
        if (!dragging) return;
        dragging = false;
        dockEl.classList.remove("is-resizing");
        document.body.style.cursor = "";
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", stop);
        window.removeEventListener("pointercancel", stop);
        resetViewToFit();
      };
      const onPointerMove = (ev) => onMove(ev.clientY);
      handle.addEventListener("pointerdown", (ev) => {
        if (document.querySelector(".app")?.classList.contains("dock-collapsed")) return;
        ev.preventDefault();
        dragging = true;
        dockEl.classList.add("is-resizing");
        document.body.style.cursor = "ns-resize";
        handle.setPointerCapture?.(ev.pointerId);
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", stop);
        window.addEventListener("pointercancel", stop);
      });
      handle.addEventListener("dblclick", (ev) => {
        if (document.querySelector(".app")?.classList.contains("dock-collapsed")) return;
        ev.preventDefault();
        resetDockHeight();
      });
    }

    window.addEventListener("resize", () => {
      if (!dockEl || document.querySelector(".app")?.classList.contains("dock-collapsed")) return;
      const h = dockEl.offsetHeight;
      if (h > 40) applyDockHeight(h, { fit: true });
    });
    setupPreviewNavigation();

    const boot = () => {
      refreshLicense().then(() => {
        render();
        requestAnimationFrame(() => {
          fitDockToContent({ fitPreview: true });
        });
      });
    };

    if (window.pywebview?.api) {
      boot();
    } else if (window.pywebview) {
      window.addEventListener("pywebviewready", boot, { once: true });
    } else {
      boot();
    }
  } catch (err) {
    const stage = $("#previewStage") || $("#canvas");
    if (stage) stage.innerHTML = `<pre style="color:#ff7a6e;padding:1rem">${err.stack || err}</pre>`;
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
