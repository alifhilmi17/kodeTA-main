/* =========================================================
   🐔 SISTEM ADMINISTRASI PETERNAKAN
   File: dashboardTAalip.js
   Deskripsi: Mengatur interaksi sidebar, profil, logout,
   dan manajemen tabel kegiatan peternakan.
========================================================= */

// =========================================
// 1. SIDEBAR & NAVIGASI
// =========================================

/**
 * Fungsi untuk membuka atau menutup (toggle) submenu pada sidebar.
 * Mengubah atribut aria-hidden dan aria-expanded untuk aksesibilitas,
 * serta menambah class 'active-parent' agar tombol terlihat disorot aktif.
 * @param {string} submenuId - ID elemen submenu yang akan di-toggle
 */
function toggleSidebarMenu(submenuId) {
  const submenu = document.getElementById(submenuId);

  // Jika ada class 'show', hapus agar logika CSS aria-hidden bekerja sempurna
  if (submenu.classList.contains('show')) {
    submenu.classList.remove('show');
  }

  const isHidden = submenu.getAttribute("aria-hidden") === "true";
  const parentButton = submenu.previousElementSibling;

  // Toggle visibilitas submenu
  submenu.setAttribute("aria-hidden", !isHidden);
  // Mengubah state expanded pada elemen trigger (tombol/link parent)
  parentButton.setAttribute("aria-expanded", isHidden);

  // Tambahkan visual terang pada tombol induk bila menu terbuka
  if (isHidden) {
    parentButton.classList.add("active-parent");
  } else {
    parentButton.classList.remove("active-parent");
  }
}

/**
 * Fungsi untuk menangani aksi klik pada tombol/menu profil.
 * Saat ini menampilkan pop-up informasi menggunakan SweetAlert2.
 */
function goToProfile() {
  Swal.fire({
    icon: 'info',
    title: 'Profil Pengguna',
    text: 'Fitur profil belum diimplementasikan 🐔',
    confirmButtonColor: '#fb8500' // Warna oranye khas tema
  });
}

/**
 * Fungsi untuk menangani proses logout pengguna.
 * Menampilkan konfirmasi pop-up sebelum mengarahkan ke halaman login.
 */
function logoutUser() {
  Swal.fire({
    title: "Yakin ingin logout?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, logout",
    cancelButtonText: "Batal",
    confirmButtonColor: "#d33", // Warna merah untuk aksi destruktif
    cancelButtonColor: "#3085d6" // Warna biru untuk batal
  }).then((result) => {
    if (result.isConfirmed) {
      // Jika user menekan "Ya, logout", redirect ke halaman login
      window.location.href = "login.html";
    }
  });
}


