/* =========================================================
   🐔 SISTEM ADMINISTRASI PETERNAKAN
   File: dashboardTAalip.js
   Deskripsi: Mengatur interaksi sidebar, profil, logout,
   dan manajemen tabel kegiatan peternakan.
========================================================= */

// =========================================
// 1. SIDEBAR & NAVIGASI
// =========================================

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
    text: 'Fitur profil belum diimplementasikan 🐔',
    confirmButtonColor: '#fb8500'
  });
}

// Fungsi logout
function logoutUser() {
  Swal.fire({
    title: "Yakin ingin logout?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, logout",
    cancelButtonText: "Batal",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6"
  }).then((result) => {
    if (result.isConfirmed) {
      // Redirect ke halaman login
      window.location.href = "login.html";
    }
  });
}


/* =========================================================
   � MAIN DASHBOARD LOGIC (DOM LOADED)
========================================================= */
document.addEventListener("DOMContentLoaded", () => {

  // =========================================
  // A. MANAJEMEN JADWAL KEGIATAN
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
        scheduleData.push({ tanggal, waktu, agenda, ruangan });
        localStorage.setItem("scheduleData", JSON.stringify(scheduleData));
        renderSchedule();
        scheduleForm.reset();
        Swal.fire("Berhasil", "Jadwal berhasil ditambahkan!", "success");
      }
    });
  });

  scheduleTableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-schedule")) {
      const idx = e.target.dataset.index;
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
          scheduleData.splice(idx, 1);
          localStorage.setItem("scheduleData", JSON.stringify(scheduleData));
          renderSchedule();
          Swal.fire("Terhapus!", "Jadwal dihapus", "success");
        }
      });
    }
  });


  // =========================================
  // B. MANAJEMEN AKTIVITAS HARIAN
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
          activityData.push({ text: newActivity, completed: false });
          localStorage.setItem("activityData", JSON.stringify(activityData));
          renderActivities();
          input.value = "";
          Swal.fire("Berhasil", "Aktivitas berhasil ditambahkan!", "success");
        }
      });
    }
  });

  activityList.addEventListener("click", (e) => {
    // Helper to get index from button or inside button
    const btn = e.target.closest('button');
    if (!btn) return;
    const idx = btn.dataset.index;

    // Delete Activity
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
          activityData.splice(idx, 1);
          localStorage.setItem("activityData", JSON.stringify(activityData));
          renderActivities();
          Swal.fire("Terhapus!", "Aktivitas telah dihapus.", "success");
        }
      });
    }
    // Check (Complete) Activity
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
           <button class="action-btn check-btn" data-index="${index}" title="${item.read ? 'Batal Selesai' : 'Selesai'}">
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
          announcementData.push({ text: newAnnouncement, read: false });
          localStorage.setItem("announcementData", JSON.stringify(announcementData));
          renderAnnouncements();
          input.value = "";
          Swal.fire("Berhasil", "Pengumuman berhasil ditambahkan!", "success");
        }
      });
    }
  });

  announcementList.addEventListener("click", (e) => {
    // Helper to get index from button or inside button
    const btn = e.target.closest('button');
    if (!btn) return;
    const idx = btn.dataset.index;

    // Delete Announcement
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

    // Check (Read) Announcement
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
          announcementData[idx].read = !announcementData[idx].read;
          localStorage.setItem("announcementData", JSON.stringify(announcementData));
          renderAnnouncements();
          if (!isRead) Swal.fire("Sudah Dibaca!", "Pengumuman ditandai sudah dibaca.", "success");
        }
      });
    }
  });

});