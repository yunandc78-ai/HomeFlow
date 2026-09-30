/**
 * HomeFlow - Core Application Logic
 * Clean, Modern, Mobile-First Indonesian Household Operating System
 */

// Sound Effects Synthesizer using Web Audio API (tactile haptic feedback)
class SoundFX {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }
  playTap() {
    if (!window.homeStore?.data?.settings?.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {}
  }
  playSuccess() {
    if (!window.homeStore?.data?.settings?.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.35);
    } catch (e) {}
  }
}
const sfx = new SoundFX();

// Formatting Helpers
const formatIDR = (num) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(num || 0);
};

const formatDateID = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
};

// UI Notification Toast
function showToast(message, isSuccess = true) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast-msg ${isSuccess ? 'success' : ''}`;
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      ${isSuccess 
        ? '<polyline points="20 6 9 17 4 12"></polyline>' 
        : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'}
    </svg>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  sfx.playSuccess();
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// App Router & View Controller
class HomeFlowApp {
  constructor() {
    this.currentTab = 'home'; // 'home', 'finance', 'savings', 'inventory', 'shopping', 'planner'
    this.txFilter = 'all';
    this.invFilter = 'all';
    this.shopFilter = 'all';
    this.choreFilter = 'all';
    this.activePlannerTab = 'meals'; // 'meals' or 'chores'
    this.tempLogo = { type: 'emoji', value: '🏡' };
    this.init();
  }

  init() {
    this.bindEvents();
    this.checkAuth();
    this.applySettingsTheme();

    // Subscribe to store updates
    window.homeStore.subscribe(() => {
      this.renderCurrentView();
    });
  }

  // --- Authentication ---
  checkAuth() {
    const auth = window.homeStore.data.auth;
    const loginWrapper = document.getElementById('loginScreenWrapper');
    if (!auth.isLoggedIn) {
      if (loginWrapper) loginWrapper.style.display = 'flex';
      this.updateLoginPill();
    } else {
      if (loginWrapper) loginWrapper.style.display = 'none';
      this.renderCurrentView();
    }
  }

  updateLoginPill() {
    const adminUser = window.homeStore.data.auth.users.find(u => u.username === 'admin');
    const currentPass = adminUser ? adminUser.password : '123';
    const pill = document.getElementById('demoCredentialsPill');
    if (pill) {
      pill.innerHTML = `✨ Klik di sini untuk isi Akun Admin (admin / ${currentPass})`;
    }
    const passInput = document.getElementById('loginPass');
    if (passInput) passInput.value = currentPass;
  }

  autofillLogin() {
    sfx.playTap();
    const adminUser = window.homeStore.data.auth.users.find(u => u.username === 'admin');
    const currentPass = adminUser ? adminUser.password : '123';
    const uInput = document.getElementById('loginUser');
    const pInput = document.getElementById('loginPass');
    if (uInput) uInput.value = 'admin';
    if (pInput) pInput.value = currentPass;
    showToast(`Kredensial admin terisi (admin / ${currentPass})`);
  }

  login(username, password) {
    sfx.playTap();
    const user = window.homeStore.data.auth.users.find(
      u => u.username === username.trim() && u.password === password.trim()
    );
    if (user) {
      window.homeStore.data.auth.isLoggedIn = true;
      window.homeStore.data.auth.currentUser = { ...user };
      window.homeStore.save();
      showToast(`Selamat datang, ${user.name}!`);
      this.checkAuth();
      return true;
    } else {
      showToast('Username atau kata sandi salah', false);
      return false;
    }
  }

  logout() {
    sfx.playTap();
    if (confirm('Keluar dari sesi akun HomeFlow?')) {
      window.homeStore.data.auth.isLoggedIn = false;
      window.homeStore.data.auth.currentUser = null;
      window.homeStore.save();
      this.checkAuth();
      showToast('Berhasil keluar akun');
    }
  }

  handleAdminChangePassword() {
    const oldPass = document.getElementById('oldAdminPass')?.value;
    const newPass = document.getElementById('newAdminPass')?.value;
    const confirmPass = document.getElementById('confirmAdminPass')?.value;

    if (!oldPass || !newPass) {
      alert('Semua kolom password wajib diisi!');
      return;
    }

    if (newPass !== confirmPass) {
      alert('Konfirmasi password baru tidak cocok!');
      return;
    }

    const res = window.homeStore.changeAdminPassword(oldPass, newPass);
    if (res.success) {
      sfx.playSuccess();
      this.closeModal('modalChangePassword');
      showToast('🔒 Password admin berhasil diubah!');
      if (document.getElementById('oldAdminPass')) document.getElementById('oldAdminPass').value = '';
      if (document.getElementById('newAdminPass')) document.getElementById('newAdminPass').value = '';
      if (document.getElementById('confirmAdminPass')) document.getElementById('confirmAdminPass').value = '';
      this.updateLoginPill();
    } else {
      alert(res.message || 'Gagal mengubah password');
    }
  }

  // --- Theme & Viewport Controls ---
  toggleViewMode() {
    sfx.playTap();
    const wrapper = document.getElementById('viewportWrapper');
    const isFrame = wrapper.classList.toggle('is-frame-mode');
    window.homeStore.data.settings.viewMode = isFrame ? 'mobile-frame' : 'fluid';
    window.homeStore.save();
    const btn = document.getElementById('btnToggleViewMode');
    if (btn) {
      btn.innerHTML = isFrame 
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> Tampilan Layar Penuh`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg> Mode HP (Frame)`;
    }
  }

  toggleTheme() {
    sfx.playTap();
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark-sage' ? 'sage-warm' : 'dark-sage';
    document.documentElement.setAttribute('data-theme', newTheme);
    window.homeStore.data.settings.theme = newTheme;
    window.homeStore.save();
    showToast(`Tema diganti ke ${newTheme === 'dark-sage' ? 'Dark Sage' : 'Warm Sage'}`);
  }

  applySettingsTheme() {
    const savedTheme = window.homeStore.data.settings?.theme || 'sage-warm';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const wrapper = document.getElementById('viewportWrapper');
    const isFrame = window.homeStore.data.settings?.viewMode !== 'fluid';
    if (isFrame) wrapper.classList.add('is-frame-mode');
    else wrapper.classList.remove('is-frame-mode');
  }

  // --- Tab Navigation ---
  switchTab(tabId) {
    sfx.playTap();
    this.currentTab = tabId;
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    this.renderCurrentView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Master View Dispatcher ---
  renderCurrentView() {
    const content = document.getElementById('appContent');
    if (!content) return;

    // Update Header
    const branding = window.homeStore.data.branding || {
      logoType: 'emoji',
      logoValue: '🏡',
      appName: 'HomeFlow',
      familyName: 'Keluarga Raharja'
    };
    const user = window.homeStore.data.auth.currentUser || { name: branding.familyName || 'Keluarga Raharja' };
    const headerTitle = document.getElementById('headerGreetingTitle');
    if (headerTitle) {
      headerTitle.innerHTML = `Halo, ${(user.name || branding.familyName).split(' ')[0]} 👋`;
    }
    const currentMonthLabel = document.getElementById('headerMonthLabel');
    if (currentMonthLabel) {
      currentMonthLabel.innerText = window.homeStore.data.settings.currentMonth;
    }

    // Render Mobile Avatar Logo
    const avatarEl = document.getElementById('headerAvatarContent');
    if (avatarEl) {
      if (branding.logoType === 'image') {
        avatarEl.innerHTML = `<img src="${branding.logoValue}" alt="Logo">`;
      } else {
        avatarEl.innerHTML = branding.logoValue || '🏡';
      }
    }

    // Render Desktop Brand Logo & App Name
    const desktopLogoEl = document.getElementById('desktopLogoIcon');
    if (desktopLogoEl) {
      if (branding.logoType === 'image') {
        desktopLogoEl.innerHTML = `<img src="${branding.logoValue}" alt="Logo">`;
      } else {
        desktopLogoEl.innerHTML = branding.logoValue || '🏡';
      }
    }
    const desktopAppEl = document.getElementById('desktopAppName');
    if (desktopAppEl) {
      desktopAppEl.innerText = branding.appName || 'HomeFlow';
    }

    switch (this.currentTab) {
      case 'home':
        this.renderHomeDashboard(content);
        break;
      case 'finance':
        this.renderFinanceView(content);
        break;
      case 'savings':
        this.renderSavingsView(content);
        break;
      case 'inventory':
        this.renderInventoryView(content);
        break;
      case 'shopping':
        this.renderShoppingView(content);
        break;
      case 'planner':
        this.renderPlannerView(content);
        break;
      case 'roadmap':
        this.renderRoadmapView(content);
        break;
      default:
        this.renderHomeDashboard(content);
    }
  }

  // =========================================================================
  // VIEW: Bento Grid Dashboard
  // =========================================================================
  renderHomeDashboard(container) {
    const summary = window.homeStore.getFinancialSummary();
    const inventory = window.homeStore.data.inventory;
    const shopping = window.homeStore.data.shoppingList;
    const chores = window.homeStore.data.chores;
    const meals = window.homeStore.data.mealPlans[0]?.meals || {};

    const lowStockItems = inventory.filter(i => i.currentStock <= i.minStock);
    const uncompletedShop = shopping.filter(s => !s.completed);
    const todayChores = chores.slice(0, 3);

    container.innerHTML = `
      <!-- Hero Bento Card: Keuangan & Kas -->
      <div class="hero-finance-card bento-card bento-span-2">
        <div class="hero-header-row">
          <div class="hero-pill-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Ringkasan Keuangan
          </div>
          <button class="btn-toggle-view" style="background: rgba(255,255,255,0.22); color:white;" onclick="app.openModal('modalSalaryAllocator')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Atur Gaji
          </button>
        </div>

        <div class="hero-currency-label">Saldo Kas Tersisa</div>
        <div class="hero-main-amount">${formatIDR(summary.remainingCash)}</div>

        <div class="hero-stats-subgrid">
          <div class="hero-stat-item">
            <span class="hero-stat-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
              Total Gaji & Pemasukan
            </span>
            <span class="hero-stat-value">${formatIDR(summary.totalIncome)}</span>
          </div>
          <div class="hero-stat-item">
            <span class="hero-stat-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/></svg>
              Pengeluaran Terpakai
            </span>
            <span class="hero-stat-value">${formatIDR(summary.totalExpense)}</span>
          </div>
        </div>
      </div>

      <!-- USP Banner: Smart Salary Allocator & Auto-Sync -->
      <div class="usp-allocator-banner">
        <div class="usp-content">
          <h3>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Smart Salary Allocator
          </h3>
          <p>Alokasikan total gaji bulanan otomatis untuk operasional dapur, tabungan, dan belanja harian.</p>
        </div>
        <button class="btn-allocator-sparkle" onclick="app.openModal('modalSalaryAllocator')">
          Hitung Alokasi
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
      </div>

      <!-- Bento Grid Cards -->
      <div class="bento-grid">
        <!-- Bento 1: Tabungan & Investasi Widget -->
        <div class="bento-card" onclick="app.switchTab('savings')">
          <div class="bento-card-header">
            <div class="bento-title-group">
              <div class="bento-icon-badge gold">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              </div>
              <div>
                <h4 class="bento-title">Tabungan Keluarga</h4>
                <span class="bento-subtitle">${summary.savingsProgress}% dari Target</span>
              </div>
            </div>
            <span class="bento-action-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </span>
          </div>

          <div class="progress-bar-container">
            <div class="progress-bar-fill gold" style="width: ${summary.savingsProgress}%"></div>
          </div>

          <div style="margin-top: 10px; display: flex; justify-content: space-between; font-size: 12px;">
            <span style="color: var(--text-secondary);">Terkumpul</span>
            <span style="font-weight: 700; color: var(--text-main);">${formatIDR(summary.totalSavingsSaved)}</span>
          </div>
        </div>

        <!-- Bento 2: Inventaris & Sembako Alert -->
        <div class="bento-card" onclick="app.switchTab('inventory')">
          <div class="bento-card-header">
            <div class="bento-title-group">
              <div class="bento-icon-badge terracotta">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </div>
              <div>
                <h4 class="bento-title">Inventaris Dapur</h4>
                <span class="bento-subtitle">${lowStockItems.length} Stok Menipis</span>
              </div>
            </div>
            <span class="bento-action-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </span>
          </div>

          <div class="mini-item-list">
            ${lowStockItems.slice(0, 2).map(item => `
              <div class="mini-item-row">
                <div class="mini-item-left">
                  <span class="status-badge ${item.currentStock === 0 ? 'danger' : 'warning'}">
                    ${item.currentStock === 0 ? 'Habis' : 'Menipis'}
                  </span>
                  <div>
                    <div class="mini-item-name">${item.name}</div>
                    <div class="mini-item-sub">Sisa: ${item.currentStock} ${item.unit}</div>
                  </div>
                </div>
              </div>
            `).join('') || '<div style="font-size:12px; color:var(--text-muted); padding:6px;">Semua sembako stok aman! 🌿</div>'}
          </div>
        </div>

        <!-- Bento 3: Daftar Belanja Singkat -->
        <div class="bento-card bento-span-2">
          <div class="bento-card-header">
            <div class="bento-title-group">
              <div class="bento-icon-badge blue">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              </div>
              <div>
                <h4 class="bento-title">Checklist Belanja Aktif</h4>
                <span class="bento-subtitle">${uncompletedShop.length} item perlu dibeli</span>
              </div>
            </div>
            <button class="btn-secondary" style="font-size: 11px; padding: 4px 10px;" onclick="app.switchTab('shopping')">
              Lihat Semua
            </button>
          </div>

          <div class="mini-item-list">
            ${uncompletedShop.slice(0, 3).map(item => `
              <div class="mini-item-row" onclick="app.toggleShoppingItem('${item.id}')">
                <div class="mini-item-left">
                  <div class="custom-checkbox-wrapper ${item.completed ? 'checked' : ''}">
                    <div class="custom-checkbox">
                      ${item.completed ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                    </div>
                    <div>
                      <div class="mini-item-name task-title">${item.name}</div>
                      <div class="mini-item-sub">${item.qty} ${item.unit} • Est. ${formatIDR(item.priceEstimate)}</div>
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Bento 4: Tugas & Menu Masakan Hari Ini -->
        <div class="bento-card bento-span-2">
          <div class="bento-card-header">
            <div class="bento-title-group">
              <div class="bento-icon-badge" style="background: var(--accent-purple-soft); color: var(--accent-purple);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <div>
                <h4 class="bento-title">Tugas & Menu Masak Hari Ini</h4>
                <span class="bento-subtitle">Menu & Pembagian Rumah</span>
              </div>
            </div>
            <button class="btn-secondary" style="font-size: 11px; padding: 4px 10px;" onclick="app.switchTab('planner')">
              Buka Planner
            </button>
          </div>

          <div style="background: var(--bg-subtle); border-radius: var(--radius-md); padding: 12px; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">
              <span>🍲 Menu Utama Hari Ini</span>
              <span class="status-badge safe" style="font-size: 10px;">Makan Siang</span>
            </div>
            <div style="font-weight: 700; color: var(--text-main); font-size: 14px;">
              ${meals.lunch?.title || 'Sayur Asem & Tempe Bacem'}
            </div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
              ${meals.lunch?.desc || 'Sayur asem bening segar dengan rempah nusantara'}
            </div>
          </div>

          <div class="mini-item-list">
            ${todayChores.map(chore => `
              <div class="mini-item-row" onclick="app.toggleChore('${chore.id}')">
                <div class="custom-checkbox-wrapper ${chore.completed ? 'checked' : ''}">
                  <div class="custom-checkbox">
                    ${chore.completed ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                  </div>
                  <div>
                    <div class="mini-item-name task-title">${chore.title}</div>
                    <div class="mini-item-sub">PIC: <strong>${chore.assignee}</strong> • ${chore.time}</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // VIEW: Keuangan & Kas (Input Gaji, Pemasukan, Pengeluaran)
  // =========================================================================
  renderFinanceView(container) {
    const summary = window.homeStore.getFinancialSummary();
    const transactions = window.homeStore.data.transactions;
    const salary = window.homeStore.data.salary;

    // Filter transactions
    const filteredTx = transactions.filter(tx => {
      if (this.txFilter === 'income') return tx.type === 'income';
      if (this.txFilter === 'expense') return tx.type === 'expense';
      if (this.txFilter !== 'all') {
        return tx.category === this.txFilter || tx.title.toLowerCase().includes(this.txFilter.toLowerCase());
      }
      return true;
    });

    // Routine bills breakdown
    const getCatSum = (cat) => transactions
      .filter(t => t.category === cat || t.title.toLowerCase().includes(cat.toLowerCase()))
      .reduce((s, t) => s + Number(t.amount || 0), 0);

    const expenseBelanja = getCatSum('Belanja Bulanan');
    const expenseListrik = getCatSum('Listrik');
    const expenseInternet = getCatSum('Internet');
    const expenseGas = getCatSum('Gas');
    const expenseIuranRT = getCatSum('Iuran RT');
    const totalRoutineExpenses = expenseBelanja + expenseListrik + expenseInternet + expenseGas + expenseIuranRT;

    container.innerHTML = `
      <div class="section-header-bar" style="flex-wrap: wrap; gap: 10px;">
        <div>
          <h2 class="section-title">Kas & Pengeluaran</h2>
          <p class="section-subtitle">Pencatatan Gaji Bulanan dan Arus Kas Rumah Tangga</p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn-primary" style="font-size: 13px; padding: 10px 16px;" onclick="app.openModal('modalRoutineExpenses')">
            ⚡ Input Tagihan Rutin
          </button>
          <button class="btn-secondary" style="font-size: 13px; padding: 10px 14px;" onclick="app.openModal('modalAddTransaction')">
            + Catat Manual
          </button>
        </div>
      </div>

      <!-- Routine Expenses Summary Card (Belanja, Listrik, Internet, Gas, Iuran RT) -->
      <div class="bento-card bento-span-2" style="background: linear-gradient(135deg, #fbf9f5 0%, #eff5f0 100%); border: 1.5px solid var(--primary-border); margin-bottom: 18px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <div>
            <span class="status-badge safe" style="font-size: 11px; margin-bottom: 4px;">Rincian Pengeluaran Rutin</span>
            <h3 style="font-size: 17px; font-weight: 800; color: var(--text-main);">Tagihan & Kebutuhan Bulanan</h3>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
              Total Terdata: <strong style="color: var(--primary); font-size: 14px;">${formatIDR(totalRoutineExpenses)}</strong>
            </div>
          </div>
          <button class="btn-secondary" style="font-size: 11px; padding: 5px 12px;" onclick="app.openModal('modalRoutineExpenses')">
            ✏️ Sesuaikan Nominal
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; margin-top: 10px;">
          <div style="background: var(--bg-surface); padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            <div style="font-size: 11px; color: var(--text-secondary);">🛒 Belanja Bulanan</div>
            <div style="font-weight: 800; font-size: 13px; color: var(--text-main); margin-top: 2px;">${formatIDR(expenseBelanja)}</div>
          </div>
          <div style="background: var(--bg-surface); padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            <div style="font-size: 11px; color: var(--text-secondary);">⚡ Listrik PLN</div>
            <div style="font-weight: 800; font-size: 13px; color: var(--text-main); margin-top: 2px;">${formatIDR(expenseListrik)}</div>
          </div>
          <div style="background: var(--bg-surface); padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            <div style="font-size: 11px; color: var(--text-secondary);">🌐 Internet WiFi</div>
            <div style="font-weight: 800; font-size: 13px; color: var(--text-main); margin-top: 2px;">${formatIDR(expenseInternet)}</div>
          </div>
          <div style="background: var(--bg-surface); padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            <div style="font-size: 11px; color: var(--text-secondary);">🔥 Gas Elpiji</div>
            <div style="font-weight: 800; font-size: 13px; color: var(--text-main); margin-top: 2px;">${formatIDR(expenseGas)}</div>
          </div>
          <div style="background: var(--bg-surface); padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            <div style="font-size: 11px; color: var(--text-secondary);">🏘️ Iuran RT</div>
            <div style="font-weight: 800; font-size: 13px; color: var(--text-main); margin-top: 2px;">${formatIDR(expenseIuranRT)}</div>
          </div>
        </div>
      </div>

      <!-- Quick Salary Update Card -->
      <div class="bento-card" style="margin-bottom: 18px; border-left: 4px solid var(--primary);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--primary);">Total Gaji Pokok Terdaftar</div>
            <div style="font-size: 22px; font-weight: 800; color: var(--text-main); margin-top: 2px;">${formatIDR(salary.monthlySalary)}</div>
            <div style="font-size: 11px; color: var(--text-secondary);">Periode: ${window.homeStore.data.settings.currentMonth}</div>
          </div>
          <button class="btn-secondary" onclick="app.openModal('modalSalaryAllocator')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Ubah Gaji & Alokasi
          </button>
        </div>
      </div>

      <!-- Balance Summary Cards -->
      <div class="bento-grid" style="margin-bottom: 20px;">
        <div class="bento-card">
          <div style="font-size: 11px; color: var(--text-secondary); font-weight: 600;">Saldo Kas Tersisa</div>
          <div style="font-size: 18px; font-weight: 800; color: var(--primary); margin-top: 4px;">${formatIDR(summary.remainingCash)}</div>
        </div>
        <div class="bento-card">
          <div style="font-size: 11px; color: var(--text-secondary); font-weight: 600;">Total Pengeluaran</div>
          <div style="font-size: 18px; font-weight: 800; color: var(--accent-terracotta); margin-top: 4px;">${formatIDR(summary.totalExpense)}</div>
        </div>
      </div>

      <!-- Filters with Requested Expense Categories -->
      <div class="filter-chips-row">
        <button class="chip-btn ${this.txFilter === 'all' ? 'active' : ''}" onclick="app.setTxFilter('all')">Semua Transaksi</button>
        <button class="chip-btn ${this.txFilter === 'Belanja Bulanan' ? 'active' : ''}" onclick="app.setTxFilter('Belanja Bulanan')">🛒 Belanja Bulanan</button>
        <button class="chip-btn ${this.txFilter === 'Listrik' ? 'active' : ''}" onclick="app.setTxFilter('Listrik')">⚡ Listrik</button>
        <button class="chip-btn ${this.txFilter === 'Internet' ? 'active' : ''}" onclick="app.setTxFilter('Internet')">🌐 Internet</button>
        <button class="chip-btn ${this.txFilter === 'Gas' ? 'active' : ''}" onclick="app.setTxFilter('Gas')">🔥 Gas</button>
        <button class="chip-btn ${this.txFilter === 'Iuran RT' ? 'active' : ''}" onclick="app.setTxFilter('Iuran RT')">🏘️ Iuran RT</button>
        <button class="chip-btn ${this.txFilter === 'expense' ? 'active' : ''}" onclick="app.setTxFilter('expense')">Semua Pengeluaran</button>
        <button class="chip-btn ${this.txFilter === 'income' ? 'active' : ''}" onclick="app.setTxFilter('income')">Pemasukan & Gaji</button>
      </div>

      <!-- Transaction List -->
      <div class="mini-item-list">
        ${filteredTx.length === 0 ? '<div style="text-align: center; color: var(--text-muted); padding: 30px;">Belum ada catatan transaksi pada filter ini.</div>' : ''}
        ${filteredTx.map(tx => `
          <div class="mini-item-row" style="padding: 14px 16px;">
            <div class="mini-item-left">
              <div class="bento-icon-badge ${tx.type === 'income' ? '' : 'terracotta'}" style="width: 34px; height: 34px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  ${tx.type === 'income' 
                    ? '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>' 
                    : '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>'}
                </svg>
              </div>
              <div>
                <div class="mini-item-name">${tx.title}</div>
                <div class="mini-item-sub">${formatDateID(tx.date)} • ${tx.category} ${tx.note ? `• <em>${tx.note}</em>` : ''}</div>
              </div>
            </div>
            <div style="text-align: right; display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 800; font-size: 14px; color: ${tx.type === 'income' ? 'var(--primary)' : 'var(--accent-terracotta)'};">
                ${tx.type === 'income' ? '+' : '-'}${formatIDR(tx.amount)}
              </span>
              <button class="icon-btn" style="width: 28px; height: 28px;" onclick="app.deleteTransaction('${tx.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // =========================================================================
  // VIEW: Tabungan Keluarga
  // =========================================================================
  renderSavingsView(container) {
    const savings = window.homeStore.data.savings;
    const summary = window.homeStore.getFinancialSummary();

    container.innerHTML = `
      <div class="section-header-bar">
        <div>
          <h2 class="section-title">Tabungan Keluarga</h2>
          <p class="section-subtitle">Target & Rencana Masa Depan Rumah Tangga</p>
        </div>
        <button class="btn-primary" onclick="app.openModal('modalAddSavings')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Tambah Target
        </button>
      </div>

      <!-- Top Metric Card -->
      <div class="bento-card bento-span-2" style="background: linear-gradient(135deg, #f7f3eb 0%, #edf4ee 100%); margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--accent-gold);">Total Tabungan Terkumpul</div>
            <div style="font-size: 26px; font-weight: 800; color: var(--text-main);">${formatIDR(summary.totalSavingsSaved)}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; color: var(--text-secondary);">Target Keseluruhan</div>
            <div style="font-size: 15px; font-weight: 700; color: var(--text-secondary);">${formatIDR(summary.totalSavingsTarget)}</div>
          </div>
        </div>
        <div class="progress-bar-container" style="height: 10px;">
          <div class="progress-bar-fill gold" style="width: ${summary.savingsProgress}%;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-secondary); margin-top: 6px;">
          <span>Progres Tabungan: <strong>${summary.savingsProgress}%</strong></span>
          <span>Sisa Kebutuhan: ${formatIDR(summary.totalSavingsTarget - summary.totalSavingsSaved)}</span>
        </div>
      </div>

      <!-- Tabungan Target Section -->
      <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 12px; color: var(--text-main);">🎯 Target Tabungan Keluarga</h3>
      <div class="bento-grid" style="margin-bottom: 24px;">
        ${savings.map(item => {
          const pct = Math.min(100, Math.round((item.current / item.target) * 100));
          return `
            <div class="bento-card bento-span-2">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <div>
                  <span class="status-badge safe" style="font-size: 10px; margin-bottom: 4px;">${item.category}</span>
                  <h4 style="font-size: 15px; font-weight: 700; color: var(--text-main);">${item.name}</h4>
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <button class="btn-secondary" style="font-size: 11px; padding: 4px 8px;" onclick="app.promptAllocateSavings('${item.id}', '${item.name}')">
                    + Setor
                  </button>
                  <button class="icon-btn" style="width: 28px; height: 28px;" title="Ubah Tabungan" onclick="app.openEditSavingsModal('${item.id}')">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="icon-btn" style="width: 28px; height: 28px; color: var(--accent-terracotta);" title="Hapus Tabungan" onclick="app.deleteSavings('${item.id}')">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>

              <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${pct}%; background: ${item.color || 'var(--primary)'};"></div>
              </div>

              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 6px;">
                <span style="font-weight: 700; color: var(--text-main);">${formatIDR(item.current)} <span style="font-weight: 400; color: var(--text-secondary);">/ ${formatIDR(item.target)}</span></span>
                <span style="font-weight: 800; color: ${item.color || 'var(--primary)'};">${pct}%</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // =========================================================================
  // VIEW: Inventaris Sembako & Dapur
  // =========================================================================
  renderInventoryView(container) {
    const inventory = window.homeStore.data.inventory;
    const filtered = inventory.filter(item => {
      if (this.invFilter === 'all') return true;
      return item.category === this.invFilter;
    });

    const categories = ['all', 'Bahan Pokok', 'Protein & Lauk', 'Bumbu & Rempah', 'Kebersihan'];

    container.innerHTML = `
      <div class="section-header-bar">
        <div>
          <h2 class="section-title">Inventaris Dapur</h2>
          <p class="section-subtitle">Kelola Stok Kebutuhan Sembako & Peringatan Habis</p>
        </div>
        <button class="btn-primary" onclick="app.openModal('modalAddInventory')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Tambah Stok
        </button>
      </div>

      <!-- Filter Categories -->
      <div class="filter-chips-row">
        ${categories.map(cat => `
          <button class="chip-btn ${this.invFilter === cat ? 'active' : ''}" onclick="app.setInvFilter('${cat}')">
            ${cat === 'all' ? 'Semua Kategori' : cat}
          </button>
        `).join('')}
      </div>

      <!-- Inventory Cards Grid -->
      <div class="bento-grid">
        ${filtered.map(item => {
          let statusClass = 'safe';
          let statusText = 'Aman';
          if (item.currentStock === 0) {
            statusClass = 'danger';
            statusText = 'Habis';
          } else if (item.currentStock <= item.minStock) {
            statusClass = 'warning';
            statusText = 'Menipis';
          }

          return `
            <div class="bento-card bento-span-2">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <div>
                  <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                    <span class="status-badge ${statusClass}">${statusText}</span>
                    <span style="font-size: 11px; color: var(--text-secondary);">${item.category} • ${item.location}</span>
                  </div>
                  <h4 style="font-size: 16px; font-weight: 800; color: var(--text-main);">${item.name}</h4>
                  <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
                    Batas Minimum: ${item.minStock} ${item.unit}
                  </div>
                </div>

                <!-- Stepper -->
                <div class="stepper-control">
                  <button class="btn-step" onclick="app.updateStock('${item.id}', -1)">-</button>
                  <span class="step-value">${item.currentStock} <small style="font-size:10px; font-weight:400;">${item.unit}</small></span>
                  <button class="btn-step" onclick="app.updateStock('${item.id}', 1)">+</button>
                </div>
              </div>

              <!-- Action to Send to Shopping List -->
              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid var(--border-subtle);">
                <span style="font-size: 12px; color: var(--text-secondary);">
                  Est. Harga: <strong>${formatIDR(item.priceEstimate)}</strong>
                </span>
                <button class="btn-secondary" style="font-size: 11px; padding: 4px 12px; color: var(--primary);" onclick="app.sendToShopping('${item.id}')">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                  + Masuk Daftar Belanja
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // =========================================================================
  // VIEW: Daftar Belanja Interaktif & Auto-Sync Belanja (USP)
  // =========================================================================
  renderShoppingView(container) {
    const shopping = window.homeStore.data.shoppingList;
    const filtered = shopping.filter(item => {
      if (this.shopFilter === 'active') return !item.completed;
      if (this.shopFilter === 'completed') return item.completed;
      return true;
    });

    const completedItems = shopping.filter(s => s.completed);
    const totalEstCost = shopping.reduce((sum, i) => sum + (Number(i.priceEstimate) || 0), 0);
    const completedEstCost = completedItems.reduce((sum, i) => sum + (Number(i.priceEstimate) || 0), 0);

    container.innerHTML = `
      <div class="section-header-bar">
        <div>
          <h2 class="section-title">Daftar Belanja</h2>
          <p class="section-subtitle">Checklist Belanja Interaktif & Auto-Sync ke Kas</p>
        </div>
        <button class="btn-primary" onclick="app.openModal('modalAddShopping')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Tambah Item
        </button>
      </div>

      <!-- Shopping Summary Card -->
      <div class="bento-card bento-span-2" style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 11px; color: var(--text-secondary);">Total Estimasi Belanja</div>
            <div style="font-size: 22px; font-weight: 800; color: var(--primary);">${formatIDR(totalEstCost)}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; color: var(--text-secondary);">Item Siap Disinkron</div>
            <div style="font-size: 15px; font-weight: 700; color: var(--text-main);">${completedItems.length} Selesai (${formatIDR(completedEstCost)})</div>
          </div>
        </div>

        ${completedItems.length > 0 ? `
          <button class="btn-accent-sync" onclick="app.executeAutoSyncShopping()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            ⚡ Selesaikan & Auto-Sync ke Kas (${completedItems.length} Item)
          </button>
          <div style="font-size: 11px; text-align: center; color: var(--text-secondary); margin-top: 6px;">
            Otomatis mencatat pengeluaran kas sebesar ${formatIDR(completedEstCost)} & menambah stok dapur!
          </div>
        ` : ''}
      </div>

      <!-- Filter Buttons -->
      <div class="filter-chips-row">
        <button class="chip-btn ${this.shopFilter === 'all' ? 'active' : ''}" onclick="app.setShopFilter('all')">Semua (${shopping.length})</button>
        <button class="chip-btn ${this.shopFilter === 'active' ? 'active' : ''}" onclick="app.setShopFilter('active')">Belum Dibeli (${shopping.filter(s => !s.completed).length})</button>
        <button class="chip-btn ${this.shopFilter === 'completed' ? 'active' : ''}" onclick="app.setShopFilter('completed')">Sudah Dicentang (${completedItems.length})</button>
      </div>

      <!-- Shopping Item List -->
      <div class="mini-item-list">
        ${filtered.length === 0 ? '<div style="text-align: center; color: var(--text-muted); padding: 30px;">Tidak ada item belanja dalam daftar ini.</div>' : ''}
        ${filtered.map(item => `
          <div class="mini-item-row" style="padding: 12px 14px;">
            <div class="custom-checkbox-wrapper ${item.completed ? 'checked' : ''}" onclick="app.toggleShoppingItem('${item.id}')">
              <div class="custom-checkbox">
                ${item.completed ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
              </div>
              <div>
                <div class="mini-item-name task-title">${item.name}</div>
                <div class="mini-item-sub">
                  ${item.qty} ${item.unit} • ${formatIDR(item.priceEstimate)}
                  ${item.linkedInventoryId ? '<span class="status-badge safe" style="font-size: 9px; padding: 1px 6px;">Sync Sembako</span>' : ''}
                  ${item.note ? `• <em>${item.note}</em>` : ''}
                </div>
              </div>
            </div>
            <button class="icon-btn" style="width: 28px; height: 28px;" onclick="app.deleteShoppingItem('${item.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }

  // =========================================================================
  // VIEW: Jadwal Tugas (Chores) & Meal Planner
  // =========================================================================
  renderPlannerView(container) {
    const mealPlans = window.homeStore.data.mealPlans[0] || { day: 'Rabu', meals: {} };
    const chores = window.homeStore.data.chores;

    container.innerHTML = `
      <div class="section-header-bar">
        <div>
          <h2 class="section-title">Jadwal & Meal Planner</h2>
          <p class="section-subtitle">Pembagian Tugas Rumah dan Menu Masakan Harian</p>
        </div>
      </div>

      <!-- Segmented Sub-Tab Switcher -->
      <div style="display: flex; background: var(--bg-subtle); padding: 4px; border-radius: var(--radius-pill); margin-bottom: 20px;">
        <button class="chip-btn ${this.activePlannerTab === 'meals' ? 'active' : ''}" style="flex:1; border:none;" onclick="app.switchPlannerSubTab('meals')">
          🍲 Menu Masakan Harian
        </button>
        <button class="chip-btn ${this.activePlannerTab === 'chores' ? 'active' : ''}" style="flex:1; border:none;" onclick="app.switchPlannerSubTab('chores')">
          🧹 Tugas Rumah (Chores)
        </button>
      </div>

      ${this.activePlannerTab === 'meals' ? this.renderMealPlannerSection(mealPlans) : this.renderChoresSection(chores)}
    `;
  }

  renderMealPlannerSection(dayPlan) {
    const meals = dayPlan.meals || {};
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
        <span style="font-weight: 700; color: var(--text-main); font-size: 15px;">Rencana Menu: <strong>${dayPlan.day}</strong></span>
        <button class="btn-secondary" style="font-size: 11px; padding: 4px 10px;" onclick="app.randomizeMealInspiration()">
          🎲 Acak Inspirasi Menu
        </button>
      </div>

      <div class="bento-grid">
        <!-- Breakfast -->
        <div class="bento-card bento-span-2">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span class="status-badge" style="background: var(--accent-gold-soft); color: var(--accent-gold);">🌅 Sarapan Pagi</span>
            <button class="btn-secondary" style="font-size: 11px; padding: 2px 8px;" onclick="app.editMealModal('breakfast', '${meals.breakfast?.title || ''}')">Ubah</button>
          </div>
          <h4 style="font-size: 16px; font-weight: 800; color: var(--text-main);">${meals.breakfast?.title || 'Nasi Goreng Telur'}</h4>
          <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">${meals.breakfast?.desc || 'Praktis dan bernutrisi untuk pagi hari'}</p>
          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px;">
            ${(meals.breakfast?.ingredients || ['Beras', 'Telur']).map(ing => `
              <span style="font-size: 10px; background: var(--bg-subtle); padding: 2px 8px; border-radius: var(--radius-pill); color: var(--text-secondary);">${ing}</span>
            `).join('')}
          </div>
        </div>

        <!-- Lunch -->
        <div class="bento-card bento-span-2">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span class="status-badge safe">☀️ Makan Siang</span>
            <button class="btn-secondary" style="font-size: 11px; padding: 2px 8px;" onclick="app.editMealModal('lunch', '${meals.lunch?.title || ''}')">Ubah</button>
          </div>
          <h4 style="font-size: 16px; font-weight: 800; color: var(--text-main);">${meals.lunch?.title || 'Sayur Asem & Tempe Bacem'}</h4>
          <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">${meals.lunch?.desc || 'Menu berkuah segar khas masakan rumah'}</p>
          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px;">
            ${(meals.lunch?.ingredients || ['Sayuran', 'Tempe']).map(ing => `
              <span style="font-size: 10px; background: var(--bg-subtle); padding: 2px 8px; border-radius: var(--radius-pill); color: var(--text-secondary);">${ing}</span>
            `).join('')}
          </div>
        </div>

        <!-- Dinner -->
        <div class="bento-card bento-span-2">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span class="status-badge" style="background: var(--accent-purple-soft); color: var(--accent-purple);">🌙 Makan Malam</span>
            <button class="btn-secondary" style="font-size: 11px; padding: 2px 8px;" onclick="app.editMealModal('dinner', '${meals.dinner?.title || ''}')">Ubah</button>
          </div>
          <h4 style="font-size: 16px; font-weight: 800; color: var(--text-main);">${meals.dinner?.title || 'Ayam Goreng Lengkuas'}</h4>
          <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">${meals.dinner?.desc || 'Lauk lezat untuk santap malam keluarga'}</p>
          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px;">
            ${(meals.dinner?.ingredients || ['Ayam', 'Bawang', 'Minyak']).map(ing => `
              <span style="font-size: 10px; background: var(--bg-subtle); padding: 2px 8px; border-radius: var(--radius-pill); color: var(--text-secondary);">${ing}</span>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  renderChoresSection(chores) {
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
        <span style="font-weight: 700; color: var(--text-main); font-size: 15px;">Daftar Tugas Rumah</span>
        <button class="btn-primary" style="font-size: 12px; padding: 8px 14px;" onclick="app.openModal('modalAddChore')">
          + Tambah Tugas
        </button>
      </div>

      <div class="mini-item-list">
        ${chores.map(chore => `
          <div class="mini-item-row" style="padding: 12px 14px;">
            <div class="custom-checkbox-wrapper ${chore.completed ? 'checked' : ''}" onclick="app.toggleChore('${chore.id}')">
              <div class="custom-checkbox">
                ${chore.completed ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
              </div>
              <div>
                <div class="mini-item-name task-title">${chore.title}</div>
                <div class="mini-item-sub">
                  Penanggung Jawab: <strong>${chore.assignee}</strong> • ${chore.day} (${chore.time})
                </div>
              </div>
            </div>
            <button class="icon-btn" style="width: 28px; height: 28px;" onclick="app.deleteChore('${chore.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }

  // =========================================================================
  // VIEW: Roadmap Lanjutan (V2 & V3 Preview)
  // =========================================================================
  renderRoadmapView(container) {
    container.innerHTML = `
      <div class="section-header-bar">
        <div>
          <h2 class="section-title">Roadmap Fitur</h2>
          <p class="section-subtitle">Fitur Generasi Mendatang (V2 & V3)</p>
        </div>
        <span class="roadmap-badge">Evolusi HomeFlow</span>
      </div>

      <div class="bento-grid">
        <!-- Feature 1: Auto-Budgeting Rule 50/30/20 -->
        <div class="bento-card bento-span-2">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div class="bento-icon-badge gold">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
            </div>
            <span class="roadmap-badge">V2 • Coming Soon</span>
          </div>
          <h3 style="font-size: 17px; font-weight: 800; color: var(--text-main);">Auto-Budgeting Rule 50/30/20</h3>
          <p style="font-size: 13px; color: var(--text-secondary); margin-top: 6px; line-height: 1.5;">
            Sistem otomatis membagi gaji bulanan ke tiga pos utama: 50% Kebutuhan Pokok (Needs), 30% Keinginan (Wants), dan 20% Tabungan/Investasi (Savings) dengan pembatasan saldo otomatis.
          </p>
          <div style="margin-top: 14px;">
            <button class="btn-secondary" style="font-size: 12px; width: 100%;" onclick="app.previewBudgetingDemo()">
              Lihat Simulasi Konsep 50/30/20
            </button>
          </div>
        </div>

        <!-- Feature 2: Pengingat Tagihan Bulanan -->
        <div class="bento-card bento-span-2">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div class="bento-icon-badge terracotta">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <span class="roadmap-badge">V2 • Coming Soon</span>
          </div>
          <h3 style="font-size: 17px; font-weight: 800; color: var(--text-main);">Pengingat Tagihan Bulanan</h3>
          <p style="font-size: 13px; color: var(--text-secondary); margin-top: 6px; line-height: 1.5;">
            Pengingat jatuh tempo otomatis untuk tagihan rutin rumah tangga: Token PLN, Tagihan Air PDAM, WiFi Rumah, IPL/Iuran Warga, dan BPJS Kesehatan lengkap dengan tanggal tagih kalender.
          </p>
          <div style="margin-top: 14px;">
            <button class="btn-secondary" style="font-size: 12px; width: 100%;" onclick="app.previewBillReminderDemo()">
              Lihat Contoh Tagihan Rutin
            </button>
          </div>
        </div>

        <!-- Feature 3: Scan Struk Belanja Otomatis (OCR) -->
        <div class="bento-card bento-span-2">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div class="bento-icon-badge blue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
            <span class="roadmap-badge">V3 • Coming Soon</span>
          </div>
          <h3 style="font-size: 17px; font-weight: 800; color: var(--text-main);">Scan Struk Belanja Otomatis (OCR)</h3>
          <p style="font-size: 13px; color: var(--text-secondary); margin-top: 6px; line-height: 1.5;">
            Cukup foto struk belanja supermarket atau pasar menggunakan kamera smartphone. Teknologi OCR otomatis mengekstrak nama barang, harga satuan, dan total belanja ke inventaris serta catatan kas!
          </p>
          <div style="margin-top: 14px;">
            <button class="btn-secondary" style="font-size: 12px; width: 100%;" onclick="app.previewOcrDemo()">
              Coba Simulasi Scan Struk
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // ACTIONS & HANDLERS
  // =========================================================================
  setTxFilter(filter) {
    sfx.playTap();
    this.txFilter = filter;
    this.renderFinanceView(document.getElementById('appContent'));
  }

  setInvFilter(filter) {
    sfx.playTap();
    this.invFilter = filter;
    this.renderInventoryView(document.getElementById('appContent'));
  }

  setShopFilter(filter) {
    sfx.playTap();
    this.shopFilter = filter;
    this.renderShoppingView(document.getElementById('appContent'));
  }

  switchPlannerSubTab(subTab) {
    sfx.playTap();
    this.activePlannerTab = subTab;
    this.renderPlannerView(document.getElementById('appContent'));
  }

  deleteTransaction(id) {
    sfx.playTap();
    if (confirm('Hapus transaksi ini?')) {
      window.homeStore.deleteTransaction(id);
      showToast('Transaksi berhasil dihapus');
    }
  }

  updateStock(id, delta) {
    sfx.playTap();
    window.homeStore.updateInventoryStock(id, delta);
  }

  sendToShopping(invId) {
    sfx.playTap();
    const result = window.homeStore.sendInventoryToShopping(invId);
    if (result) {
      showToast(result.isNew ? `"${result.item.name}" ditambahkan ke Daftar Belanja!` : `Kuantitas "${result.item.name}" ditambah di Belanja!`);
    }
  }

  toggleShoppingItem(id) {
    sfx.playTap();
    window.homeStore.toggleShoppingItem(id);
  }

  deleteShoppingItem(id) {
    sfx.playTap();
    window.homeStore.deleteShoppingItem(id);
    showToast('Item belanja dihapus');
  }

  executeAutoSyncShopping() {
    sfx.playSuccess();
    const res = window.homeStore.syncCompletedShoppingToCashAndInventory();
    if (res.count > 0) {
      showToast(`⚡ Auto-Sync Berhasil: ${res.count} item tercatat di kas (${formatIDR(res.totalAmount)}) & stok ter-update!`);
    }
  }

  toggleChore(id) {
    sfx.playTap();
    window.homeStore.toggleChore(id);
  }

  deleteChore(id) {
    sfx.playTap();
    window.homeStore.deleteChore(id);
    showToast('Tugas dihapus');
  }

  promptAllocateSavings(id, name) {
    sfx.playTap();
    const amountStr = prompt(`Masukkan nominal alokasi dana untuk "${name}":`, '500000');
    if (amountStr) {
      const amt = Number(amountStr.replace(/[^0-9]/g, ''));
      if (amt > 0) {
        window.homeStore.allocateToSavings(id, amt, true);
        showToast(`Dana ${formatIDR(amt)} berhasil dialokasikan ke ${name}!`);
      }
    }
  }

  deleteSavings(id) {
    sfx.playTap();
    const item = window.homeStore.data.savings.find(s => s.id === id);
    const name = item ? `"${item.name}"` : 'target ini';
    if (confirm(`Yakin ingin menghapus ${name} dari target tabungan?`)) {
      window.homeStore.deleteSavings(id);
      showToast('Target tabungan berhasil dihapus!');
    }
  }

  openEditSavingsModal(id) {
    sfx.playTap();
    const item = window.homeStore.data.savings.find(s => s.id === id);
    if (!item) return;

    const idInput = document.getElementById('editSavId');
    const nameInput = document.getElementById('editSavName');
    const targetInput = document.getElementById('editSavTarget');
    const currentInput = document.getElementById('editSavCurrent');
    const catInput = document.getElementById('editSavCategory');

    if (idInput) idInput.value = item.id;
    if (nameInput) nameInput.value = item.name;
    if (targetInput) targetInput.value = item.target;
    if (currentInput) currentInput.value = item.current;
    if (catInput) catInput.value = item.category || '';

    this.openModal('modalEditSavings');
  }

  saveEditedSavings() {
    sfx.playSuccess();
    const id = document.getElementById('editSavId')?.value;
    const name = document.getElementById('editSavName')?.value;
    const target = document.getElementById('editSavTarget')?.value;
    const current = document.getElementById('editSavCurrent')?.value;
    const category = document.getElementById('editSavCategory')?.value;

    if (!name || !target) {
      alert('Nama dan target nominal tabungan wajib diisi!');
      return;
    }

    window.homeStore.updateSavingsGoal(id, { name, target, current, category });
    this.closeModal('modalEditSavings');
    showToast(`Target tabungan "${name}" berhasil diperbarui! 🌿`);
  }

  // --- Logo & Branding Customizer (Admin) ---
  openLogoCustomizerModal() {
    sfx.playTap();
    const branding = window.homeStore.data.branding || {
      logoType: 'emoji',
      logoValue: '🏡',
      appName: 'HomeFlow',
      familyName: 'Keluarga Raharja'
    };

    this.tempLogo = {
      type: branding.logoType || 'emoji',
      value: branding.logoValue || '🏡'
    };

    const familyInput = document.getElementById('inputFamilyName');
    if (familyInput) familyInput.value = branding.familyName || 'Keluarga Raharja';

    const appInput = document.getElementById('inputAppName');
    if (appInput) appInput.value = branding.appName || 'HomeFlow';

    const initialsInput = document.getElementById('logoInitialsInput');
    if (initialsInput && branding.logoType === 'initials') {
      initialsInput.value = branding.logoValue || '';
    }

    this.updateLogoPreview();
    this.openModal('modalCustomLogo');
  }

  selectPresetLogo(emoji) {
    sfx.playTap();
    this.tempLogo = { type: 'emoji', value: emoji };
    this.updateLogoPreview();
  }

  handleLogoFileUpload(event) {
    const file = event.target?.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Silakan pilih file gambar yang valid (PNG, JPG, SVG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.tempLogo = { type: 'image', value: e.target.result };
      this.updateLogoPreview();
      showToast('Gambar logo berhasil dimuat di preview!');
    };
    reader.readAsDataURL(file);
  }

  selectInitialsLogo() {
    sfx.playTap();
    const val = (document.getElementById('logoInitialsInput')?.value || '').trim().toUpperCase();
    if (!val) {
      alert('Masukkan inisial huruf (contoh: KR atau HF)');
      return;
    }
    this.tempLogo = { type: 'initials', value: val };
    this.updateLogoPreview();
    showToast(`Inisial "${val}" diterapkan di preview!`);
  }

  updateLogoPreview() {
    const previewBox = document.getElementById('modalLogoPreview');
    const label = document.getElementById('modalLogoPreviewLabel');
    if (!previewBox) return;

    if (this.tempLogo.type === 'image') {
      previewBox.innerHTML = `<img src="${this.tempLogo.value}" alt="Preview Logo">`;
      if (label) label.innerText = 'Foto / Gambar Kustom Aktif';
    } else if (this.tempLogo.type === 'initials') {
      previewBox.innerHTML = `<span style="font-weight: 800; font-size: 26px; letter-spacing: -1px;">${this.tempLogo.value}</span>`;
      if (label) label.innerText = `Inisial "${this.tempLogo.value}" Aktif`;
    } else {
      previewBox.innerHTML = `<span>${this.tempLogo.value || '🏡'}</span>`;
      if (label) label.innerText = `Ikon "${this.tempLogo.value || '🏡'}" Aktif`;
    }
  }

  saveBrandingSettings() {
    sfx.playSuccess();
    const familyName = (document.getElementById('inputFamilyName')?.value || 'Keluarga Raharja').trim();
    const appName = (document.getElementById('inputAppName')?.value || 'HomeFlow').trim();

    window.homeStore.updateBranding({
      logoType: this.tempLogo.type,
      logoValue: this.tempLogo.value,
      familyName,
      appName
    });

    this.closeModal('modalCustomLogo');
    showToast('✨ Logo dan profil identitas berhasil diperbarui!');
  }

  randomizeMealInspiration() {
    sfx.playTap();
    const suggestions = [
      { title: 'Soto Ayam Lamongan & Telur Rebus', desc: 'Kuah koya gurih wangi dengan suwiran ayam empuk', ingredients: ['Ayam', 'Bawang', 'Telur'] },
      { title: 'Sup Daging Kacang Merah & Perkedel', desc: 'Sup hangat bergizi tinggi cocok untuk santap keluarga', ingredients: ['Daging', 'Kacang Merah', 'Kentang'] },
      { title: 'Ikan Bakar Bumbu Jimbaran & Lalap', desc: 'Ikan segar aroma rempah bakar dengan sambal matah', ingredients: ['Ikan', 'Bawang', 'Cabai'] },
      { title: 'Tumis Brokoli Jamur & Tahu Jepang', desc: 'Sayuran renyah saus tiram kaya serat dan vitamin', ingredients: ['Brokoli', 'Jamur', 'Tahu'] }
    ];
    const picked = suggestions[Math.floor(Math.random() * suggestions.length)];
    window.homeStore.updateMeal('Rabu', 'lunch', picked);
    showToast(`Inspirasi menu makan siang: ${picked.title}!`);
  }

  editMealModal(mealType, currentTitle) {
    sfx.playTap();
    const typeLabel = mealType === 'breakfast' ? 'Sarapan Pagi' : mealType === 'lunch' ? 'Makan Siang' : 'Makan Malam';
    const newTitle = prompt(`Ubah Menu untuk ${typeLabel}:`, currentTitle);
    if (newTitle && newTitle.trim()) {
      const newDesc = prompt('Keterangan / catatan resep menu:', 'Menu lezat pilihan keluarga');
      window.homeStore.updateMeal('Rabu', mealType, {
        title: newTitle.trim(),
        desc: newDesc ? newDesc.trim() : 'Menu bergizi keluarga',
        ingredients: ['Bahan Segar', 'Bumbu Dapur']
      });
      showToast(`Menu ${typeLabel} berhasil diperbarui!`);
    }
  }

  // --- Modal Helpers ---
  openModal(modalId) {
    sfx.playTap();
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');

    // If opening salary allocator, initialize values
    if (modalId === 'modalSalaryAllocator') {
      this.initSalaryAllocatorModal();
    }
  }

  closeModal(modalId) {
    sfx.playTap();
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  // --- Smart Salary Allocator Logic (USP) ---
  initSalaryAllocatorModal() {
    const currentSalary = window.homeStore.data.salary.monthlySalary || 12500000;
    const salaryInput = document.getElementById('allocSalaryInput');
    if (salaryInput) salaryInput.value = currentSalary;

    this.updateAllocatorBreakdown(currentSalary);
  }

  updateAllocatorBreakdown(totalSalary) {
    const num = Number(totalSalary) || 0;
    const kitchenPct = Number(document.getElementById('sliderKitchen')?.value || 30);
    const savingsPct = Number(document.getElementById('sliderSavings')?.value || 30);
    const operationalPct = Number(document.getElementById('sliderOperational')?.value || 30);
    const flexiblePct = Math.max(0, 100 - (kitchenPct + savingsPct + operationalPct));

    const kitchenAmt = Math.round(num * (kitchenPct / 100));
    const savingsAmt = Math.round(num * (savingsPct / 100));
    const operationalAmt = Math.round(num * (operationalPct / 100));
    const flexibleAmt = Math.round(num * (flexiblePct / 100));

    // Update labels
    const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.innerText = txt; };
    setTxt('lblKitchenPct', `${kitchenPct}%`);
    setTxt('lblKitchenAmt', formatIDR(kitchenAmt));
    setTxt('lblSavingsPct', `${savingsPct}%`);
    setTxt('lblSavingsAmt', formatIDR(savingsAmt));
    setTxt('lblOperationalPct', `${operationalPct}%`);
    setTxt('lblOperationalAmt', formatIDR(operationalAmt));
    setTxt('lblFlexiblePct', `${flexiblePct}%`);
    setTxt('lblFlexibleAmt', formatIDR(flexibleAmt));
  }

  applySalaryAllocationFromModal() {
    const salaryInput = document.getElementById('allocSalaryInput');
    const salary = Number(salaryInput?.value || 0);
    if (salary <= 0) {
      alert('Silakan masukkan total gaji yang valid');
      return;
    }

    const kitchenPct = Number(document.getElementById('sliderKitchen')?.value || 30);
    const savingsPct = Number(document.getElementById('sliderSavings')?.value || 30);
    const operationalPct = Number(document.getElementById('sliderOperational')?.value || 30);
    const flexiblePct = Math.max(0, 100 - (kitchenPct + savingsPct + operationalPct));

    const breakdown = {
      kitchen: Math.round(salary * (kitchenPct / 100)),
      savings: Math.round(salary * (savingsPct / 100)),
      operational: Math.round(salary * (operationalPct / 100)),
      flexible: Math.round(salary * (flexiblePct / 100))
    };

    window.homeStore.applySalaryAllocation(salary, breakdown);
    this.closeModal('modalSalaryAllocator');
    showToast(`Gaji ${formatIDR(salary)} berhasil dialokasikan! 🌿`);
  }

  // --- Roadmap Interactive Previews ---
  previewBudgetingDemo() {
    sfx.playTap();
    alert('Simulasi 50/30/20:\n- 50% Kebutuhan: Rp 6.250.000 (Dapur, Listrik, Air)\n- 30% Keinginan: Rp 3.750.000 (Hiburan, Kuliner Luar)\n- 20% Tabungan/Investasi: Rp 2.500.000 (Dana Darurat & Emas)\n\nFitur ini akan otomatis membatasi transaksi kas pada rilis V2!');
  }

  previewBillReminderDemo() {
    sfx.playTap();
    alert('Preview Pengingat Tagihan V2:\n- Token Listrik PLN: Tgl 1 setiap bulan\n- WiFi Indihome/Biznet: Tgl 5 setiap bulan\n- Air PDAM: Tgl 10 setiap bulan\n- BPJS Kesehatan: Tgl 10 setiap bulan\n\nNotifikasi kalender dan status lunas akan hadir di V2!');
  }

  previewOcrDemo() {
    sfx.playTap();
    alert('Preview Scan Struk OCR V3:\nKamera AI membaca struk belanja, mendeteksi harga barang, dan langsung memasukkannya ke daftar pengeluaran kas tanpa ketik manual!');
  }

  // --- Global Event Listeners ---
  bindEvents() {
    // Nav Items
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = btn.dataset.tab;
        if (tab) this.switchTab(tab);
      });
    });

    // Close modal on click overlay
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    });
  }
}

// Global App Initialization
document.addEventListener('DOMContentLoaded', () => {
  window.app = new HomeFlowApp();
});