/* =========================================================
   🚀 MAIN DASHBOARD LOGIC (DOM LOADED)
   Semua script di bawah akan dieksekusi setelah struktur HTML selesai dimuat.
========================================================= */
document.addEventListener("DOMContentLoaded", () => {

  // =========================================
  // A. MANAJEMEN JADWAL KEGIATAN
  // Mengelola tabel jadwal kegiatan peternakan
  // =========================================

  // Mengambil elemen tbody dari tabel jadwal dan form tambah jadwal
  const scheduleTableBody = document.querySelector("#scheduleTable tbody");
  const scheduleForm = document.getElementById("addScheduleForm");

  // Memuat data dari localStorage jika ada, jika tidak gunakan data default
  let scheduleData = JSON.parse(localStorage.getItem("scheduleData")) || [
    { tanggal: "Senin, 14 Okt 2025", waktu: "08:00", agenda: "Cek stok pakan", ruangan: "Gudang Pakan" },
    { tanggal: "Selasa, 15 Okt 2025", waktu: "09:00", agenda: "Panen Telur", ruangan: "Kandang A" }
  ];

  /**
   * Render/menampilkan data jadwal ke dalam tabel HTML.
   */
  function renderSchedule() {
    scheduleTableBody.innerHTML = ""; // Bersihkan isi tabel sebelumnya
    scheduleData.forEach((item, index) => {
      // Looping data dan tambahkan baris (tr) baru untuk setiap jadwal
      scheduleTableBody.innerHTML += `
        <tr>
          <td>${item.tanggal}</td>
          <td>${item.waktu}</td>
          <td>${item.agenda}</td>
          <td>${item.ruangan}</td>
          <td>
            <button class="delete-btn delete-schedule" data-index="${index}" title="Hapus">🗑</button>
          </td>
        </tr>
      `;
    });
  }
  // Panggil renderSchedule saat pertama dimuat
  renderSchedule();

  // Menangani event submit pada form tambah jadwal
  scheduleForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Mencegah reload halaman

    // Ambil nilai dari input form
    const tanggal = document.getElementById("tanggal").value;
    const waktu = document.getElementById("waktu").value;
    const agenda = document.getElementById("agenda").value;
    const ruangan = document.getElementById("ruangan").value;

    // Menampilkan konfirmasi sebelum menyimpan
    Swal.fire({
      title: "Tambah Kegiatan?",
      text: `Apakah Anda yakin ingin menambahkan kegiatan "${agenda}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Tambah",
      cancelButtonText: "Batal",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33"
    }).then((result) => {
      if (result.isConfirmed) {
        // Jika dikonfirmasi, masukkan data baru ke dalam array
        scheduleData.push({ tanggal, waktu, agenda, ruangan });
        // Simpan array terbaru ke localStorage
        localStorage.setItem("scheduleData", JSON.stringify(scheduleData));
        // Refresh tabel
        renderSchedule();
        // Reset/kosongkan kolom isian form
        scheduleForm.reset();
        Swal.fire("Berhasil", "Jadwal berhasil ditambahkan!", "success");
      }
    });
  });

  // Event delegasi untuk menghapus jadwal saat tombol 🗑 ditekan
  scheduleTableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-schedule")) {
      const idx = e.target.dataset.index; // Ambil index dari elemen tombol

      // Konfirmasi penghapusan
      Swal.fire({
        title: "Hapus jadwal?",
        text: "Anda tidak dapat mengembalikan data ini!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Ya, hapus!",
        cancelButtonText: "Batal"
      }).then((result) => {
        if (result.isConfirmed) {
          // Hapus 1 data pada index yang dipilih
          scheduleData.splice(idx, 1);
          // Update data di localStorage
          localStorage.setItem("scheduleData", JSON.stringify(scheduleData));
          // Refresh tabel
          renderSchedule();
          Swal.fire("Terhapus!", "Jadwal dihapus", "success");
        }
      });
    }
  });


  // =========================================
  // B. MANAJEMEN AKTIVITAS HARIAN
  // Mengelola daftar checklist aktivitas harian
  // =========================================

  const activityList = document.getElementById("dailyActivityList");
  const activityForm = document.getElementById("addActivityForm");

  // Load data, convert string to object if necessary (migration for older versions)
  let rawActivityData = JSON.parse(localStorage.getItem("activityData"));
  let activityData = [];

  if (!rawActivityData) {
    // Default data jika belum ada penyimpanan di localStorage
    activityData = [
      { text: "Cek stok pakan", completed: false },
      { text: "Catat jumlah telur harian", completed: false },
      { text: "Periksa kesehatan ayam", completed: false },
      { text: "Input laporan produksi", completed: false }
    ];
  } else if (rawActivityData.length > 0 && typeof rawActivityData[0] === 'string') {
    // Migrate legacy string data (jika format lama di localStorage masih array string biasa)
    activityData = rawActivityData.map(item => ({ text: item, completed: false }));
    localStorage.setItem("activityData", JSON.stringify(activityData));
  } else {
    // Gunakan data localStorage
    activityData = rawActivityData;
  }

  /**
   * Render item ke dalam daftar UL (Unordered List) aktivitas.
   */
  function renderActivities() {
    activityList.innerHTML = ""; // Bersihkan list
    activityData.forEach((item, index) => {
      const li = document.createElement("li");
      li.style.display = "flex";
      li.style.justifyContent = "space-between";
      li.style.alignItems = "center";

      // Styling khusus jika aktivitas sudah selesai
      if (item.completed) {
        li.style.opacity = "0.7";
        li.style.background = "#f1f3f5";
      } else {
        li.style.background = "#fff";
      }

      // Masukkan HTML ke dalam list item
      li.innerHTML = `
        <span style="flex:1; padding-right:10px; ${item.completed ? 'text-decoration:line-through; color:#888;' : ''}">${item.text}</span>
        
        <div class="action-btn-group">
          <!-- Tombol checklist untuk menandai selesai atau batal selesai -->
          <button class="action-btn check-btn" data-index="${index}" title="${item.completed ? 'Batal Selesai' : 'Selesai'}">
            ${item.completed ? '↩' : '✔'}
          </button>
          <!-- Tombol hapus ukuran kecil (✕) -->
          <button class="action-btn delete-item-btn delete-activity" data-index="${index}" title="Hapus">✕</button>
        </div>
      `;
      activityList.appendChild(li); // Tambahkan item ke UI
    });
  }
  // Panggil saat dimuat pertama kali
  renderActivities();

  // Menangani submit penambahan aktivitas
  activityForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("activityInput");

    // Validasi input agar tidak kosong
    if (input.value.trim() !== "") {
      const newActivity = input.value.trim();

      Swal.fire({
        title: "Tambah Aktivitas?",
        text: `Apakah Anda yakin ingin menambahkan "${newActivity}"?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, Tambah",
        cancelButtonText: "Batal",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33"
      }).then((result) => {
        if (result.isConfirmed) {
          // Tambah aktivitas baru (default status belum selesai)
          activityData.push({ text: newActivity, completed: false });
          localStorage.setItem("activityData", JSON.stringify(activityData));
          renderActivities(); // Refresh UI
          input.value = ""; // Kosongkan input form setelah tambah
          Swal.fire("Berhasil", "Aktivitas berhasil ditambahkan!", "success");
        }
      });
    }
  });

  // Event delegasi pada list aktivitas klik
  activityList.addEventListener("click", (e) => {
    // Helper untuk meraba ke atas DOM untuk mencari tag tombol, mencegah mis-klik pada element lain
    const btn = e.target.closest('button');
    if (!btn) return;
    const idx = btn.dataset.index;

    // Aksi: Delete Activity
    if (btn.classList.contains("delete-activity")) {
      Swal.fire({
        title: "Hapus Aktivitas?",
        text: "Item ini akan dihapus permanen.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, Hapus",
        cancelButtonText: "Batal",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6"
      }).then((result) => {
        if (result.isConfirmed) {
          activityData.splice(idx, 1); // Hapus data array
          localStorage.setItem("activityData", JSON.stringify(activityData));
          renderActivities();
          Swal.fire("Terhapus!", "Aktivitas telah dihapus.", "success");
        }
      });
    }

    // Aksi: Check (Complete/Uncomplete) Activity
    if (btn.classList.contains("check-btn")) {
      const isCompleted = activityData[idx].completed;
      Swal.fire({
        title: isCompleted ? "Batalkan Selesai?" : "Tandai Selesai?",
        text: isCompleted ? "Kembalikan status ke belum selesai?" : "Apakah aktivitas ini sudah selesai?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya",
        cancelButtonText: "Batal",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33"
      }).then((result) => {
        if (result.isConfirmed) {
          // Toggle (balikkan) nilai true -> false / false -> true
          activityData[idx].completed = !activityData[idx].completed;
          localStorage.setItem("activityData", JSON.stringify(activityData));
          renderActivities();
          if (!isCompleted) Swal.fire("Selesai!", "Aktivitas ditandai selesai.", "success");
        }
      });
    }
  });


  // =========================================
  // C. MANAJEMEN PENGUMUMAN
  // Mengelola list pengumuman atau info penting
  // =========================================

  const announcementList = document.getElementById("announcementList");
  const announcementForm = document.getElementById("addAnnouncementForm");

  // Load data, convert string to object if necessary (migration)
  let rawAnnouncementData = JSON.parse(localStorage.getItem("announcementData"));
  let announcementData = [];

  if (!rawAnnouncementData) {
    // Data default untuk pengumuman
    announcementData = [
      { text: "📌 Pembersihan kandang dilakukan setiap Senin & Kamis.", read: false },
      { text: "📌 Vaksinasi ayam dilakukan pada 20 Oktober 2025.", read: false },
      { text: "📌 Perawatan atap kandang dijadwalkan 25 Oktober 2025.", read: false }
    ];
  } else if (rawAnnouncementData.length > 0 && typeof rawAnnouncementData[0] === 'string') {
    // Jika format lama, convert agar support properti "read"
    announcementData = rawAnnouncementData.map(item => ({ text: item, read: false }));
    localStorage.setItem("announcementData", JSON.stringify(announcementData));
  } else {
    announcementData = rawAnnouncementData;
  }

  /**
   * Render menampilkan pengumuman di list HTML.
   */
  function renderAnnouncements() {
    announcementList.innerHTML = ""; // Bersihkan list HTML
    announcementData.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "announcement-item"; // Beri class untuk styling dari CSS

      // Membersihkan teks, buang karakter emoji lawas seperti '📌' atau '📢' dari awal baris
      let displayText = item.text.replace(/^(📌|📢)\s*/, '');

      // Styling tambahan jika pengumuman sudah dibaca
      if (item.read) {
        li.style.opacity = "0.7";
        li.style.background = "#f1f3f5";
        li.style.borderLeftColor = "#ccc";
      }

      li.innerHTML = `
        <div class="announcement-content">
          <div class="announcement-details">
            <!-- Beri coretan jika item ditandai sudah terbaca -->
            <span class="text" ${item.read ? 'style="text-decoration:line-through; color:#888;"' : ''}>${displayText}</span>
            <span class="time-stamp">Baru saja</span>
          </div>
        </div>
        
        <div class="action-btn-group">
           <!-- Tombol check ganda fungsi untuk membaca / unbaca -->
           <button class="action-btn check-btn" data-index="${index}" title="${item.read ? 'Batal Selesai' : 'Selesai'}">
             ${item.read ? '↩' : '✔'}
           </button>
           <!-- Tombol hapus pengumuman -->
           <button class="action-btn delete-item-btn delete-announcement" data-index="${index}" title="Hapus">✕</button>
        </div>
      `;
      announcementList.appendChild(li); // Tambahkan element Li ke list
    });
  }
  // Panggil pertama kali
  renderAnnouncements();

  // Menangani submit pada bagian pengumuman
  announcementForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("announcementInput");

    // Validasi input text tidak kosong
    if (input.value.trim() !== "") {
      const newAnnouncement = input.value.trim();

      Swal.fire({
        title: "Tambah Pengumuman?",
        text: "Apakah Anda yakin ingin menambahkan pengumuman ini?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, Tambah",
        cancelButtonText: "Batal",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33"
      }).then((result) => {
        if (result.isConfirmed) {
          // Masukan ke array list data
          announcementData.push({ text: newAnnouncement, read: false });
          // Update database sementara lokal
          localStorage.setItem("announcementData", JSON.stringify(announcementData));
          renderAnnouncements(); // Redraw UI
          input.value = ""; // Reset form teks
          Swal.fire("Berhasil", "Pengumuman berhasil ditambahkan!", "success");
        }
      });
    }
  });

  // Delegasi event list pengumuman untuk baca & hapus pengumuman
  announcementList.addEventListener("click", (e) => {
    // Helper untuk meraba event source ke closest DOM Button
    const btn = e.target.closest('button');
    if (!btn) return;
    const idx = btn.dataset.index;

    // Aksi: Menghapus (Delete Announcement)
    if (btn.classList.contains("delete-announcement")) {
      Swal.fire({
        title: "Hapus pengumuman?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, hapus",
        cancelButtonText: "Batal",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6"
      }).then((result) => {
        if (result.isConfirmed) {
          announcementData.splice(idx, 1);
          localStorage.setItem("announcementData", JSON.stringify(announcementData));
          renderAnnouncements();
          Swal.fire("Terhapus!", "Pengumuman berhasil dihapus.", "success");
        }
      });
    }

    // Aksi: Centang/Sudah Dibaca (Check Read Announcement)
    if (btn.classList.contains("check-btn")) {
      const isRead = announcementData[idx].read;
      Swal.fire({
        title: isRead ? "Tandai Belum Dibaca?" : "Tandai Sudah Dibaca?",
        text: isRead ? "Kembalikan status ke belum dibaca?" : "Apakah Anda sudah membaca pengumuman ini?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya",
        cancelButtonText: "Batal",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33"
      }).then((result) => {
        if (result.isConfirmed) {
          // Toggle status read
          announcementData[idx].read = !announcementData[idx].read;
          localStorage.setItem("announcementData", JSON.stringify(announcementData));
          renderAnnouncements();
          // Notifikasi apabila baru saja ditandai dibaca
          if (!isRead) Swal.fire("Sudah Dibaca!", "Pengumuman ditandai sudah dibaca.", "success");
        }
      });
    }
  });

  // =========================================
  // D. GRAFIK DASHBOARD (CHART.JS) & KARTU STATISTIK
  // =========================================

  // 1. DUMMY DATA SETS
  const eggProductionData = [1100, 1150, 1200, 1180, 1250, 1220, 1550]; // 7 days data
  const financeIncomeData = [15, 18, 14, 20]; // In Million IDR
  const financeExpenseData = [8, 10, 7, 12]; // In Million IDR

  // Static set for demonstration purposes
  const totalAyam = 5000;
  const mortalitasData = 2; // ekor
  const sisaPakan = 250; // kg

  // 2. UPDATE KARTU STATISTIK CEPAT (QUICK STATS) DI ATAS
  // Mendapatkan angka telur dari indeks data terakhir (Hari Minggu)
  const todayEggProduction = eggProductionData[eggProductionData.length - 1];

  // Mendapatkan total pemasukan dengan menjumlahkan array income (Juta Rp)
  const totalIncomeMillion = financeIncomeData.reduce((acc, curr) => acc + curr, 0);

  // Menyalurkan ke HTML (Card)
  document.getElementById('stat-telur').textContent = `${todayEggProduction.toLocaleString('id-ID')} Butir`;
  document.getElementById('stat-ayam').textContent = `${totalAyam.toLocaleString('id-ID')} Ekor`;
  document.getElementById('stat-mortalitas').textContent = `${mortalitasData} Ekor`;
  document.getElementById('stat-pakan').textContent = `${sisaPakan} Kg`;
  document.getElementById('stat-pendapatan').textContent = `Rp ${totalIncomeMillion}.000.000`;


  // 3. RENDER GRAFIK
  // --- Line Chart: Tren Produksi Telur (7 Hari) ---
  const canvasEgg = document.getElementById('eggProductionChart');
  if (canvasEgg) {
    const ctxEgg = canvasEgg.getContext('2d');
    new Chart(ctxEgg, {
      type: 'line',
      data: {
        labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
        datasets: [{
          label: 'Produksi Telur (Butir)',
          data: eggProductionData,
          borderColor: '#fb8500',
          backgroundColor: 'rgba(251, 133, 0, 0.2)',
          borderWidth: 3,
          pointBackgroundColor: '#ffb703',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: false, suggestedMin: 1000 }
        }
      }
    });
  }

  // --- Bar Chart: Pemasukan vs Pengeluaran ---
  const canvasFinance = document.getElementById('financeChart');
  if (canvasFinance) {
    const ctxFinance = canvasFinance.getContext('2d');
    new Chart(ctxFinance, {
      type: 'bar',
      data: {
        labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
        datasets: [
          {
            label: 'Pemasukan (Juta Rp)',
            data: financeIncomeData,
            backgroundColor: '#2ecc71',
            borderRadius: 5
          },
          {
            label: 'Pengeluaran (Juta Rp)',
            data: financeExpenseData,
            backgroundColor: '#e74c3c',
            borderRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

});