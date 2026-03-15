<template>
  <!-- ============================================================
       TRANG CHỦ CÔNG KHAI – PublicHome.vue
       Hiển thị cho khách chưa đăng nhập
       Giao diện theo chuẩn WorkBridge prototype
  ============================================================ -->
  <div class="home">
    <Header />

    <!-- ══════════════════════════════════
         HERO SECTION
    ══════════════════════════════════ -->
    <section class="hero">
      <div class="wb-container">

        <!-- Eyebrow label nhỏ trên tiêu đề -->
        <p class="wb-hero-eyebrow">🎓 Nền tảng việc làm sinh viên #1</p>

        <!-- Tiêu đề lớn – dùng DM Serif Display -->
        <h1 class="wb-hero-title">
          Tìm việc <em>phù hợp</em><br>với bạn nhất
        </h1>

        <!-- Mô tả ngắn -->
        <p class="wb-hero-sub">
          Hơn 1,200 vị trí part-time, internship và fresher từ các công ty uy tín.
        </p>

        <!-- Nút hành động -->
        <div class="hero-actions">
          <router-link to="/jobs/public" class="wb-btn wb-btn-primary wb-btn-lg">
            Khám phá việc làm ngay
          </router-link>
          <router-link to="/register" class="wb-btn wb-btn-ghost wb-btn-lg">
            Tạo tài khoản miễn phí
          </router-link>
        </div>

        <!-- Thống kê nhanh -->
        <div class="wb-hero-stats">
          <div class="hero-stat">
            <div class="wb-hero-stat-num">10,000+</div>
            <div class="wb-hero-stat-label">Sinh viên</div>
          </div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat">
            <div class="wb-hero-stat-num">500+</div>
            <div class="wb-hero-stat-label">Công ty</div>
          </div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat">
            <div class="wb-hero-stat-num">5,000+</div>
            <div class="wb-hero-stat-label">Việc làm</div>
          </div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat">
            <div class="wb-hero-stat-num">94%</div>
            <div class="wb-hero-stat-label">Độ chính xác gợi ý</div>
          </div>
        </div>

      </div>
    </section>

    <!-- ══════════════════════════════════
         PHẦN GIỚI THIỆU 3 LOẠI TÀI KHOẢN
    ══════════════════════════════════ -->
    <section class="roles-section">
      <div class="wb-container">
        <div class="roles-grid">

          <!-- Card: Việc làm công khai -->
          <div class="role-card">
            <div class="role-icon" style="background: var(--accent-light);">🔍</div>
            <h3>Xem việc làm</h3>
            <p>Duyệt toàn bộ tin tuyển dụng công khai mà không cần đăng nhập.</p>
            <router-link to="/jobs/public" class="wb-btn wb-btn-outline wb-btn-sm" style="margin-top: 16px;">
              Xem ngay →
            </router-link>
          </div>

          <!-- Card: Sinh viên -->
          <div class="role-card">
            <div class="role-icon" style="background: var(--green-light);">🎓</div>
            <h3>Tài khoản Sinh viên</h3>
            <p>Đăng nhập để lưu việc làm, ứng tuyển và nhận gợi ý cá nhân hóa.</p>
            <router-link to="/login" class="wb-btn wb-btn-outline wb-btn-sm" style="margin-top: 16px;">
              Đăng nhập →
            </router-link>
          </div>

          <!-- Card: Nhà tuyển dụng -->
          <div class="role-card">
            <div class="role-icon" style="background: var(--amber-light);">🏢</div>
            <h3>Nhà tuyển dụng</h3>
            <p>Đăng tin tuyển dụng và tiếp cận hàng nghìn sinh viên tài năng.</p>
            <router-link to="/register" class="wb-btn wb-btn-outline wb-btn-sm" style="margin-top: 16px;">
              Đăng ký →
            </router-link>
          </div>

        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════
         TÍNH NĂNG NỔI BẬT
    ══════════════════════════════════ -->
    <section class="features-section">
      <div class="wb-container">
        <p class="section-eyebrow">Tính năng</p>
        <h2 class="section-title">Mọi thứ bạn cần để tìm việc thành công</h2>

        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-num">01</div>
            <h4>Tìm kiếm thông minh</h4>
            <p>Lọc theo thành phố, loại hình, cấp bậc và kỹ năng. Bản đồ hiển thị việc làm gần bạn.</p>
          </div>
          <div class="feature-item">
            <div class="feature-num">02</div>
            <h4>Gợi ý cá nhân hóa</h4>
            <p>AI phân tích hồ sơ của bạn và đề xuất công việc phù hợp với điểm số minh bạch.</p>
          </div>
          <div class="feature-item">
            <div class="feature-num">03</div>
            <h4>Theo dõi ứng tuyển</h4>
            <p>Quản lý đơn, nhận cập nhật từ nhà tuyển dụng và xem lịch phỏng vấn.</p>
          </div>
          <div class="feature-item">
            <div class="feature-num">04</div>
            <h4>Nhà tuyển dụng xác thực</h4>
            <p>Chỉ công ty đã được Admin duyệt mới được đăng tin — thông tin đảm bảo chính xác.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════
         CTA CUỐI TRANG
    ══════════════════════════════════ -->
    <section class="cta-section">
      <div class="wb-container">
        <div class="cta-box">
          <h2>Sẵn sàng bắt đầu?</h2>
          <p>Đăng ký miễn phí và khám phá hàng nghìn cơ hội việc làm dành cho sinh viên.</p>
          <div class="cta-actions">
            <router-link to="/register" class="wb-btn wb-btn-primary wb-btn-lg">
              Đăng ký ngay
            </router-link>
            <router-link to="/jobs/public" class="wb-btn cta-ghost wb-btn-lg">
              Xem việc làm
            </router-link>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
