/* =========================================================
   SISTEM ADMINISTRASI PETERNAKAN
   File: keuangan.js
   Deskripsi: Menangani logika Pembuatan, Pembacaan, dan 
   Penghapusan (CRUD) untuk modul Buku Data Keuangan.
========================================================= */

// =========================================
// 1. FUNGSI NAVIGASI UMUM & SIDEBAR 
// =========================================

/**
 * Membuka/Menutup (Toggle) sub-menu di samping panel sidebar
 * @param {string} submenuId - ID elemen HTML dari submenu yang dituju
 */
function toggleSidebarMenu(submenuId) {
    const submenu = document.getElementById(submenuId);
    if (submenu.classList.contains('show')) {
        submenu.classList.remove('show');
    }
    const isHidden = submenu.getAttribute("aria-hidden") === "true";
    const parentButton = submenu.previousElementSibling;

    submenu.setAttribute("aria-hidden", !isHidden);
    parentButton.setAttribute("aria-expanded", isHidden);

    if (isHidden) {
        parentButton.classList.add("active-parent");
    } else {
        parentButton.classList.remove("active-parent");
    }
}

/**
 * Pemberitahuan popup saat mengeklik foto profil (Fitur masih belum tersedia)
 */
function goToProfile() {
    Swal.fire({
        icon: 'info',
        title: 'Profil Pengguna',
        text: 'Fitur profil belum diimplementasikan 🐔',
        confirmButtonColor: '#fb8500'
    });
}

/**
 * Konfirmasi sistem otentikasi logout ke layar Login
 */
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
            window.location.href = "login.html";
        }
    });
}

// =========================================
// 2. LOGIKA INTI DATA KEUANGAN (CRUD)
// =========================================

// Variabel Penampung Utama untuk merekam daftar riwayat
let financeData = [];

// =========================================
// INISIALISASI HALAMAN AWAL DI BUKA (INITIAL LOAD)
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    // Otomatis men-set kotak input tanggal hari ini pada form transaksi
    document.getElementById('trxDate').valueAsDate = new Date();

    // Array Data Dummy Sementara (sebelum disambung tabel Database sesungguhnya)
    financeData = [
        { id: generateId(), date: '2026-03-01', type: 'pemasukan', desc: 'Penjualan 100 Papan Telur', amount: 3500000 },
        { id: generateId(), date: '2026-03-02', type: 'pengeluaran', desc: 'Beli Pakan Ayam 5 Karung', amount: 1800000 },
        { id: generateId(), date: '2026-03-05', type: 'pengeluaran', desc: 'Obat & Vitamin', amount: 450000 },
        { id: generateId(), date: '2026-03-08', type: 'pemasukan', desc: 'Penjualan Kotoran Ayam (Pupuk)', amount: 200000 }
    ];

    // Menggambar data kosong/awal ke HTML saat laman diakses
    renderTable();
});

/**
 * Generator ID Unik acak untuk menjadi primary-key transaksi
 */
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// =========================================
// OPERASI "CREATE" (Menambah Transaksi)
// =========================================
function addTransaction(event) {
    event.preventDefault(); // Menghentikan perilaku reload laman form secara paksa

    // Mengambil ekstraksi nilai-nilai data dari Formulir di layat
    const date = document.getElementById('trxDate').value;
    const type = document.querySelector('input[name="trxType"]:checked').value;
    const desc = document.getElementById('trxDesc').value;
    const amount = parseFloat(document.getElementById('trxAmount').value);

    // Proteksi (Validasi): jika isian formulir dibiarkan bolong/tidak lengkap
    if (!date || !desc || isNaN(amount) || amount <= 0) {
        Swal.fire('Oops!', 'Mohon isi semua data dengan benar', 'error');
        return;
    }

    // Pembuatan Objék Array Transaksi Baru
    const newTrx = {
        id: generateId(),
        date: date,
        type: type,
        desc: desc,
        amount: amount
    };

    // Mendorong array baru & Me-refresh urutan dari paling baru ke atas
    financeData.push(newTrx);
    financeData.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Menghapus data sisa ketikan di formulir agar langsung kosong
    document.getElementById('financeForm').reset();
    document.getElementById('trxDate').valueAsDate = new Date(); // Balikkan ke kalender hari ini

    // Gambarkan/Segarkan Data Visual di antarmuka html
    renderTable();

    // Tampilkan Indikator Sukses Berhasil (Mengambang Singkat)
    Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Data transaksi berhasil ditambahkan!',
        timer: 2000,
        showConfirmButton: false
    });
}

