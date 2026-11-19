(() => {
  "use strict";
  const el = (id) => document.getElementById(id);
  const page = document.body.dataset.page;
  const key = "jiang-an-guide-v1";
  const original = Object.keys(places);
  const search = new URLSearchParams(location.search);
  const defaults = {
    path: ["hustgate", "jh"],
    mode: "transit",
    interest: "any",
    departure: (() => {
      const t = new Date(Date.now() + 8 * 60 * 60 * 1000);
      return String(t.getUTCHours()).padStart(2, "0") + ":" + String(t.getUTCMinutes()).padStart(2, "0");
    })(),
    due: "18:00",
    deadlineOn: false,
    dueDay: 0,
    buffer: 0,
    dwell: {},
    pins: {},
    step: 0,
    fraction: 0,
    updated: 0,
  };
  function parse(value) {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  const carried = parse(new URLSearchParams(location.hash.slice(1)).get("route"));
  let stored, durable;
  try {
    durable = parse(localStorage.getItem(key));
  } catch {}
  try {
    stored = parse(sessionStorage.getItem(key));
  } catch {}
  let state = Object.assign({}, defaults, carried || stored || durable);
  const safeTime = (v) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
  if (!safeTime(state.departure)) state.departure = defaults.departure;
  if (!safeTime(state.due)) state.due = defaults.due;
  const plain = (v) => v && typeof v === "object" && !Array.isArray(v);
  if (!plain(state.pins)) state.pins = {};
  if (!plain(state.dwell)) state.dwell = {};
  for (const [id, value] of Object.entries(state.dwell)) {
    const n = Number(value);
    state.dwell[id] = Number.isFinite(n) ? Math.max(0, Math.min(720, Math.round(n))) : 0;
  }
  state.buffer = [0, 5, 10, 15, 20, 30, 45].includes(Number(state.buffer)) ? Number(state.buffer) : 0;
  state.dueDay = state.dueDay === 1 ? 1 : 0;
  state.deadlineOn = state.deadlineOn === true;
  for (const [k, p] of Object.entries(state.pins || {})) {
    if (
      /^p\d{1,9}$/.test(k) &&
      p &&
      Array.isArray(p.ll) &&
      p.ll.length === 2 &&
      p.ll.every(Number.isFinite) &&
      p.ll[0] >= 30.415 &&
      p.ll[0] <= 30.705 &&
      p.ll[1] >= 114.095 &&
      p.ll[1] <= 114.515
    )
      places[k] = {
        n: typeof p.n === "string" ? p.n.slice(0, 32) : "自选地点 " + k.slice(1),
        ll: p.ll,
        t: "自选",
      };
    else delete state.pins[k];
  }
  state.path = Array.isArray(state.path)
    ? [...new Set(state.path.filter((k) => Object.prototype.hasOwnProperty.call(places, k)))]
    : [];
  if (state.path.length < 2) state.path = defaults.path.slice();
  state.step = Math.max(0, Math.min(Number(state.step) || 0, state.path.length - 1));
  state.fraction = Math.max(0, Math.min(Number(state.fraction) || 0, 1));
  if (!["transit", "walk", "ferry"].includes(state.mode)) state.mode = "transit";
  if (page === "index" || page === "trip") routeMode = state.mode;
  function snapshot() {
    return {
      ...state,
      pins: Object.fromEntries(
        Object.entries(state.pins).filter(([id]) => state.path.includes(id) || id === state.camera?.pick),
      ),
    };
  }
  function persist() {
    state.updated = Date.now();
    const saved = snapshot();
    try {
      sessionStorage.setItem(key, JSON.stringify(saved));
    } catch {}
    try {
      localStorage.setItem(key, JSON.stringify(saved));
    } catch {}
    const u = new URL(location.href);
    u.hash = new URLSearchParams({ route: JSON.stringify(saved) }).toString();
    try {
      history.replaceState(null, "", u.href);
    } catch {}
  }
  let captureMap = null;
  function go(name, id, leaf) {
    if (captureMap) captureMap();
    persist();
    const u = new URL((name === "home" ? "index" : name) + ".html", location.href);
    if (id) u.searchParams.set("id", id);
    if (leaf) u.searchParams.set("leaf", leaf);
    if (name === "index") u.searchParams.set("view", "route");
    u.hash = new URLSearchParams({ route: JSON.stringify(snapshot()) }).toString();
    if (
      name === "postcard" &&
      page === "index" &&
      places[id]?.art &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      if (document.querySelector(".postDeparture")) return;
      const shade = document.createElement("div");
      shade.className = "postDeparture";
      shade.setAttribute("aria-hidden", "true");
      const preview = new Image();
      preview.src = places[id].art;
      shade.append(preview);
      document.body.append(shade);
      setTimeout(() => location.assign(u.href), 260);
    } else location.assign(u.href);
  }
  document.querySelectorAll("[data-nav]").forEach(
    (a) =>
      (a.onclick = (e) => {
        if (e.ctrlKey || e.metaKey) return;
        e.preventDefault();
        go(a.dataset.nav);
      }),
  );
  function options(select, ids, value) {
    select.replaceChildren(...ids.map((id) => new Option(places[id].n, id)));
    if (value) select.value = value;
  }
  const glyph = (id) => iconArt[id] || '<span aria-hidden="true">●</span>';
  const isVenue = id => id === "zhimin" || id === "packing";
  const last = (arr) => arr[arr.length - 1];
  const clock = (n) =>
    (n >= 2880 ? "第 " + (Math.floor(n / 1440) + 1) + " 天 " : n >= 1440 ? "次日 " : "") +
    String(Math.floor(n / 60) % 24).padStart(2, "0") +
    ":" +
    String(n % 60).padStart(2, "0");
  const minutes = (v) => Number(v.slice(0, 2)) * 60 + Number(v.slice(3, 5));
  const deadlineMinutes = () => minutes(state.due) + 1440 * (state.dueDay === 1 ? 1 : 0);
  const stay = (id, dwell = state.dwell) => Number(dwell?.[id]) || 0;
  function schedule(path = state.path, departure = state.departure, dwell = state.dwell) {
    let t = minutes(departure);
    return path.map((id, i) => {
      if (i) t += routeLeg(path[i - 1], id).minutes;
      const arrival = t;
      if (i < path.length - 1) t += stay(id, dwell);
      return arrival;
    });
  }
  function assign(path) {
    state.guided = null;
    state.pendingVia = null;
    state.camera = null;
    if (state.visitEnd !== path[path.length - 1]) state.visitEnd = null;
    state.path = path;
    state.step = 0;
    state.fraction = 0;
    persist();
  }
  function setPoint(id, kind) {
    let path = [...state.path],
      pending = null;
    if (kind === "start" || kind === "end") {
      const start = kind === "start",
        at = start ? 0 : path.length - 1,
        opposite = start ? path.length - 1 : 0;
      if (id === path[opposite]) {
        [path[0], path[path.length - 1]] = [path[path.length - 1], path[0]];
      } else {
        path[at] = id;
        path = path.filter((k, i) => k !== id || i === at);
      }
    } else {
      if (id === path[0] || id === last(path)) return false;
      path = path.filter((k) => k !== id);
      const best = typeof travelTable !== "undefined" ? insertAtBest(path, id, state.mode) : null;
      if (typeof travelTable === "undefined") pending = id;
      path.splice(best?.at ?? path.length - 1, 0, id);
    }
    if (path.length < 2) return false;
    assign(path);
    if (pending) {
      state.pendingVia = pending;
      persist();
    }
    return true;
  }
  function initMap() {
    map = L.map("map", {
      zoomControl: false,
      doubleClickZoom: false,
      maxBounds: bounds.pad(0.08),
      zoomSnap: 0.25,
      minZoom: 10,
      maxZoom: 18,
      preferCanvas: true,
      fadeAnimation:false,
    }).setView([30.568, 114.29], 13);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    map.attributionControl.setPrefix(false);
    cartography(mapData);
    const lineLayer = L.layerGroup().addTo(map),
      pinLayer = L.layerGroup().addTo(map);
    const waterNames = [
      ["东 湖", 30.5622, 114.3765],
      ["南 湖", 30.4915, 114.3571],
      ["长 江", 30.597, 114.3246],
      ["汉 江", 30.5765, 114.2097],
      ["墨水湖", 30.542, 114.216],
    ];
    for (const [name, lat, lon] of waterNames)
      L.marker([lat, lon], {
        interactive: false,
        keyboard: false,
        zIndexOffset: -1500,
        icon: L.divIcon({ className: "lakeName", html: name, iconSize: [52, 20], iconAnchor: [26, 10] }),
      }).addTo(map);
    const pinMarkers = new Map();
    let selected,
      activeLegs = [],
      frame = 0,
      waitAtStop = 0,
      active = false;
    const red = L.marker(ll(state.path[state.step]), {
      zIndexOffset: 1600,
      title: "行程红点，点击播放或暂停",
      icon: L.divIcon({
        className: "",
        html: '<div class="redDot"></div>',
        iconSize: [17, 17],
        iconAnchor: [8, 8],
      }),
    }).addTo(map);
    let tapKey = "",
      tapTime = 0,
      navigated = false;
    window.addEventListener("pageshow", () => {
      navigated = false;
    });
    function openBook(id) {
      if (!navigated && places[id]?.art) {
        navigated = true;
        el("pick").hidden = true;
        go("venue", id);
      }
    }
    function tapMark(id) {
      if (active) {
        pause();
        persist();
      }
      if(navigated)return;
      const now = performance.now();
      if (id === tapKey && now - tapTime < 420) {
        openBook(id);
        tapKey = "";
        return;
      }
      tapKey = id;
      tapTime = now;
      select(id);
      animateStop(id);
    }
    function select(id) {
      el("pickArt").hidden = !places[id].art;
      if (places[id].art) el("pickArt").src = places[id].art;
      el("pickType").textContent =
        places[id].t +
        (state.path.includes(id) ? " · 可拖动改点" : "") +
        (places[id].art ? " · 双击打开立体模型" : "");
      const vb = document.querySelector('[data-set="via"]');
      vb.disabled = state.path.includes(id);
      selected = id;
      const chosenMarker=pinMarkers.get(id);
      if(chosenMarker&&!pinLayer.hasLayer(chosenMarker))pinLayer.addLayer(chosenMarker);
      el("pick").hidden = false;
      el("pickName").textContent = places[id].n;
      el("openCard").hidden = !places[id].art;
      el("pickPostcard").hidden = !places[id].art;
      host.refresh();
    }
    function marker(id) {
      const pos = state.path.indexOf(id),
        size = isVenue(id) ? 44 : ["tower","hustgate","grain"].includes(id) ? (pos >= 0 ? 54 : 44) : pos >= 0 ? 43 : 34;
      const icon = L.divIcon({
        className: "",
        html: '<div class="landPin' + (isVenue(id) ? ' venuePin' : '') + '">' + glyph(id) + (pos >= 0 ? "<b>" + (pos + 1) + "</b>" : "") + "</div>",
        iconSize: [size, size],
        iconAnchor: [size / 2, size - 3],
      });
      const m = L.marker(ll(id), {
        icon,
        draggable: pos >= 0,
        autoPan: pos >= 0,
        title: places[id].n,
        zIndexOffset: isVenue(id) ? 690 : pos >= 0 ? 400 : 0,
      });
      m.on("click", () => tapMark(id)).on("dblclick", () => openBook(id));
      if (isVenue(id)) m.bindTooltip(id==="zhimin"?"智民里 · 主会场":"平和打包厂 · 观赛",{
        permanent:true,direction:id==="zhimin"?"left":"right",className:"tag venueTag",offset:[id==="zhimin"?-12:12,-22]});
      else if (pos >= 0)
        m.on("dragend", () => {
          const coord = m.getLatLng(),
            xy = [coord.lat, coord.lng],
            near = original
              .filter((k) => k !== id && !state.path.includes(k))
              .map((k) => [k, meters(xy, ll(k))])
              .sort((a, b) => a[1] - b[1])[0];
          const replacement = near && near[1] < 75 ? near[0] : localPin(xy);
          if (!replacement || replacement === id || state.path.includes(replacement)) {
            m.setLatLng(ll(id));
            return;
          }
          remember();
          const changed = [...state.path];
          changed[pos] = replacement;
          state.dwell[replacement] = stay(id);
          assign(changed);
          planChanged(replacement, "已移动落点，线路和时间已重算。");
        });
      function labelMarker() {
        const node = m.getElement();
        if (!node) return;
        node.setAttribute("data-point", id);
        node.setAttribute("aria-label", places[id].n + (places[id].art ? "，单击选择，双击打开立体模型" : "，选择地点"));
      }
      m.on("add", labelMarker);
      labelMarker();
      if (pos >= 0)
        m.bindTooltip(Object.assign(document.createElement("span"), { textContent: places[id].n }), {
          permanent: pos === 0 || pos === state.path.length - 1,
          direction: pos === 0 ? "left" : pos === state.path.length - 1 ? "right" : "top",
          offset: pos === 0 ? [-13, -13] : pos === state.path.length - 1 ? [12, -13] : [0, -size + 6],
          className: "tag routeTag",
        });
      pinMarkers.set(id, m);
    }
    const highlighted = [
      "hustgate",
      "hym",
      "red","qc","baotong","guiyuan","guishan","wheel",
      "jh",
      "riverpark",
      "hust",
      "whu",
      "balloon",
      "greenway",
      "tower",
      "custom",
      "expo",
      "gutian",
      "hzau",
      "qsbank",
      "dijiao",
      "qintaiart",
      "optic",
      "forest",
      "luoyan",
      "yangsi",
      "zoo",
    ];
    const priority = [...new Set([...highlighted, ...original])];
    function organize() {
      const zoom = map.getZoom(),
        occupied = [],
        groups = new Set(),
        keep = new Set(["zhimin", ...(zoom >= 15 ? ["packing"] : []), ...state.path, "hust", "whu"]);
      if (selected) keep.add(selected);
      const visible=map.getBounds().pad(.4);
      const spacing = zoom < 12 ? 41 : zoom < 13 ? 38 : zoom < 14 ? 32 : zoom < 15 ? 22 : 0;
      for (const id of new Set([...keep, ...priority, ...pinMarkers.keys()])) {
        const m = pinMarkers.get(id);
        if (!m) continue;
        if(!keep.has(id)&&!visible.contains(m.getLatLng())){pinLayer.removeLayer(m);continue;}
        const pixel = map.project(ll(id), zoom),
          close = spacing && occupied.some((p) => p.distanceTo(pixel) < spacing);
        if (!keep.has(id) && close) {
          pinLayer.removeLayer(m);
          continue;
        }
        occupied.push(pixel);
        if (!pinLayer.hasLayer(m)) pinLayer.addLayer(m);
        if (highlighted.includes(id) && !state.path.includes(id)) {
          const label =
            {
              hust: "华中科技大学",
              whu: "武汉大学",
              expo: "园博园",
              hzau: "华中农业大学",
              balloon: "东湖氦气球",
              qsbank: "青山江滩",
              qintaiart: "琴台美术馆",
              greenway: "东湖绿道",
            }[id] || places[id].n.split(" · ")[0];
          const cell = Math.floor(pixel.x / 94) + "," + Math.floor(pixel.y / 40);
          if (
            (zoom >= 13 ||
              ["hust", "whu", "expo", "hzau", "qsbank", "gutian", "tower", "dijiao"].includes(id)) &&
            !groups.has(cell)
          ) {
            if (!m.getTooltip())
              m.bindTooltip(label, {
                permanent: true,
                direction: id === "whu" ? "left" : "bottom",
                className: "tag placeTag",
                offset: [0, -1],
              });
            groups.add(cell);
          } else if (m.getTooltip()) m.unbindTooltip();
        }
      }
    }
    function cityView() {
      map.fitBounds(
        L.latLngBounds([
          [30.46025, 114.15413],
          [30.69656, 114.45501],
        ]),
        { paddingTopLeft: [30, 48], paddingBottomRight: [30, 28], maxZoom: 13, animate: false },
      );
      organize();
    }
    el("city").onclick = cityView;
    function frameVenues(){
      el("pick").hidden = true;
      map.fitBounds(L.latLngBounds([ll("zhimin"),ll("packing")]),{paddingTopLeft:[62,104],paddingBottomRight:[68,57],maxZoom:17,animate:false});
      organize();
    }
    el("showVenues").onclick = frameVenues;
    map.on("moveend", organize);
    const field = el("findPlace"),
      results = el("matches");
    const normalize = (word) => word.toLowerCase().replace(/[\s·]/g, "");
    function searchHits() {
      const q = normalize(field.value.trim());
      if (!q) return [];
      const list = [];
      for (const id of original) {
        const p = places[id],
          n = normalize(p.n),
          t = normalize(
            p.n +
              " " +
              (p.aliases || "") +
              " " +
              (foodIds.has(id) ? "小吃 美食 早餐" : "") +
              " " +
              (photoIds.has(id) ? "拍照" : "") +
              " " +
              p.t,
          );
        if (t.includes(q))
          list.push({
            id,
            n: p.n,
            kind: "明信片",
            score: n === q ? 0 : n.startsWith(q) ? 1 : n.includes(q) ? 2 : 3,
          });
      }
      const center = map.getCenter(),
        samples = [];
      for (const [n, y, x, kind] of searchPlaces) {
        const name = normalize(n);
        if (!name.includes(q)) continue;
        const exact = name === q,
          begins = name.startsWith(q);
        samples.push({
          n,
          ll: [y, x],
          kind,
          score: exact ? 1 : begins ? 4 : 5,
          dist: meters([center.lat, center.lng], [y, x]),
        });
      }
      samples.sort((a, b) => a.score - b.score || a.dist - b.dist);
      for (const h of samples) {
        if (list.some((p) => p.n === h.n && (!p.ll || meters(h.ll, p.ll) < 110))) continue;
        list.push(h);
        if (list.length >= 30) break;
      }
      return list
        .sort((a, b) => a.score - b.score || Number(!a.id) - Number(!b.id) || (a.dist || 0) - (b.dist || 0))
        .slice(0, 8);
    }
    function locate(hit) {
      const id = hit.id || localPin(hit.ll, hit.n);
      results.hidden = true;
      if (!id) {
        message("这个位置附近没有连通的步行路，可在附近手动落点。");
        return;
      }
      if (!pinMarkers.has(id)) marker(id);
      field.value = hit.n;
      select(id);
      map.setView(ll(id), 16, { animate: false });
      organize();
      animateStop(id);
      field.blur();
    }
    field.oninput = () => {
      const hits = searchHits();
      results.replaceChildren();
      results.hidden = !field.value.trim();
      for (const h of hits) {
        const b = document.createElement("button"),
          name = document.createElement("span"),
          kind = document.createElement("small");
        b.type = "button";
        name.textContent = h.n;
        kind.textContent = h.kind;
        b.append(name, kind);
        b.onclick = () => locate(h);
        results.append(b);
      }
      if (!hits.length && field.value.trim()) results.textContent = "没有找到。可以直接点地图落点。";
    };
    field.onkeydown = (e) => {
      if (e.key === "Enter" && searchHits()[0]) {
        e.preventDefault();
        locate(searchHits()[0]);
      } else if (e.key === "Escape") results.hidden = true;
    };

    document.addEventListener("pointerdown", (e) => {
      if (!e.target.closest(".placeFinder")) results.hidden = true;
    });
    function animateStop(id) {
      const node = pinMarkers.get(id)?.getElement()?.firstElementChild;
      if (node) {
        node.classList.remove("pop");
        void node.offsetWidth;
        node.classList.add("pop");
      }
    }
    function positionDot() {
      const leg = activeLegs[state.step];
      if (!leg) {
        red.setLatLng(ll(last(state.path)));
        return;
      }
      const target = state.fraction * leg.real;
      let lo = 1,
        hi = leg.acc.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (leg.acc[mid] < target) lo = mid + 1;
        else hi = mid;
      }
      const a = leg.coords[lo - 1],
        b = leg.coords[lo],
        q = (target - leg.acc[lo - 1]) / (leg.acc[lo] - leg.acc[lo - 1] || 1);
      red.setLatLng([a[0] + (b[0] - a[0]) * q, a[1] + (b[1] - a[1]) * q]);
    }
    function fit() {
      if (activeLegs.length) {
        const small = map.getSize().x < 600;
        map.fitBounds(L.latLngBounds(activeLegs.flatMap((l) => l.coords)), {
          paddingTopLeft: small ? [39, 68] : [76, 72],
          paddingBottomRight: small ? [59, 52] : [73, 59],
          maxZoom: 15,
          animate: false,
        });
      }
    }
    function pause() {
      active = false;
      clearTimeout(waitAtStop);
      cancelAnimationFrame(frame);
      el("play").textContent =
        state.step === state.path.length - 1
          ? "↻ 再预演"
          : state.fraction || state.step
            ? "▷ 继续预演"
            : "▷ 预演路线";
    }
    function toggle() {
      if (active) {
        pause();
        persist();
        return;
      }
      if (map.getZoom() < 13) fit();
      if (!activeLegs.length) return;
      if (state.step >= activeLegs.length) {
        state.step = 0;
        state.fraction = 0;
      }
      el("pick").hidden = true;
      active = true;
      el("play").textContent = "暂停预演";
      function runLeg() {
        if (!active) return;
        const start = performance.now(),
          base = state.fraction,
          duration = Math.min(9500, Math.max(2400, activeLegs[state.step].real * 2));
        function tick(now) {
          if (!active) return;
          state.fraction = Math.min(1, base + (now - start) / duration);
          positionDot();
          const pos = red.getLatLng();
          discoverAround([pos.lat, pos.lng], state.step, state.fraction * activeLegs[state.step].real);
          if (state.fraction < 1) {
            frame = requestAnimationFrame(tick);
            return;
          }
          state.step++;
          state.fraction = 0;
          const id = state.path[state.step];
          animateStop(id);
          select(id);
          persist();
          el("notice").textContent = "预演抵达" + places[id].n;
          if (state.step >= activeLegs.length) {
            pause();
            return;
          }
          waitAtStop = setTimeout(() => {
            if (active) {
              el("pick").hidden = true;
              runLeg();
            }
          }, 1250);
        }
        frame = requestAnimationFrame(tick);
      }
      runLeg();
    }
    function rebuild() {
      if (el("nearbyStop")) el("nearbyStop").hidden = true;
      pause();
      activeLegs = [];
      for (const id of Object.keys(state.pins)) {
        if (!state.path.includes(id) && !editSnapshot?.path.includes(id) && id !== selected) {
          delete places[id];
          delete state.pins[id];
        }
      }
      lineLayer.clearLayers();
      pinLayer.clearLayers();
      pinMarkers.clear();
      const path = state.path,
        ids = Object.keys(places);
      options(el("origin"), ids, path[0]);
      options(el("dest"), ids, last(path));
      ids.forEach(marker);
      el("notice").textContent = "";
      try {
        activeLegs = path.slice(1).map((k, i) => routeLeg(path[i], k));
        for (const leg of activeLegs) {
          L.polyline(leg.coords, { color: "#fffdf7", weight: 8, opacity: 0.93, interactive: false }).addTo(
            lineLayer,
          );
          for (const piece of leg.pieces) {
            if (piece.coords.length < 2) continue;
            L.polyline(piece.coords, {
              color: piece.type === "rail" ? "#b44239" : "#d54537",
              weight: piece.type === "rail" ? 5 : 4.5,
              opacity: 0.95,
              dashArray: piece.type === "ferry" ? "7 8" : piece.type === "access" ? "2 4" : null,
              interactive: false,
            }).addTo(lineLayer);
            if (piece.type === "rail")
              L.polyline(piece.coords, {
                color: "#ffdfcb",
                weight: 1.4,
                dashArray: "2 9",
                interactive: false,
              }).addTo(lineLayer);
          }
        }
        const km = activeLegs.reduce((sum, l) => sum + l.real, 0) / 1000,
          mins = activeLegs.reduce((sum, l) => sum + l.minutes, 0);
        const foot = activeLegs.reduce((sum, l) => sum + l.foot, 0);
        const dwell = path.slice(0, -1).reduce((sum, k) => sum + stay(k), 0);
        const summary = el("summary");
        summary.replaceChildren();
        const strong = document.createElement("strong"),
          small = document.createElement("small");
        strong.textContent = "约 " + (mins + dwell) + " 分钟";
        small.textContent =
          km.toFixed(1) +
          " 公里 · " +
          (routeMode === "transit"
            ? "地面步行 " + prettyDistance(foot)
            : routeMode === "walk"
              ? "全程步行"
              : activeLegs.some((l) => l.water.length)
                ? "含轮渡"
                : "步行") +
          (dwell ? " · 含停留 " + dwell + " 分钟" : "");
        summary.append(strong, small);
        const caveat = serviceEstimate(activeLegs, path, state.departure, state.dwell);
        if (caveat) {
          const note = document.createElement("small");
          note.className = "nightService";
          note.textContent = caveat;
          summary.append(note);
        }
        paintTransport();
        positionDot();
        fit();
        organize();
      } catch (e) {
        el("summary").textContent = e.message;
        el("play").disabled = true;
      }
      el("play").disabled = el("startNav").disabled = !activeLegs.length;
      drawExtras();
    }
    function choose(k, kind) {
      if (!k) return;
      remember();
      if (kind === "via" && !state.path.includes(k))
        state.dwell[k] = journal[k] ? Math.min(journal[k].minutes, 30) : 0;
      if (setPoint(k, kind)) {
        activeGuideLeg = activeGuideStep = 0;
        el("pick").hidden = true;
        planChanged(k);
      } else el("notice").textContent = "请选择其他地点。";
    }
    el("origin").onchange = (e) => choose(e.target.value, "start");
    el("dest").onchange = (e) => choose(e.target.value, "end");
    document
      .querySelectorAll("[data-set]")
      .forEach((b) => (b.onclick = () => choose(selected, b.dataset.set)));
    el("dismiss").onclick = () => (el("pick").hidden = true);
    el("openCard").onclick = () => openBook(selected);
    el("pickPostcard").onclick = () => go("postcard", selected);
    el("fit").onclick = fit;
    el("play").onclick = toggle;
    let redClick = 0,
      redTime = 0;
    red.on("click", () => {
      if (following) {
        showGuide();
        if (!el("directionPanel").open) el("directionPanel").showModal();
        return;
      }
      const now = performance.now(),
        id = state.path[state.step];
      if (redClick && now - redTime < 440) {
        clearTimeout(redClick);
        redClick = 0;
        openBook(id);
        return;
      }
      redTime = now;
      if (!active) select(id);
      redClick = setTimeout(() => {
        redClick = 0;
        toggle();
      }, 405);
    });
    red.on("dblclick", () => {
      clearTimeout(redClick);
      redClick = 0;
      openBook(state.path[state.step]);
    });
    const guideLocation = (() => {
      if (!window.GuideGps) return navigator.geolocation;
      const jobs = new Map();
      let seq = 0;
      function cancel(key) {
        const job = jobs.get(key);
        if (job) clearTimeout(job.timer);
        jobs.delete(key);
        window.GuideGps.cancel(key);
      }
      function request(ok, bad, options, watch) {
        const key = "gps" + Date.now().toString(36) + "_" + (++seq).toString(36);
        const job = { ok, bad, watch, timer: 0 };
        jobs.set(key, job);
        job.timer = setTimeout(() => {
          if (!watch) cancel(key);
          bad({ code: 3 });
        }, options?.timeout || 18000);
        window.GuideGps.request(key, watch);
        return key;
      }
      window.receiveGuideLocation = (key, position, error) => {
        const j = jobs.get(key);
        if (!j) return;
        clearTimeout(j.timer);
        if (error) {
          if (j.watch && (error === 2 || error === 3)) {
            j.bad({ code: error });
            j.timer = setTimeout(() => {
              if (jobs.has(key)) window.GuideGps.request(key, true);
            }, 3500);
          } else {
            jobs.delete(key);
            j.bad({ code: error });
          }
          return;
        }
        if (!j.watch) jobs.delete(key);
        j.ok(position);
      };
      window.addEventListener("pagehide", () => {
        for (const k of jobs.keys()) cancel(k);
      });
      return {
        getCurrentPosition: (ok, bad, opts) => request(ok, bad, opts, false),
        watchPosition: (ok, bad, opts) => request(ok, bad, opts, true),
        clearWatch: cancel,
      };
    })();

    let interest = state.interest || "any",
      activeGuideLeg = 0,
      activeGuideStep = 0,
      watch = null,
      gpsMarker = null,
      lastFix = null,
      autoProgress = 0,
      activeOpen = false,
      pendingPin = null,
      editSnapshot = null;
    const interestName = { any: "顺路", photo: "拍照", food: "小吃", water: "水景" };
    function message(text) {
      el("notice").textContent = text;
    }
    function remember() {
      editSnapshot = {
        path: [...state.path],
        dwell: { ...state.dwell },
        mode: state.mode,
        visitEnd: state.visitEnd,
      };
    }
    function undo() {
      if (!editSnapshot) return;
      const previous = editSnapshot;
      editSnapshot = null;
      state.dwell = previous.dwell;
      state.mode = previous.mode;
      state.visitEnd = previous.visitEnd;
      routeMode = state.mode;
      assign(previous.path);
      rebuild();
    }
    function planChanged(id, text) {
      clearTimeout(redClick);
      redClick = 0;
      activeGuideLeg = activeGuideStep = autoProgress = 0;
      guideUsed = false;
      lastArrival = null;
      el("arrivalBook").hidden = true;
      endFollowing();
      stopWatch();
      rebuild();
      if (id) {
        select(id);
        animateStop(id);
        el("pick").hidden = true;
      }
      message(text || "路线已重算。");
      host.cue((text || "路线已重算。") + "预计 " + clock(last(schedule())) + " 到终点。");
    }
    function applyVia(id, at, stopMinutes) {
      if (state.path.includes(id)) {
        message("这站已经在你的路线里。");
        return;
      }
      remember();
      const path = [...state.path];
      path.splice(at, 0, id);
      state.dwell[id] = stopMinutes;
      assign(path);
      planChanged(id, "已加入" + places[id].n + "，预计停留 " + stopMinutes + " 分钟。");
    }
    function sample() {
      remember();
      state.mode = routeMode = "transit";
      state.dwell = { ...state.dwell, optic: 15, hym: 25, jh: 35, riverpark: 25, hustgate: 0 };
      state.visitEnd = "riverpark";
      assign([...demoPath]);
      planChanged(null, "已排好五站。你可以在地图上增加或换掉任何一站。");
    }
    function drawExtras() {
      for (const b of document.querySelectorAll("[data-mode]")) {
        b.classList.toggle("on", b.dataset.mode === routeMode);
        b.setAttribute("aria-pressed", b.dataset.mode === routeMode);
      }
      for (const b of document.querySelectorAll("[data-interest]")) {
        b.classList.toggle("on", b.dataset.interest === interest);
        b.setAttribute("aria-pressed", b.dataset.interest === interest);
      }
      const chips = el("viaChips");
      chips.replaceChildren();
      state.path.slice(1, -1).forEach((id) => {
        const btn = document.createElement("button");
        btn.textContent = places[id].n + " ×";
        btn.setAttribute("aria-label", "移除途经点" + places[id].n);
        btn.onclick = () => {
          remember();
          assign(state.path.filter((k) => k !== id));
          planChanged(null, "已移除" + places[id].n);
        };
        chips.append(btn);
      });
      if (editSnapshot) {
        const b = document.createElement("button");
        b.className = "undo";
        b.textContent = "撤销上次更改";
        b.onclick = undo;
        chips.append(b);
      }
      const wrap = el("suggestions");
      wrap.replaceChildren();
      for (const entry of suggestionsFor(state.path, interest, routeMode)) {
        const { id, extra, stay } = entry,
          p = places[id],
          row = document.createElement("article");
        row.className = "suggestRow";
        const open = document.createElement("button");
        open.className = "sightOpen";
        open.title = "查看" + p.n + "的位置";
        const img = new Image();
        img.src = p.art;
        img.alt = "";
        const copy = document.createElement("span"),
          title = document.createElement("b"),
          reason = document.createElement("small");
        title.textContent = p.n;
        reason.textContent = (extra ? "多走约 " + extra + " 分钟" : "沿当前线路") + " · 逛 " + stay + " 分钟";
        copy.append(title, reason);
        open.append(img, copy);
        open.onclick = () => {
          map.setView(ll(id), 15, { animate: false });
          select(id);
          animateStop(id);
          if (innerWidth <= 800) el("map").scrollIntoView({ block: "center", behavior: "smooth" });
        };
        const add = document.createElement("button");
        add.className = "addSuggest";
        add.textContent = "＋";
        add.setAttribute("aria-label", "把" + p.n + "加入路线");
        add.onclick = () => applyVia(id, entry.at, stay);
        row.append(open, add);
        wrap.append(row);
      }
    }
    const encounterPool = [...new Set([...foodIds, ...waterIds, ...photoIds])];
    let encounterId = null,
      encounterAt = 0,
      lastEncounterCheck = 0,
      encounterLeg = -1;
    function discoverAround(pos, index, progress, realTime = false) {
      const wall = performance.now();
      if (!realTime && wall - lastEncounterCheck < 320) return;
      lastEncounterCheck = wall;
      const route = activeLegs[index];
      if (!route) return;
      const airborne = route.steps.some(
        (s) =>
          (s.type === "rail" || s.type === "ferry") && progress > s.startM + 40 && progress < s.endM - 65,
      );
      if (airborne) {
        el("nearbyStop").hidden = true;
        return;
      }
      const pool = { photo: photoIds, food: foodIds, water: waterIds }[interest] || encounterPool;
      const candidates = [...pool]
        .filter((k) => !state.path.includes(k))
        .map((k) => [k, meters(pos, ll(k))])
        .filter((v) => v[1] < 220)
        .sort((a, b) => a[1] - b[1]);
      if (!candidates.length) {
        el("nearbyStop").hidden = true;
        return;
      }
      const [id, dist] = candidates[0];
      if (encounterId !== id || encounterLeg !== index || el("nearbyStop").hidden) {
        encounterId = id;
        encounterLeg = index;
        encounterAt = wall;
        animateStop(id);
        el("nearbyStop").classList.remove("bloom");
        void el("nearbyStop").offsetWidth;
        el("nearbyStop").classList.add("bloom");
      }
      el("nearbyStop").hidden = false;
      el("nearThumb").src = places[id].art;
      el("nearName").textContent = places[id].n;
      el("nearRange").textContent = (realTime ? "附近" : "预演沿途") + " · 约 " + prettyDistance(dist);
    }
    el("nearRead").onclick = () => {
      if (encounterId) go("postcard", encounterId);
    };
    el("nearAdd").onclick = () => {
      const id = encounterId;
      if (!id || state.path.includes(id)) return;
      const index = Math.max(1, Math.min(state.path.length - 1, encounterLeg + 1));
      applyVia(id, index, Math.min(25, journal[id].minutes));
      el("nearbyStop").hidden = true;
    };

    let following = false,
      guideUsed = false,
      lastArrival = null;
    el("arrivalBook").onclick = () => {
      const k = state.path[activeGuideLeg + 1];
      if (places[k]?.art) go("postcard", k);
    };
    function guideViewport() {
      const step = activeLegs[activeGuideLeg]?.steps[activeGuideStep],
        leg = activeLegs[activeGuideLeg];
      if (!leg) return;
      const title = step ? stepText(step) : { kind: "步行", title: "到达目的地", detail: "" };
      el("followKind").textContent = activeGuideLeg + 1 + " / " + activeLegs.length + " 段 · " + title.kind;
      el("followName").textContent = title.title;
      el("followDetail").textContent = title.detail;
      el("mapNext").textContent = el("nextStep").textContent;
      if (!following) return;
      const start = step?.startM || 0,
        end = step?.endM || leg.real;
      const view = leg.coords.filter((p, i) => leg.acc[i] >= start - 1 && leg.acc[i] <= end + 1);
      if (watch !== null && lastFix) {
        map.panTo(lastFix, { animate: false });
        return;
      }
      const pad =
        innerWidth < 801
          ? { paddingTopLeft: [28, 65], paddingBottomRight: [45, 150] }
          : { padding: [65, 70] };
      if (view.length > 1) map.fitBounds(L.latLngBounds(view), { ...pad, maxZoom: 17, animate: false });
      else map.setView(view[0] || leg.coords[0], 16, { animate: false });
    }
    function endFollowing() {
      if (!following) return;
      following = false;
      document.body.classList.remove("following");
      el("followBox").hidden = true;
      stopWatch();
      requestAnimationFrame(() => {
        map.invalidateSize({ pan: false });
        fit();
      });
    }
    el("followMap").onclick = () => {
      following = true;
      el("directionPanel").close();
      el("pick").hidden = true;
      el("followBox").hidden = false;
      document.body.classList.add("following");
      el("map").scrollIntoView({ block: "start" });
      requestAnimationFrame(() => {
        map.invalidateSize({ pan: false });
        guideViewport();
      });
    };
    el("mapNext").onclick = () => {
      nextGuide();
      if (following) guideViewport();
    };
    el("mapDetails").onclick = () => {
      showGuide();
      el("directionPanel").showModal();
    };
    el("endFollow").onclick = endFollowing;
    el("mapGps").onclick = () => el("watchGps").click();
    el("replanFix").onclick = () => {
      if (!lastFix) return;
      const id = localPin(lastFix, "我的位置");
      if (!id) return;
      const remain = state.path.slice(activeGuideLeg + 1).filter((k) => k !== id);
      if (!remain.length) return;
      remember();
      assign([id, ...remain]);
      endFollowing();
      if (el("directionPanel").open) el("directionPanel").close();
      planChanged(id, "已从当前位置重算剩余路线。");
      el("replanFix").hidden = true;
    };
    function paintTransport() {
      const stations = new Map();
      for (const [index, leg] of activeLegs.entries()) {
        if (leg.real > 500 && activeLegs.length <= 8) {
          const mark = leg.real * (index % 2 ? 0.6 : 0.43);
          let i = 1;
          while (i < leg.acc.length - 1 && leg.acc[i] < mark) i++;
          const a = leg.coords[i - 1],
            b = leg.coords[i],
            bearing = (Math.atan2((b[1] - a[1]) * 95750, (b[0] - a[0]) * 111000) * 180) / Math.PI;
          const arrow = L.divIcon({
            className: "travelArrow",
            html: '<i style="transform:rotate(' + Math.round(bearing) + 'deg)"></i>',
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          });
          L.marker(b, { icon: arrow, interactive: false, keyboard: false, zIndexOffset: -600 }).addTo(
            lineLayer,
          );
        }
        for (const s of leg.steps) {
          if (s.type !== "rail") continue;
          for (const name of [s.from, s.to]) {
            const key = name,
              xy = railData.lines[s.line].stations[name];
            if (!xy) continue;
            if (!stations.has(key)) stations.set(key, { xy, lines: new Set(), leg: index });
            stations.get(key).lines.add(lineName(s.line));
          }
        }
      }
      for (const [name, v] of stations) {
        const m = L.circleMarker(v.xy, {
          radius: v.lines.size > 1 ? 6 : 4,
          color: "#88422f",
          weight: 2,
          fill: true,
          fillColor: "#fffdf0",
          fillOpacity: 1,
          pane: "overlayPane",
          interactive: true,
        }).addTo(lineLayer);
        m.bindTooltip(name + " · " + [...v.lines].join(" / "), { direction: "top", className: "stationTip" });
        m.on("click", () => {
          activeGuideLeg = v.leg;
          activeGuideStep = Math.max(
            0,
            activeLegs[v.leg].steps.findIndex((s) => s.type === "rail" && (s.from === name || s.to === name)),
          );
          showGuide();
          if (!el("directionPanel").open) el("directionPanel").showModal();
        });
      }
    }

    el("demo").onclick = sample;
    el("swap").onclick = () => {
      remember();
      assign([...state.path].reverse());
      planChanged();
    };
    document.querySelectorAll("[data-mode]").forEach(
      (b) =>
        (b.onclick = () => {
          if (routeMode === b.dataset.mode) return;
          remember();
          routeMode = state.mode = b.dataset.mode;
          assign([...state.path]);
          planChanged();
        }),
    );
    document.querySelectorAll("[data-interest]").forEach(
      (b) =>
        (b.onclick = () => {
          interest = state.interest = b.dataset.interest;
          persist();
          drawExtras();
        }),
    );
    function localPin(pos, name) {
      if (!bounds.contains(pos)) return null;
      const near = snap(pos);
      if (near.d > 350) return null;
      const match = Object.keys(state.pins).find(
        (k) => places[k] && meters(places[k].ll, pos) < 3 && (!name || places[k].n === name),
      );
      if (match) return match;
      timeRows.clear();
      const id = "p" + (Math.max(0, ...Object.keys(state.pins).map((k) => Number(k.slice(1)) || 0)) + 1);
      places[id] = { n: name || "自选地点 " + id.slice(1), ll: pos, snap: near, t: "自选" };
      state.pins[id] = { ll: pos, n: places[id].n };
      return id;
    }
    function stopWatch() {
      if (watch !== null) {
        guideLocation.clearWatch(watch);
        watch = null;
      }
      if (el("watchGps")) el("watchGps").textContent = "跟随我的位置";
      if (el("mapGps")) el("mapGps").textContent = "定位跟随";
    }
    function gpsFailure(err, continuous = false) {
      const desc =
        err.code === 1
          ? "未获得定位授权，可以在地图上点选当前位置。"
          : err.code === 3
            ? "定位超时，可到开阔处重试。"
            : "设备暂时没有提供位置，可在地图上手选。";
      message(desc);
      el("gpsStatus").textContent = desc;
      el("followPosition").textContent = desc;
      if (!continuous || err.code === 1 || err.code === 4) stopWatch();
    }
    function showFix(fix) {
      const pos = [fix.coords.latitude, fix.coords.longitude];
      if (!bounds.contains(pos)) {
        message("当前位置在武汉导览范围以外。");
        el("followPosition").textContent = el("gpsStatus").textContent = "当前位置在武汉导览范围以外。";
        return null;
      }
      lastFix = pos;
      if (!gpsMarker)
        gpsMarker = L.circleMarker(pos, {
          radius: 8,
          color: "white",
          weight: 3,
          fillColor: "#2684ae",
          fillOpacity: 1,
          interactive: false,
        }).addTo(map);
      else gpsMarker.setLatLng(pos);
      return pos;
    }
    el("gps").onclick = () => {
      if (!guideLocation) {
        message("当前浏览器无法定位，可点地图选择起点。");
        return;
      }
      message("正在定位…");
      guideLocation.getCurrentPosition(
        (fix) => {
          const pos = showFix(fix);
          if (!pos) return;
          map.setView(pos, 16);
          const id = localPin(pos, "我的位置");
          if (id) {
            if (!pinMarkers.has(id)) marker(id);
            select(id);
            message("已找到你的位置，点「从这出发」重算。");
          } else message("已定位，附近暂无可通行路网。");
        },
        gpsFailure,
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    };
    function showGuide() {
      guideUsed = true;
      const leg = activeLegs[activeGuideLeg];
      if (!leg) return;
      const chooser = el("legChoice");
      chooser.replaceChildren(
        ...activeLegs.map(
          (_, i) =>
            new Option(i + 1 + ". " + places[state.path[i]].n + " → " + places[state.path[i + 1]].n, i),
        ),
      );
      chooser.value = activeGuideLeg;
      chooser.onchange = () => {
        activeGuideLeg = Number(chooser.value);
        activeGuideStep = 0;
        autoProgress = 0;
        showGuide();
      };
      const a = state.path[activeGuideLeg],
        b = state.path[activeGuideLeg + 1],
        wrap = el("guideContents");
      wrap.replaceChildren();
      const top = document.createElement("div");
      top.className = "guideSummary";
      const no = document.createElement("small"),
        name = document.createElement("h3"),
        stats = document.createElement("p");
      no.textContent = "第 " + (activeGuideLeg + 1) + " 段 / " + activeLegs.length;
      name.textContent = places[a].n + " → " + places[b].n;
      stats.textContent = "约 " + leg.minutes + " 分钟 · 地面步行 " + prettyDistance(leg.foot);
      top.append(no, name, stats);
      wrap.append(top);
      const steps = leg.steps.length ? leg.steps : [{ type: "walk", distance: leg.real, roads: [] }];
      steps.forEach((s, i) => {
        const row = displayStep(s);
        row.classList.toggle("now", i === activeGuideStep);
        row.classList.toggle("done", i < activeGuideStep);
        wrap.append(row);
      });
      const prev = document.createElement("button");
      prev.className = "prevStep";
      prev.textContent = "← 上一步";
      prev.disabled = !activeGuideLeg && !activeGuideStep;
      prev.onclick = () => {
        if (activeGuideStep) activeGuideStep--;
        else {
          activeGuideLeg--;
          activeGuideStep = Math.max(0, activeLegs[activeGuideLeg].steps.length - 1);
          autoProgress = 0;
        }
        showGuide();
      };
      wrap.append(prev);
      const relay = document.createElement("a");
      relay.className = "relay";
      relay.textContent = "在高德查看本段 ↗";
      relay.href = amapLegUrl(a, b, leg);
      relay.target = "_blank";
      relay.rel = "noopener noreferrer";
      wrap.append(relay);
      el("nextStep").textContent =
        activeGuideStep < steps.length - 1
          ? "下一步 →"
          : activeGuideLeg < activeLegs.length - 1
            ? "抵达，去下一站 →"
            : "结束导览";
      guideViewport();
      host.refresh();
    }
    function nextGuide() {
      const leg = activeLegs[activeGuideLeg];
      if (activeGuideStep < leg.steps.length - 1) activeGuideStep++;
      else if (activeGuideLeg < activeLegs.length - 1) {
        activeGuideLeg++;
        activeGuideStep = 0;
        autoProgress = 0;
        lastArrival = null;
        el("arrivalBook").hidden = true;
        animateStop(state.path[activeGuideLeg]);
      } else {
        endFollowing();
        stopWatch();
        if (el("directionPanel").open) el("directionPanel").close();
        message("已走完路线，抵达" + places[last(state.path)].n + "。");
        host.cue("这一程走完啦，一起看看" + places[last(state.path)].n + "？");
        activeGuideLeg = activeGuideStep = 0;
        guideUsed = false;
        state.guided = null;
        persist();
        return;
      }
      showGuide();
    }
    el("nextStep").onclick = nextGuide;
    el("startNav").onclick = () => {
      if (!activeLegs.length) return;
      guideUsed = true;
      pause();
      activeGuideLeg = Math.min(activeGuideLeg, activeLegs.length - 1);
      activeGuideStep = Math.min(activeGuideStep, Math.max(0, activeLegs[activeGuideLeg].steps.length - 1));
      showGuide();
      el("gpsStatus").textContent =
        serviceEstimate(activeLegs, state.path, state.departure, state.dwell) ||
        "行程为离线估算，换乘看站内标识。";
      el("directionPanel").showModal();
    };
    el("watchGps").onclick = () => {
      if (watch !== null) {
        stopWatch();
        el("followPosition").textContent = el("gpsStatus").textContent = "已暂停位置跟随。";
        return;
      }
      if (!guideLocation) {
        el("gpsStatus").textContent = "此设备暂不能提供定位。";
        return;
      }
      el("followPosition").textContent = "正在等候设备定位…";
      el("watchGps").textContent = "暂停位置跟随";
      el("mapGps").textContent = "暂停跟随";
      el("gpsStatus").textContent = "正在等候设备定位…";
      watch = guideLocation.watchPosition(
        (fix) => {
          const pos = showFix(fix);
          if (!pos) return;
          const leg = activeLegs[activeGuideLeg];
          if (!leg) return;
          const accuracy = Math.round(fix.coords.accuracy || 100);
          if (accuracy > 150) {
            el("followPosition").textContent = el("gpsStatus").textContent =
              "定位精度约 " + accuracy + " 米，暂不判断到站。";
            return;
          }
          const nearest = nearestAlong(pos, leg, autoProgress),
            remaining = leg.real - nearest.along;
          if (nearest.distance > Math.max(100, accuracy * 2)) {
            el("gpsStatus").textContent = "已偏离红线，可用当前位置重新规划。";
            el("followPosition").textContent = "已偏离红线，打开整段指引可重算。";
            el("replanFix").hidden = false;
            return;
          }
          discoverAround(pos, activeGuideLeg, nearest.along, true);
          el("replanFix").hidden = true;
          autoProgress = Math.max(autoProgress, nearest.along);
          if (following) red.setLatLng(pos);
          if (remaining < 65) {
            const stop = state.path[activeGuideLeg + 1];
            if (lastArrival !== stop) {
              lastArrival = stop;
              animateStop(stop);
            }
            el("arrivalBook").hidden = !places[stop].art;
          } else el("arrivalBook").hidden = true;
          const autoStep = leg.steps.findIndex(
            (step) => step.endM >= autoProgress && step.endM > step.startM,
          );
          if (autoStep >= 0 && autoStep > activeGuideStep) {
            activeGuideStep = autoStep;
            showGuide();
          }
          el("gpsStatus").textContent =
            remaining < 65
              ? "已接近" + places[state.path[activeGuideLeg + 1]].n + "，到达后点下一步。"
              : "距本段终点约 " + prettyDistance(remaining) + " · 定位精度 " + accuracy + " 米";
          el("followPosition").textContent = el("gpsStatus").textContent;
          if (following) map.panTo(pos, { animate: false });
        },
        (err) => gpsFailure(err, true),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 8000 },
      );
    };
    document.querySelectorAll("[data-close]").forEach((b) => (b.onclick = () => el(b.dataset.close).close()));
    el("directionPanel").addEventListener("close", () => {
      if (!following) stopWatch();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopWatch();
    });
    function chatLine(text, who = "bird", actions = []) {host.line(text, who, actions);}
    function placeIn(text) {
      const normalize = (s) => s.replace(/[·\s，。！？]/g, "").toLowerCase();
      const t = normalize(text);
      let best = "",
        score = 0;
      for (const id of original) {
        const p = places[id];
        const words = [p.n, ...p.n.split(/\s*·\s*/), ...(p.aliases || "").split(/\s+/)].map(normalize);
        for (const word of words) {
          if (word.length < 2 || !t.includes(word)) continue;
          const weight = word.length + (normalize(p.n) === word ? 0.15 : 0);
          if (weight > score) {
            score = weight;
            best = id;
          }
        }
      }
      return best;
    }
    function mentionedPlaces(text) {
      const options = [];
      const cut = (v) => v.toLowerCase().replace(/[·\s]/g, "");
      const value = cut(text);
      for (const id of Object.keys(places)) {
        const p = places[id];
        const words = new Set([p.n, ...p.n.split(/\s*·\s*/), ...(p.aliases || "").split(/\s+/)].map(cut));
        for (const word of words) {
          if (
            word.length < 2 ||
            [
              "江景",
              "江边",
              "校园",
              "小吃",
              "早餐",
              "过早",
              "拍照",
              "看江",
              "地铁",
              "湖边",
              "湖心亭",
              "城堡",
              "广场",
              "樱花",
              "长江",
              "森林",
            ].includes(word)
          )
            continue;
          let pos = value.indexOf(word);
          if (pos < 0) continue;
          options.push({ id, at: pos, end: pos + word.length, len: word.length, exact: cut(p.n) === word });
        }
      }
      options.sort((a, b) => b.len - a.len || Number(b.exact) - Number(a.exact) || a.at - b.at);
      const used = [];
      for (const v of options) {
        if (used.some((t) => (t.at < v.end && v.at < t.end) || t.id === v.id)) continue;
        used.push(v);
      }
      return used.sort((a, b) => a.at - b.at).map((p) => p.id);
    }
    function languageRoute(q) {
      if (!/从|我在|我现在在|起点|出发地/.test(q) || !/去|到|终点|目的地|结束/.test(q)) return null;
      const pts = mentionedPlaces(q);
      if (pts.length < 2) return null;
      const start = pts[0];
      let goal = pts[pts.length - 1];
      const explicit = q.match(
        /(?:最终去|最终到|最后再去|最后去|最后到|终点(?:是|在|放在|定在)?|目的地(?:是|在)?|想要去|想去)([^，,。；;]+)/,
      );
      if (explicit) {
        const dest = mentionedPlaces(explicit[1])[0];
        if (dest && dest !== start) goal = dest;
      } else {
        const firstLeg = q.match(/(?:从|我现在在|我在|起点)(.+?)(?:到|去)(.+?)(?=[，,。；;]|$)/);
        if (firstLeg && /(?:途经|经过|路过|顺路去)/.test(q.slice(firstLeg.index + firstLeg[0].length))) {
          const ids = mentionedPlaces(firstLeg[2]);
          if (ids[0] && ids[0] !== start) goal = ids[0];
        }
      }
      return [start, ...pts.filter((id) => id !== start && id !== goal), goal];
    }
    function chatEdit(q) {
      const ids = mentionedPlaces(q);
      const recent = state.chatPlace && places[state.chatPlace] ? state.chatPlace : null;
      if (/(?:删掉|删除|移除|不去|跳过|去掉|取消这站)/.test(q)) {
        const id = ids[0] || recent;
        if (!id || !state.path.slice(1, -1).includes(id)) {
          chatLine("这站未在途经点里。告诉我要去掉哪个中途停留，或者直接点地图下方的站名。");
          return true;
        }
        const next = state.path.filter((k) => k !== id);
        chatLine("去掉" + places[id].n + "后，预计 " + clock(last(schedule(next))) + " 到终点。", "bird", [
          [
            "去掉这一站",
            () => {
              if (!state.path.slice(1, -1).includes(id)) {
                chatLine("这站已移除。");
                return;
              }
              remember();
              assign(state.path.filter((k) => k !== id));
              planChanged();
              chatLine("已重算剩下的路线。");
            },
          ],
        ]);
        return true;
      }
      const mode = /改.*轮渡|想坐船|换.*轮渡|坐船过江/.test(q)
        ? "ferry"
        : /只.*走路|只步行|全程步行|不要.*地铁/.test(q)
          ? "walk"
          : /改.*地铁|换.*地铁|地铁优先/.test(q)
            ? "transit"
            : null;
      if (mode) {
        const route = state.path.map((k) => places[k].n).join(" → ");
        chatLine(
          "按" +
            { ferry: "步行和可用轮渡", walk: "步行", transit: "地铁优先" }[mode] +
            "重算 " +
            route +
            "，各站停留照旧。",
          "bird",
          [
            [
              "切换出行方式",
              () => {
                remember();
                routeMode = state.mode = mode;
                assign([...state.path]);
                planChanged();
                chatLine("已更新，预计 " + clock(last(schedule())) + " 到终点。");
              },
            ],
          ],
        );
        return true;
      }
      if (/(?:加入|加上|加个|加一站|顺便去|路过一下|那就去|就去这|带我去)/.test(q) && !/^从|我在/.test(q)) {
        const id = ids[0] || recent;
        if (!id) return false;
        const place = places[id],
          v = insertAtBest(state.path, id, routeMode);
        if (!v) {
          chatLine(place.n + "已经在路线中了。");
          return true;
        }
        const stay = Math.min(30, journal[id]?.minutes || 15);
        chatLine(
          "把" +
            place.n +
            "排在" +
            places[state.path[v.at - 1]].n +
            "之后，在途约多 " +
            v.extra +
            " 分钟，再留 " +
            stay +
            " 分钟游览。",
          "bird",
          [
            [
              "加入这站",
              () => {
                const now = insertAtBest(state.path, id, routeMode);
                if (now) {
                  applyVia(id, now.at, stay);
                  state.chatPlace = id;
                  chatLine("已加入，预计 " + clock(last(schedule())) + " 到终点。");
                } else chatLine("这站已在行程中。");
              },
            ],
          ],
        );
        return true;
      }
      if (
        /(?:加|留|停|逛).*(?:分钟|小时)/.test(q) &&
        ids.length &&
        state.path.includes(ids[0]) &&
        !/还能|有空|来得及/.test(q)
      ) {
        const mins = durationFromText(q);
        if (mins !== null && mins >= 0 && mins <= 720) {
          const id = ids[0];
          chatLine("把" + places[id].n + "的停留设成 " + mins + " 分钟？", "bird", [
            [
              "调整停留",
              () => {
                remember();
                state.dwell[id] = mins;
                if (id === last(state.path)) state.visitEnd = id;
                assign([...state.path]);
                planChanged();
                chatLine("已记录 " + mins + " 分钟停留。");
              },
            ],
          ]);
          return true;
        }
      }
      return false;
    }

    function sendChat(input) {
      const raw = input.trim();
      if (!raw) return;

      const q = normalSpeech(raw);
      const eventTimes = [...q.matchAll(/(上午|早上|中午|下午|傍晚|晚上|凌晨)?\s*(\d{1,2})\s*[:：点时]\s*(\d{1,2})?/g)].map(m => {
        let h=Number(m[2]);const min=Number(m[3]||0);
        if (/下午|傍晚|晚上/.test(m[1]||"") && h<12) h+=12;
        if(m[1]==="中午"&&h<5)h+=12;
        return {valid:h<24&&min<60,time:h*60+min,departure:/^(?:钟|左右)?(?:从[^，。；,]{0,16})?(?:出发|动身)/.test(q.slice(m.index+m[0].length))};
      });
      const appointment=eventTimes.find(t=>!t.departure), depart=eventTimes.find(t=>t.departure);
      if (appointment && /看比赛|观赛|开幕|现场接单|平和打包厂|智民里/.test(q)) {
        if (!appointment.valid||(depart&&!depart.valid)){chatLine("这个时间我没读准，告诉我几点几分到好吗？");return;}
        const departure=depart?clock(depart.time):state.departure;
        const target = /开幕|智民里/.test(q) ? "zhimin" : "packing";
        const from = q.match(/从(.+?)(?:出发|去|到|，|,|。)/);
        const start = (from && placeIn(from[1])) || state.path[0];
        if (start === target) {chatLine("起点就在这个场地，可以直接看场地导览。","bird",[["看场地",()=>go("venue",target)]]);return;}
        const path = [start,...state.path.slice(1,-1).filter(k=>k!==start && k!==target),target];
        const end = last(schedule(path,departure)), tomorrow = /明天|次日/.test(q) ? 1 : 0;
        const deadline = appointment.time+tomorrow*1440, gap = deadline-end-state.buffer;
        chatLine("去"+places[target].n+"。按 "+departure+" 从"+places[start].n+"出发，预计 "+clock(end)+" 到。按你说的 "+clock(deadline)+" 到场，预留 "+state.buffer+" 分钟后"+(gap>=0?"还宽裕约 "+gap:"还差约 "+(-gap))+" 分钟。要按这个安排走吗？","bird",[
          ["按这条观赛路线走",()=>{remember();state.departure=departure;state.due=clock(appointment.time);state.dueDay=tomorrow;state.deadlineOn=true;assign(path);planChanged();chatLine("已经排好。想看第一段怎么走，可以问我下一步。");}],
          ["查看场地",()=>go("venue",target)]
        ]);return;
      }
      const answer = receptionAnswer(q);
      if (answer && !languageRoute(q) && !/帮我排|规划路线|改为终点|设为终点|帮我导航/.test(q)) {
        const [topic, section, reply] = answer;
        const actions = [["打开" + receptionTopics[topic].tab, () => go("reception", topic, String(section))]];
        if (topic === "saig" && section === 1) {
          actions.push(["导航到观赛点", () => { setPoint("packing", "end"); go("index"); }]);
        }
        chatLine(reply, "bird", actions);
        return;
      }
      if (/介绍武汉|认识武汉|初到武汉|武汉.*三镇|武汉为什么叫江城|第一次来武汉|武汉是什么样/.test(q)) {
        chatLine(citySpreads.overview[1], "bird", [
          ["翻开武汉导览", () => go("postcard", "wuhan")],
          ["帮我排好今天", () => initTourDialog()],
        ]);
        return;
      }
      if (chatEdit(q)) return;
      const available = durationFromText(q),
        wanted = tourTopics(q),
        parsedRoute = languageRoute(q);
      if (
        /帮我安排|排一条|帮我规划|怎么逛|顺路.*(吃|拍|江)|能不能.*(吃|逛)|想.*(吃|拍|看江).*(吃|拍|看江)/.test(
          q,
        ) ||
        (available !== null && wanted.length)
      ) {
        const fromTo = q.match(/从(.+?)(?:出发)?(?:去|到)(.+?)(?=[，,。]|$)/),
          a = fromTo ? placeIn(fromTo[1]) : null,
          b = fromTo ? placeIn(fromTo[2]) : null;
        const anchor = parsedRoute || (a && b && a !== b ? [a, b] : [...state.path]);
        const base = routeTotals(anchor, state.dwell, routeMode).total,
          spare =
            available === null
              ? 65
              : /额外|再多|多出|多留|还能用/.test(q)
                ? available
                : Math.max(0, available - base);
        chatLine(
          "我可以保留" +
            places[anchor[0]].n +
            "和" +
            places[last(anchor)].n +
            "，沿途挑" +
            (wanted.length ? wanted.map((t) => tourThemeNames[t]).join("、") : "适合停留的地方") +
            "。" +
            (available !== null ? "按你给的时间，交通和已有停留之后还能用约 " + spare + " 分钟。" : ""),
          "bird",
          [
            [
              "查看路线方案",
              () =>
                initTourDialog(anchor, {
                  budget: spare,
                  topics: wanted.length ? wanted : undefined,
                  quiet: /慢|休息/.test(q),
                  fromChat: true,
                }),
            ],
          ],
        );
        return;
      }
      if (parsedRoute) {
        const dur = routeTotals(parsedRoute, state.dwell, routeMode).total;
        chatLine(
          parsedRoute.map((k) => places[k].n).join(" → ") +
            "。按已有停留约 " +
            dur +
            " 分钟，你还可以在地图上调整每一站。",
          "bird",
          [
            [
              "按这条走",
              () => {
                remember();
                assign([...parsedRoute]);
                planChanged();
                el("birdPanel").close();
              },
            ],
            ["再挑沿途景点", () => initTourDialog(parsedRoute)],
          ],
        );
        return;
      }
      const deadline = q.match(/(\d{1,2})\s*[:：点时]\s*(\d{1,2})?/);
      if (deadline && /到|比赛|赶|前|点/.test(q)) {
        let h = Number(deadline[1]),
          m = Number(deadline[2] || 0);
        if (/下午|晚上/.test(q) && h < 12) h += 12;
        if (h < 24 && m < 60) {
          const due = h * 60 + m + (/明天|次日/.test(q) ? 1440 : 0),
            end = last(schedule()),
            gap = due - end;
          const proposed = mentionedPlaces(q).find((id) => !state.path.includes(id));
          if (proposed && /来得及|能去|还能|可以去|够不够/.test(q)) {
            const slot = insertAtBest(state.path, proposed, routeMode);
            if (slot) {
              const amount = Math.min(30, journal[proposed]?.minutes || 15),
                added = slot.extra + amount,
                spare = gap - added - (state.buffer || 0);
              chatLine(
                "去" +
                  places[proposed].n +
                  "要额外约 " +
                  slot.extra +
                  " 分钟在途，再逛 " +
                  amount +
                  " 分钟，预计 " +
                  clock(end + added) +
                  " 到终点。" +
                  (spare >= 0 ? "还能留 " + spare + " 分钟。" : "要按时到，需再腾出 " + -spare + " 分钟。"),
                "bird",
                spare >= 0
                  ? [
                      [
                        "安排这站",
                        () => {
                          const v = insertAtBest(state.path, proposed, routeMode);
                          if (v) {
                            applyVia(proposed, v.at, amount);
                            chatLine("已加到行程。");
                          }
                        },
                      ],
                    ]
                  : [["调整停留", () => go("trip")]],
              );
              return;
            }
          }
          chatLine(
            "按 " +
              state.departure +
              " 出发，算上途中停留，预计 " +
              clock(end) +
              " 到" +
              places[last(state.path)].n +
              "。" +
              (gap >= 0
                ? "距你说的时间约有 " + gap + " 分钟。"
                : "预计赶不上，要提前 " + -gap + " 分钟或减少停留。"),
            "bird",
            [
              [
                "设为最晚到达",
                () => {
                  state.due = clock(due % 1440);
                  state.deadlineOn = true;
                  state.dueDay = due >= 1440 ? 1 : 0;
                  persist();
                  chatLine("已记下 " + state.due + "；在行程里可调整各站停留。");
                },
              ],
              ["看行程", () => go("trip")],
            ],
          );
          return;
        }
      }
      const id =
        mentionedPlaces(q)[0] ||
        placeIn(q) ||
        (/这里|那里|它|这个地方|这一站|上一个/.test(q) ? state.chatPlace : null);
      if (id) {
        state.chatPlace = id;
        persist();
      }
      if (id && fieldNotes[id] && /拍照|拍哪里|取景|机位|历史|来历|为什么|特色|什么样/.test(q)) {
        const hint = /拍照|拍哪里|取景|机位/.test(q) ? fieldNotes[id][1] : fieldNotes[id][0];
        chatLine(hint, "bird", [
          ["看这张明信片", () => go("postcard", id)],
          ["打开手记", () => go("place", id)],
        ]);
        return;
      }
      if (id && /讲|介绍|好玩|怎么玩|故事|了解|有什么|哪里|好看/.test(q) && !/想吃|想拍/.test(q)) {
        chatLine(journal[id].title + "。" + journal[id].walk[0], "bird", [
          ["翻明信片", () => go("postcard", id)],
          ["看游览手记", () => go("place", id)],
        ]);
        return;
      }
      if (/换乘|下车|地铁|怎么走|路线|下一站/.test(q) && !/想吃|想拍/.test(q)) {
        const rail = activeLegs.flatMap((leg, i) =>
          leg.steps
            .filter((s) => s.type === "rail")
            .map((s) => stepText(s).kind + "从" + s.from + "到" + s.to),
        );
        chatLine(
          rail.length
            ? rail.join("；") + "。分段指引也标了步行和换乘。"
            : "这条路线按地面步行" + (routeMode === "ferry" ? "和可用轮渡" : "") + "规划。",
          "bird",
          [
            [
              "打开指引",
              () => {
                el("birdPanel").close();
                el("startNav").click();
              },
            ],
          ],
        );
        return;
      }
      if (/停留|逛多久|要多久|花多久|多长时间/.test(q) && id) {
        chatLine(
          "单逛" + places[id].n + "，可以先留 " + journal[id].minutes + " 分钟。" + journal[id].tip,
          "bird",
          [["改行程时间", () => go("trip")]],
        );
        return;
      }
      if (/换一个|下一个|还有呢|再推荐|别的呢/.test(q) && state.chatInterest) {
        const choices = suggestionsFor(state.path, state.chatInterest, routeMode, 6),
          idx = choices.findIndex((v) => v.id === state.chatPlace),
          v = choices[(idx + 1) % choices.length];
        if (v) {
          state.chatPlace = v.id;
          chatLine(
            "也可以试试" +
              places[v.id].n +
              "。" +
              (placeHints[v.id] || journal[v.id].title) +
              "，加入后在途约增加 " +
              v.extra +
              " 分钟。",
            "bird",
            [
              [
                "加进路线",
                () => {
                  const best = insertAtBest(state.path, v.id, routeMode);
                  if (best) {
                    applyVia(v.id, best.at, v.stay);
                    chatLine("已排在" + places[state.path[best.at - 1]].n + "之后。");
                  } else chatLine("已经加过了。");
                },
              ],
              ["看看这里", () => go("postcard", v.id)],
            ],
          );
          return;
        }
      }
      const theme = /吃|过早|美食|饿|小吃|面窝/.test(q)
        ? "food"
        : /拍|摄影|照相/.test(q)
          ? "photo"
          : /江|水|湖/.test(q)
            ? "water"
            : /顺路|推荐|逛/.test(q)
              ? "any"
              : null;
      if (theme) {
        state.chatInterest = theme;
        const picks = suggestionsFor(state.path, theme, routeMode, 2);
        if (!picks.length) {
          chatLine("这条线上暂时没有新的候选点。");
          return;
        }
        const first = picks[0];
        state.chatPlace = first.id;
        persist();
        chatLine(
          "按你现在的起终点，" +
            places[first.id].n +
            "适合" +
            (theme === "food"
              ? "尝点当地味道"
              : theme === "photo"
                ? "停下拍照"
                : theme === "water"
                  ? "看水岸风景"
                  : "顺路走走") +
            "。多用约 " +
            first.extra +
            " 分钟交通，建议再留 " +
            first.stay +
            " 分钟。",
          "bird",
          picks.map((v) => [
            "＋ " + places[v.id].n,
            () => {
              const now = insertAtBest(state.path, v.id, routeMode);
              if (now) {
                applyVia(v.id, now.at, v.stay);
                chatLine("加好了，现在预计 " + clock(last(schedule())) + " 到终点。");
              } else chatLine("这站已经在行程中。");
            },
          ]),
        );
        return;
      }
      if (id) {
        chatLine("想把" + places[id].n + "放进路线，还是先看看那里？", "bird", [
          [
            "放进路线",
            () => {
              const v = insertAtBest(state.path, id, routeMode);
              if (v) {
                applyVia(id, v.at, Math.min(30, journal[id].minutes));
                chatLine("已加入行程。");
              } else chatLine("这站已在路线中。");
            },
          ],
          ["翻手册", () => go("postcard", id)],
        ]);
        return;
      }
      return host.freeReply(raw);

    }
    let proposalPath = null,
      proposalCards = [],
      originRequest = "";
    function initTourDialog(seed = state.path, opts = {}) {
      proposalPath = [...seed];
      originRequest = opts.fromChat ? "bird" : "";
      el("tourStops").value = String(opts.stops || 2);
      const minutesLeft = opts.budget ?? 65;
      el("tourBudget").value = String(Math.max(0, Math.min(450, minutesLeft)));
      el("tourQuiet").checked = Boolean(opts.quiet);
      const topics = opts.topics || ["photo", "water"];
      document
        .querySelectorAll("[name=tourTopic]")
        .forEach((box) => (box.checked = topics.includes(box.value)));
      el("tourAnchors").textContent = proposalPath.map((k) => places[k].n).join(" → ");
      if (el("birdPanel").open) el("birdPanel").close();
      el("tourPanel").showModal();
      renderTours();
    }
    function renderTours() {
      const raw = Number(el("tourBudget").value),
        budget = Math.max(0, Math.min(450, Math.round(raw) || 0));
      const limit = +el("tourStops").value,
        topics = [...document.querySelectorAll("[name=tourTopic]:checked")].map((c) => c.value);
      const wrap = el("tourResults");
      wrap.replaceChildren();
      const baseDwell = { ...state.dwell };
      if (proposalPath.join("|") !== state.path.join("|")) {
        for (const k of proposalPath) if (!state.path.includes(k)) baseDwell[k] = 0;
      }
      const base = routeTotals(proposalPath, baseDwell, routeMode);
      const start = minutes(state.departure),
        hard = state.deadlineOn
          ? deadlineMinutes() - Number(state.buffer || 0) - start - base.total
          : Infinity;
      const available = Math.min(budget, hard);
      if (available < 0) {
        el("tourStatus").textContent =
          "现有路线已经超过到达目标约 " + Math.ceil(-available) + " 分钟。可以提前出发或减少停留。";
        proposalCards = [];
        return;
      }
      proposalCards = tourOptions(proposalPath, baseDwell, routeMode, {
        budget: available,
        topics,
        limit,
        quiet: el("tourQuiet").checked,
        departure: start,
      });
      el("tourStatus").textContent = proposalCards.length
        ? "已计入在途、换乘与途中停留。"
        : "这段时间放不下新的游览点。可增加可用时间，或直接走原路线。";
      proposalCards.forEach((v, i) => {
        const row = document.createElement("article");
        row.className = "tourProposal";
        const head = document.createElement("div");
        head.className = "tourCardHead";
        const title = document.createElement("b"),
          badge = document.createElement("span");
        title.textContent = i
          ? v.elapsed < proposalCards[0].elapsed
            ? "更省时间"
            : "另一种逛法"
          : "按你的兴趣";
        badge.textContent = "预计 " + clock(start + v.elapsed) + " 到";
        head.append(title, badge);
        const chain = document.createElement("p");
        chain.className = "proposalChain";
        chain.textContent = v.path.map((k) => places[k].n.replace(" · ", "·")).join(" → ");
        row.append(head, chain);
        for (const k of v.path.filter((k) => v.add.includes(k))) {
          const line = document.createElement("div");
          line.className = "proposedStop";
          const img = new Image();
          img.src = places[k].art;
          img.alt = "";
          const copy = document.createElement("div"),
            name = document.createElement("strong"),
            sub = document.createElement("p");
          name.textContent = places[k].n + " · " + v.stays[k] + " 分钟";
          sub.textContent = describedStop(
            k,
            topics.find((t) => toursByTheme[t].has(k)),
          );
          copy.append(name, sub);
          line.append(img, copy);
          row.append(line);
        }
        const btn = document.createElement("button");
        btn.className = i ? "" : "primary";
        btn.textContent = "采用这条 · 多用 " + (v.elapsed - base.total) + " 分钟";
        btn.onclick = () => {
          remember();
          state.dwell = v.stays;
          assign(v.path);
          el("tourPanel").close();
          planChanged(null, "路线已安排。可继续增删途经点。");
        };
        row.append(btn);
        wrap.append(row);
      });
    }
    el("planTour").onclick = () => initTourDialog();
    el("tourForm").oninput = renderTours;
    el("tourForm").onsubmit = (e) => {
      e.preventDefault();
      renderTours();
    };
    el("tourDismiss").onclick = () => el("tourPanel").close();

    host.connect({
      selection: () => el("pick").hidden ? null : selected,
      answer: sendChat,
      advance: nextGuide,
      step(preview = false) {
        if (!activeLegs.length || (!guideUsed && !preview)) return null;
        const i = guideUsed ? activeGuideLeg : 0, j = guideUsed ? activeGuideStep : 0;
        const leg = activeLegs[i];
        if (!leg) return null;
        const info = stepText(leg.steps[j] || {type:"walk",distance:leg.real,roads:[]});
        return {active:guideUsed, short:"第 "+(i+1)+" 段 · 第 "+(j+1)+" 步 · "+info.kind,
          detail:"从"+places[state.path[i]].n+"到"+places[state.path[i+1]].n+"。"+info.title+"。"+info.detail};
      }
    });
    for (const id of ["followHost","guideHost"]) el(id).onclick = () => host.open("下一步怎么走");
    el("pickHost").onclick = () => host.open("这里怎么看");
    el("openTrip").onclick = () => go("trip");
    map.on("click", (e) => {
      const pos = [e.latlng.lat, e.latlng.lng],
        near = snap(pos);
      if (!bounds.contains(pos) || near.d > 350) {
        el("notice").textContent = "请在步行路网附近选点。";
        return;
      }
      if (pendingPin && !state.path.includes(pendingPin)) {
        const old = pinMarkers.get(pendingPin);
        if (old) pinLayer.removeLayer(old);
        pinMarkers.delete(pendingPin);
        delete places[pendingPin];
        delete state.pins[pendingPin];
      }
      const id = localPin(points[near.i]);
      if (id) {
        pendingPin = id;
        marker(id);
        select(id);
      }
    });
    const previousCamera = state.camera;
    captureMap = () => {
      if (guideUsed)
        state.guided = {
          path: state.path.join("|"),
          mode: routeMode,
          leg: activeGuideLeg,
          step: activeGuideStep,
          along: autoProgress,
          following,
        };
      const c = map.getCenter();
      state.camera = {
        lat: c.lat,
        lon: c.lng,
        z: map.getZoom(),
        path: state.path.join("|"),
        mode: routeMode,
        pick: el("pick").hidden ? null : selected,
      };
    };
    window.addEventListener("pagehide", () => {
      pause();
      stopWatch();
      captureMap();
      persist();
    });
    rebuild();
    if (
      previousCamera &&
      previousCamera.path === state.path.join("|") &&
      previousCamera.mode === routeMode &&
      [previousCamera.lat, previousCamera.lon, previousCamera.z].every(Number.isFinite) &&
      bounds.contains([previousCamera.lat, previousCamera.lon])
    ) {
      map.setView([previousCamera.lat, previousCamera.lon], Math.min(18, Math.max(10, previousCamera.z)), {
        animate: false,
      });
      if (places[previousCamera.pick]) select(previousCamera.pick);
    }
    if (search.get("view")==="venues") frameVenues();
    const savedGuide = state.guided;
    if (
      savedGuide &&
      savedGuide.path === state.path.join("|") &&
      savedGuide.mode === routeMode &&
      Number.isInteger(savedGuide.leg) &&
      activeLegs[savedGuide.leg]
    ) {
      guideUsed = true;
      activeGuideLeg = savedGuide.leg;
      const leg = activeLegs[activeGuideLeg];
      activeGuideStep = Math.max(
        0,
        Math.min(Number(savedGuide.step) || 0, Math.max(0, leg.steps.length - 1)),
      );
      autoProgress = Math.max(0, Math.min(Number(savedGuide.along) || 0, leg.real));
      if (savedGuide.following) {
        following = true;
        document.body.classList.add("following");
        el("followBox").hidden = false;
        el("pick").hidden = true;
        el("followPosition").textContent = "已接回上次的路段。";
        requestAnimationFrame(() => {
          map.invalidateSize({ pan: false });
          showGuide();
        });
      }
    }
  }
  function initTrip() {
    const times = schedule(),
      path = state.path,
      end = last(times);
    el("tripRoute").textContent = places[path[0]].n + " → " + places[last(path)].n;
    el("departDisplay").textContent = state.departure;
    el("arrival").textContent = clock(end);
    const finish = el("tourFinish");
    finish.hidden = state.visitEnd !== last(path);
    if (!finish.hidden) {
      const done = end + stay(last(path));
      finish.textContent = "逛完末站约 " + clock(done) + " · 全程约 " + (done - times[0]) + " 分钟";
    }
    const slack = deadlineMinutes() - end - (Number(state.buffer) || 0);
    const target = clock(deadlineMinutes());
    const latestStart = deadlineMinutes() - (Number(state.buffer) || 0) - (end - minutes(state.departure));
    el("slack").textContent = state.deadlineOn
      ? (state.buffer ? "目标 " + target + "（已留 " + state.buffer + " 分钟入场）" : "目标 " + target) +
        (slack >= 0 ? " · 余 " + slack + " 分钟" : " · 时间还差 " + -slack + " 分钟") +
        (latestStart >= 0 ? " · 最迟 " + clock(latestStart) + " 出发" : "")
      : "按 " + state.departure + " 出发估算 · 可设置最晚到达";
    const service = serviceEstimate(
      path.slice(1).map((k, i) => routeLeg(path[i], k)),
      path,
      state.departure,
      state.dwell,
    );
    if (service) el("slack").textContent += " · " + service;
    const timeline = el("timeline");
    timeline.replaceChildren();
    path.forEach((id, i) => {
      const li = document.createElement("li"),
        b = document.createElement("button");
      b.innerHTML = "<time>" + clock(times[i]) + "</time>" + glyph(id) + "<b></b><span>›</span>";
      b.querySelector("b").textContent = places[id].n;
      b.onclick = () => go(places[id].art ? "venue" : "index", places[id].art ? id : undefined);
      li.append(b);
      if (i < path.length - 1) {
        const leg = routeLeg(id, path[i + 1]),
          box = document.createElement("details"),
          summary = document.createElement("summary");
        box.className = "tripLeg";
        const rails = leg.steps.filter((s) => s.type === "rail");
        summary.textContent =
          (stay(id) ? "停留 " + stay(id) + " 分钟 · " : "") +
          (rails.length
            ? rails.map((s) => lineName(s.line)).join(" → ")
            : leg.water.length
              ? "轮渡＋步行"
              : "步行") +
          " · 在途约 " +
          leg.minutes +
          " 分钟";
        box.append(summary);
        leg.steps.forEach((step) => box.append(displayStep(step)));
        li.append(box);
      }
      timeline.append(li);
    });
    let draft, dwell;
    function toggleGoal() {
      const on = el("deadlineOn").checked;
      el("due").disabled = !on;
      el("bufferWrap").hidden = el("dueDayWrap").hidden = !on;
    }
    el("deadlineOn").onchange = toggleGoal;
    function draw() {
      const wrap = el("editRows");
      wrap.replaceChildren();
      draft.forEach((id, i) => {
        const row = document.createElement("div");
        row.className = "editRow";
        const name = document.createElement("strong");
        name.textContent = places[id].n;
        row.append(name);
        if (i < draft.length - 1 || state.visitEnd === id) {
          const sel = document.createElement("select");
          sel.setAttribute("aria-label", name.textContent + "停留时长");
          for (const n of [...new Set([0, 5, 10, 15, 20, 30, 45, 60, 90, 120, 180, stay(id, dwell)])].sort(
            (a, b) => a - b,
          ))
            sel.add(new Option(n + " 分钟", n));
          sel.value = stay(id, dwell);
          sel.onchange = () => (dwell[id] = +sel.value);
          row.append(sel);
        }
        if (i > 0 && i < draft.length - 1) {
          for (const [label, fn, disabled] of [
            ["↑", () => ([draft[i - 1], draft[i]] = [draft[i], draft[i - 1]]), i === 1],
            ["↓", () => ([draft[i + 1], draft[i]] = [draft[i], draft[i + 1]]), i === draft.length - 2],
            ["×", () => draft.splice(i, 1), false],
          ]) {
            const b = document.createElement("button");
            b.type = "button";
            b.textContent = label;
            b.disabled = disabled;
            b.setAttribute("aria-label", { "↑": "上移", "↓": "下移", "×": "移除" }[label] + name.textContent);
            b.onclick = () => {
              fn();
              draw();
            };
            row.append(b);
          }
        }
        wrap.append(row);
      });
      options(
        el("candidate"),
        Object.keys(places).filter((k) => !draft.includes(k)),
      );
    }
    el("edit").onclick = () => {
      draft = [...state.path];
      dwell = { ...state.dwell };
      el("startTime").value = state.departure;
      el("due").value = state.due;
      el("deadlineOn").checked = state.deadlineOn;
      el("dueDay").value = state.dueDay || 0;
      el("buffer").value = state.buffer || 0;
      toggleGoal();
      el("editStatus").textContent = "";
      draw();
      el("editor").showModal();
    };
    el("cancel").onclick = () => el("editor").close();
    el("insert").onclick = () => {
      let k = el("candidate").value;
      if (k) {
        draft.splice(-1, 0, k);
        dwell[k] = 15;
        draw();
      }
    };
    const themes = {
      architecture: [
        "custom",
        "tower",
        "bagong",
        "gude",
        "qc",
        "opera",
        "tan",
        "hust",
        "optic",
        "qintaiart",
        "gutian",
        "industry",
        "chutian",
        "hankouart",
        "yifu",
        "library",
      ],
      food: ["hubu", "cailin", "grain", "jh", "lhp", "enshi", "opticstreet"],
      water: [
        "whpier",
        "zhpier",
        "riverpark",
        "longwang",
        "nanan",
        "hybank",
        "wuchangbank",
        "greenway",
        "balloon",
        "lingbo",
        "moonlake",
        "qsbank",
        "wheel",
        "luoyan",
        "xibei",
      ],
    };
    el("recommend").onclick = () => {
      const dep = el("startTime").value,
        due = el("deadlineOn").checked
          ? minutes(el("due").value) + 1440 * Number(el("dueDay").value) - Number(el("buffer").value)
          : last(schedule(draft, dep, dwell)) + 65;
      if (!safeTime(dep) || (el("deadlineOn").checked && !safeTime(el("due").value)) || due < minutes(dep)) {
        el("editStatus").textContent = "请检查出发时间、到达日期和预留时间。";
        return;
      }
      const arrival = last(schedule(draft, dep, dwell));
      let best;
      const pool = themes[el("theme").value]
        .filter((k) => !draft.includes(k))
        .sort(
          (a, b) =>
            Math.min(...draft.map((id) => meters(ll(id), ll(a)))) -
            Math.min(...draft.map((id) => meters(ll(id), ll(b)))),
        )
        .slice(0, 7);
      for (const k of pool) {
        if (draft.includes(k)) continue;
        for (let i = 1; i < draft.length; i++) {
          const a = draft[i - 1],
            b = draft[i];
          const extra = routeLeg(a, k).minutes + routeLeg(k, b).minutes - routeLeg(a, b).minutes + 15;
          if (arrival + extra + 5 <= due && (!best || extra < best.extra)) best = { k, i, extra };
        }
      }
      if (best) {
        draft.splice(best.i, 0, best.k);
        dwell[best.k] = 15;
        draw();
        el("editStatus").textContent = "推荐" + places[best.k].n + "，预留 15 分钟游览。";
      } else el("editStatus").textContent = "在当前时间内，没有适合再加的一站。";
    };
    el("editForm").onsubmit = (e) => {
      e.preventDefault();
      if (
        el("deadlineOn").checked &&
        (!safeTime(el("due").value) ||
          minutes(el("due").value) + 1440 * Number(el("dueDay").value) < minutes(el("startTime").value))
      ) {
        el("editStatus").textContent = "最晚到达须晚于出发时间；跨零点请选择次日。";
        return;
      }
      state.departure = el("startTime").value;
      state.deadlineOn = el("deadlineOn").checked;
      state.due = el("due").value || "18:00";
      state.dueDay = Number(el("dueDay").value);
      state.buffer = Number(el("buffer").value);
      state.dwell = dwell;
      assign(draft);
      el("editor").close();
      initTrip();
    };
  }
  function useWalk(ids) {
    const route = [...ids];
    for (const id of route) state.dwell[id] = journal[id].minutes;
    state.visitEnd = last(route);
    assign(route);
    go("trip");
  }
  const walks = {
    reading: ["从省图读到汉街", ["library", "skp", "hanshow"]],
    shopping: ["宝通寺与武商商圈", ["baotong", "dream", "yamao"]],
    oldTown: ["汉口里份与厂房", ["jiqing", "xianan", "packing", "bagong", "lhp"]],
    wuchang: ["从街巷看黄鹤楼", ["tan", "desheng", "red", "hubu", "zhpier"]],
    lake: ["东湖听涛与楚文化", ["hbart", "museum", "tingtao", "xingyin"]],
    moon: ["沿月湖看建筑", ["qintai", "opera", "qintaiart", "moonlake"]],
    campus: ["喻家山到光谷", ["hust", "optic", "opticstreet"]],
    qing: ["青山从江岸到餐桌", ["qsbank", "qspark", "enshi"]],
  };
  function initCollection(){
    const stamps=citySave(state).stamps, ids=Object.keys(stamps).sort((a,b)=>stamps[b]-stamps[a]);
    el("recordCount").textContent=ids.length?"已到访 "+ids.length+" 处":"去过哪里，就把它收入这一册。";
    const grid=el("recordGrid");
    if(!ids.length){const a=document.createElement("button");a.textContent="去地图选地点打卡 →";a.onclick=()=>go("index");grid.append(a);}
    for(const id of ids){const b=document.createElement("button"),im=new Image(),label=document.createElement("strong"),time=document.createElement("small");
      im.src=places[id].art;im.alt="";label.textContent=places[id].n;
      time.textContent=new Date(stamps[id]).toLocaleDateString("zh-CN");b.append(im,label,time);b.onclick=()=>go("venue",id);grid.append(b);}
  }
  function initCards() {
    el("albumCount").textContent="已到访 "+Object.keys(citySave(state).stamps).length+" 处";
    el("openCity").onclick = () => go("postcard", "wuhan");
    const fresh = [...original.filter(id=>places[id].modelGroup),"baotong",
      "hustgate",
      "hym",
      "castle",
      "whitecloud",
      "dacheng",
      "oldlib",
      "shanhai",
      "flood",
      "goose",
      "poem",
      "lawn",
      "yuefei",
      "zuiwan",
      "yuehan",
      "yingroad",
      "xuesong",
    ];
    const picker = el("walkPicker"),
      use = el("useWalk");
    for (const [id, [name, ids]] of Object.entries(walks))
      picker.add(new Option(name + " · " + ids.length + " 站", id));
    const featured = [
      "tower", "opticstreet", "wutong",
      "hym",
      "hustgate",
      "jh",
      "whu",
      "riverpark",
      "dacheng",
      "optic",
      "ccnu",
      "jiqing",
      "custom",
      "xingyin",
      "hust",
      "tower",
      "xianan",
      "qintaiart",
      "balloon",
      "simetang",
      "wheel",
      "watertower",
    ];
    let activeFilter = "全部";
    function render(filter) {
      activeFilter = filter;
      const g = el("gallery");
      g.replaceChildren();
      const sequence = walks[picker.value]?.[1];
      const ids = sequence || (picker.value === "new" ? fresh : [...new Set([...featured, ...original])]);
      use.hidden = !sequence;
      for (const id of ids) {
        const p = places[id];
        const group = { 小吃: foodIds, 拍照: photoIds, 水岸: waterIds }[filter];
        const category = filter === "商业建筑" ? "商业" : filter;
        if (group ? !group.has(id) : filter !== "全部" && p.t !== filter && p.modelGroup !== category && !(id==="oldlib" && filter==="图书馆")) continue;
        const term = el("atlasSearch").value.trim().toLowerCase(),
          bk = bookFor(id);
        const direct = (
          p.n +
          " " +
          p.aliases +
          " " +
          p.s +
          " " +
          bk.title +
          " " +
          (foodIds.has(id) ? "小吃 美食" : "") +
          " " +
          (photoIds.has(id) ? "拍照" : "")
        )
          .toLowerCase()
          .includes(term);
        const submatch = term
          ? bk.ids.find(
              (k) =>
                sceneNotes[k] &&
                leafData(k).parent === id &&
                (leafData(k).n + " " + leafData(k).body).toLowerCase().includes(term),
            )
          : null;
        if (term && !direct && !submatch) continue;
        const leaf = submatch ? leafData(submatch) : null;
        const tile = document.createElement("article");
        tile.innerHTML =
          '<button class="cardArt"><img loading="lazy" alt=""></button><div class="cardLabel"><b></b><button>去这里 →</button></div>';
        const img = tile.querySelector("img"),
          button = tile.querySelector(".cardArt");
        img.src = leaf?.art || p.art;
        if(img.getAttribute("src").startsWith("assets/models/")) img.classList.add("miniatureCard");
        img.alt = (leaf?.n || p.n) + "动漫明信片";
        button.onclick = () => go("postcard", id, submatch);
        tile.querySelector("b").textContent = leaf?.n || p.n;
        tile.querySelector(".cardLabel button").onclick = () => {
          setPoint(id, "end");
          go("index");
        };
        g.append(tile);
      }
      el("atlasStatus").textContent = g.children.length
        ? "共 " + g.children.length + " 处"
        : "暂时没有找到，换个地名或清除筛选试试。";
    }
    el("atlasSearch").oninput = () => render(activeFilter);
    const buttons = [...document.querySelectorAll(".filters button")];
    function active(b) {
      buttons.forEach((c) => c.classList.toggle("on", b === c));
    }
    buttons.forEach(
      (b) =>
        (b.onclick = () => {
          picker.value = "all";
          active(b);
          render(b.textContent);
        }),
    );
    picker.onchange = () => {
      active(buttons[0]);
      render("全部");
    };
    use.onclick = () => {
      if (walks[picker.value]) useWalk(walks[picker.value][1]);
    };
    render("全部");
  }
  function initLetter(id) {
    const p = places[id],
      note = journal[id];
    const photo = fieldNotes[id];
    if (photo) {
      el("photoFact").textContent = photo[0];
      el("photoStand").textContent = photo[1];
    } else {
      el("tabPhoto").remove();
      el("panelPhoto").remove();
    }
    el("jArt").src = p.art;
    el("jArt").alt = p.n + "插画";
    el("jStamp").innerHTML = glyph(id);
    el("jArea").textContent = "武汉 · " + p.t;
    el("jTitle").textContent = note.title;
    el("jMinutes").textContent = "建议停留 " + note.minutes + " 分钟";
    el("firstLeg").textContent = note.walk[0];
    el("secondLeg").textContent = note.walk[1];
    el("jTip").textContent = note.tip;
    el("backCard").onclick = () => go("postcard", id);
    function turn(name) {
      for (const b of document.querySelectorAll("[data-tab]")) {
        const on = b.dataset.tab === name;
        b.setAttribute("aria-selected", String(on));
        b.tabIndex = on ? 0 : -1;
        el(b.getAttribute("aria-controls")).hidden = !on;
      }
    }
    const tabs = [...document.querySelectorAll("[data-tab]")];
    tabs.forEach((b, i) => {
      b.onclick = () => turn(b.dataset.tab);
      b.onkeydown = (e) => {
        let n;
        if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
        else if (e.key === "ArrowLeft") n = (i + tabs.length - 1) % tabs.length;
        else if (e.key === "Home") n = 0;
        else if (e.key === "End") n = tabs.length - 1;
        else return;
        e.preventDefault();
        tabs[n].focus();
        turn(tabs[n].dataset.tab);
      };
    });
    for (const next of note.next) {
      const n = places[next],
        card = document.createElement("article");
      card.className = "nextLetter";
      const thumb = document.createElement("button");
      thumb.className = "nextThumb";
      thumb.setAttribute("aria-label", "翻开" + n.n + "的明信片");
      thumb.onclick = () => go("postcard", next);
      const im = new Image();
      im.src = n.art;
      im.alt = "";
      thumb.append(im);
      const info = document.createElement("div"),
        link = document.createElement("button"),
        caption = document.createElement("p"),
        route = document.createElement("button");
      link.className = "nextName";
      link.textContent = n.n + " ↗";
      link.onclick = thumb.onclick;
      caption.textContent = journal[next].title;
      route.textContent = "规划这两站 →";
      route.className = "nextRoute";
      route.onclick = () => useWalk([id, next]);
      info.append(link, caption, route);
      card.append(thumb, info);
      el("nextVisits").append(card);
    }
    const selected = state.path.includes(id);
    el("addVisit").textContent = selected ? "查看我的行程 →" : "加入我的行程 ＋";
    el("addVisit").onclick = () => {
      if (!selected) {
        state.dwell[id] = note.minutes;
        setPoint(id, "via");
      }
      go("trip");
    };
    for (const ref of note.refs) {
      const [name, url] = reading[ref];
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = name + " ↗";
      el("jRefs").append(a);
    }
    turn("walk");
  }
  function initBook(id) {
    const book = bookFor(id),
      requested = search.get("leaf"),
      first = book.ids.indexOf(requested || id);
    let index = Math.max(0, first),
      startX = null,
      startY = 0;
    const backdrop = el("paper").closest("main").querySelector(".bookBackdrop");
    backdrop.style.backgroundImage = 'url("assets/scenes/bg-' + book.theme + '.webp")';
    el("bookTitle").textContent = book.title;
    el("citySource").hidden = id !== "wuhan";
    function draw(dir) {
      const key = book.ids[index],
        leaf = leafData(key),
        target = leaf.target;
      el("landmark").textContent = leaf.n;
      document.title = leaf.n + " · " + book.title;
      el("sentence").textContent = leaf.title === leaf.n ? "" : leaf.title;
      el("leafBody").textContent = leaf.body;
      document.querySelector("main").dataset.hostPlace = id === "wuhan" ? "" : target;
      host.refresh();
      el("district").textContent =
        (id === "wuhan" ? "武汉" : places[target].t) +
        "  /  " +
        String(index + 1).padStart(2, "0") +
        " — " +
        String(book.ids.length).padStart(2, "0");
      const art = el("bigArt");
      art.src = leaf.art;
      art.alt = leaf.n + "的旅行插画";
      const paper = el("paper");
      paper.classList.remove("forward", "backward");
      void paper.offsetWidth;
      paper.classList.add(dir < 0 ? "backward" : "forward");
      el("prev").disabled = index === 0;
      el("next").disabled = index === book.ids.length - 1;
      el("visit").onclick = () => go("place", leaf.parent);
      el("leafModel").onclick = () => go("venue", target);
      el("setDest").textContent = leaf.action + " →";
      el("setDest").onclick = () => {
        setPoint(target, "end");
        go("index");
      };
      const add = el("addLeaf");
      add.textContent = state.path.includes(target) ? "已在行程 · 查看" : "＋ 加入途经";
      add.onclick = () => {
        if (!state.path.includes(target)) {
          state.dwell[target] = Math.min(30, journal[target].minutes);
          setPoint(target, "via");
        }
        go("trip");
      };
      const strip = el("filmStrip");
      strip.replaceChildren();
      book.ids.forEach((k, i) => {
        const d = leafData(k),
          b = document.createElement("button"),
          im = new Image(),
          label = document.createElement("span");
        b.className = i === index ? "chosen" : "";
        b.setAttribute("aria-label", "第 " + (i + 1) + " 张，" + d.n);
        b.setAttribute("aria-current", i === index ? "true" : "false");
        im.src = d.art;
        im.alt = "";
        label.textContent = d.n.replace(/^.+? · /, "");
        b.append(im, label);
        b.onclick = () => turn(i);
        strip.append(b);
      });
      const current = strip.children[index];
      if (current)
        strip.scrollLeft = Math.max(
          0,
          current.offsetLeft - strip.offsetLeft - strip.clientWidth / 2 + current.offsetWidth / 2,
        );
      const url = new URL(location.href);
      url.searchParams.set("leaf", key);
      try {
        history.replaceState(null, "", url);
      } catch {}
      if (book.ids[index + 1]) {
        const preload = new Image();
        preload.src = leafData(book.ids[index + 1]).art;
      }
    }
    function turn(next) {
      if (next < 0 || next >= book.ids.length || next === index) return;
      const direction = next - index;
      index = next;
      draw(direction);
    }
    el("prev").onclick = () => turn(index - 1);
    el("next").onclick = () => turn(index + 1);
    document.addEventListener("keydown", (e) => {
      if (e.altKey || e.metaKey || e.ctrlKey) return;
      if (e.key === "ArrowRight") turn(index + 1);
      if (e.key === "ArrowLeft") turn(index - 1);
    });
    el("paper").addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length !== 1) {
          startX = null;
          return;
        }
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      },
      { passive: true },
    );
    el("paper").addEventListener(
      "touchend",
      (e) => {
        if (startX === null) return;
        const dx = e.changedTouches[0].clientX - startX,
          dy = e.changedTouches[0].clientY - startY;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.35) turn(index + (dx < 0 ? 1 : -1));
        startX = null;
      },
      { passive: true },
    );
    draw(1);
  }

  function initDetail() {
    const req = search.get("id"),
      id = req === "wuhan" && page === "postcard" ? "wuhan" : original.includes(req) ? req : "tower";
    if (page === "place") {
      document.title = places[id].n + " · 游览手记";
      el("landmark").textContent = places[id].n;
      initLetter(id);
    } else initBook(id);
  }
  const host = createPorpoise({state,page,persist,go,setPoint,clock,schedule});
  if (page === "index" || page === "trip") {
    setupGraph(mapData.roads);
    for (const p of Object.values(places)) p.snap = snap(p.ll);
    if (state.pendingVia) {
      const k = state.pendingVia;
      state.pendingVia = null;
      if (state.path.slice(1, -1).includes(k)) {
        const base = state.path.filter((id) => id !== k),
          v = insertAtBest(base, k, routeMode);
        if (v) {
          base.splice(v.at, 0, k);
          assign(base);
        }
      }
    }
    if (page === "index") initMap();
    else initTrip();
  } else if (page === "collection") initCollection();
  else if (page === "cards") initCards();
  else if (page === "reception") initReception(() => { setPoint("packing","end"); go("index"); },go);
  else if (page === "city") initCity(state,persist,go);
  else if (page === "venue") initVenue(original.includes(search.get("id"))?search.get("id"):"tower",go,setPoint,state,persist);
  else initDetail();
  window.addEventListener("pageshow", (event) => {
    document.querySelector(".postDeparture")?.remove();
    if (!event.persisted) return;
    try {
      const fresh = parse(sessionStorage.getItem(key));
      if (fresh && fresh.updated > state.updated) {
        const u = new URL(location.href);
        u.hash = new URLSearchParams({ route: JSON.stringify(fresh) });
        history.replaceState(null, "", u.href);
        location.reload();
      }
    } catch {}
  });
  host.mount();
  document.querySelector("main").removeAttribute("inert");
  if (
    "serviceWorker" in navigator &&
    location.protocol !== "file:" &&
    location.hostname !== "appassets.androidplatform.net"
  )
    navigator.serviceWorker.register("sw.js").catch(() => {});
})();
