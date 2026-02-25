/* =========================================================
   🐔 SCRIPT MANAJEMEN DATA AYAM
========================================================= */

// Data Dummy Awal
let dataAyam = [
    {
        id: "B-001",
        tglMasuk: "2026-01-10",
        jenis: "Petelur (Layer)",
        jumlahAwal: 2000,
        sisaAyam: 1950,
        kandang: "Kandang A (Utara)",
        status: "Aktif"
    },
    {
        id: "B-002",
        tglMasuk: "2026-02-05",
        jenis: "Petelur (Layer)",
        jumlahAwal: 3000,
        sisaAyam: 2980,
        kandang: "Kandang B (Timur)",
        status: "Aktif"
    }
];

// Fungsi Utility untuk Toggle Menu Sidebar (Shared behavior)
function toggleSidebarMenu(menuId) {
    const submenu = document.getElementById(menuId);
    submenu.classList.toggle('show');
    const button = submenu.previousElementSibling;
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', !isExpanded);
}

// Fungsi Load Data
document.addEventListener("DOMContentLoaded", () => {
    // Muat data dari LocalStorage jika ada, jika tidak pakai dataAyam dummy
    if(localStorage.getItem('dataAyamData')) {
        dataAyam = JSON.parse(localStorage.getItem('dataAyamData'));
    }
    renderTable();
    updateQuickStats();
});

// Update Kartu Info Statistik
function updateQuickStats() {
    const totalBatch = dataAyam.length;
    let totalPopulasi = 0;
    let setKandang = new Set();

    dataAyam.forEach(ayam => {
        if(ayam.status === 'Aktif') {
            totalPopulasi += parseInt(ayam.sisaAyam);
            setKandang.add(ayam.kandang);
        }
    });

    document.getElementById('totalBatch').innerText = totalBatch;
    document.getElementById('totalPopulasi').innerText = totalPopulasi.toLocaleString('id-ID') + ' Ekor';
    document.getElementById('kandangTerisi').innerText = setKandang.size + ' Kandang';
}

// Render Tabel Data
function renderTable() {
    const tbody = document.getElementById("ayamTableBody");
    const emptyState = document.getElementById("emptyState");
    const tableEl = document.getElementById("ayamTable");
    
    tbody.innerHTML = "";

    if (dataAyam.length === 0) {
        tableEl.style.display = "none";
        emptyState.style.display = "block";
    } else {
        tableEl.style.display = "table";
        emptyState.style.display = "none";

        dataAyam.forEach((ayam) => {
            // Tentukan style badge
            let badgeClass = "badge-aktif";
            if(ayam.status === 'Panen') badgeClass = "badge-panen";
            else if(ayam.status === 'Afkir') badgeClass = "badge-afkir";

            const row = document.createElement("tr");
            row.innerHTML = `
                <td><strong>${ayam.id}</strong></td>
                <td>${formatTanggal(ayam.tglMasuk)}</td>
                <td>${ayam.jenis}</td>
                <td>${ayam.jumlahAwal.toLocaleString('id-ID')}</td>
                <td><strong>${ayam.sisaAyam.toLocaleString('id-ID')}</strong></td>
                <td>${ayam.kandang}</td>
                <td><span class="badge ${badgeClass}">${ayam.status}</span></td>
                <td>
                    <button class="btn-edit" onclick="editAyam('${ayam.id}')">✏️ Edit</button>
                    <button class="btn-delete" onclick="deleteAyam('${ayam.id}')">🗑️ Hapus</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
}

// Format Tanggal (e.g. 10 Jan 2026)
function formatTanggal(tglString) {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(tglString).toLocaleDateString('id-ID', options);
}

// Logika Pencarian Tabel
function searchTable() {
    const input = document.getElementById("searchAyam").value.toLowerCase();
    const rows = document.querySelectorAll("#ayamTableBody tr");

    rows.forEach(row => {
        const textContent = row.innerText.toLowerCase();
        row.style.display = textContent.includes(input) ? "" : "none";
    });
}

// =======================
//   MODAL & CRUD LOGIC
// =======================

const modal = document.getElementById('ayamModal');
const form = document.getElementById('ayamForm');

function openAyamModal() {
    form.reset();
    document.getElementById('ayamId').value = ""; // Kosongkan ID berarti Mode Tambah
    document.getElementById('modalTitle').innerText = "Tambah Batch Ayam";
    modal.classList.add('show');
}

function closeAyamModal() {
    modal.classList.remove('show');
}

function saveAyamData(event) {
    event.preventDefault();

    const idInput = document.getElementById('ayamId').value;
    const tglMasuk = document.getElementById('tglMasuk').value;
    const jenisAyam = document.getElementById('jenisAyam').value;
    const jumlahAwal = document.getElementById('jumlahAwal').value;
    const sisaAyam = document.getElementById('sisaAyam').value;
    const kandang = document.getElementById('kandang').value;
    const statusAyam = document.getElementById('statusAyam').value;

    if (idInput === "") {
        // Mode Tambah: Buat ID Baru Otomatis (misal B-003)
        const nextNum = dataAyam.length + 1;
        const newId = "B-" + String(nextNum).padStart(3, '0');
        
        dataAyam.push({
            id: newId,
            tglMasuk,
            jenis: jenisAyam,
            jumlahAwal: parseInt(jumlahAwal),
            sisaAyam: parseInt(sisaAyam),
            kandang,
            status: statusAyam
        });

        Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Data batch '+newId+' berhasil ditambahkan.',
            timer: 2000,
            showConfirmButton: false
        });
    } else {
        // Mode Edit
        const index = dataAyam.findIndex(a => a.id === idInput);
        if (index > -1) {
            dataAyam[index] = {
                id: idInput,
                tglMasuk,
                jenis: jenisAyam,
                jumlahAwal: parseInt(jumlahAwal),
                sisaAyam: parseInt(sisaAyam),
                kandang,
                status: statusAyam
            };
        }

        Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Data ayam diperbarui.',
            timer: 2000,
            showConfirmButton: false
        });
    }

    // Simpan ke localStorage agar awet
    localStorage.setItem('dataAyamData', JSON.stringify(dataAyam));

    closeAyamModal();
    renderTable();
    updateQuickStats();
}

function editAyam(id) {
    const ayam = dataAyam.find(a => a.id === id);
    if(ayam) {
        document.getElementById('ayamId').value = ayam.id;
        document.getElementById('tglMasuk').value = ayam.tglMasuk;
        document.getElementById('jenisAyam').value = ayam.jenis;
        document.getElementById('jumlahAwal').value = ayam.jumlahAwal;
        document.getElementById('sisaAyam').value = ayam.sisaAyam;
        document.getElementById('kandang').value = ayam.kandang;
        document.getElementById('statusAyam').value = ayam.status;

        document.getElementById('modalTitle').innerText = "Edit Batch " + ayam.id;
        modal.classList.add('show');
    }
}

function deleteAyam(id) {
    Swal.fire({
        title: 'Hapus Data?',
        text: "Data batch " + id + " akan dihapus secara permanen.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff6b6b',
        cancelButtonColor: '#999',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            dataAyam = dataAyam.filter(a => a.id !== id);
            localStorage.setItem('dataAyamData', JSON.stringify(dataAyam));
            renderTable();
            updateQuickStats();

            Swal.fire(
                'Terhapus!',
                'Data batch telah dihapus.',
                'success'
            )
        }
    });
}
