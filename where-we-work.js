(function () {
  const section = document.getElementById("where-we-work");
  const mapEl = document.getElementById("service-leaflet-map");
  const btnReplay = document.getElementById("replay-map-intro");

  if (!section || !mapEl || typeof L === "undefined") {
    return;
  }

  const CITIES = [
    { name: "Spartanburg, SC", pos: [34.9496, -81.9321] },
    { name: "Tryon, NC", pos: [35.2089, -82.2344] },
    { name: "Inman, SC", pos: [35.0479, -82.0919] },
    { name: "Landrum, SC", pos: [35.1751, -82.1893] },
    { name: "Columbus, NC", pos: [35.2532, -82.1971] }
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
  let markerTimeouts = [];
  let introStarted = false;
  let flyMoveEndHandler = null;

  const MARKER_STAGGER_MS = prefersReduceMotion ? 140 : 620;
  const FLY_DURATION = prefersReduceMotion ? 0.01 : 2.2;
  const BOUNDS_PAD = 0.045;

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

    CITIES.forEach((city, index) => {
      const id = window.setTimeout(() => {
        const inner = document.createElement("div");
        inner.className = "ae-city-marker";
        inner.innerHTML = `<span class="ae-city-dot" aria-hidden="true"></span><span class="ae-city-label">${escapeHtml(
          city.name
        )}</span>`;

        const labelW = Math.min(196, 104 + city.name.length * 5.5);
        const iconH = 52;
        const icon = L.divIcon({
          className: "ae-city-marker-outer",
          html: inner,
          iconSize: [labelW, iconH],
          iconAnchor: [labelW / 2, iconH / 2]
        });

        const marker = L.marker(city.pos, { icon }).addTo(mapInstance);
        cityMarkers.push(marker);
      }, index * MARKER_STAGGER_MS);
      markerTimeouts.push(id);
    });
  }

  function runIntro() {
    destroyMap();

    mapInstance = L.map(mapEl, { scrollWheelZoom: true, zoomControl: true }).setView([18, -78], 3);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(mapInstance);

    servicePolygon = L.polygon(SERVICE_POLYGON, {
      color: "#0d3a0d",
      weight: 1.25,
      fillColor: "#2563eb",
      fillOpacity: 0.24
    }).addTo(mapInstance);

    const afterLayout = () => {
      mapInstance.invalidateSize();
      const bounds = servicePolygon.getBounds().pad(BOUNDS_PAD);

      flyMoveEndHandler = () => {
        flyMoveEndHandler = null;
        addCityMarkersStaggered();
      };
      mapInstance.once("moveend", flyMoveEndHandler);

      if (prefersReduceMotion) {
        mapInstance.fitBounds(bounds, { animate: false });
        return;
      }

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
