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
   ========================================================= */
function toggleSidebarMenu() {
  const submenu = document.getElementById("appSubmenu");
  const arrow = document.getElementById("arrow");
  const button = document.querySelector(".has-submenu");

  // Toggle class untuk menampilkan / menyembunyikan submenu
  const isOpen = submenu.classList.toggle("show");

  // Aksesibilitas ARIA
  submenu.setAttribute("aria-hidden", !isOpen);
  button.setAttribute("aria-expanded", isOpen);

  // Animasi rotasi panah
  arrow.classList.toggle("rotate", isOpen);
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
  const tableBody = document.querySelector("#scheduleTable tbody");
  const form = document.getElementById("addScheduleForm");

  // Data awal (dummy) atau dari localStorage
  let scheduleData = JSON.parse(localStorage.getItem("scheduleData")) || [
    {
      tanggal: "Senin, 14 Okt 2025",
      waktu: "08:00",
      agenda: "Cek stok pakan",
      ruangan: "Gudang Pakan"
    },
    {
      tanggal: "Selasa, 15 Okt 2025",
      waktu: "09:00",
      agenda: "Panen Telur",
      ruangan: "Kandang A"
    }
  ];

  // 🔹 Fungsi menampilkan data ke tabel
  function renderTable() {
    tableBody.innerHTML = "";
    scheduleData.forEach((item, index) => {
      tableBody.innerHTML += `
        <tr>
          <td>${item.tanggal}</td>
          <td>${item.waktu}</td>
          <td>${item.agenda}</td>
          <td>${item.ruangan}</td>
          <td>
            <button class="delete-btn" data-index="${index}" title="Hapus kegiatan">🗑</button>
          </td>
        </tr>
      `;
    });
  }

  // Tampilkan data awal saat halaman dimuat
  renderTable();

  // 🔹 Event: Tambah kegiatan
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const tanggal = document.getElementById("tanggal").value;
    const waktu = document.getElementById("waktu").value;
    const agenda = document.getElementById("agenda").value;
    const ruangan = document.getElementById("ruangan").value;

    scheduleData.push({ tanggal, waktu, agenda, ruangan });
    localStorage.setItem("scheduleData", JSON.stringify(scheduleData));

    renderTable();
    form.reset();

    Swal.fire({
      title: "Berhasil!",
      text: "Kegiatan berhasil ditambahkan 🥚",
      icon: "success",
      confirmButtonColor: "#4CAF50"
    });
  });

  // 🔹 Event: Hapus kegiatan
  tableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const idx = e.target.dataset.index;

      Swal.fire({
        title: "Hapus kegiatan?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, hapus!",
        cancelButtonText: "Batal"
      }).then((result) => {
        if (result.isConfirmed) {
          scheduleData.splice(idx, 1);
          localStorage.setItem("scheduleData", JSON.stringify(scheduleData));
          renderTable();

          Swal.fire({
            title: "Terhapus!",
            text: "Kegiatan berhasil dihapus 🗑",
            icon: "success"
          });
        }
      });
    }
  });
});
