<template>
  <div class="jobs-map-wrapper">
    <div ref="mapEl" class="jobs-map"></div>
  </div>
</template>

<script>
import L from 'leaflet';

// Fix icon path (Leaflet hay lỗi icon khi build/Vite)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default {
  name: 'JobsMap',
  props: {
    // job cần có _id + latlng: [lat, lng]
    jobs: { type: Array, default: () => [] },
    selectedJobId: { type: [String, Number], default: null },

    // center: [lat, lng]
    center: { type: Array, default: () => [10.77689, 106.70098] },
    zoom: { type: Number, default: 11 },

    // ✅ vị trí user (optional): [lat, lng]
    userLatLng: { type: Array, default: null },
    radiusKm: { type: Number, default: null },
  },
  emits: ['marker-click'],
  data() {
    return {
      map: null,
      markersLayer: null,
      markerByJobId: new Map(),
      mapReady: false,

      userMarker: null,
      radiusCircle: null,
    };
  },
  mounted() {
    this.initMap();
    this.renderMarkers();
    this.renderUserLayer();
    this.fitToContent();
    this.mapReady = true;

    if (this.selectedJobId) this.focusJob(this.selectedJobId);
  },
  beforeUnmount() {
    try {
      if (this.map) this.map.remove();
    } catch {}
    this.map = null;
  },
  watch: {
    jobs: {
      handler() {
        this.renderMarkers();
        this.fitToContent();
        if (this.selectedJobId) this.focusJob(this.selectedJobId);
      },
      deep: true,
    },
    selectedJobId(newVal) {
      if (newVal) this.focusJob(newVal);
    },
    center(newCenter) {
      if (!this.map || !Array.isArray(newCenter) || newCenter.length !== 2) return;
      this.map.setView(newCenter, this.map.getZoom());
    },

    // user location changes
    userLatLng: {
      handler() {
        this.renderUserLayer();
        this.fitToContent();
      },
      deep: true,
    },
    radiusKm() {
      this.renderUserLayer();
      this.fitToContent();
    },
  },
  methods: {
    initMap() {
      this.map = L.map(this.$refs.mapEl, {
        zoomControl: true,
        attributionControl: true,
      }).setView(this.center, this.zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(this.map);

      this.markersLayer = L.layerGroup().addTo(this.map);
    },

    renderMarkers() {
      if (!this.map || !this.markersLayer) return;

      this.markersLayer.clearLayers();
      this.markerByJobId.clear();

      (this.jobs || []).forEach((job) => {
        if (!job || !Array.isArray(job.latlng) || job.latlng.length !== 2) return;

        const marker = L.marker(job.latlng);

        const title = this.escapeHtml(job.title || 'Việc làm');
        const company = this.escapeHtml(
          job?.employer?.companyName || job?.companyName || 'Nhà tuyển dụng'
        );
        const city = this.escapeHtml(job?.location?.city || '');
        const salaryText = this.buildSalaryText(job?.salary);

        marker.bindPopup(`
          <div style="min-width:220px">
            <div style="font-weight:700; margin-bottom:6px;">${title}</div>
            <div style="font-size:13px; margin-bottom:4px;">${company}</div>
            <div style="font-size:12px; color:#555; margin-bottom:6px;">${city}</div>
            <div style="font-size:12px; font-weight:700;">${salaryText}</div>
          </div>
        `);

        marker.on('click', () => this.$emit('marker-click', job));

        marker.addTo(this.markersLayer);
        if (job._id != null) this.markerByJobId.set(String(job._id), marker);
      });
    },

    // ✅ render vị trí user + vòng tròn bán kính
    renderUserLayer() {
      if (!this.map) return;

      // clear old
      if (this.userMarker) {
        try { this.userMarker.remove(); } catch {}
        this.userMarker = null;
      }
      if (this.radiusCircle) {
        try { this.radiusCircle.remove(); } catch {}
        this.radiusCircle = null;
      }

      if (!Array.isArray(this.userLatLng) || this.userLatLng.length !== 2) return;

      // divIcon để dễ nhìn thấy (không phụ thuộc CSS scoped)
      const userIcon = L.divIcon({
        className: '',
        html: `
          <div style="
            width: 28px; height: 28px;
            border-radius: 999px;
            display:flex; align-items:center; justify-content:center;
            background:#111827;
            color:#fff; font-size:16px;
            box-shadow: 0 6px 16px rgba(0,0,0,.25);
            border: 2px solid #fff;
          ">📍</div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      this.userMarker = L.marker(this.userLatLng, { icon: userIcon }).addTo(this.map);

      this.userMarker.bindPopup(`
        <div style="min-width:180px">
          <div style="font-weight:800;">📍 Vị trí của bạn</div>
          <div style="font-size:12px; color:#666; margin-top:6px;">
            (từ hồ sơ hoặc vị trí hiện tại)
          </div>
        </div>
      `);

      if (typeof this.radiusKm === 'number' && this.radiusKm > 0) {
        this.radiusCircle = L.circle(this.userLatLng, {
          radius: this.radiusKm * 1000,
          weight: 1,
          opacity: 0.6,
          fillOpacity: 0.08,
        }).addTo(this.map);
      }
    },

    fitToContent() {
      if (!this.map) return;

      const jobLatLngs = (this.jobs || [])
        .filter((j) => j && Array.isArray(j.latlng) && j.latlng.length === 2)
        .map((j) => j.latlng);

      const points = [...jobLatLngs];

      // include user location
      if (Array.isArray(this.userLatLng) && this.userLatLng.length === 2) {
        points.push(this.userLatLng);
      }

      if (!points.length) {
        this.map.setView(this.center, this.zoom);
        return;
      }

      if (points.length === 1) {
        this.map.setView(points[0], Math.max(this.zoom, 13));
        return;
      }

      const bounds = L.latLngBounds(points);
      this.map.fitBounds(bounds, { padding: [20, 20] });
    },

    focusJob(jobId) {
      if (!this.mapReady || !this.map) return;

      const marker = this.markerByJobId.get(String(jobId));
      if (!marker) return;

      const latlng = marker.getLatLng();
      this.map.setView(latlng, Math.max(this.map.getZoom(), 13), { animate: true });
      marker.openPopup();
    },

    buildSalaryText(salary) {
      if (!salary) return 'Thoả thuận';
      const min = typeof salary.min === 'number' ? salary.min : null;
      const max = typeof salary.max === 'number' ? salary.max : null;
      if (min == null || max == null) return 'Thoả thuận';
      return `${Number(min).toLocaleString('vi-VN')} - ${Number(max).toLocaleString('vi-VN')} ${salary.currency || 'VND'}`;
    },

    escapeHtml(str) {
      if (str == null) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    },
  },
};
</script>

<style scoped>
.jobs-map-wrapper {
  width: 100%;
  height: 100%;
}

.jobs-map {
  width: 100%;
  min-height: 420px;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}
</style>