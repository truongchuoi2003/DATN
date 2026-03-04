<template>
  <div class="student-jobs">
    <Header />

    <div class="container">
      <div class="page-header">
        <div>
          <h1>🔍 Tìm việc làm</h1>
          <p class="subtitle">Khám phá hàng ngàn cơ hội việc làm phù hợp với bạn</p>
        </div>
      </div>

      <div class="search-section">
        <div class="search-bar">
          <input
            v-model="filters.search"
            @input="debounceSearch"
            type="text"
            placeholder="🔍 Tìm kiếm theo vị trí, công ty..."
            class="search-input"
          />
          <button @click="handleSearch" class="btn-search">Tìm kiếm</button>
        </div>

        <div class="filters">
          <select v-model="filters.city" @change="handleSearch">
            <option value="">📍 Tất cả thành phố</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
            <option value="Đà Nẵng">Đà Nẵng</option>
            <option value="Hải Phòng">Hải Phòng</option>
            <option value="Cần Thơ">Cần Thơ</option>
          </select>

          <select v-model="filters.jobType" @change="handleSearch">
            <option value="">💼 Loại hình</option>
            <option value="full-time">Toàn thời gian</option>
            <option value="part-time">Bán thời gian</option>
            <option value="internship">Thực tập</option>
            <option value="contract">Hợp đồng</option>
            <option value="freelance">Freelance</option>
          </select>

          <select v-model="filters.level" @change="handleSearch">
            <option value="">⭐ Cấp bậc</option>
            <option value="intern">Thực tập sinh</option>
            <option value="fresher">Fresher</option>
            <option value="junior">Junior</option>
            <option value="middle">Middle</option>
            <option value="senior">Senior</option>
          </select>

          <button @click="resetFilters" class="btn-reset">🔄 Đặt lại</button>
        </div>
      </div>

      <div class="stats-bar">
        <p>
          Tìm thấy <strong>{{ total }}</strong> công việc
          <span v-if="filterWithinRadius && effectiveUserLatLng" class="inside-count">
            • Trong {{ radiusKm }}km: <strong>{{ insideRadiusCount }}</strong>
          </span>
        </p>

        <div class="stats-actions">
          <button class="btn-map-toggle" @click="showMap = !showMap">
            {{ showMap ? '🗺️ Ẩn bản đồ' : '🗺️ Hiện bản đồ' }}
          </button>

          <button
            class="btn-map-toggle"
            type="button"
            @click="onlySaved = !onlySaved"
          >
            {{ onlySaved ? '💾 Đang lọc job đã lưu' : '💾 Chỉ xem job đã lưu' }}
          </button>

          <div class="my-location">
            <label class="chk">
              <input type="checkbox" v-model="showMyLocation" :disabled="!effectiveUserLatLng" />
              <span>Vị trí của tôi</span>
            </label>

            <select
              class="radius-select"
              v-model.number="radiusKm"
              :disabled="!effectiveUserLatLng || !showMyLocation"
            >
              <option :value="5">5km</option>
              <option :value="10">10km</option>
              <option :value="20">20km</option>
            </select>

            <button
              class="btn-near"
              type="button"
              @click="sortByDistance = !sortByDistance"
              :disabled="!effectiveUserLatLng"
            >
              {{ sortByDistance ? '📌 Đang ưu tiên gần' : '📍 Ưu tiên gần tôi' }}
            </button>

            <button
              class="btn-radius-filter"
              type="button"
              @click="toggleRadiusFilter"
              :disabled="!effectiveUserLatLng"
            >
              {{ filterWithinRadius ? '🎯 Đang lọc theo bán kính' : '🎯 Chỉ trong bán kính' }}
            </button>

            <button
              v-if="!studentLatLng"
              class="btn-current"
              type="button"
              @click="useCurrentLocation"
            >
              📡 Dùng vị trí hiện tại
            </button>
          </div>
        </div>
      </div>

      <div class="recommend-section">
        <div class="recommend-section-header">
          <div>
            <h2>🎯 Việc làm phù hợp cho bạn</h2>
            <p>Danh sách được cá nhân hóa dựa trên hồ sơ, kỹ năng và lịch sử quan tâm</p>
          </div>

          <button
            class="btn-refresh-recommend"
            type="button"
            @click="fetchRecommendedJobs"
            :disabled="recommendationLoading"
          >
            {{ recommendationLoading ? 'Đang tải...' : 'Làm mới gợi ý' }}
          </button>
        </div>

        <div v-if="recommendationLoading" class="recommend-loading">
          <div class="spinner small"></div>
          <span>Đang tải gợi ý phù hợp...</span>
        </div>

        <div v-else-if="recommendationError" class="recommend-error">
          {{ recommendationError }}
        </div>

        <div v-else-if="recommendedJobs.length" class="recommend-grid">
          <div
            v-for="job in recommendedJobs"
            :key="`recommend-${job._id}`"
            class="recommend-card"
          >
            <div class="recommend-card-top">
              <div class="recommend-left">
                <div class="recommend-company-logo">
                  {{ getInitials(job.employer?.companyName) }}
                </div>

                <div class="recommend-title-wrap">
                  <div class="recommend-ribbon">Gợi ý cho bạn</div>
                  <h3>{{ job.title }}</h3>
                  <p>{{ job.employer?.companyName }}</p>
                </div>
              </div>

              <div
                v-if="hasRecommendation(job)"
                class="recommend-score-badge"
                :class="getRecommendationTier(job).className"
              >
                {{ getRecommendationTier(job).icon }} {{ getRecommendationScore(job) }}
              </div>
            </div>

            <div class="recommend-meta">
              <span>📍 {{ job.location?.city || 'N/A' }}</span>
              <span>💼 {{ getJobTypeLabel(job.jobType) }}</span>
              <span>⭐ {{ getLevelLabel(job.level) }}</span>
              <span v-if="job.distanceKm != null">🧭 ~ {{ formatDistance(job.distanceKm) }}</span>
            </div>

            <div v-if="getRecommendationSignalBadges(job).length" class="smart-signal-list">
              <span
                v-for="(badge, index) in getRecommendationSignalBadges(job)"
                :key="`smart-badge-${job._id}-${index}`"
                class="smart-signal-chip"
                :class="badge.className"
              >
                {{ badge.icon }} {{ badge.label }}
              </span>
            </div>

            <div v-if="getRecommendationReasons(job).length" class="recommend-reasons">
              <span
                v-for="(reason, index) in getRecommendationReasons(job)"
                :key="`top-reason-${job._id}-${index}`"
                class="recommend-reason-chip"
              >
                {{ reason }}
              </span>
            </div>

            <div class="recommend-actions">
              <button
                @click.stop="toggleSaveJob(job._id)"
                class="btn"
                :style="savedJobIds.includes(String(job._id))
                  ? 'background:#ffe8e8;color:#d63384;border:1px solid #f5c2c7;'
                  : 'background:#f8f9fa;color:#495057;border:1px solid #dee2e6;'"
              >
                {{ savedJobIds.includes(String(job._id)) ? '❤️ Đã lưu' : '🤍 Lưu' }}
              </button>

              <button
                @click.stop="openRecommendedJob(job._id)"
                class="btn btn-primary"
              >
                Xem chi tiết →
              </button>
            </div>
          </div>
        </div>

        <div v-else class="recommend-empty">
          Chưa có gợi ý cá nhân hóa. Hãy cập nhật hồ sơ và tương tác thêm để hệ thống đề xuất tốt hơn.
        </div>
      </div>

      <div v-if="!effectiveUserLatLng" class="location-hint">
        ⚠️ Bạn chưa có tọa độ trong hồ sơ. Bạn có thể bấm <b>“Dùng vị trí hiện tại”</b> hoặc vào <b>Hồ sơ</b> để cập nhật vị trí.
      </div>

      <div v-if="filterWithinRadius && effectiveUserLatLng" class="radius-hint">
        ✅ Đang lọc thật sự theo bán kính: chỉ job có <b>tọa độ thật</b> và nằm trong <b>{{ radiusKm }}km</b> sẽ được hiển thị.
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải công việc...</p>
      </div>

      <div v-else :class="['content-split', { 'no-map': !showMap }]">
        <div class="left-col">
          <div class="jobs-grid">
            <div v-if="displayJobs.length === 0" class="empty-state">
              <p>📭 Không tìm thấy công việc phù hợp</p>
              <button @click="resetFilters" class="btn btn-primary">Xem tất cả công việc</button>
            </div>

            <template v-else>
              <div
                v-for="job in displayJobs"
                :key="job._id"
                :id="`job-${job._id}`"
                :class="['job-card', { selected: String(job._id) === String(selectedJobId) }]"
                @click="selectedJobId = job._id"
              >
                <div class="job-header">
                  <div class="company-logo">
                    {{ getInitials(job.employer?.companyName) }}
                  </div>
                  <div class="job-title-area">
                    <h3>{{ job.title }}</h3>
                    <p class="company-name">{{ job.employer?.companyName }}</p>
                  </div>
                </div>

                <div v-if="hasRecommendation(job)" class="recommendation-box">
                  <div class="recommendation-top">
                    <div
                      class="recommendation-tier"
                      :class="getRecommendationTier(job).className"
                    >
                      <span class="tier-icon">{{ getRecommendationTier(job).icon }}</span>
                      <span>{{ getRecommendationTier(job).label }}</span>
                    </div>

                    <div
                      class="recommendation-score"
                      :class="getRecommendationTier(job).className"
                    >
                      <span class="score-label">Match</span>
                      <span class="score-value">{{ getRecommendationScore(job) }}</span>
                    </div>
                  </div>

                  <div v-if="getRecommendationSignalBadges(job).length" class="smart-signal-list">
                    <span
                      v-for="(badge, index) in getRecommendationSignalBadges(job)"
                      :key="`signal-${job._id}-${index}`"
                      class="smart-signal-chip"
                      :class="badge.className"
                    >
                      {{ badge.icon }} {{ badge.label }}
                    </span>
                  </div>

                  <div
                    v-if="getRecommendationReasons(job).length"
                    class="recommendation-reasons"
                  >
                    <span
                      v-for="(reason, index) in getRecommendationReasons(job)"
                      :key="`${job._id}-reason-${index}`"
                      class="reason-chip"
                    >
                      {{ reason }}
                    </span>
                  </div>
                </div>

                <div class="job-details">
                  <div class="detail-item">
                    <span class="icon">📍</span>
                    <span>{{ job.location?.city || 'N/A' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="icon">💰</span>
                    <span>{{ formatSalary(job.salary) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="icon">💼</span>
                    <span>{{ getJobTypeLabel(job.jobType) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="icon">⭐</span>
                    <span>{{ getLevelLabel(job.level) }}</span>
                  </div>

                  <div v-if="job.distanceKm != null" class="detail-item distance">
                    <span class="icon">🧭</span>
                    <span>~ {{ formatDistance(job.distanceKm) }}</span>
                  </div>
                  <div v-else class="detail-item distance muted">
                    <span class="icon">🧭</span>
                    <span>Chưa có tọa độ</span>
                  </div>
                </div>

                <div class="job-skills" v-if="job.skills && job.skills.length > 0">
                  <span v-for="skill in job.skills.slice(0, 4)" :key="skill" class="skill-tag">
                    {{ skill }}
                  </span>
                  <span v-if="job.skills.length > 4" class="skill-more">
                    +{{ job.skills.length - 4 }}
                  </span>
                </div>

                <div class="job-footer">
                  <div class="job-meta">
                    <span class="meta-item">👁️ {{ job.views || 0 }}</span>
                    <span class="meta-item">👥 {{ job.applicationsCount || 0 }}</span>
                  </div>

                  <div class="footer-actions">
                    <button
                      @click.stop="toggleSaveJob(job._id)"
                      class="btn"
                      :style="savedJobIds.includes(String(job._id))
                        ? 'background:#ffe8e8;color:#d63384;border:1px solid #f5c2c7;'
                        : 'background:#f8f9fa;color:#495057;border:1px solid #dee2e6;'"
                    >
                      {{ savedJobIds.includes(String(job._id)) ? '❤️ Đã lưu' : '🤍 Lưu' }}
                    </button>

                    <button @click.stop="goToJobDetail(job._id)" class="btn btn-primary">
                      Xem chi tiết →
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <div v-if="totalPages > 1" class="pagination">
            <button @click="changePage(page - 1)" :disabled="page === 1" class="btn-page">
              ← Trước
            </button>
            <span class="page-info">Trang {{ page }} / {{ totalPages }}</span>
            <button @click="changePage(page + 1)" :disabled="page === totalPages" class="btn-page">
              Sau →
            </button>
          </div>
        </div>

        <aside v-if="showMap" class="right-col">
          <div class="map-card">
            <div class="map-header">
              <h2>🗺️ Bản đồ việc làm</h2>
              <p class="map-subtitle">
                Marker 📍 là vị trí của bạn • Click marker job để chọn
              </p>
            </div>

            <div class="map-body">
              <JobsMap
                :jobs="mapJobs"
                :selected-job-id="selectedJobId"
                :center="mapCenter"
                :user-lat-lng="showMyLocation ? effectiveUserLatLng : null"
                :radius-km="showMyLocation ? radiusKm : null"
                @marker-click="handleMarkerClick"
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import Header from '../components/Header.vue';
import JobsMap from '../components/JobsMap.vue';
import axios from 'axios';
import { useAuth } from '../composables/useAuth';

const { user } = useAuth();
const router = useRouter();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const loading = ref(false);
const jobs = ref([]);
const total = ref(0);
const page = ref(1);
const totalPages = ref(1);

const recommendedJobs = ref([]);
const recommendationLoading = ref(false);
const recommendationError = ref('');

const onlySaved = ref(false);
const savedJobIds = ref([]);

const showMap = ref(true);
const selectedJobId = ref(null);

const showMyLocation = ref(true);
const radiusKm = ref(10);
const sortByDistance = ref(false);
const filterWithinRadius = ref(false);

const currentLatLng = ref(null);

const filters = reactive({
  search: '',
  city: '',
  jobType: '',
  level: '',
});

let searchTimeout = null;

const CITY_CENTER = {
  'Hà Nội': [21.02776, 105.83416],
  'TP. Hồ Chí Minh': [10.77689, 106.70098],
  'Đà Nẵng': [16.05441, 108.20217],
  'Hải Phòng': [20.84491, 106.68808],
  'Cần Thơ': [10.04516, 105.78309],
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const getRecommendationScore = (job) => {
  const score = Number(job?.recommendation?.score || 0);
  if (!Number.isFinite(score)) return 0;
  return Math.round(score);
};

const getRecommendationTier = (job) => {
  const score = getRecommendationScore(job);

  if (score >= 80) {
    return { label: 'Phù hợp cao', className: 'tier-high', icon: '🔥' };
  }

  if (score >= 60) {
    return { label: 'Khá phù hợp', className: 'tier-medium', icon: '✨' };
  }

  if (score >= 40) {
    return { label: 'Có thể cân nhắc', className: 'tier-low', icon: '📌' };
  }

  return { label: 'Đề xuất thêm', className: 'tier-neutral', icon: '📝' };
};

const getRecommendationReasons = (job, limit = 3) => {
  const reasons = Array.isArray(job?.recommendation?.reasons)
    ? job.recommendation.reasons
    : [];

  return reasons.filter(Boolean).slice(0, limit);
};

const hasRecommendation = (job) => {
  return !!job?.recommendation && getRecommendationScore(job) > 0;
};

const getRecommendationSignalBadges = (job) => {
  const breakdown = job?.recommendation?.scoreBreakdown;
  if (!breakdown) return [];

  const badges = [];
  const profile = breakdown.profile || {};
  const context = breakdown.context || {};

  if ((profile.requiredSkillFit || 0) >= 0.35) {
    badges.push({
      label: 'Khớp kỹ năng',
      icon: '🧠',
      className: 'signal-skill',
    });
  }

  if ((profile.majorFit || 0) >= 1) {
    badges.push({
      label: 'Đúng ngành',
      icon: '🎓',
      className: 'signal-major',
    });
  }

  if ((profile.titleFit || 0) >= 0.7) {
    badges.push({
      label: 'Đúng vị trí mong muốn',
      icon: '🎯',
      className: 'signal-title',
    });
  }

  if ((context.jobTypeFit || 0) >= 1) {
    badges.push({
      label: 'Đúng loại việc',
      icon: '💼',
      className: 'signal-type',
    });
  }

  if (
    Number.isFinite(context.distanceKm) &&
    context.distanceKm <= 12
  ) {
    badges.push({
      label: 'Gần bạn',
      icon: '📍',
      className: 'signal-location',
    });
  }

  return badges.slice(0, 4);
};

const fetchSavedJobs = async () => {
  try {
    const headers = getAuthHeaders();
    if (!headers) {
      savedJobIds.value = [];
      return;
    }

    const res = await axios.get(`${API_URL}/jobs/saved/my`, { headers });
    const savedJobs = res.data.jobs || [];
    savedJobIds.value = savedJobs.map((job) => String(job._id));
  } catch (error) {
    console.error('❌ Error fetching saved jobs:', error.response?.data || error.message);
    savedJobIds.value = [];
  }
};

const fetchRecommendedJobs = async () => {
  try {
    recommendationLoading.value = true;
    recommendationError.value = '';

    const headers = getAuthHeaders();
    if (!headers) {
      recommendedJobs.value = [];
      return;
    }

    const res = await axios.get(`${API_URL}/recommendations/jobs?limit=6`, {
      headers,
    });

    recommendedJobs.value = (res.data?.jobs || []).map((job) => attachJobDistance(job));
  } catch (error) {
    console.error('❌ Error fetching recommended jobs:', error.response?.data || error.message);
    recommendationError.value =
      error.response?.data?.message || 'Không thể tải danh sách gợi ý';
    recommendedJobs.value = [];
  } finally {
    recommendationLoading.value = false;
  }
};

const toggleSaveJob = async (jobId) => {
  try {
    const headers = getAuthHeaders();
    if (!headers) {
      alert('Vui lòng đăng nhập để lưu việc làm');
      router.push('/login');
      return;
    }

    const id = String(jobId);
    const alreadySaved = savedJobIds.value.includes(id);

    if (alreadySaved) {
      await axios.delete(`${API_URL}/jobs/${id}/save`, { headers });
      savedJobIds.value = savedJobIds.value.filter((x) => x !== id);
    } else {
      await axios.post(`${API_URL}/jobs/${id}/save`, {}, { headers });
      savedJobIds.value.push(id);
    }
  } catch (error) {
    console.error('❌ Error toggling save job:', error.response?.data || error.message);
    alert(error.response?.data?.message || 'Không thể cập nhật trạng thái lưu việc làm');
  }
};

const goToJobDetail = async (jobId) => {
  try {
    const headers = getAuthHeaders();

    if (headers) {
      await axios.post(
        `${API_URL}/jobs/${jobId}/interactions/click`,
        {},
        { headers }
      );
    }
  } catch (error) {
    console.error('❌ Error recording click from job list:', error.response?.data || error.message);
  } finally {
    router.push(`/student/jobs/${jobId}`);
  }
};

const openRecommendedJob = async (jobId) => {
  await goToJobDetail(jobId);
};

function toLatLng(job) {
  const coords = job?.location?.coordinates;
  if (Array.isArray(coords) && coords.length === 2) {
    const [lng, lat] = coords;
    if (typeof lng === 'number' && typeof lat === 'number') return [lat, lng];
  }
  const city = job?.location?.city;
  if (city && CITY_CENTER[city]) return CITY_CENTER[city];
  return null;
}

const studentLatLng = computed(() => {
  const coords = user.value?.location?.coordinates;
  if (Array.isArray(coords) && coords.length === 2) {
    const [lng, lat] = coords;
    if (typeof lng === 'number' && typeof lat === 'number') return [lat, lng];
  }
  return null;
});

const effectiveUserLatLng = computed(() => {
  return studentLatLng.value || currentLatLng.value || null;
});

async function useCurrentLocation() {
  if (!navigator.geolocation) {
    alert('Trình duyệt của bạn không hỗ trợ định vị.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      currentLatLng.value = [pos.coords.latitude, pos.coords.longitude];
      showMyLocation.value = true;

      if (filterWithinRadius.value) {
        page.value = 1;
        fetchJobs();
      }

      if (recommendedJobs.value.length) {
        recommendedJobs.value = recommendedJobs.value.map((job) => attachJobDistance(job));
      }
    },
    (err) => {
      alert('Không lấy được vị trí hiện tại: ' + err.message);
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function toggleRadiusFilter() {
  if (!effectiveUserLatLng.value) {
    alert('Bạn cần có tọa độ để lọc theo bán kính. Hãy bấm “Dùng vị trí hiện tại” hoặc cập nhật hồ sơ.');
    return;
  }

  filterWithinRadius.value = !filterWithinRadius.value;

  if (filterWithinRadius.value) sortByDistance.value = true;

  page.value = 1;
  fetchJobs();
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getJobRealLatLng(job) {
  const coords = job?.location?.coordinates;
  if (Array.isArray(coords) && coords.length === 2) {
    const [lng, lat] = coords;
    if (typeof lng === 'number' && typeof lat === 'number') return [lat, lng];
  }
  return null;
}

function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

function attachJobDistance(job) {
  const s = effectiveUserLatLng.value;
  const latlng = toLatLng(job);
  let distanceKm = null;

  if (s) {
    const real = getJobRealLatLng(job);
    if (real) distanceKm = haversineKm(s[0], s[1], real[0], real[1]);
  }

  return { ...job, latlng, distanceKm };
}

const jobsDecorated = computed(() => {
  return (jobs.value || []).map((job) => attachJobDistance(job));
});

const radiusFilteredJobs = computed(() => {
  if (!filterWithinRadius.value) return jobsDecorated.value;

  const s = effectiveUserLatLng.value;
  if (!s) return jobsDecorated.value;

  const r = Number(radiusKm.value);
  if (!r || r <= 0) return jobsDecorated.value;

  return jobsDecorated.value.filter((j) => j.distanceKm != null && j.distanceKm <= r);
});

const insideRadiusCount = computed(() => {
  if (!filterWithinRadius.value || !effectiveUserLatLng.value) return 0;
  return total.value || 0;
});

const displayJobs = computed(() => {
  let arr = [...radiusFilteredJobs.value];

  if (onlySaved.value) {
    arr = arr.filter((job) => savedJobIds.value.includes(String(job._id)));
  }

  if (sortByDistance.value && effectiveUserLatLng.value) {
    arr.sort((a, b) => {
      const da = a.distanceKm == null ? Number.POSITIVE_INFINITY : a.distanceKm;
      const db = b.distanceKm == null ? Number.POSITIVE_INFINITY : b.distanceKm;
      return da - db;
    });
  }

  return arr;
});

const mapJobs = computed(() => {
  return displayJobs.value.filter((j) => Array.isArray(j.latlng) && j.latlng.length === 2);
});

const mapCenter = computed(() => {
  if (filters.city && CITY_CENTER[filters.city]) return CITY_CENTER[filters.city];
  if (effectiveUserLatLng.value && showMyLocation.value) return effectiveUserLatLng.value;
  if (mapJobs.value.length > 0) return mapJobs.value[0].latlng;
  return CITY_CENTER['TP. Hồ Chí Minh'];
});

const fetchJobs = async () => {
  try {
    loading.value = true;

    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.city) params.append('city', filters.city);
    if (filters.jobType) params.append('jobType', filters.jobType);
    if (filters.level) params.append('level', filters.level);

    if (filterWithinRadius.value && effectiveUserLatLng.value) {
      const [lat, lng] = effectiveUserLatLng.value;
      params.append('lat', String(lat));
      params.append('lng', String(lng));
      params.append('radiusKm', String(radiusKm.value));
    }

    params.append('page', page.value);
    params.append('limit', 12);

    const res = await axios.get(`${API_URL}/jobs/public?${params.toString()}`);
    jobs.value = res.data.jobs || [];
    total.value = res.data.total || 0;
    totalPages.value = res.data.totalPages || 1;

    if (selectedJobId.value) {
      const stillExists = jobs.value.some((j) => String(j._id) === String(selectedJobId.value));
      if (!stillExists) selectedJobId.value = null;
    }
  } catch (error) {
    console.error('❌ Error fetching jobs:', error);
    alert('Không thể tải danh sách công việc: ' + (error.response?.data?.message || error.message));
  } finally {
    loading.value = false;
  }
};

const debounceSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => handleSearch(), 500);
};

const handleSearch = () => {
  page.value = 1;
  fetchJobs();
};

const resetFilters = () => {
  filters.search = '';
  filters.city = '';
  filters.jobType = '';
  filters.level = '';
  page.value = 1;
  sortByDistance.value = false;
  filterWithinRadius.value = false;
  fetchJobs();
};

const changePage = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    page.value = newPage;
    fetchJobs();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

function handleMarkerClick(job) {
  selectedJobId.value = job._id;
  const el = document.getElementById(`job-${job._id}`);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) return parts[0][0] + parts[parts.length - 1][0];
  return name.substring(0, 2).toUpperCase();
};

const formatSalary = (salary) => {
  if (!salary) return 'Thỏa thuận';
  const minVal = typeof salary.min === 'number' ? salary.min : null;
  const maxVal = typeof salary.max === 'number' ? salary.max : null;
  if (minVal == null || maxVal == null) return 'Thỏa thuận';
  return `${(minVal / 1000000).toFixed(0)} - ${(maxVal / 1000000).toFixed(0)} triệu ${salary.currency || 'VND'}`;
};

const getJobTypeLabel = (type) => {
  const types = {
    'full-time': 'Toàn thời gian',
    'part-time': 'Bán thời gian',
    internship: 'Thực tập',
    contract: 'Hợp đồng',
    freelance: 'Freelance',
  };
  return types[type] || type || 'N/A';
};

const getLevelLabel = (level) => {
  const levels = {
    intern: 'Thực tập sinh',
    fresher: 'Fresher',
    junior: 'Junior',
    middle: 'Middle',
    senior: 'Senior',
    leader: 'Leader',
    manager: 'Manager',
  };
  return levels[level] || level || 'N/A';
};

watch(radiusKm, () => {
  if (filterWithinRadius.value && effectiveUserLatLng.value) {
    page.value = 1;
    fetchJobs();
  }

  if (recommendedJobs.value.length) {
    recommendedJobs.value = recommendedJobs.value.map((job) => attachJobDistance(job));
  }
});

watch(effectiveUserLatLng, () => {
  if (recommendedJobs.value.length) {
    recommendedJobs.value = recommendedJobs.value.map((job) => attachJobDistance(job));
  }
});

onMounted(async () => {
  await Promise.allSettled([
    fetchJobs(),
    fetchSavedJobs(),
    fetchRecommendedJobs(),
  ]);
});
</script>

<style scoped>
.student-jobs { min-height: 100vh; background: #f5f7fa; }
.container { max-width: 1400px; margin: 0 auto; padding: 30px 20px; }

.page-header { margin-bottom: 30px; }
.page-header h1 { font-size: 32px; color: #2c3e50; margin-bottom: 5px; }
.subtitle { color: #666; font-size: 16px; }

.search-section {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,.05);
  margin-bottom: 20px;
}

.search-bar { display: flex; gap: 15px; margin-bottom: 20px; }

.search-input {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: all .3s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102,126,234,.1);
}

.btn-search {
  padding: 12px 30px;
  background: linear-gradient(135deg,#667eea 0%,#764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all .3s;
}

.btn-search:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102,126,234,.4);
}

.filters { display: flex; gap: 15px; flex-wrap: wrap; }

.filters select {
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all .3s;
}

.filters select:focus {
  outline: none;
  border-color: #667eea;
}

.btn-reset {
  padding: 10px 20px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all .3s;
}

.btn-reset:hover {
  border-color: #667eea;
  color: #667eea;
}

.stats-bar {
  background: white;
  padding: 15px 25px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.stats-bar strong { color: #667eea; }
.stats-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.inside-count { color: #374151; font-size: 13px; margin-left: 6px; }

.btn-map-toggle {
  padding: 10px 14px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all .3s;
  white-space: nowrap;
}

.btn-map-toggle:hover {
  border-color: #667eea;
  color: #667eea;
}

.my-location { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

.chk {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #444;
  user-select: none;
}

.radius-select {
  padding: 8px 10px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
}

.btn-near,
.btn-current,
.btn-radius-filter {
  padding: 8px 10px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  background: white;
  cursor: pointer;
  font-weight: 800;
  font-size: 13px;
  transition: all .25s;
}

.btn-near:hover:not(:disabled),
.btn-current:hover:not(:disabled),
.btn-radius-filter:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
}

.btn-near:disabled,
.btn-radius-filter:disabled {
  opacity: .55;
  cursor: not-allowed;
}

.recommend-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}

.recommend-section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.recommend-section-header h2 {
  margin: 0 0 4px;
  font-size: 22px;
  color: #1f2937;
}

.recommend-section-header p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.btn-refresh-recommend {
  padding: 10px 14px;
  border-radius: 10px;
  border: 2px solid #dbeafe;
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s;
  white-space: nowrap;
}

.btn-refresh-recommend:hover:not(:disabled) { background: #dbeafe; }
.btn-refresh-recommend:disabled { opacity: 0.7; cursor: not-allowed; }

.recommend-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #4b5563;
  font-size: 14px;
}

.recommend-error {
  padding: 12px;
  border-radius: 10px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  font-size: 14px;
}

.recommend-empty {
  padding: 14px;
  border-radius: 10px;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  color: #6b7280;
  font-size: 14px;
}

.recommend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.recommend-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  transition: all 0.25s;
}

.recommend-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}

.recommend-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.recommend-left {
  display: flex;
  gap: 12px;
  min-width: 0;
}

.recommend-company-logo {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  flex-shrink: 0;
}

.recommend-title-wrap {
  min-width: 0;
}

.recommend-ribbon {
  display: inline-block;
  margin-bottom: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #2563eb;
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
}

.recommend-title-wrap h3 {
  margin: 0 0 4px;
  font-size: 16px;
  color: #111827;
  line-height: 1.4;
}

.recommend-title-wrap p {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.recommend-score-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
}

.recommend-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #4b5563;
}

.location-hint {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #7c2d12;
  padding: 10px 12px;
  border-radius: 10px;
  margin-bottom: 10px;
  font-size: 13px;
}

.radius-hint {
  background: #ecfeff;
  border: 1px solid #a5f3fc;
  color: #155e75;
  padding: 10px 12px;
  border-radius: 10px;
  margin-bottom: 14px;
  font-size: 13px;
}

.loading { text-align: center; padding: 60px 20px; }

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin .8s linear infinite;
  margin: 0 auto 20px;
}

.spinner.small {
  width: 18px;
  height: 18px;
  margin: 0;
  border-width: 3px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.content-split {
  display: grid;
  grid-template-columns: minmax(0,1fr) 420px;
  gap: 20px;
  align-items: start;
}

.content-split.no-map { grid-template-columns: 1fr; }
.left-col { min-width: 0; }
.right-col { position: static; }

.map-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,.05);
  padding: 14px;
}

.map-header { margin-bottom: 10px; }
.map-header h2 { font-size: 16px; color: #2c3e50; margin: 0 0 6px; }
.map-subtitle { margin: 0; color: #666; font-size: 12px; }
.map-body { height: 520px; min-height: 420px; }

.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  grid-column: 1 / -1;
}

.job-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0,0,0,.05);
  transition: all .3s;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.job-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,.1);
}

.job-card.selected {
  outline: 3px solid rgba(102,126,234,.25);
  border: 1px solid rgba(102,126,234,.35);
}

.job-header { display: flex; gap: 15px; margin-bottom: 18px; }

.company-logo {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg,#667eea 0%,#764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 20px;
  flex-shrink: 0;
}

.job-title-area h3 { font-size: 18px; color: #2c3e50; margin-bottom: 5px; }
.company-name { font-size: 14px; color: #666; }

.recommendation-box {
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.recommendation-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.recommendation-tier {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 13px;
  font-weight: 600;
}

.tier-icon { line-height: 1; }

.tier-high { background: #dcfce7; color: #166534; }
.tier-medium { background: #dbeafe; color: #1d4ed8; }
.tier-low { background: #fef3c7; color: #92400e; }
.tier-neutral { background: #e5e7eb; color: #374151; }

.recommendation-score {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 10px;
  color: #ffffff;
}

.recommendation-score.tier-high,
.recommend-score-badge.tier-high { background: #166534; color: #ffffff; }

.recommendation-score.tier-medium,
.recommend-score-badge.tier-medium { background: #1d4ed8; color: #ffffff; }

.recommendation-score.tier-low,
.recommend-score-badge.tier-low { background: #92400e; color: #ffffff; }

.recommendation-score.tier-neutral,
.recommend-score-badge.tier-neutral { background: #374151; color: #ffffff; }

.score-label { font-size: 12px; opacity: 0.85; }
.score-value { font-size: 18px; font-weight: 700; line-height: 1; }

.smart-signal-list {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.smart-signal-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.signal-skill { background: #ede9fe; color: #5b21b6; }
.signal-major { background: #dcfce7; color: #166534; }
.signal-title { background: #dbeafe; color: #1d4ed8; }
.signal-type { background: #fef3c7; color: #92400e; }
.signal-location { background: #fee2e2; color: #b91c1c; }

.recommendation-reasons,
.recommend-reasons {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.reason-chip,
.recommend-reason-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid #dbeafe;
  color: #1e3a8a;
  font-size: 12px;
  font-weight: 600;
}

.job-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.icon { font-size: 16px; }

.distance {
  grid-column: 1 / -1;
  background: #f7f7ff;
  border: 1px solid rgba(102,126,234,.15);
  padding: 10px 12px;
  border-radius: 10px;
}

.distance.muted {
  background: #fafafa;
  border-color: #eee;
  color: #999;
}

.job-skills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 15px; }
.skill-tag { padding: 5px 12px; background: #f0f0f0; border-radius: 15px; font-size: 12px; color: #666; }
.skill-more { padding: 5px 12px; background: #667eea; color: white; border-radius: 15px; font-size: 12px; }

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
  gap: 12px;
}

.job-meta { display: flex; gap: 15px; }
.meta-item { font-size: 13px; color: #999; }

.footer-actions,
.recommend-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all .3s;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: linear-gradient(135deg,#667eea 0%,#764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102,126,234,.4);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 22px;
}

.btn-page {
  padding: 10px 20px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all .3s;
}

.btn-page:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
}

.btn-page:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.page-info { font-weight: 500; color: #2c3e50; }

@media (max-width: 1024px) {
  .content-split { grid-template-columns: 1fr; }
  .map-body { height: 520px; }
}

@media (max-width: 768px) {
  .jobs-grid,
  .recommend-grid { grid-template-columns: 1fr; }
  .search-bar { flex-direction: column; }
  .filters { flex-direction: column; }
  .filters select { width: 100%; }
  .job-details { grid-template-columns: 1fr; }
  .stats-bar,
  .recommend-section-header { flex-direction: column; align-items: stretch; }
  .btn-map-toggle,
  .btn-refresh-recommend { width: 100%; }
  .job-footer,
  .recommend-actions { flex-direction: column; align-items: stretch; }
  .footer-actions { justify-content: stretch; }
}
</style>