// =========================================
// OPERASI "DELETE" (Hapus Transaksi)
// =========================================
function deleteTransaction(id) {
    // Memunculkan kotak peringatan bahaya sebelum benar-benar dihapus tuntas
    Swal.fire({
        title: 'Hapus Data?',
        text: "Anda tidak bisa mengembalikan data yang sudah dihapus!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus!'
    }).then((result) => {
        if (result.isConfirmed) {
            // Saring dan potong array dari riwayat utuh apabila id nya cocok untuk dimusnahkan
            financeData = financeData.filter(item => item.id !== id);
            renderTable();
            Swal.fire(
                'Terhapus!',
                'Data transaksi telah dihapus.',
                'success'
            );
        }
    });
}

// =========================================
// OPERASI PENCARIAN & FILTER KATA KUNCI
// =========================================
function filterTable() {
    // Pantau dan konversi setiap huruf yang diketik oleh pengguna jadi kecil untuk disamakan (agar tdk case sensitive)
    const keyword = document.getElementById('searchTrx').value.toLowerCase();
    renderTable(keyword);
}

// =========================================
// OPERASI "READ" (Merakit Antarmuka Ke HTML)
// =========================================
function renderTable(filterKeyword = '') {
    const tbody = document.getElementById('financeTableBody');
    tbody.innerHTML = ''; // Membersihkan Papan agar siap dilukis dengan data baru.

    let totalPemasukan = 0;
    let totalPengeluaran = 0;

    // Filter daftar baris transaksi sesuai masukan kueri kata kunci yg dicari
    const filteredData = financeData.filter(item =>
        item.desc.toLowerCase().includes(filterKeyword)
    );

    // Antisipasi Logika jika tabel sedang tidak berisikan data apapun alias nihil
    if (filteredData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state">Tidak ada data transaksi.</td></tr>`;
    } else {
        // Lingkaran loop proses: Melewati dan memetakan satu persatu transaksi ke dalam tampilan visual Baris (<tr>) Tabel
        filteredData.forEach(item => {

            // Logika Matematis memisahkan kubu Pemasukan Tambah (Masuk) atau Kurang (Keluar)
            if (item.type === 'pemasukan') {
                totalPemasukan += item.amount;
            } else {
                totalPengeluaran += item.amount;
            }

            // Membangun Elemen Kolom Tabel Baru (Tr)
            const tr = document.createElement('tr');

            // Format Tanggal estetik berbahasa Indonesia (Contoh: "17 Agt 2026")
            const dateObj = new Date(item.date);
            const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

            // Format Konversi Angka murni menjadi Uang Rupiah (Contoh: "2.500.000")
            const amountStr = item.amount.toLocaleString('id-ID');

            // Logika membedah gaya warna desain (Hijau/Merah) berdasarkan sifat transaksinya
            const badgeClass = item.type === 'pemasukan' ? 'badge-income' : 'badge-expense';
            const typeLabel = item.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran';
            const amountColor = item.type === 'pemasukan' ? '#166534' : '#991b1b';

            // Templat struktur murni kerangka tabel
            tr.innerHTML = `
                <td>${dateStr}</td>
                <td><span class="badge-type ${badgeClass}">${typeLabel}</span></td>
                <td style="font-weight: 500;">${item.desc}</td>
                <td style="text-align: right; color: ${amountColor}; font-weight: 600;">Rp ${amountStr}</td>
                <td style="text-align: center;">
                    <button class="btn-delete" onclick="deleteTransaction('${item.id}')" title="Hapus Data">🗑️ Hapus</button>
                </td>
            `;

            tbody.appendChild(tr); // Pasang kolom yang selesai ditata ini pada papan besar HTML.
        });
    }

    // =========================================
    // MODIFIKASI PANEL DOMPET RINGKASAN REKAPITULASI 
    // =========================================

    // Taruh nominal Pemasukan Kasaran VS Nominal Dompet Kotor di ujung kiri Layar
    document.getElementById('totalPemasukan').textContent = `Rp ${totalPemasukan.toLocaleString('id-ID')}`;
    document.getElementById('totalPengeluaran').textContent = `Rp ${totalPengeluaran.toLocaleString('id-ID')}`;

    // Menghasilkan nominal Sisa Uang / Margin Saldo Bersih
    const saldo = totalPemasukan - totalPengeluaran;
    const elSaldo = document.getElementById('totalSaldo');
    elSaldo.textContent = `Rp ${saldo.toLocaleString('id-ID')}`;

    // Fitur Cerdas: Mengganti warna font menjadi merah mentereng terang jika status perusahaan sedang di posisi RUGI/MINUS atau Biru Aman.
    if (saldo < 0) {
        elSaldo.style.color = '#dc2626';
    } else {
        elSaldo.style.color = '#1e40af';
    }
}
