const $ = (id) => document.getElementById(id);
let map,
  points,
  graph,
  main,
  net,
  roadNames = new Map(),
  features,
  known = {},
  stops = [],
  legs = [],
  focus = "jh",
  at = 0,
  phase = 0,
  raf = null,
  mode = "end",
  dot,
  layers,
  filmId,
  previousFocus,
  customCount = 0;
const stays = {},
  meters = (a, b) => Math.hypot((a[1] - b[1]) * 95750, (a[0] - b[0]) * 111000);
const ll = (id) => places[id].ll,
  chosen = () => stops[at],
  hint = (t) => ($("hint").textContent = t);
const bounds = L.latLngBounds([30.415, 114.095], [30.705, 114.515]);
function html(text) {
  const d = document.createElement("div");
  d.textContent = text;
  return d.innerHTML;
}
function project(lat, lon) {
  const s = Math.sin((lat * Math.PI) / 180),
    z = 4194304;
  return [((lon + 180) * z) / 360, (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * z];
}
function cartography(data) {
  const index = new Map(),
    world = points.map(([lat, lon]) => project(lat, lon));
  function add(type, kind, name, rings) {
    let x0 = Infinity,
      y0 = Infinity,
      x1 = -Infinity,
      y1 = -Infinity;
    for (const ring of rings)
      for (const [x, y] of ring) {
        x0 = Math.min(x0, x);
        y0 = Math.min(y0, y);
        x1 = Math.max(x1, x);
        y1 = Math.max(y1, y);
      }
    const minZoom = type === "building" ? 15 : type !== "road" ? 0 : kind>=10 ? 15 : kind>=7 ? 14 : kind>=5 ? 12 : 0;
    const order = type==="green"?0:type==="water"?1:type==="building"?2:25-Math.min(kind,18);
    const f = {type, kind, name, rings, x0, y0, x1, y1, minZoom, order};
    for (let x = Math.floor(x0 / 512); x <= Math.floor(x1 / 512); x++)
      for (let y = Math.floor(y0 / 512); y <= Math.floor(y1 / 512); y++) {
        const key = x + "," + y;
        if (!index.has(key)) index.set(key, []);
        index.get(key).push(f);
      }
  }
  for (const [type, rings] of data.areas)
    add(
      type,
      0,
      "",
      rings.map((r) => r.map(([lat, lon]) => project(lat, lon))),
    );
  for (const ring of data.buildings)
    add("building", 0, "", [ring.map(([x, y]) => project(y / 1e5, x / 1e5))]);
  for (const [kind, walk, name, refs] of data.roads.ways)
    add("road", kind, name, [refs.map((i) => world[i])]);
  const recentTiles = new Map();
  const Base = L.GridLayer.extend({
    createTile(coord) {
      const tile = document.createElement("canvas"),
        dpi = Math.min(devicePixelRatio || 1, 2),
        size = 256;
      tile.width = tile.height = size * dpi;
      const ctx = tile.getContext("2d");
      const key = [coord.x,coord.y,coord.z,dpi].join("/");
      const cached=recentTiles.get(key);
      if(cached){ctx.drawImage(cached,0,0);recentTiles.delete(key);recentTiles.set(key,cached);return tile;}
      ctx.scale(dpi, dpi);
      ctx.fillStyle = "#f1eddf";
      ctx.fillRect(0, 0, 256, 256);
      const z = coord.z,
        k = 2 ** (z - 14),
        ox = (coord.x * 256) / k,
        oy = (coord.y * 256) / k,
        side = 256 / k,
        found = new Set();
      for (let x = Math.floor(ox / 512); x <= Math.floor((ox + side) / 512); x++)
        for (let y = Math.floor(oy / 512); y <= Math.floor((oy + side) / 512); y++)
          for (const f of index.get(x + "," + y) || [])
            if (z>=f.minZoom && f.x1 >= ox && f.x0 <= ox + side && f.y1 >= oy && f.y0 <= oy + side) found.add(f);
      const list=[...found].sort((a,b)=>a.order-b.order);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      let labels = [];
      for (const f of list) {
        // Geometry stays in zoom-14 world coordinates and is reusable across tiles.
        if(!f.path){
          const path=new Path2D();
          for(const ring of f.rings){
            if(!ring.length)continue;
            path.moveTo(ring[0][0],ring[0][1]);
            for(let i=1;i<ring.length;i++)path.lineTo(ring[i][0],ring[i][1]);
            if(f.type!=="road")path.closePath();
          }
          f.path=path;
        }
        ctx.setTransform(dpi*k,0,0,dpi*k,-ox*dpi*k,-oy*dpi*k);
        if (f.type === "road") {
          const belt = f.name === "三环线" && z <= 13,
            major = f.kind < 5;
          ctx.strokeStyle = belt ? "#879d86" : major ? "#d4bb91" : f.kind < 9 ? "#d5cfb8" : "#cfcab5";
          const width = major
            ? Math.max(1.8, Math.min(8, k * 1.4 + 1))
            : Math.max(0.6, Math.min(5, k * 0.62 + 0.4));
          ctx.lineWidth = (width + 1)/k;
          ctx.stroke(f.path);
          ctx.lineWidth = width/k;
          ctx.strokeStyle = belt ? "#b4c8a5" : major ? "#f9dfad" : "#fffaf0";
          ctx.stroke(f.path);
          if (f.name && z >= 14 && f.rings[0].length > 2 && (major || z >= 16)) {
            const [x, y] = f.rings[0][Math.floor(f.rings[0].length / 2)];
            labels.push([f.name, (x - ox) * k, (y - oy) * k]);
          }
        } else {
          ctx.fillStyle = { green: "#cadbc1", water: "#a8ced0", building: "#ded8c8" }[f.type];
          ctx.fill(f.path,"evenodd");
        }
      }
      ctx.setTransform(dpi,0,0,dpi,0,0);
      const used = [];
      ctx.font = "10px Microsoft YaHei,sans-serif";
      ctx.textAlign = "center";
      for (const [name, x, y] of labels) {
        const half = ctx.measureText(name).width / 2;
        if (
          x < half + 2 ||
          x > 254 - half ||
          y < 10 ||
          y > 250 ||
          used.some((p) => Math.abs(y - p[1]) < 28 && Math.abs(x - p[0]) < half + p[2] + 13)
        )
          continue;
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "#fff8e7";
        ctx.strokeText(name, x, y);
        ctx.fillStyle = "#857c66";
        ctx.fillText(name, x, y);
        used.push([x, y, half]);
      }
      recentTiles.set(key,tile);
      if(recentTiles.size>Math.floor(128/(dpi*dpi)))recentTiles.delete(recentTiles.keys().next().value);
      return tile;
    },
  });
  new Base({
    noWrap: true,
    updateWhenZooming:false,
    bounds: bounds.pad(0.1),
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · OpenFreeMap / OpenMapTiles',
  }).addTo(map);
}
/* Rail and walking edges use OSM WGS84 geometry. Edge weights are planning estimates in minutes. */
let routeMode = "transit";
const routeCache = new Map(),
  timeRows = new Map(),
  walkBuckets = new Map();
const railMeta = [];
let offsets,
  targets,
  weights,
  tags,
  types,
  workDist,
  workPrev,
  workEdge,
  workVersion,
  runId = 0;
const ROAD = 0,
  FERRY = 1,
  BOARD = 2,
  RIDE = 3,
  EXIT = 4,
  TRANSFER = 5;
const bucketSize = 0.003;
const bucketKey = (x, y) => x + "," + y;
function makeSnapIndex() {
  for (const i of main) {
    const p = points[i],
      key = bucketKey(Math.floor(p[1] / bucketSize), Math.floor(p[0] / bucketSize));
    if (!walkBuckets.has(key)) walkBuckets.set(key, []);
    walkBuckets.get(key).push(i);
  }
}
function snap(pos) {
  let best = Infinity,
    index = -1;
  const x = Math.floor(pos[1] / bucketSize),
    y = Math.floor(pos[0] / bucketSize);
  for (let radius = 0; radius <= 4; radius++) {
    for (let dx = -radius; dx <= radius; dx++)
      for (let dy = -radius; dy <= radius; dy++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
        for (const i of walkBuckets.get(bucketKey(x + dx, y + dy)) || []) {
          const p = points[i],
            a = (p[1] - pos[1]) * 95750,
            b = (p[0] - pos[0]) * 111000,
            s = a * a + b * b;
          if (s < best) {
            best = s;
            index = i;
          }
        }
      }
    if (index >= 0 && Math.sqrt(best) < radius * bucketSize * 95000) break;
  }
  if (index === -1) {
    for (const i of main) {
      const d = meters(pos, points[i]);
      if (d * d < best) {
        best = d * d;
        index = i;
      }
    }
  }
  return { i: index, d: Math.sqrt(best) };
}
function setupGraph(roads) {
  points = roads.points.map(([x, y]) => [y / 1e5, x / 1e5]);
  main = roads.walkable;
  makeSnapIndex();
  const extra = [],
    stationGroups = new Map();
  function add(from, to, cost, type, data) {
    const tag = railMeta.push(data) - 1;
    extra.push([from, to, cost, type, tag]);
  }
  const pierA = snap(ll("whpier")).i,
    pierB = snap(ll("zhpier")).i;
  for (const [from, to] of [
    [pierA, pierB],
    [pierB, pierA],
  ])
    add(from, to, 25, FERRY, {
      from: from === pierA ? "武汉关" : "中华路",
      to: to === pierB ? "中华路" : "武汉关",
    });
  for (const [number, line] of Object.entries(railData.lines)) {
    const byStation = {};
    for (const [name, xy] of Object.entries(line.stations)) {
      const node = points.push(xy) - 1;
      byStation[name] = node;
      if (!stationGroups.has(name)) stationGroups.set(name, []);
      stationGroups.get(name).push({ number, node });
      if (!bounds.contains(xy)) continue;
      const entrances = railData.entrances[name] || [[...xy, ""]];
      for (const gate of entrances) {
        const [lat, lon, code] = gate,
          p = [lat, lon],
          near = snap(p);
        if (near.d > 190) continue;
        const access = (meters(xy, p) + near.d) / 80,
          info = { name, number, gate: code, gatePoint: p };
        add(near.i, node, 4.5 + access, BOARD, info);
        add(node, near.i, 2 + access, EXIT, info);
      }
    }
    for (const [a, b, coords] of line.segments) {
      const i = byStation[a],
        j = byStation[b];
      if (i === undefined || j === undefined) continue;
      const shape = coords.length ? coords : [points[i], points[j]];
      let distance = 0;
      for (let k = 1; k < shape.length; k++) distance += meters(shape[k - 1], shape[k]);
      const ride = 0.48 + distance / (number === "19" ? 950 : 635);
      add(i, j, ride, RIDE, {
        number,
        from: a,
        to: b,
        toward: number === "12" ? b : line.ends[1],
        shape,
        reverse: false,
      });
      add(j, i, ride, RIDE, {
        number,
        from: b,
        to: a,
        toward: number === "12" ? a : line.ends[0],
        shape,
        reverse: true,
      });
    }
  }
  for (const [name, stations] of stationGroups) {
    for (const a of stations)
      for (const b of stations) {
        if (a === b) continue;
        const distance = meters(points[a.node], points[b.node]);
        if (distance > 650) continue;
        add(a.node, b.node, 5.5 + distance / 75, TRANSFER, { name, from: a.number, to: b.number });
      }
  }
  const size = points.length;
  offsets = new Uint32Array(size + 1);
  for (const [, walk, , ids] of roads.ways)
    if (walk)
      for (let k = 1; k < ids.length; k++) {
        const i = ids[k - 1],
          j = ids[k];
        if (i === j) continue;
        offsets[i + 1]++;
        offsets[j + 1]++;
      }
  for (const [i] of extra) offsets[i + 1]++;
  for (let i = 1; i <= size; i++) offsets[i] += offsets[i - 1];
  const total = offsets[size],
    cursor = offsets.slice(0, size);
  targets = new Uint32Array(total);
  weights = new Float32Array(total);
  tags = new Int32Array(total);
  types = new Uint8Array(total);
  function edge(i, j, w, t, tag) {
    const at = cursor[i]++;
    targets[at] = j;
    weights[at] = w;
    tags[at] = tag;
    types[at] = t;
  }
  roads.ways.forEach(([, walk, name, ids], way) => {
    if (!walk) return;
    if (name && !roadNames.has(name)) roadNames.set(name, points[ids[Math.floor(ids.length / 2)]]);
    for (let k = 1; k < ids.length; k++) {
      const i = ids[k - 1],
        j = ids[k];
      if (i === j) continue;
      const cost = meters(points[i], points[j]) / 75;
      edge(i, j, cost, ROAD, way);
      edge(j, i, cost, ROAD, way);
    }
  });
  for (const args of extra) edge(...args);
  workDist = new Float64Array(size);
  workPrev = new Int32Array(size);
  workEdge = new Int32Array(size);
  workVersion = new Uint32Array(size);
}
class RouteHeap {
  constructor() {
    this.nodes = [];
    this.costs = [];
    this.value = 0;
    this.node = 0;
  }
  push(node, cost) {
    let i = this.nodes.length;
    this.nodes.push(node);
    this.costs.push(cost);
    while (i) {
      const p = (i - 1) >> 1;
      if (this.costs[p] <= cost) break;
      this.nodes[i] = this.nodes[p];
      this.costs[i] = this.costs[p];
      i = p;
    }
    this.nodes[i] = node;
    this.costs[i] = cost;
  }
  pop() {
    const n = this.nodes.length - 1;
    this.node = this.nodes[0];
    this.value = this.costs[0];
    const node = this.nodes.pop(),
      cost = this.costs.pop();
    if (!n) return;
    let i = 0;
    while (i * 2 + 1 < n) {
      let child = i * 2 + 1;
      if (child + 1 < n && this.costs[child + 1] < this.costs[child]) child++;
      if (cost <= this.costs[child]) break;
      this.nodes[i] = this.nodes[child];
      this.costs[i] = this.costs[child];
      i = child;
    }
    this.nodes[i] = node;
    this.costs[i] = cost;
  }
}
function explore(origin, target, mode) {
  const heap = new RouteHeap();
  ++runId;
  workVersion[origin] = runId;
  workDist[origin] = 0;
  workPrev[origin] = -1;
  heap.push(origin, 0);
  while (heap.nodes.length) {
    heap.pop();
    const i = heap.node,
      cost = heap.value;
    if (cost !== workDist[i]) continue;
    if (i === target) return;
    for (let e = offsets[i]; e < offsets[i + 1]; e++) {
      const t = types[e];
      if ((t === FERRY && mode !== "ferry") || (t > FERRY && mode !== "transit")) continue;
      const j = targets[e],
        c = cost + weights[e];
      if (workVersion[j] === runId && c >= workDist[j]) continue;
      workVersion[j] = runId;
      workDist[j] = c;
      workPrev[j] = i;
      workEdge[j] = e;
      heap.push(j, c);
    }
  }
}
function timeRow(id, mode) {
  const p = places[id],
    key = mode + "|" + id + "|" + p.ll.join(",");
  if (timeRows.has(key)) return timeRows.get(key);
  explore(p.snap.i, -1, mode);
  const row = {};
  for (const [k, poi] of Object.entries(places)) {
    if (!poi.snap) continue;
    row[k] =
      workVersion[poi.snap.i] === runId
        ? Math.max(1, Math.ceil(workDist[poi.snap.i] + (p.snap.d + poi.snap.d) / 75))
        : Infinity;
  }
  if (timeRows.size > 120) timeRows.clear();
  timeRows.set(key, row);
  return row;
}
function travelTime(a, b, mode = routeMode) {
  if (a === b) return 0;
  if (typeof travelTable !== "undefined") {
    const i = travelTable.keys.indexOf(a),
      j = travelTable.keys.indexOf(b);
    if (i >= 0 && j >= 0) return travelTable[mode][i][j] ?? Infinity;
    if (i >= 0 && j < 0) return timeRow(b, mode)[a] ?? routeLeg(a, b, mode).minutes;
  }
  const row = timeRow(a, mode);
  return row[b] ?? routeLeg(a, b, mode).minutes;
}
function routeLeg(a, b, mode = routeMode) {
  const A = places[a],
    B = places[b],
    key = [mode, a, ...A.ll, b, ...B.ll].join("/");
  if (routeCache.has(key)) return routeCache.get(key);
  const start = A.snap.i,
    end = B.snap.i;
  explore(start, end, mode);
  if (workVersion[end] !== runId) throw Error("当前位置之间暂未找到连通线路，请移动选点。");
  const cost = workDist[end] + (A.snap.d + B.snap.d) / 75,
    trace = [];
  for (let i = end; i !== start;) {
    const e = workEdge[i],
      prev = workPrev[i];
    trace.push([prev, i, e]);
    i = prev;
  }
  trace.reverse();
  const coords = [A.ll],
    acc = [0],
    water = [],
    steps = [],
    pieces = [];
  let length = 0,
    foot = 0,
    walkStep = null,
    railStep = null,
    previousPiece = null,
    boarding = null;
  function point(p) {
    const d = meters(coords[coords.length - 1], p);
    if (d < 0.02) return;
    length += d;
    coords.push(p);
    acc.push(length);
  }
  function paint(type, list) {
    if (!previousPiece || previousPiece.type !== type) {
      previousPiece = { type, coords: [coords[coords.length - 1]] };
      pieces.push(previousPiece);
    }
    for (const p of list) {
      const n = coords.length;
      point(p);
      if (coords.length > n) previousPiece.coords.push(p);
    }
  }
  function walk(distance, road, p) {
    if (!walkStep) {
      walkStep = {
        type: "walk",
        distance: 0,
        roads: [],
        turns: [],
        startM: length,
        endM: length,
        minutes: 0,
      };
      steps.push(walkStep);
    }
    walkStep.distance += distance;
    walkStep.minutes += distance / 75;
    foot += distance;
    if (road) {
      const prev = walkStep.roads[walkStep.roads.length - 1];
      if (prev && prev.name === road) prev.m += distance;
      else walkStep.roads.push({ name: road, m: distance });
    }
    const old = coords[coords.length - 1],
      dx = (p[1] - old[1]) * 95750,
      dy = (p[0] - old[0]) * 111000;
    if (distance >= 2) {
      const angle = ((Math.atan2(dx, dy) * 180) / Math.PI + 360) % 360;
      const seg = walkStep.turns[walkStep.turns.length - 1];
      const name = road || "";
      if (!seg || seg.name !== name || Math.abs(((angle - seg.lastAngle + 540) % 360) - 180) > 42) {
        walkStep.turns.push({ name, angle, lastAngle: angle, length: distance, ll: old, dx, dy });
      } else {
        seg.length += distance;
        seg.dx += dx;
        seg.dy += dy;
        seg.angle = ((Math.atan2(seg.dx, seg.dy) * 180) / Math.PI + 360) % 360;
        seg.lastAngle = angle;
      }
    }
    paint("walk", [p]);
    walkStep.endM = length;
  }
  walk(A.snap.d, "", points[start]);
  for (const [i, j, e] of trace) {
    const type = types[e],
      p = points[j],
      meta = type === ROAD ? null : railMeta[tags[e]];
    if (type === ROAD) {
      walk(weights[e] * 75, mapData.roads.ways[tags[e]][2], p);
      continue;
    }
    walkStep = null;
    if (type === FERRY) {
      steps.push({
        type: "ferry",
        from: meta.from,
        to: meta.to,
        minutes: weights[e],
        startM: length,
        endM: length + meters(points[i], p),
      });
      water.push([points[i], p]);
      paint("ferry", [p]);
      continue;
    }
    if (type === BOARD) {
      boarding = { ...meta, minutes: weights[e], startM: length };
      paint("access", [meta.gatePoint, p]);
      continue;
    }
    if (type === TRANSFER) {
      railStep = null;
      boarding = null;
      steps.push({
        type: "transfer",
        name: meta.name,
        from: meta.from,
        to: meta.to,
        minutes: weights[e],
        startM: length,
        endM: length + meters(points[i], p),
      });
      paint("access", [p]);
      continue;
    }
    if (type === RIDE) {
      if (!railStep) {
        railStep = {
          type: "rail",
          line: meta.number,
          from: meta.from,
          to: meta.to,
          toward: meta.toward,
          stations: [meta.from],
          startM: boarding?.startM ?? length,
          endM: length,
          minutes: boarding?.minutes || 0,
          entrance: boarding?.gate || "",
          exit: "",
        };
        steps.push(railStep);
        boarding = null;
      }
      railStep.to = meta.to;
      railStep.stations.push(meta.to);
      railStep.minutes += weights[e];
      paint("rail", meta.reverse ? meta.shape.slice().reverse() : meta.shape);
      paint("rail", [p]);
      railStep.endM = length;
      continue;
    }
    if (type === EXIT) {
      if (railStep) {
        railStep.minutes += weights[e];
        railStep.exit = meta.gate;
        railStep.leavesStation = true;
      }
      paint("access", [meta.gatePoint, p]);
      if (railStep) railStep.endM = length;
      railStep = null;
      boarding = null;
    }
  }
  walk(B.snap.d, "", B.ll);
  if (coords.length < 2) {
    coords.push(B.ll);
    acc.push(0);
  }
  const out = {
    coords,
    acc,
    real: length,
    minutes: Math.max(1, Math.ceil(cost)),
    water,
    foot,
    snapA: A.snap.d,
    snapB: B.snap.d,
    pieces,
    steps: steps.filter((s) => s.type !== "walk" || s.distance > 8),
  };
  if (routeCache.size > 100) routeCache.clear();
  routeCache.set(key, out);
  return out;
}
