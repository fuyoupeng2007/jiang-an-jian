const prettyDistance = (m) =>
  m < 1000 ? Math.max(1, Math.round(m / 10) * 10) + " 米" : (m / 1000).toFixed(1) + " 公里";
const lineName = (n) => (n === "21" ? "阳逻线" : n + "号线");
function stepText(s) {
  if (s.type === "rail") {
    const tips = [
      s.entrance ? s.from + "站 " + s.entrance + " 口进站" : "",
      s.exit ? s.to + "站 " + s.exit + " 口出站" : "",
    ].filter(Boolean);
    if (s.leavesStation && !s.exit) {
      tips.push(s.to === "江汉路" ? "按站内江汉路步行街标识出站" : "在" + s.to + "站按现场指引出站");
    }
    return {
      kind: lineName(s.line),
      title: s.from + " → " + s.to,
      detail:
        "往" +
        s.toward +
        "方向 · " +
        (s.stations.length - 1) +
        " 站" +
        (tips.length ? " · " + tips.join("，") : ""),
      extra: s.stations.join(" → "),
    };
  }
  if (s.type === "transfer")
    return {
      kind: "换乘",
      title: "在" + s.name + "换乘" + lineName(s.to),
      detail: "沿站内换乘标识，由" + lineName(s.from) + "前往" + lineName(s.to) + "站台。",
    };
  if (s.type === "ferry")
    return {
      kind: "轮渡",
      title: s.from + "码头 → " + s.to + "码头",
      detail: "按码头公告确认开航与候船时间。",
    };
  const maneuvers = walkManeuvers(s);
  const roads = s.roads
    .filter((r) => r.name && r.m > 18)
    .map((r) => r.name)
    .filter((n, i, a) => !i || n !== a[i - 1]);
  return {
    kind: "步行",
    title: "步行 " + prettyDistance(s.distance),
    detail: roads.length
      ? "沿 " + roads.slice(0, 4).join(" → ")
      : maneuvers[0] || "沿地图红线与现场人行通道前进",
    extra: maneuvers.length ? maneuvers.join("；") : roads.length > 4 ? roads.join(" → ") : "",
  };
}
function displayStep(s) {
  const t = stepText(s),
    row = document.createElement("div");
  row.className = "transStep " + s.type;
  const tag = document.createElement("small"),
    copy = document.createElement("div"),
    name = document.createElement("b"),
    detail = document.createElement("p");
  tag.textContent = t.kind;
  name.textContent = t.title;
  detail.textContent = t.detail;
  copy.append(name, detail);
  if (t.extra) {
    const box = document.createElement("details"),
      summary = document.createElement("summary"),
      p = document.createElement("p");
    summary.textContent = s.type === "rail" ? "途经各站" : "逐段步行";
    p.textContent = t.extra;
    box.append(summary, p);
    copy.append(box);
  }
  row.append(tag, copy);
  return row;
}
function insertAtBest(path, id, mode) {
  if (path.includes(id)) return null;
  let best = null;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1],
      b = path[i],
      x = travelTime(a, id, mode),
      y = travelTime(id, b, mode),
      z = travelTime(a, b, mode);
    if (![x, y, z].every(Number.isFinite)) continue;
    const extra = Math.max(0, x + y - z);
    if (!best || extra < best.extra) best = { id, at: i, extra };
  }
  return best;
}
function suggestionsFor(path, interest, mode, limit = 3) {
  const group = { food: foodIds, water: waterIds, photo: photoIds }[interest];
  const ids = group ? [...group] : [...new Set([...photoIds, ...foodIds, ...waterIds])];
  const scores = [];
  for (const id of ids) {
    if (!places[id] || path.includes(id)) continue;
    const v = insertAtBest(path, id, mode);
    if (!v) continue;
    v.stay = Math.min(30, Math.max(10, journal[id].minutes));
    scores.push(v);
  }
  scores.sort(
    (a, b) => a.extra - b.extra || a.stay - b.stay || places[a.id].n.localeCompare(places[b.id].n, "zh"),
  );
  const near = [];
  for (const v of scores) {
    if (near.some((p) => meters(places[p.id].ll, places[v.id].ll) < 180)) continue;
    near.push(v);
    if (near.length === limit) break;
  }
  return near;
}
function nearestAlong(pos, leg, minAlong = 0) {
  let best = Infinity,
    along = 0;
  for (let i = 1; i < leg.coords.length; i++) {
    if (leg.acc[i] + 40 < minAlong) continue;
    const a = leg.coords[i - 1],
      b = leg.coords[i],
      x = (b[1] - a[1]) * 95750,
      y = (b[0] - a[0]) * 111000,
      px = (pos[1] - a[1]) * 95750,
      py = (pos[0] - a[0]) * 111000;
    const t = Math.min(1, Math.max(0, (px * x + py * y) / (x * x + y * y || 1))),
      distance = Math.hypot(px - t * x, py - t * y);
    if (distance < best) {
      best = distance;
      along = leg.acc[i - 1] + t * (leg.acc[i] - leg.acc[i - 1]);
    }
  }
  return { distance: best, along };
}