// Trang này chỉ dùng component Header, không cần state hay API
import Header from '../components/PublicHeader.vue'
</script>

<style scoped>
/* ════════════════════════════════════
   HERO
════════════════════════════════════ */
.hero {
  padding: 80px 0 64px;
  background: linear-gradient(160deg, var(--accent-light) 0%, var(--bg) 55%);
  border-bottom: 1px solid var(--border);
}

/* Nút hành động dưới hero title */
.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 0;
}

/* Đường kẻ dọc phân cách stats */
.hero-stat-divider {
  width: 1px;
  height: 36px;
  background: var(--border);
  align-self: center;
}

/* ════════════════════════════════════
   ROLES SECTION
════════════════════════════════════ */
.roles-section {
  padding: 64px 0;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.role-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  transition: all 0.15s;
}

.role-card:hover {
  border-color: var(--accent);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

/* Icon tròn màu */
.role-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-bottom: 16px;
}

.role-card h3 {
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 8px;
}

.role-card p {
  font-size: 14px;
  color: var(--text-2);
  line-height: 1.6;
  font-weight: 300;
  flex: 1;
}

/* ════════════════════════════════════
   FEATURES SECTION
════════════════════════════════════ */
.features-section {
  padding: 72px 0;
  background: var(--bg);
}

/* Label nhỏ phía trên title section */
.section-eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 10px;
}

.section-title {
  font-family: var(--font-head);
  font-size: 32px;
  letter-spacing: -0.5px;
  margin-bottom: 40px;
  max-width: 500px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.feature-item {
  padding: 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: all 0.15s;
}

.feature-item:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Số thứ tự lớn kiểu serif */
.feature-num {
  font-family: var(--font-head);
  font-size: 32px;
  color: var(--border);
  margin-bottom: 12px;
  line-height: 1;
}

.feature-item h4 {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 8px;
}

.feature-item p {
  font-size: 13px;
  color: var(--text-2);
  line-height: 1.6;
  font-weight: 300;
}

/* ════════════════════════════════════
   CTA SECTION
════════════════════════════════════ */
.cta-section {
  padding: 64px 0;
  background: var(--surface);
  border-top: 1px solid var(--border);
}

.cta-box {
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #7c3aed 100%);
  border-radius: 20px;
  padding: 56px 48px;
  text-align: center;
  color: #fff;
}

.cta-box h2 {
  font-family: var(--font-head);
  font-size: 36px;
  color: #fff;
  margin-bottom: 12px;
}

.cta-box p {
  font-size: 17px;
  opacity: 0.85;
  margin-bottom: 32px;
  font-weight: 300;
}

.cta-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Nút phụ trong CTA (nền trong suốt trên gradient) */
.cta-ghost {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.cta-ghost:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* ════════════════════════════════════
   RESPONSIVE
════════════════════════════════════ */
@media (max-width: 1024px) {
  .features-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .roles-grid    { grid-template-columns: 1fr; }
  .features-grid { grid-template-columns: 1fr; }
  .hero          { padding: 56px 0 48px; }
  .cta-box       { padding: 40px 24px; }
  .cta-box h2    { font-size: 28px; }
}
</style>