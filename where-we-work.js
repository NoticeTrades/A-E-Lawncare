(function () {
  const section = document.getElementById("where-we-work");
  const mapEl = document.getElementById("service-leaflet-map");
  const btnReplay = document.getElementById("replay-map-intro");
  const cityButtons = Array.from(document.querySelectorAll("[data-city]"));

  if (!section || !mapEl || typeof L === "undefined") {
    return;
  }

  const CITIES = [
    { name: "Spartanburg, SC", pos: [34.9496, -81.9321], labelSide: "right" },
    { name: "Tryon, NC", pos: [35.2089, -82.2344], labelSide: "left" },
    { name: "Inman, SC", pos: [35.0479, -82.0919], labelSide: "right" },
    { name: "Landrum, SC", pos: [35.1751, -82.1893], labelSide: "left" },
    { name: "Columbus, NC", pos: [35.2532, -82.1971], labelSide: "right" }
  ];

  const SERVICE_POLYGON = [
    [35.45, -83.05],
    [35.32, -82.05],
    [35.05, -81.55],
    [34.72, -81.65],
    [34.68, -82.45],
    [35.05, -82.85],
    [35.38, -83.12],
    [35.45, -83.05]
  ];

  const prefersReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let mapInstance = null;
  let servicePolygon = null;
  let cityMarkers = [];
  let markerByCity = new Map();
  let markerTimeouts = [];
  let introStarted = false;
  let flyMoveEndHandler = null;

  const MARKER_STAGGER_MS = prefersReduceMotion ? 140 : 620;
  const FLY_DURATION = prefersReduceMotion ? 0.01 : 2.2;
  const BOUNDS_PAD = 0.045;
  const POST_ZOOM_STEP = prefersReduceMotion ? 0 : 0.55;
  const POST_ZOOM_DURATION = prefersReduceMotion ? 0.01 : 0.9;
  const DOT_ANCHOR_X = 10;
  const DOT_ANCHOR_Y = 20;

  function clearMarkerTimeouts() {
    markerTimeouts.forEach((id) => clearTimeout(id));
    markerTimeouts = [];
  }

  function destroyMap() {
    clearMarkerTimeouts();
    if (flyMoveEndHandler && mapInstance) {
      mapInstance.off("moveend", flyMoveEndHandler);
      flyMoveEndHandler = null;
    }
    cityMarkers = [];
    markerByCity = new Map();
    servicePolygon = null;
    if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
    }
    mapEl.replaceChildren();
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function addCityMarkersStaggered() {
    clearMarkerTimeouts();
    cityMarkers = [];
    markerByCity = new Map();

    CITIES.forEach((city, index) => {
      const id = window.setTimeout(() => {
        const side = city.labelSide === "left" ? "left" : "right";
        const labelW = Math.min(188, 90 + city.name.length * 5.35);
        const lineW = 30;
        const iconH = 44;
        const iconW = Math.round(labelW + lineW + 24);

        const inner = document.createElement("div");
        inner.className = `ae-city-marker ae-city-marker--${side}`;
        inner.style.setProperty("--city-label-w", `${labelW}px`);
        inner.innerHTML =
          side === "left"
            ? `<span class="ae-city-label">${escapeHtml(city.name)}</span><span class="ae-city-line" aria-hidden="true"></span><span class="ae-city-dot" aria-hidden="true"></span>`
            : `<span class="ae-city-dot" aria-hidden="true"></span><span class="ae-city-line" aria-hidden="true"></span><span class="ae-city-label">${escapeHtml(city.name)}</span>`;

        const icon = L.divIcon({
          className: "ae-city-marker-outer",
          html: inner,
          iconSize: [iconW, iconH],
          iconAnchor: side === "left" ? [iconW - DOT_ANCHOR_X, DOT_ANCHOR_Y] : [DOT_ANCHOR_X, DOT_ANCHOR_Y]
        });

        const marker = L.marker(city.pos, { icon })
          .addTo(mapInstance)
          .bindPopup(`<strong>${escapeHtml(city.name)}</strong><br>A&amp;E service area`);
        marker.on("click", () => setActiveCity(city.name));
        cityMarkers.push(marker);
        markerByCity.set(city.name, marker);

        if (index === 0) {
          setActiveCity(city.name);
        }
      }, index * MARKER_STAGGER_MS);
      markerTimeouts.push(id);
    });
  }

  function setActiveCity(cityName) {
    cityButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.city === cityName);
    });
  }

  function focusCity(cityName) {
    const city = CITIES.find((item) => item.name === cityName);
    if (!city) return;

    introStarted = true;
    if (!mapInstance) {
      runIntro();
    }

    setActiveCity(cityName);

    window.setTimeout(() => {
      if (!mapInstance) return;
      mapInstance.flyTo(city.pos, 11, {
        duration: prefersReduceMotion ? 0.01 : 0.75,
        easeLinearity: 0.2
      });

      const marker = markerByCity.get(cityName);
      if (marker) {
        marker.openPopup();
      }
    }, mapInstance && markerByCity.size ? 0 : 520);
  }

  function addServicePolygon() {
    if (!mapInstance) return;
    servicePolygon = L.polygon(SERVICE_POLYGON, {
      color: "#0d3a0d",
      weight: 1.25,
      fillColor: "#4da24d",
      fillOpacity: 0.16,
      dashArray: "5 6"
    }).addTo(mapInstance);
  }

  function runIntro() {
    destroyMap();

    mapInstance = L.map(mapEl, { scrollWheelZoom: true, zoomControl: true }).setView([18, -78], 3);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(mapInstance);

    const afterLayout = () => {
      mapInstance.invalidateSize();
      const bounds = L.latLngBounds(SERVICE_POLYGON).pad(BOUNDS_PAD);

      if (prefersReduceMotion) {
        mapInstance.fitBounds(bounds, { animate: false });
        addServicePolygon();
        addCityMarkersStaggered();
        return;
      }

      flyMoveEndHandler = () => {
        flyMoveEndHandler = null;
        mapInstance.flyTo(mapInstance.getCenter(), mapInstance.getZoom() + POST_ZOOM_STEP, {
          duration: POST_ZOOM_DURATION,
          easeLinearity: 0.22
        });

        mapInstance.once("moveend", () => {
          addServicePolygon();
          addCityMarkersStaggered();
        });
      };
      mapInstance.once("moveend", flyMoveEndHandler);

      mapInstance.flyToBounds(bounds, {
        duration: FLY_DURATION,
        easeLinearity: 0.22
      });
    };

    window.requestAnimationFrame(afterLayout);
  }

  btnReplay?.addEventListener("click", () => {
    introStarted = true;
    runIntro();
  });

  cityButtons.forEach((button) => {
    button.addEventListener("click", () => focusCity(button.dataset.city));
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || introStarted) return;
        introStarted = true;
        observer.disconnect();
        window.requestAnimationFrame(runIntro);
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(section);
})();