function amapLegUrl(a, b, leg) {
  const out = new URL("https://uri.amap.com/navigation");
  for (const [key, id] of [
    ["from", a],
    ["to", b],
  ]) {
    const p = places[id];
    out.searchParams.set(key, [p.ll[1], p.ll[0], p.n].join(","));
  }
  out.searchParams.set(
    "mode",
    leg.steps.some((s) => s.type === "rail" || s.type === "ferry") ? "bus" : "walk",
  );
  out.searchParams.set("coordinate", "wgs84");
  out.searchParams.set("src", "jiang-an-jian");
  out.searchParams.set("callnative", "1");
  return out.href;
}
function normalSpeech(input) {
  const digits = "零一二三四五六七八九";
  const number = (s) => {
    s = s.replace(/两/g, "二").replace(/〇/g, "零");
    if (s.includes("十")) {
      const [t, u] = s.split("十");
      return (t ? digits.indexOf(t) : 1) * 10 + (u ? digits.indexOf(u) : 0);
    }
    return Number([...s].map((c) => digits.indexOf(c)).join(""));
  };
  return input
    .replace(/([零〇一二两三四五六七八九十]+)(?=[点时分])/g, (_, n) => String(number(n)))
    .replace(/(\d+)点半/g, "$1点30")
    .replace(/(\d+)点一刻/g, "$1点15")
    .replace(/(\d+)点三刻/g, "$1点45");
}
function walkManeuvers(s) {
  const spans = [];
  for (const t of s.turns || []) {
    if (t.length < 5 && !t.name) continue;
    const prev = spans[spans.length - 1];
    if (prev && prev.name === t.name && Math.abs(((prev.angle - t.angle + 540) % 360) - 180) < 30) {
      prev.length += t.length;
      continue;
    }
    spans.push({ ...t });
  }
  const words = [];
  let previousHeading;
  for (const cur of spans) {
    if (cur.length < 18 && spans.length > 1) continue;
    const direction = ["北", "东北", "东", "东南", "南", "西南", "西", "西北"][
      Math.round(cur.angle / 45) % 8
    ];
    let action = "向" + direction;
    if (previousHeading !== undefined) {
      const change = ((cur.angle - previousHeading + 540) % 360) - 180;
      action =
        Math.abs(change) > 145 ? "折返" : change > 40 ? "右转" : change < -40 ? "左转" : "继续向" + direction;
    }
    words.push(action + "，沿" + (cur.name || "人行通道") + "约 " + prettyDistance(cur.length));
    previousHeading = cur.angle;
  }
  return words;
}

