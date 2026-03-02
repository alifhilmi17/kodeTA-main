/* =========================================================
   🐔 SCRIPT MANAJEMEN DATA AYAM
   File: dataAyamTAalip.js
   Deskripsi: Mengelola fitur CRUD (Create, Read, Update, Delete) 
   untuk tabel inventaris atau populasi ayam termasuk update statistik.
========================================================= */

// =========================================
// 1. DEKLARASI DATA AWAL
// =========================================

// Data Dummy Awal yang merepresentasikan struktur data batch ayam.
// Digunakan apabila di dalam localStorage belum ada data yang tersimpan.
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

// =========================================
// 2. FUNGSI UTILITAS UMUM
// =========================================

/**
 * Fungsi Utility untuk Toggle Menu Sidebar
 * Mengatur buka tutup submenu pada sisi sidebar navigasi.
 * @param {string} menuId - ID dari elemen submenu yang akan di toggle.
 */
function toggleSidebarMenu(menuId) {
    const submenu = document.getElementById(menuId);
    // Tambah/hapus class 'show' untuk menampilkan submenu dengan CSS
    submenu.classList.toggle('show');

    // Memperbarui atribut aria-expanded untuk aksesibilitas (pembaca layar)
    const button = submenu.previousElementSibling;
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', !isExpanded);
}

/**
 * Format Tanggal menjadi string lokal bahasa Indonesia (misal: 10 Jan 2026).
 * @param {string} tglString - String tanggal dengan format YYYY-MM-DD
 * @returns {string} String tanggal terformat
 */
function formatTanggal(tglString) {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(tglString).toLocaleDateString('id-ID', options);
}

// =========================================
// 3. INISIALISASI & LOGIKA TAMPILAN UTAMA
// =========================================

// Berjalan otomatis saat dokumen HTML selesai diload.
document.addEventListener("DOMContentLoaded", () => {
    // Mengecek apakah terdapat data tersimpan di LocalStorage dengan key 'dataAyamData'.
    // Jika ada, timpa variabel dummy 'dataAyam' dengan data dari localStorage.
    if (localStorage.getItem('dataAyamData')) {
        dataAyam = JSON.parse(localStorage.getItem('dataAyamData'));
    }
    // Render ulang tabel ke HTML
    renderTable();
    // Update dashboard kartu stastistik kecil di atas (Quick Stats)
    updateQuickStats();
});

/**
 * Memperbarui nilai angka-angka pada Kartu Info Statistik di atas tabel.
 * Menghitung otomatis total batch, populasi aktif, dan jumlah kandang terisi.
 */
function updateQuickStats() {
    // Total batch = panjang dari array dataAyam
    const totalBatch = dataAyam.length;
    let totalPopulasi = 0;

    // Set (Himpunan Matematika) berguna agar nama kandang yang sama 
    // tidak dihitung ganda jika ada 2 batch di 1 kandang yang sama.
    let setKandang = new Set();

    // Loop semua array untuk menghitung statistik yang berstatus 'Aktif'
    dataAyam.forEach(ayam => {
        if (ayam.status === 'Aktif') {
            totalPopulasi += parseInt(ayam.sisaAyam);  // Tambah total ekor
            setKandang.add(ayam.kandang);              // Tambahkan id kandang ke Set uniqueness
        }
    });

    // Menuliskan hasil kalkulasi langsung ke element HTML masing-masing ID
    document.getElementById('totalBatch').innerText = totalBatch;
    document.getElementById('totalPopulasi').innerText = totalPopulasi.toLocaleString('id-ID') + ' Ekor';
    document.getElementById('kandangTerisi').innerText = setKandang.size + ' Kandang';
}

/**
 * Merender daftar baris (row) ke dalam tag Tabel Body (<tbody>) HTML.
 */
function renderTable() {
    const tbody = document.getElementById("ayamTableBody");
    const emptyState = document.getElementById("emptyState"); // Elemen jika text kosong
    const tableEl = document.getElementById("ayamTable");

    // Bersihkan semua baris lama yang ada di dalam HTML <tbody>
    tbody.innerHTML = "";

    // Pengecekan ada tidaknya data di dalam list array
    if (dataAyam.length === 0) {
        // Jika data kosong, sembunyikan tabel dan tampilkan gambar Empty State
        tableEl.style.display = "none";
        emptyState.style.display = "block";
    } else {
        // Jika data ada, pastikan tabel tampil dan embpty state tersembunyi
        tableEl.style.display = "table";
        emptyState.style.display = "none";

        // Tambahkan baris per elemen data ayam
        dataAyam.forEach((ayam) => {

            // Logika pewarnaan status lencana (badge)
            let badgeClass = "badge-aktif";
            if (ayam.status === 'Panen') badgeClass = "badge-panen";
            else if (ayam.status === 'Afkir') badgeClass = "badge-afkir";

            const row = document.createElement("tr");

            // Konstruksi sel string HTML secara dinamis
            row.innerHTML = `
                <td><strong>${ayam.id}</strong></td>
                <td>${formatTanggal(ayam.tglMasuk)}</td>
                <td>${ayam.jenis}</td>
                <td>${ayam.jumlahAwal.toLocaleString('id-ID')}</td>
                <td><strong>${ayam.sisaAyam.toLocaleString('id-ID')}</strong></td>
                <td>${ayam.kandang}</td>
                <td><span class="badge ${badgeClass}">${ayam.status}</span></td>
                <td>
                    <!-- Parameter memakai single quotes agar passing ID string berjalan benar -->
                    <button class="btn-edit" onclick="editAyam('${ayam.id}')">✏️ Edit</button>
                    <button class="btn-delete" onclick="deleteAyam('${ayam.id}')">🗑️ Hapus</button>
                </td>
            `;
            tbody.appendChild(row); // Pasangkan baris ini ke dalam tabel
        });
    }
}

