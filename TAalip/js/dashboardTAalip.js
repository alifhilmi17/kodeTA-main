/* =========================================================
   🐔 SISTEM ADMINISTRASI PETERNAKAN
   File: dashboardTAalip.js
   Deskripsi: Mengatur interaksi sidebar, profil, logout,
   dan manajemen tabel kegiatan peternakan.
========================================================= */


/* =========================================================
   👤 1. MENU PROFIL
========================================================= */
function goToProfile() {
  Swal.fire({
    icon: 'info',
    title: 'Profil Peternak',
    text: 'Menu profil sedang dalam pengembangan 🐔',
    confirmButtonColor: '#fb8500'
  });
}


/* =========================================================
   ⚙️ 2. DROPDOWN SIDEBAR MENU
   - Mendukung banyak submenu dengan arrow animasi
========================================================= */
// Fungsi toggle submenu sidebar
function toggleSidebarMenu(submenuId) {
  const submenu = document.getElementById(submenuId);
  const isHidden = submenu.getAttribute("aria-hidden") === "true";

  // Toggle visibilitas submenu
  submenu.setAttribute("aria-hidden", !isHidden);
  submenu.previousElementSibling.setAttribute("aria-expanded", isHidden);

  // Toggle panah arah
  const arrow = submenu.previousElementSibling.querySelector(".arrow");
  arrow.textContent = isHidden ? "▾" : "▸";
}

// Fungsi profil
function goToProfile() {
  Swal.fire({
    icon: 'info',
    title: 'Profil Pengguna',
    text: 'Fitur profil belum diimplementasikan',
  });
}

// Fungsi logout
function logoutUser() {
  Swal.fire({
    icon: 'warning',
    title: 'Logout',
    text: 'Apakah Anda yakin ingin logout?',
    showCancelButton: true,
    confirmButtonText: 'Ya',
    cancelButtonText: 'Tidak'
  }).then((result) => {
    if (result.isConfirmed) {
      // Di sini bisa redirect ke halaman login
      window.location.href = "login.html";
    }
  });
}



/* =========================================================
   🚪 3. LOGOUT BUTTON
========================================================= */
function logoutUser() {
  Swal.fire({
    title: "Yakin ingin logout?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, logout",
    cancelButtonText: "Batal"
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire("Berhasil logout!", "", "success");
    }
  });
}


