/**
 * HomeFlow - LocalStorage & State Management
 */
const STORAGE_KEY = 'homeflow_app_state_v3';

class Store {
  constructor() {
    this.data = this.load();
    this.listeners = [];
  }

  load() {
    try {
      let saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        // Check if v2 or v1 exists and migrate
        saved = localStorage.getItem('homeflow_app_state_v2') || localStorage.getItem('homeflow_app_state_v1');
      }
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check if routine expenses exist in saved transactions, if not inject default seed
        const hasListrik = (parsed.transactions || []).some(t => t.category === 'Listrik' || t.title.toLowerCase().includes('listrik'));
        const transactions = hasListrik ? parsed.transactions : JSON.parse(JSON.stringify(DEFAULT_DATA.transactions));

        // Filter out any investment portfolio items, keep strictly savings
        const savings = (parsed.savings && parsed.savings.length > 0)
          ? parsed.savings.filter(s => s.type !== 'investment')
          : JSON.parse(JSON.stringify(DEFAULT_DATA.savings));

        return {
          ...DEFAULT_DATA,
          ...parsed,
          transactions,
          savings: savings.length > 0 ? savings : JSON.parse(JSON.stringify(DEFAULT_DATA.savings)),
          branding: { ...DEFAULT_DATA.branding, ...(parsed.branding || {}) },
          salary: { ...DEFAULT_DATA.salary, ...(parsed.salary || {}) },
          settings: { ...DEFAULT_DATA.settings, ...(parsed.settings || {}) },
          auth: { ...DEFAULT_DATA.auth, ...(parsed.auth || {}) }
        };
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using defaults', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      this.notify();
    } catch (e) {
      console.error('Error saving state', e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => {
      try {
        fn(this.data);
      } catch (err) {
        console.error('Listener callback error', err);
      }
    });
  }

  reset() {
    this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    this.data.auth.isLoggedIn = true;
    this.data.auth.currentUser = { username: 'admin', name: 'Keluarga Raharja', role: 'Kepala Keluarga' };
    this.save();
  }

