/**
 * HomeFlow - Initial Seed Data (Indonesian Household Context)
 */
const DEFAULT_DATA = {
  auth: {
    isLoggedIn: false,
    currentUser: null,
    users: [
      { username: 'admin', password: '123', name: 'Keluarga Raharja', role: 'Kepala Keluarga' }
    ]
  },
  settings: {
    currency: 'IDR',
    theme: 'sage-warm', // sage-warm, pure-warm, dark-sage
    soundEnabled: true,
    viewMode: 'mobile-frame', // 'mobile-frame' or 'fluid'
    currentMonth: 'September 2026'
  },
  branding: {
    logoType: 'emoji', // 'emoji', 'image', 'initials'
    logoValue: '🏡',
    appName: 'HomeFlow',
    familyName: 'Keluarga Raharja'
  },
  salary: {
    monthlySalary: 12500000, // Total Gaji Pokok Bulanan
    paydayDate: 25,
    lastAllocatedMonth: '2026-09',
    allocations: {
      kitchen: 3500000,      // Dapur & Belanja Bulanan
      savings: 3750000,      // Tabungan Keluarga
      operational: 3750000,  // Kas Operasional & Utilitas
      flexible: 1500000      // Hiburan & Fleksibel
    }
  },
  transactions: [
    {
      id: 'tx-1',
      date: '2026-09-25',
      type: 'income',
      title: 'Gaji Bulanan September',
      amount: 12500000,
      category: 'Gaji',
      note: 'Transfer gaji pokok kantor'
    },
    {
      id: 'tx-2',
      date: '2026-09-26',
      type: 'expense',
      title: 'Belanja Bulanan Supermarket & Sembako',
      amount: 1850000,
      category: 'Belanja Bulanan',
      note: 'Beras, minyak, sabun, bumbu dapur & perlengkapan bulanan'
    },
    {
      id: 'tx-3',
      date: '2026-09-27',
      type: 'expense',
      title: 'Tagihan Listrik PLN',
      amount: 450000,
      category: 'Listrik',
      note: 'Token listrik daya 1300VA periode September'
    },
    {
      id: 'tx-4',
      date: '2026-09-27',
      type: 'expense',
      title: 'Internet WiFi Rumah',
      amount: 350000,
      category: 'Internet',
      note: 'Paket langganan WiFi 50 Mbps'
    },
    {
      id: 'tx-5',
      date: '2026-09-28',
      type: 'expense',
      title: 'Gas Elpiji Memasak (Refill)',
      amount: 85000,
      category: 'Gas',
      note: 'Refill gas elpiji kebutuhan dapur'
    },
    {
      id: 'tx-6',
      date: '2026-09-28',
      type: 'expense',
      title: 'Iuran RT, Sampah & Keamanan',
      amount: 100000,
      category: 'Iuran RT',
      note: 'Iuran warga RT 04, pos satpam & retribusi sampah'
    },
    {
      id: 'tx-7',
      date: '2026-09-29',
      type: 'income',
      title: 'Bonus Proyek Lepas',
      amount: 1200000,
      category: 'Pemasukan Lain',
      note: 'Desain web freelance'
    },
    {
      id: 'tx-8',
      date: '2026-09-29',
      type: 'expense',
      title: 'Makan Malam Akhir Pekan',
      amount: 180000,
      category: 'Hiburan & Fleksibel',
      note: 'Kuliner santai keluarga'
    }
  ],
  savings: [
    {
      id: 'sav-1',
      type: 'saving',
      name: 'Dana Darurat (Emergency Fund)',
      target: 30000000,
      current: 18500000,
      icon: 'shield-alert',
      category: 'Dana Darurat',
      color: '#5E7A60'
    },
    {
      id: 'sav-2',
      type: 'saving',
      name: 'Liburan Akhir Tahun ke Jogja',
      target: 8000000,
      current: 5200000,
      icon: 'palmtree',
      category: 'Liburan',
      color: '#D49B44'
    },
    {
      id: 'sav-3',
      type: 'saving',
      name: 'Dana Pendidikan Anak',
      target: 40000000,
      current: 15000000,
      icon: 'graduation-cap',
      category: 'Pendidikan',
      color: '#5B8EA6'
    },
    {
      id: 'sav-4',
      type: 'saving',
      name: 'Renovasi & Perawatan Rumah',
      target: 15000000,
      current: 7500000,
      icon: 'home',
      category: 'Rumah',
      color: '#739075'
    }
  ],
  inventory: [
    {
      id: 'inv-1',
      name: 'Beras Pandan Wangi Super',
      category: 'Bahan Pokok',
      currentStock: 4,
      minStock: 5,
      unit: 'kg',
      priceEstimate: 16000,
      location: 'Dapur Utama'
    },
    {
      id: 'inv-2',
      name: 'Minyak Goreng Sawit (Pouch)',
      category: 'Bahan Pokok',
      currentStock: 1,
      minStock: 2,
      unit: 'liter',
      priceEstimate: 18500,
      location: 'Rak Sembako'
    },
    {
      id: 'inv-3',
      name: 'Telur Ayam Negeri',
      category: 'Protein & Lauk',
      currentStock: 6,
      minStock: 10,
      unit: 'butir',
      priceEstimate: 2000,
      location: 'Kulkas'
    },
    {
      id: 'inv-4',
      name: 'Gula Pasir Kristal',
      category: 'Bahan Pokok',
      currentStock: 2,
      minStock: 1,
      unit: 'kg',
      priceEstimate: 17500,
      location: 'Toples Bumbu'
    },
    {
      id: 'inv-5',
      name: 'Kopi Bubuk Robusta',
      category: 'Bumbu & Minuman',
      currentStock: 0,
      minStock: 1,
      unit: 'bungkus',
      priceEstimate: 22000,
      location: 'Rak Kopi'
    },
    {
      id: 'inv-6',
      name: 'Bawang Merah Brebes',
      category: 'Bumbu & Rempah',
      currentStock: 250,
      minStock: 500,
      unit: 'gram',
      priceEstimate: 35000,
      location: 'Keranjang Dapur'
    },
    {
      id: 'inv-7',
      name: 'Sabun Cuci Piring Refill',
      category: 'Kebersihan',
      currentStock: 2,
      minStock: 1,
      unit: 'pouch',
      priceEstimate: 14000,
      location: 'Bawah Wastafel'
    },
    {
      id: 'inv-8',
      name: 'Susu UHT Full Cream 1L',
      category: 'Protein & Lauk',
      currentStock: 1,
      minStock: 3,
      unit: 'kotak',
      priceEstimate: 21000,
      location: 'Kulkas'
    }
  ],
  shoppingList: [
    {
      id: 'shop-1',
      name: 'Beras Pandan Wangi (Restock 5kg)',
      category: 'Bahan Pokok',
      qty: 1,
      unit: 'karung 5kg',
      priceEstimate: 80000,
      completed: false,
      note: 'Pilih yang pulen',
      linkedInventoryId: 'inv-1'
    },
    {
      id: 'shop-2',
      name: 'Minyak Goreng SunCo 2L',
      category: 'Bahan Pokok',
      qty: 1,
      unit: 'pouch 2L',
      priceEstimate: 37000,
      completed: false,
      note: 'Restock menipis',
      linkedInventoryId: 'inv-2'
    },
    {
      id: 'shop-3',
      name: 'Telur Ayam 1kg (16 butir)',
      category: 'Protein & Lauk',
      qty: 1,
      unit: 'kg',
      priceEstimate: 29000,
      completed: false,
      note: 'Cek jangan ada yang retak',
      linkedInventoryId: 'inv-3'
    },
    {
      id: 'shop-4',
      name: 'Kopi Robusta Lampung',
      category: 'Bumbu & Minuman',
      qty: 1,
      unit: 'bungkus 250g',
      priceEstimate: 22000,
      completed: false,
      note: 'Habis total',
      linkedInventoryId: 'inv-5'
    },
    {
      id: 'shop-5',
      name: 'Bawang Merah 1/2 kg',
      category: 'Bumbu & Rempah',
      qty: 1,
      unit: 'bungkus',
      priceEstimate: 18000,
      completed: true,
      note: 'Beli di pasar induk',
      linkedInventoryId: 'inv-6'
    }
  ],
  chores: [
    {
      id: 'chore-1',
      title: 'Sapu & Pel Lantai Utama',
      assignee: 'Ayah',
      day: 'Rabu',
      completed: true,
      time: 'Pagi'
    },
    {
      id: 'chore-2',
      title: 'Cuci Piring & Bersihkan Kompor',
      assignee: 'Ibu',
      day: 'Rabu',
      completed: true,
      time: 'Siang'
    },
    {
      id: 'chore-3',
      title: 'Kuras Bak Mandi & Buang Sampah',
      assignee: 'Ayah',
      day: 'Rabu',
      completed: false,
      time: 'Sore'
    },
    {
      id: 'chore-4',
      title: 'Rapikan Kamar Tidur & Mainan',
      assignee: 'Anak',
      day: 'Rabu',
      completed: false,
      time: 'Sore'
    },
    {
      id: 'chore-5',
      title: 'Belanja Mingguan ke Pasar',
      assignee: 'Bersama',
      day: 'Sabtu',
      completed: false,
      time: 'Pagi'
    }
  ],
  mealPlans: [
    {
      day: 'Rabu',
      meals: {
        breakfast: {
          title: 'Nasi Goreng Telur Sayuran',
          desc: 'Nasi semalam, telur orak-arik, sawi hijau, kerupuk',
          ingredients: ['Beras', 'Telur', 'Bawang Merah']
        },
        lunch: {
          title: 'Sayur Asem & Tempe Tahu Bacem',
          desc: 'Sayur asem kuah bening segar, tempe goreng legit bacem',
          ingredients: ['Labu Siam', 'Kacang Panjang', 'Tempe']
        },
        dinner: {
          title: 'Ayam Goreng Lengkuas & Sambal Terasi',
          desc: 'Ayam ungkep rempah gurih, lalapan timun kemangi',
          ingredients: ['Ayam', 'Bawang Merah', 'Minyak Goreng']
        },
        snack: {
          title: 'Pisang Bakar Keju & Kopi Hangat',
          desc: 'Pisang kepok manis tabur keju parut',
          ingredients: ['Pisang', 'Keju']
        }
      }
    },
    {
      day: 'Kamis',
      meals: {
        breakfast: {
          title: 'Bubur Ayam Praktis & Cakwe',
          desc: 'Bubur beras lembut dengan suwiran ayam gurih',
          ingredients: ['Beras', 'Ayam']
        },
        lunch: {
          title: 'Sop Daging Sapi Bening & Perkedel',
          desc: 'Kuah kaldu daging kaya wortel dan seledri',
          ingredients: ['Daging', 'Kentang', 'Bawang']
        },
        dinner: {
          title: 'Tumis Kangkung Belacan & Ikan Asin',
          desc: 'Kangkung renyah pedas wangi terasi',
          ingredients: ['Kangkung', 'Bawang Merah', 'Cabai']
        },
        snack: {
          title: 'Potongan Buah Semangka Dingin',
          desc: 'Penyegar sore hari setelah beraktivitas',
          ingredients: ['Semangka']
        }
      }
    }
  ]
};