/* =========================================================
   📅 4. TABEL JADWAL & FORM TAMBAH KEGIATAN
========================================================= */
document.addEventListener("DOMContentLoaded", () => {

  // =========================================
  // 1. MANAJEMEN JADWAL (EXISTING)
  // =========================================
  const scheduleTableBody = document.querySelector("#scheduleTable tbody");
  const scheduleForm = document.getElementById("addScheduleForm");

  let scheduleData = JSON.parse(localStorage.getItem("scheduleData")) || [
    { tanggal: "Senin, 14 Okt 2025", waktu: "08:00", agenda: "Cek stok pakan", ruangan: "Gudang Pakan" },
    { tanggal: "Selasa, 15 Okt 2025", waktu: "09:00", agenda: "Panen Telur", ruangan: "Kandang A" }
  ];

  function renderSchedule() {
    scheduleTableBody.innerHTML = "";
    scheduleData.forEach((item, index) => {
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
  renderSchedule();

  scheduleForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const tanggal = document.getElementById("tanggal").value;
    const waktu = document.getElementById("waktu").value;
    const agenda = document.getElementById("agenda").value;
    const ruangan = document.getElementById("ruangan").value;

    scheduleData.push({ tanggal, waktu, agenda, ruangan });
    localStorage.setItem("scheduleData", JSON.stringify(scheduleData));
    renderSchedule();
    scheduleForm.reset();
    Swal.fire("Berhasil!", "Jadwal ditambahkan", "success");
  });

  scheduleTableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-schedule")) {
      const idx = e.target.dataset.index;
      Swal.fire({
        title: "Hapus jadwal?", icon: "warning", showCancelButton: true, confirmButtonText: "Ya", cancelButtonText: "Batal"
      }).then((result) => {
        if (result.isConfirmed) {
          scheduleData.splice(idx, 1);
          localStorage.setItem("scheduleData", JSON.stringify(scheduleData));
          renderSchedule();
          Swal.fire("Terhapus!", "Jadwal dihapus", "success");
        }
      });
    }
  });


  // =========================================
  // 2. MANAJEMEN AKTIVITAS HARIAN
  // =========================================
  const activityList = document.getElementById("dailyActivityList");
  const activityForm = document.getElementById("addActivityForm");

  // Load data, convert string to object if necessary (migration)
  let rawActivityData = JSON.parse(localStorage.getItem("activityData"));
  let activityData = [];

  if (!rawActivityData) {
    // Default data
    activityData = [
      { text: "Cek stok pakan", completed: false },
      { text: "Catat jumlah telur harian", completed: false },
      { text: "Periksa kesehatan ayam", completed: false },
      { text: "Input laporan produksi", completed: false }
    ];
  } else if (rawActivityData.length > 0 && typeof rawActivityData[0] === 'string') {
    // Migrate legacy string data
    activityData = rawActivityData.map(item => ({ text: item, completed: false }));
    localStorage.setItem("activityData", JSON.stringify(activityData));
  } else {
    activityData = rawActivityData;
  }

  function renderActivities() {
    activityList.innerHTML = "";
    activityData.forEach((item, index) => {
      const li = document.createElement("li");
      li.style.display = "flex";
      li.style.justifyContent = "space-between";
      li.style.alignItems = "center";

      // Styling for completed item
      if (item.completed) {
        li.style.opacity = "0.7";
        li.style.background = "#f1f3f5";
      } else {
        li.style.background = "#fff";
      }

      li.innerHTML = `
        <span style="flex:1; padding-right:10px; ${item.completed ? 'text-decoration:line-through; color:#888;' : ''}">${item.text}</span>
        
        <div class="action-btn-group">
          <button class="action-btn check-btn" data-index="${index}" title="${item.completed ? 'Batal Selesai' : 'Selesai'}">
            ${item.completed ? '↩' : '✔'}
          </button>
          <button class="action-btn delete-item-btn delete-activity" data-index="${index}" title="Hapus">✕</button>
        </div>
      `;
      activityList.appendChild(li);
    });
  }
  renderActivities();

  activityForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("activityInput");
    if (input.value.trim() !== "") {
      activityData.push({ text: input.value.trim(), completed: false });
      localStorage.setItem("activityData", JSON.stringify(activityData));
      renderActivities();
      input.value = "";
      Swal.fire({ title: "Berhasil!", text: "Aktivitas ditambahkan", icon: "success", timer: 1500, showConfirmButton: false });
    }
  });

  activityList.addEventListener("click", (e) => {
    // Delete
    if (e.target.classList.contains("delete-activity")) {
      const idx = e.target.dataset.index;
      activityData.splice(idx, 1);
      localStorage.setItem("activityData", JSON.stringify(activityData));
      renderActivities();
    }
    // Check (Complete)
    if (e.target.classList.contains("check-btn")) {
      const idx = e.target.dataset.index;
      activityData[idx].completed = !activityData[idx].completed;
      localStorage.setItem("activityData", JSON.stringify(activityData));
      renderActivities();
    }
  });


  // =========================================
  // 3. MANAJEMEN PENGUMUMAN
  // =========================================
  const announcementList = document.getElementById("announcementList");
  const announcementForm = document.getElementById("addAnnouncementForm");

  // Load data, convert string to object if necessary (migration)
  let rawAnnouncementData = JSON.parse(localStorage.getItem("announcementData"));
  let announcementData = [];

  if (!rawAnnouncementData) {
    announcementData = [
      { text: "📌 Pembersihan kandang dilakukan setiap Senin & Kamis.", read: false },
      { text: "📌 Vaksinasi ayam dilakukan pada 20 Oktober 2025.", read: false },
      { text: "📌 Perawatan atap kandang dijadwalkan 25 Oktober 2025.", read: false }
    ];
  } else if (rawAnnouncementData.length > 0 && typeof rawAnnouncementData[0] === 'string') {
    announcementData = rawAnnouncementData.map(item => ({ text: item, read: false }));
    localStorage.setItem("announcementData", JSON.stringify(announcementData));
  } else {
    announcementData = rawAnnouncementData;
  }

  function renderAnnouncements() {
    announcementList.innerHTML = "";
    announcementData.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "announcement-item"; // Class for styling

      // Clean up old emoji from text display if exists
      let displayText = item.text.replace(/^(📌|📢)\s*/, '');

      if (item.read) {
        li.style.opacity = "0.7";
        li.style.background = "#f1f3f5";
        li.style.borderLeftColor = "#ccc";
      }

      li.innerHTML = `
        <div class="announcement-content">
          <div class="announcement-details">
            <span class="text" ${item.read ? 'style="text-decoration:line-through; color:#888;"' : ''}>${displayText}</span>
            <span class="time-stamp">Baru saja</span>
          </div>
        </div>
        
        <div class="action-btn-group">
           <button class="action-btn check-btn" data-index="${index}" title="${item.read ? 'Tandai Belum Dibaca' : 'Tandai Sudah Dibaca'}">
             ${item.read ? '↩' : '✔'}
           </button>
           <button class="action-btn delete-item-btn delete-announcement" data-index="${index}" title="Hapus">✕</button>
        </div>
      `;
      announcementList.appendChild(li);
    });
  }
  renderAnnouncements();

  announcementForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("announcementInput");
    if (input.value.trim() !== "") {
      announcementData.push({ text: input.value.trim(), read: false });
      localStorage.setItem("announcementData", JSON.stringify(announcementData));
      renderAnnouncements();
      input.value = "";
      Swal.fire({ title: "Berhasil!", text: "Pengumuman ditambahkan", icon: "success", timer: 1500, showConfirmButton: false });
    }
  });

  announcementList.addEventListener("click", (e) => {
    // Helper to get index from button or inside button
    const btn = e.target.closest('button');
    if (!btn) return;
    const idx = btn.dataset.index;

    if (btn.classList.contains("delete-announcement")) {
      announcementData.splice(idx, 1);
      localStorage.setItem("announcementData", JSON.stringify(announcementData));
      renderAnnouncements();
    }

    if (btn.classList.contains("check-btn")) {
      announcementData[idx].read = !announcementData[idx].read;
      localStorage.setItem("announcementData", JSON.stringify(announcementData));
      renderAnnouncements();
    }
  });

});