const tourThemeNames = { photo: "拍照", food: "小吃", water: "水景" };
const toursByTheme = { photo: photoIds, food: foodIds, water: waterIds };
const signatureStops = [
  "hym",
  "custom",
  "optic",
  "red",
  "riverpark",
  "dacheng",
  "shanhai",
  "jiqing",
  "hubu",
  "greenway",
  "whu",
  "tingtao",
  "castle",
  "qintaiart",
  "qsbank",
  "tower",
  "xuesong",
];
function describedStop(id, interest) {
  if (interest === "food") return placeHints[id] || journal[id].title;
  if (interest === "water" && id === "lingbo") return "从校园一侧看东湖的开阔水面";
  return placeHints[id] || journal[id].title;
}
function routeTotals(path, dwell, mode) {
  let travel = 0,
    visits = 0;
  for (let i = 1; i < path.length; i++) travel += travelTime(path[i - 1], path[i], mode);
  for (const k of path.slice(0, -1)) visits += Number(dwell[k]) || 0;
  return { travel, visits, total: travel + visits };
}
function tourOptions(path, dwell, mode, request) {
  const { budget, topics, limit, quiet } = request;
  const timer = routeTotals(path, dwell, mode),
    ceiling = timer.total + budget;
  const group = topics.length ? topics : ["photo", "food", "water"];
  const pool = [...new Set(group.flatMap((topic) => [...toursByTheme[topic]]))].filter(
    (id) => places[id] && !path.includes(id),
  );
  const initial = pool
    .map((id) => insertAtBest(path, id, mode))
    .filter(Boolean)
    .sort((a, b) => a.extra - b.extra);
  // Preserve the nearest choices per interest even when many camera spots cluster around one station.
  const candidates = [
    ...new Set(
      group.flatMap((topic) =>
        initial
          .filter((c) => toursByTheme[topic].has(c.id))
          .slice(0, 10)
          .map((c) => c.id),
      ),
    ),
  ];
  const initialBeam = { path: [...path], stays: { ...dwell }, add: [], elapsed: timer.total, score: 0 };
  let beam = [initialBeam],
    completed = [];
  for (let count = 1; count <= limit; count++) {
    const layer = [],
      seen = new Set();
    for (const prev of beam)
      for (const id of candidates) {
        if (prev.path.includes(id)) continue;
        const ins = insertAtBest(prev.path, id, mode);
        if (!ins) continue;
        const stay = Math.min(quiet ? 30 : 22, Math.max(10, journal[id].minutes)),
          elapsed = prev.elapsed + ins.extra + stay;
        if (elapsed > ceiling) continue;
        const next = prev.path.slice();
        next.splice(ins.at, 0, id);
        const hash = next.join("|");
        if (seen.has(hash)) continue;
        seen.add(hash);
        const add = [...prev.add, id],
          stays = { ...prev.stays, [id]: stay };
        const covered = group.filter((topic) => add.some((k) => toursByTheme[topic].has(k))).length;
        const localGroups = new Set(add.map((k) => bookFor(k).title)).size;
        const specialty = add.filter((k) => signatureStops.includes(k)).length;
        const detour = elapsed - timer.total - add.reduce((v, k) => v + stays[k], 0);
        let dayFit = 0;
        for (const k of add) {
          const idx = next.indexOf(k),
            arrive = (request.departure + routeTotals(next.slice(0, idx + 1), stays, mode).total) % 1440;
          if (["dacheng", "shanhai"].includes(k) && arrive > 11 * 60) dayFit -= 15;
          if (k === "xuesong" && arrive < 15 * 60) dayFit -= 14;
        }
        const score =
          covered * 40 +
          add.length * (quiet ? 4 : 10) +
          localGroups * 4 +
          specialty * 4 -
          detour * (quiet ? 1.1 : 0.66) +
          dayFit;
        layer.push({ path: next, stays, add, elapsed, score });
      }
    layer.sort((a, b) => b.score - a.score || a.elapsed - b.elapsed);
    beam = layer.slice(0, 18);
    completed.push(...beam);
    if (!beam.length) break;
  }
  completed.sort((a, b) => b.score - a.score || a.elapsed - b.elapsed);
  if (!completed.length) return [];
  const top = completed[0],
    topKey = [...top.add].sort().join("|");
  const short = completed
    .filter((v) => [...v.add].sort().join("|") !== topKey)
    .sort((a, b) => a.elapsed - b.elapsed || b.score - a.score)[0];
  return short ? [top, short] : [top];
}
function durationFromText(q) {
  const toNum = (t) => {
    if (/^\d+(\.\d+)?$/.test(t)) return Number(t);
    const digits = "零一二三四五六七八九";
    if (t === "半") return 0.5;
    if (t === "一个" || t === "一") return 1;
    t = t.replace(/两/g, "二");
    if (t.includes("十")) {
      const [a, b] = t.split("十");
      return (a ? digits.indexOf(a) : 1) * 10 + (b ? digits.indexOf(b) : 0);
    }
    return digits.indexOf(t);
  };
  let m = q.match(/(\d+(?:\.\d+)?|[一二两三四五六七八九十半]+)个?小时(半)?/);
  if (m) return Math.round(toNum(m[1]) * 60 + (m[2] ? 30 : 0));
  m = q.match(/(\d+|[一二两三四五六七八九十]+)分钟/);
  return m ? toNum(m[1]) : null;
}
function tourTopics(text) {
  const list = [];
  if (/吃|过早|美食|早点|早餐|饿/.test(text)) list.push("food");
  if (/拍|照相|地标|建筑|打卡/.test(text)) list.push("photo");
  if (/看江|江景|江边|湖景|湖边|玩水|看水|江滩/.test(text)) list.push("water");
  return list;
}

function serviceEstimate(legs, path, departure, dwell) {
  const [hours, mins] = departure.split(":").map(Number);
  let when = hours * 60 + mins;
  for (let i = 0; i < legs.length; i++) {
    when += Number(dwell[path[i]]) || 0;
    for (const step of legs[i].steps) {
      const local = when % 1440;
      if (step.type === "rail" && (local >= 22 * 60 + 30 || local < 6 * 60))
        return "夜间在途时间按有车估算，请核对" + step.from + "站首末班。";
      if (step.type === "ferry" && (local >= 20 * 60 || local < 7 * 60))
        return "夜间含轮渡，出发前请核对码头当日航班。";
      when += step.minutes;
    }
  }
  return "";
}