/**
 * Logika Pencarian Tabel.
 * Menyembunyikan baris <tr> mana saja yang tidak cocok dengan input teks pengguna.
 */
function searchTable() {
    const input = document.getElementById("searchAyam").value.toLowerCase();
    const rows = document.querySelectorAll("#ayamTableBody tr");

    // Lakukan filter visual untuk tiap baris
    rows.forEach(row => {
        // Gabungkan seluruh teks yang ada di dalam 1 baris tr
        const textContent = row.innerText.toLowerCase();

        // Cek secara kasar apakah string dari input terdapat di dalam baris
        row.style.display = textContent.includes(input) ? "" : "none";
    });
}

// =========================================
// 4. MODAL POP-UP LOGIC & CRUD
// =========================================

// Deklarasi element global untuk modal dan form
const modal = document.getElementById('ayamModal');
const form = document.getElementById('ayamForm');

/**
 * Menampilkan Modal untuk menambah Batch Ayam Baru.
 */
function openAyamModal() {
    form.reset(); // Kosongkan form dari isian lama
    // Penting: Mengosongkan value ID tak terlihat (hidden) merupakan pertanda bahwa form ini adalah "Mode Tambah" bukan "Mode Edit"
    document.getElementById('ayamId').value = "";
    document.getElementById('modalTitle').innerText = "Tambah Batch Ayam";
    modal.classList.add('show');
}

/**
 * Menutup dan menyembunyikan modal.
 */
function closeAyamModal() {
    modal.classList.remove('show');
}

/**
 * Handles action ketika tombol "Simpan" dipencet dari dalam modal.
 * Mampu bekerja sebagai "Tambah Baru" ataupun "Edit Lama" tergantung pada nilai idInput.
 */
function saveAyamData(event) {
    event.preventDefault(); // Mencegah reload halaman klasik

    // Mengambil Value / Isi yang diketik dari semua input fields
    const idInput = document.getElementById('ayamId').value;
    const tglMasuk = document.getElementById('tglMasuk').value;
    const jenisAyam = document.getElementById('jenisAyam').value;
    const jumlahAwal = document.getElementById('jumlahAwal').value;
    const sisaAyam = document.getElementById('sisaAyam').value;
    const kandang = document.getElementById('kandang').value;
    const statusAyam = document.getElementById('statusAyam').value;

    if (idInput === "") {
        // ===== MODE TAMBAH =====
        // Membuat string ID baru Otomatis bertipe (misal B-003, B-004) berdasarkan panjang data terakhir
        const nextNum = dataAyam.length + 1;
        const newId = "B-" + String(nextNum).padStart(3, '0');

        // Push object baru ke dalam data keseluruhan
        dataAyam.push({
            id: newId,
            tglMasuk,
            jenis: jenisAyam,
            jumlahAwal: parseInt(jumlahAwal),
            sisaAyam: parseInt(sisaAyam), // Pastikan konversi ke tipe Integer
            kandang,
            status: statusAyam
        });

        // Tampilkan feedback manis dengan Swal (SweetAlert)
        Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Data batch ' + newId + ' berhasil ditambahkan.',
            timer: 2000,
            showConfirmButton: false
        });
    } else {
        // ===== MODE EDIT =====
        // Mencari index letak data ayam yang ID-nya sama dengan idInput
        const index = dataAyam.findIndex(a => a.id === idInput);

        if (index > -1) {
            // Replace / Timpa objek pada index tersebut dengan data baru dari form
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

    // Simpan data terbaru dari Array JS ke dalam localStorage browser agar menjadi awet
    localStorage.setItem('dataAyamData', JSON.stringify(dataAyam));

    // Tutup popup lalu gambar ulang tabel beserta statistiknya
    closeAyamModal();
    renderTable();
    updateQuickStats();
}

/**
 * Menampilkan Modal yang berisi nilai-nilai lama dari data spesifik yang hendak Diedit.
 * @param {string} id - Identifier unik (Contoh: "B-001")
 */
function editAyam(id) {
    // Cari objek ayam mana yang cocok di dalam array
    const ayam = dataAyam.find(a => a.id === id);
    if (ayam) {
        // Set up nilai di dalam form element sebelum menampilkan modal
        document.getElementById('ayamId').value = ayam.id; // Menyisipkan ID ke hidden state sebagai mode Edit
        document.getElementById('tglMasuk').value = ayam.tglMasuk;
        document.getElementById('jenisAyam').value = ayam.jenis;
        document.getElementById('jumlahAwal').value = ayam.jumlahAwal;
        document.getElementById('sisaAyam').value = ayam.sisaAyam;
        document.getElementById('kandang').value = ayam.kandang;
        document.getElementById('statusAyam').value = ayam.status;

        document.getElementById('modalTitle').innerText = "Edit Batch " + ayam.id;
        modal.classList.add('show'); // Memaksa Modal Tampil
    }
}

/**
 * Menghapus 1 baris objek data ayam setelah konfirmasi pengguna.
 * @param {string} id - Identifier unik (Contoh: "B-001")
 */
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
            // Hapus isi array dengan mem-filter agar isinya hanya objek ayam yg tidak sama dengan ID penghapusan. (Metode Non-Destructive)
            dataAyam = dataAyam.filter(a => a.id !== id);

            // Timpa memori local storage dengan array terbaru
            localStorage.setItem('dataAyamData', JSON.stringify(dataAyam));

            // Gambar ulang tampilan user
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