  exportData() {
    const jsonStr = JSON.stringify(this.data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HomeFlow_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importData(jsonContent) {
    try {
      const parsed = JSON.parse(jsonContent);
      if (!parsed.transactions || !parsed.inventory) {
        throw new Error('Format data tidak sesuai');
      }
      this.data = {
        ...DEFAULT_DATA,
        ...parsed
      };
      this.save();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // --- Branding & Logo Customizer (Admin) ---
  updateBranding(newBranding) {
    this.data.branding = {
      ...(this.data.branding || DEFAULT_DATA.branding),
      ...newBranding
    };
    if (newBranding.familyName && this.data.auth?.currentUser) {
      this.data.auth.currentUser.name = newBranding.familyName;
    }
    this.save();
    return this.data.branding;
  }

  // --- Password Management (Admin) ---
  changeAdminPassword(oldPassword, newPassword) {
    const adminUser = this.data.auth.users.find(u => u.username === 'admin');
    if (!adminUser) {
      return { success: false, message: 'Akun admin tidak ditemukan.' };
    }
    if (adminUser.password !== (oldPassword || '').trim()) {
      return { success: false, message: 'Password lama salah!' };
    }
    if (!newPassword || newPassword.trim().length < 3) {
      return { success: false, message: 'Password baru minimal 3 karakter!' };
    }

    const cleanNewPass = newPassword.trim();
    adminUser.password = cleanNewPass;
    if (this.data.auth.currentUser && this.data.auth.currentUser.username === 'admin') {
      this.data.auth.currentUser.password = cleanNewPass;
    }
    this.save();
    return { success: true };
  }

  // --- Financial Calculations ---
  getFinancialSummary() {
    const totalSalary = Number(this.data.salary?.monthlySalary || 0);
    
    // Income excluding base salary if already recorded as transaction
    const incomes = this.data.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    
    const expenses = this.data.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const totalSavingsSaved = this.data.savings
      .reduce((sum, s) => sum + Number(s.current || 0), 0);

    const totalSavingsTarget = this.data.savings
      .reduce((sum, s) => sum + Number(s.target || 0), 0);

    // Current remaining cash = Incomes - Expenses
    // If incomes transaction already has salary, don't double count
    const hasSalaryInTx = this.data.transactions.some(t => t.category === 'Gaji');
    const netIncome = hasSalaryInTx ? incomes : (totalSalary + incomes);
    const remainingCash = netIncome - expenses;

    return {
      monthlySalary: totalSalary,
      totalIncome: netIncome,
      totalExpense: expenses,
      remainingCash: remainingCash,
      totalSavingsSaved,
      totalSavingsTarget,
      savingsProgress: totalSavingsTarget > 0 ? Math.round((totalSavingsSaved / totalSavingsTarget) * 100) : 0
    };
  }

  // --- Quick Transaction Actions ---
  addTransaction(tx) {
    const newTx = {
      id: 'tx-' + Date.now(),
      date: tx.date || new Date().toISOString().slice(0, 10),
      type: tx.type || 'expense',
      title: tx.title.trim(),
      amount: Number(tx.amount) || 0,
      category: tx.category || 'Lainnya',
      note: (tx.note || '').trim()
    };
    this.data.transactions.unshift(newTx);
    this.save();
    return newTx;
  }

  deleteTransaction(id) {
    this.data.transactions = this.data.transactions.filter(t => t.id !== id);
    this.save();
  }

  // --- Input Rincian Pengeluaran Rutin (Belanja Bulanan, Listrik, Internet, Gas, Iuran RT) ---
  inputRoutineExpenses(customValues = {}) {
    const routineList = [
      {
        title: 'Belanja Bulanan Supermarket & Sembako',
        amount: Number(customValues.belanja) || 1850000,
        category: 'Belanja Bulanan',
        note: 'Bahan pokok, beras, minyak, sabun & bumbu stok sebulan'
      },
      {
        title: 'Tagihan Listrik PLN',
        amount: Number(customValues.listrik) || 450000,
        category: 'Listrik',
        note: 'Token listrik daya 1300VA periode aktif'
      },
      {
        title: 'Internet WiFi Rumah',
        amount: Number(customValues.internet) || 350000,
        category: 'Internet',
        note: 'Langganan WiFi 50 Mbps'
      },
      {
        title: 'Gas Elpiji Memasak (Refill)',
        amount: Number(customValues.gas) || 85000,
        category: 'Gas',
        note: 'Refill gas elpiji kebutuhan dapur'
      },
      {
        title: 'Iuran RT, Sampah & Keamanan',
        amount: Number(customValues.iuran) || 100000,
        category: 'Iuran RT',
        note: 'Iuran warga RT 04, pos satpam & retribusi sampah'
      }
    ];

    const today = new Date().toISOString().slice(0, 10);
    routineList.forEach(item => {
      this.data.transactions.unshift({
        id: 'tx-rtn-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        date: today,
        type: 'expense',
        ...item
      });
    });

    this.save();
    return routineList;
  }

  // --- Smart Salary Allocator (USP) ---
  applySalaryAllocation(newSalary, allocationBreakdown) {
    this.data.salary.monthlySalary = Number(newSalary);
    this.data.salary.allocations = { ...allocationBreakdown };
    this.data.salary.lastAllocatedMonth = new Date().toISOString().slice(0, 7);

    // Check if salary transaction already exists for this month, otherwise add or update
    const salaryTx = this.data.transactions.find(t => t.category === 'Gaji' && t.date.startsWith(this.data.salary.lastAllocatedMonth));
    if (salaryTx) {
      salaryTx.amount = Number(newSalary);
    } else {
      this.data.transactions.unshift({
        id: 'tx-sal-' + Date.now(),
        date: new Date().toISOString().slice(0, 10),
        type: 'income',
        title: `Gaji Masuk (${this.data.settings.currentMonth})`,
        amount: Number(newSalary),
        category: 'Gaji',
        note: 'Dialokasikan via Smart Salary Allocator'
      });
    }

    this.save();
  }

  // --- Savings / Investment Actions ---
  addSavingsGoal(goal) {
    const newGoal = {
      id: 'sav-' + Date.now(),
      type: goal.type || 'saving',
      name: goal.name.trim(),
      target: Number(goal.target) || 0,
      current: Number(goal.current) || 0,
      icon: goal.icon || 'shield-check',
      category: goal.category || 'Target Tabungan',
      color: goal.color || '#5E7A60'
    };
    this.data.savings.push(newGoal);
    this.save();
    return newGoal;
  }

  allocateToSavings(id, amount, deductFromCash = true) {
    const item = this.data.savings.find(s => s.id === id);
    if (!item) return false;
    const addAmt = Number(amount);
    item.current += addAmt;

    if (deductFromCash) {
      this.data.transactions.unshift({
        id: 'tx-' + Date.now(),
        date: new Date().toISOString().slice(0, 10),
        type: 'expense',
        title: `Alokasi: ${item.name}`,
        amount: addAmt,
        category: 'Tabungan Keluarga',
        note: `Setoran alokasi untuk ${item.category}`
      });
    }
    this.save();
    return true;
  }

  updateSavingsGoal(id, updatedFields) {
    const item = this.data.savings.find(s => s.id === id);
    if (!item) return false;
    if (updatedFields.name !== undefined) item.name = updatedFields.name.trim();
    if (updatedFields.target !== undefined) item.target = Number(updatedFields.target) || 0;
    if (updatedFields.current !== undefined) item.current = Number(updatedFields.current) || 0;
    if (updatedFields.category !== undefined) item.category = updatedFields.category.trim();
    this.save();
    return true;
  }

  deleteSavings(id) {
    this.data.savings = this.data.savings.filter(s => s.id !== id);
    this.save();
  }

  // --- Inventory Actions ---
  addInventory(item) {
    const newItem = {
      id: 'inv-' + Date.now(),
      name: item.name.trim(),
      category: item.category || 'Bahan Pokok',
      currentStock: Number(item.currentStock) || 0,
      minStock: Number(item.minStock) || 1,
      unit: item.unit || 'pcs',
      priceEstimate: Number(item.priceEstimate) || 0,
      location: item.location || 'Dapur'
    };
    this.data.inventory.push(newItem);
    this.save();
    return newItem;
  }

  updateInventoryStock(id, delta) {
    const item = this.data.inventory.find(i => i.id === id);
    if (!item) return;
    item.currentStock = Math.max(0, item.currentStock + delta);
    this.save();
  }

  deleteInventory(id) {
    this.data.inventory = this.data.inventory.filter(i => i.id !== id);
    this.save();
  }

  // Quick Action: Send low stock inventory item to Shopping List
  sendInventoryToShopping(invId) {
    const inv = this.data.inventory.find(i => i.id === invId);
    if (!inv) return null;

    // Check if already in shopping list and not completed
    const existing = this.data.shoppingList.find(s => s.linkedInventoryId === invId && !s.completed);
    if (existing) {
      existing.qty += 1;
      this.save();
      return { item: existing, isNew: false };
    }

    const neededQty = Math.max(1, inv.minStock - inv.currentStock + 1);
    const newShop = {
      id: 'shop-' + Date.now(),
      name: inv.name,
      category: inv.category,
      qty: neededQty,
      unit: inv.unit,
      priceEstimate: inv.priceEstimate * neededQty,
      completed: false,
      note: `Restock otomatis dari inventaris (${inv.currentStock} ${inv.unit} tersisa)`,
      linkedInventoryId: inv.id
    };
    this.data.shoppingList.unshift(newShop);
    this.save();
    return { item: newShop, isNew: true };
  }

  // --- Shopping List Actions & Auto-Sync (USP) ---
  addShoppingItem(item) {
    const newItem = {
      id: 'shop-' + Date.now(),
      name: item.name.trim(),
      category: item.category || 'Bahan Pokok',
      qty: Number(item.qty) || 1,
      unit: item.unit || 'pcs',
      priceEstimate: Number(item.priceEstimate) || 0,
      completed: false,
      note: (item.note || '').trim(),
      linkedInventoryId: item.linkedInventoryId || null
    };
    this.data.shoppingList.unshift(newItem);
    this.save();
    return newItem;
  }

  toggleShoppingItem(id) {
    const item = this.data.shoppingList.find(s => s.id === id);
    if (item) {
      item.completed = !item.completed;
      this.save();
    }
  }

  deleteShoppingItem(id) {
    this.data.shoppingList = this.data.shoppingList.filter(s => s.id !== id);
    this.save();
  }

  // Auto-Sync Belanja: Selesaikan item belanja yang dicentang, potong saldo kas sebagai pengeluaran belanja, dan restock inventaris sembako!
  syncCompletedShoppingToCashAndInventory() {
    const completedItems = this.data.shoppingList.filter(s => s.completed);
    if (completedItems.length === 0) return { count: 0, totalAmount: 0 };

    const totalAmount = completedItems.reduce((sum, item) => sum + (Number(item.priceEstimate) || 0), 0);
    const itemNames = completedItems.map(i => i.name).slice(0, 3).join(', ') + (completedItems.length > 3 ? '...' : '');

    // 1. Record expense in cash transaction
    this.data.transactions.unshift({
      id: 'tx-sync-' + Date.now(),
      date: new Date().toISOString().slice(0, 10),
      type: 'expense',
      title: `Belanja Selesai (${completedItems.length} item)`,
      amount: totalAmount,
      category: 'Dapur & Makanan',
      note: `Auto-Sync Belanja: ${itemNames}`
    });

    // 2. Restock linked inventory items
    completedItems.forEach(item => {
      if (item.linkedInventoryId) {
        const inv = this.data.inventory.find(i => i.id === item.linkedInventoryId);
        if (inv) {
          inv.currentStock += Number(item.qty) || 1;
        }
      }
    });

    // 3. Remove completed items from shopping list
    this.data.shoppingList = this.data.shoppingList.filter(s => !s.completed);

    this.save();
    return { count: completedItems.length, totalAmount };
  }

  // --- Chores Actions ---
  toggleChore(id) {
    const chore = this.data.chores.find(c => c.id === id);
    if (chore) {
      chore.completed = !chore.completed;
      this.save();
    }
  }

  addChore(chore) {
    const newChore = {
      id: 'chore-' + Date.now(),
      title: chore.title.trim(),
      assignee: chore.assignee || 'Ayah',
      day: chore.day || 'Hari Ini',
      time: chore.time || 'Pagi',
      completed: false
    };
    this.data.chores.push(newChore);
    this.save();
    return newChore;
  }

  deleteChore(id) {
    this.data.chores = this.data.chores.filter(c => c.id !== id);
    this.save();
  }

  // --- Meal Planner Actions ---
  updateMeal(day, mealType, mealData) {
    let dayPlan = this.data.mealPlans.find(m => m.day === day);
    if (!dayPlan) {
      dayPlan = { day, meals: {} };
      this.data.mealPlans.push(dayPlan);
    }
    dayPlan.meals[mealType] = {
      title: mealData.title,
      desc: mealData.desc,
      ingredients: mealData.ingredients || []
    };
    this.save();
  }
}

// Global Store Instance
window.homeStore = new Store();
