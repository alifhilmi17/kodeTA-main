/* =========================================================
   SISTEM ADMINISTRASI PETERNAKAN
   File: prediksihasil.js
   Deskripsi: Mengandung logika eksekusi matematika untuk
   halaman rekomendasi prediktif "Moving Average". Menangani
   dom update panel statistik hasil dan pembuatan Chart grafik.
========================================================= */

// =========================================
// 1. FUNGSI SIDEBAR & NAVIGASI UMUM 
//    (Halaman ini tetap dapat memiliki akses menu)
// =========================================

/**
 * Membuka/menutup sistem menu list (accordion style) di sidebar samping.
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
 * Fungsi untuk berpindah tab antara input Produksi dan Keuntungan
 */
function switchHistoricalTab(tabName, btnElement) {
    // Sembunyikan semua tab
    document.getElementById('tabProduksi').style.display = 'none';
    document.getElementById('tabKeuntungan').style.display = 'none';

    // Hapus class active dari semua tombol tab
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));

    // Tampilkan tab yang dipilih dan aktifkan tombolnya
    if (tabName === 'produksi') {
        document.getElementById('tabProduksi').style.display = 'block';
    } else if (tabName === 'keuntungan') {
        document.getElementById('tabKeuntungan').style.display = 'block';
    }

    btnElement.classList.add('active');
}

/**
 * Fungsi sekunder apabila ikon pensil di Profil diklik.
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
 * Fungsi untuk mengeluarkan (logout) pengguna dan mereturn mereka ke layar Login.
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
// 2. LOGIKA UTAMA PREDIKSI MOVING AVERAGE (MA)
// =========================================

// Variabel Global untuk menyimpan state / objek grafik Chart.js 
// sehingga jika ada update, chart sebelumnya bisa dihapus (.destroy) dulu
let predictionChart = null;

/**
 * Fungsi Utama `calculatePrediction`!
 * Berjalan seketika petani menekan tombol "Analisis dengan MA".
 * @param {Event} event - Dioper dari eksekusi form 'onsubmit', diproteksi dengan .preventDefault() agar laman web tidak reload patah-patah.
 */
function calculatePrediction(event) {
    event.preventDefault(); // Menghentikan perilaku form memuat ulang halaman

    // --- STEP 1: Mengambil Data Parameter / Pengaturan Statik ---
    // (di bagian form sebelah bawah-kiri)
    const periodeMA = parseInt(document.getElementById('periodeMA').value);
    const populasi = parseInt(document.getElementById('populasi').value); // Ekor
    const pakanPerEkor = parseFloat(document.getElementById('pakanPerEkor').value); // dalam satuan Gram (g)
    const hargaPakan = parseInt(document.getElementById('hargaPakan').value); // Rp per kg
    const hargaTelur = parseInt(document.getElementById('hargaTelur').value); // Rp per kg

    // --- STEP 2A: Mengumpulkan Data Input Historis Produksi ---
    // Menyusun dom elemen dalam sebuah list array (H-6 berada di index atas)
    const historyDataButir = [];
    const inputs = [
        document.getElementById('hist6'), // index 0 (H-6)
        document.getElementById('hist5'), // index 1 (H-5)
        document.getElementById('hist4'), // index 2 (H-4)
        document.getElementById('hist3'), // index 3 (H-3)
        document.getElementById('hist2'), // index 4 (H-2)
        document.getElementById('hist1'), // index 5 (H-1)
        document.getElementById('hist0')  // index 6 (Hari Ini)
    ];

    // --- STEP 2B: Mengumpulkan Data Input Historis Finansial (Rp) ---
    // Blok khusus untuk isian riwayat Keuntungan Nyata (Aktual) Manualnya.
    const inputsProfit = [
        document.getElementById('prof6'), // index 0
        document.getElementById('prof5'), // index 1
        document.getElementById('prof4'), // index 2
        document.getElementById('prof3'), // index 3
        document.getElementById('prof2'), // index 4
        document.getElementById('prof1'), // index 5
        document.getElementById('prof0')  // index 6
    ];

    // --- STEP 3: Proses Validasi (Pengecekan Keamanan) Form ---
    // Jika user pilih MA="5" Hari, artinya WAJIB H-4 sampai Hari Ini (total 5 baris) wajib tidak boleh kosong (NaN)!
    let startIndex = 7 - periodeMA; // Kalkulasi titik baca wajib form
    let isDataValid = true;
    for (let i = startIndex; i < 7; i++) {
        let val = parseInt(inputs[i].value); // Ambil angka telur Butir
        if (isNaN(val)) {
            // Jika ada baris yang kosong atau keliru isinya
            isDataValid = false;
            break;
        }
    }

    // Jika blok produksi ada yang bolong, teriak error Swal dan matikan proses baca (return)!
    if (!isDataValid) {
        Swal.fire({
            icon: 'error',
            title: 'Data Tidak Lengkap',
            text: `Mohon isi semua data jumlah historis (Butir) dari H-${periodeMA - 1} sampai Hari Ini sesuai periode MA yang Anda pilih (${periodeMA} Hari)!`,
            confirmButtonColor: '#3085d6'
        });
        return; // Hentikan eksekusi function ini disini
    }

    // Lakukan validasi hal yang serupa bagi form Nilai Pemasukan Historis (Rp) profit.
    for (let i = startIndex; i < 7; i++) {
        let val = parseInt(inputsProfit[i].value);
        if (isNaN(val)) {
            Swal.fire({
                icon: 'error',
                title: 'Data Keuntungan Tidak Lengkap',
                text: `Mohon isi semua data keuntungan historis uang (Rp) Anda sedari H-${periodeMA - 1} hingga Hari Ini!`,
                confirmButtonColor: '#3085d6'
            });
            return;
        }
    }

    // --- STEP 4: Ekstraksi Data yang Sudah Diverifikasi ---
    // Kita baca kembali, lalu simpan dalam array baru sebagai cadangan memori array bersih yang tidak memuat kekosongan.
    let fullHistoryButir = [];
    let startActual = 0;
    // Lompati indeks input jika memang sengaja tidak diisi petani (bagian atas/opsi lama)
    while (startActual < 7 && isNaN(parseInt(inputs[startActual].value))) {
        startActual++;
    }

    let fullHistoryProfit = [];
    for (let i = startActual; i < 7; i++) {
        // Didorong/disisipkan ke ujung array (push)
        fullHistoryButir.push(parseInt(inputs[i].value));
        fullHistoryProfit.push(parseInt(inputsProfit[i].value));
    }

    // KONVERSI EMAS MA (Butir -> Kilogram)
    // Parameter hitungan kita pakai Kg, namun petani nyaman pakai Butir.
    // Maka (Asumsi 1 Kg = sekitar 16 Butir Telur Kecil). Nilai array Butir dipetakan ke wujud Kilogram (Kg).
    let fullHistoryKg = fullHistoryButir.map(butir => butir / 16);

    // --- STEP 5: MELAKUKAN KALKULASI PINTAR PREDIKSI "HARI ESOK" (H+1) ---
    // Ambil rentang index sepotong sebanyak periode MA terakhir (contoh MA 5 = 5 angka terakhir dari ujung history list)
    let sliceForPredict = fullHistoryKg.slice(-periodeMA);

    // a. Menjumlahkan (Summation) nilai dari himpunan tsb
    let sumKg = sliceForPredict.reduce((a, b) => a + b, 0);

    // b. Rumus Inti "Moving Average" : Cari Rata-Ratanya. 
    // Rata-rata periode ini adalah Hasil Ramalan Produksi HARI ESOK (Hari + 1).
    let prediksiBesokKg = sumKg / periodeMA;

    // --- STEP 6: KALKULASI LAPORAN UANG/FINANSIAL HARI ESOK ---
    let prediksiBesokButir = Math.round(prediksiBesokKg * 16); // Konver kembali ke butir secara integer tak desimal (Dibulatkan)
    let estimasiPendapatan = prediksiBesokKg * hargaTelur;     // Total Uang Penjualan
    let totalPakanKg = (populasi * pakanPerEkor) / 1000;       // Butuh pakan berapa sekandang perharinya? (/1000 konversi karena pakan dari input beralias gram)
    let biayaPakan = totalPakanKg * hargaPakan;                // Biaya Operasional / Modal Cost
    let keuntungan = estimasiPendapatan - biayaPakan;          // Sisa Laba Bersih Petani (Net Profit)

    // --- STEP 7: MEMASUKKAN NILAI KE PANEL ANTARMUKA (DOM UPGRADE) ---
    // Masukkan data hasil perhitungan ke dalam Text HTML Card sebelah atas Chart.
    document.getElementById('outProduksi').textContent = `${prediksiBesokKg.toFixed(2)} Kg`;
    document.getElementById('outButir').textContent = `${prediksiBesokButir.toLocaleString('id-ID')} Butir`;
    document.getElementById('outPendapatan').textContent = `Rp ${Math.round(estimasiPendapatan).toLocaleString('id-ID')}`;
    document.getElementById('outBiayaPakan').textContent = `Rp ${Math.round(biayaPakan).toLocaleString('id-ID')}`;
    document.getElementById('outKeuntungan').textContent = `Rp ${Math.round(keuntungan).toLocaleString('id-ID')}`;

    // Fitur Tambahan Cerdas: Jika keuntungannya (Laba Besih) MINUS (Negatif/Rugi)
    // maka kita merubah tema warna kotak Margin nya dari Biru/Hijau, langsung menjadi MERAH SIAGA BENCANA!
    const resultCardsContainer = document.getElementById('resultCards');
    const highlightCard = resultCardsContainer.querySelector('.highlight-card');
    const statIcon = highlightCard.querySelector('.stat-icon');

    if (keuntungan < 0) { // Rugi!
        statIcon.classList.remove('blue-bg', 'green-bg');
        statIcon.classList.add('red-bg');
        highlightCard.querySelector('h4').textContent = "Proyeksi Kerugian";
        highlightCard.querySelector('p').classList.add('highlight-text-red');
        highlightCard.querySelector('p').classList.remove('highlight-text-green');
    } else { // Untung!
        statIcon.classList.remove('red-bg', 'blue-bg');
        statIcon.classList.add('green-bg');
        highlightCard.querySelector('h4').textContent = "Proyeksi Keuntungan";
        highlightCard.querySelector('p').classList.add('highlight-text-green');
        highlightCard.querySelector('p').classList.remove('highlight-text-red');
    }

    // --- STEP 8: PREDIKSI MASA DEPAN (MERAMAL 7 HARI KEDEPAN SEKALIGUS) ---
    let proyeksi7HariKg = [];
    let proyeksi7HariKeuntungan = [];

    // Klone memori array (Spread copy array [...]) untuk dimanipulasi sementara dalam memory perulangan.
    let tempHistory = [...fullHistoryKg];

    for (let i = 0; i < 7; i++) { // Loop lompat simulasi dimensi hari+1 s.d hari+7
        // Cari Rata2 MA dari rentang 5 data terbaru (Yang selalu bergeser ke kanan hari demi harinya)
        let currentWindow = tempHistory.slice(-periodeMA);
        let currSum = currentWindow.reduce((a, b) => a + b, 0);
        let nextPredKg = currSum / periodeMA;

        proyeksi7HariKg.push(nextPredKg); // Simpan hasil angka timbangan esok hari ke antrian plot Chart

        // Asumsi operasional pengeluaran akan berjalan statis/konsisten tiap harinya
        let nextKeuntungan = (nextPredKg * hargaTelur) - biayaPakan;
        proyeksi7HariKeuntungan.push(nextKeuntungan);

        // Kunci Magis Algoritma MA Rantai (Chaining):
        // Mendorong nilai prediksi H+ sekian ini, masuk ke barisan SEJARAH TERBARU dalam antrian virtual!
        // Supaya saat prediksi "H+ besok"nya lagi, hari yang diprediksikan itu menggunakan hasil tebakan hari sebelumnya ini pula. (Moving Window)
        tempHistory.push(nextPredKg);
    }

    // Ambil Data Profit manual murni. (Sebelah kiri Chart)
    let historyKeuntunganAct = fullHistoryProfit;

    // --- STEP 9: JALANKAN PROSESS PENGGAMBARAN KE KANVAS (RENDER GRAFIK CHART.JS) ---
    // Dipecah dan ditransfer menjadi parameter argumen fungsi lain dibawah sana.
    updateChart(fullHistoryKg, historyKeuntunganAct, proyeksi7HariKg, proyeksi7HariKeuntungan);

    // Kirim notifikasi manis perihal hasil Laba Hari Esok (Satu hari di depan).
    Swal.fire({
        icon: 'success',
        title: 'Analisis Cerdas Berhasil',
        html: `Berdasarkan pola MA-${periodeMA}, besok diproyeksikan untung/rugi sebesar <b>Rp ${Math.round(keuntungan).toLocaleString('id-ID')}</b>.`,
        timer: 3500, // Pop up kilat 3.5 detik (menghilang sendiri kalau dibiarkan)
        showConfirmButton: true,
        confirmButtonColor: '#48bb78',
        confirmButtonText: 'Tutup'
    });
}


/**
 * Fungsi Sub-Renderer: ChartJS Maker.
 * Memuat dua sisi sumbu Axis (Kg vs Rupiah). Sumbu kiri dan Sumbu kanan bertumpang tindih secara canggih.
 */
function updateChart(historyKg, historyKeuntungan, predictKg, predictKeuntungan) {
    const ctx = document.getElementById('profitChart').getContext('2d');

    // Mencegah 'Glitches' grafik duplikat karena pengguna klik analisis berkali-kali - Destroy jika kanvas bernyawa tua.
    if (predictionChart) {
        predictionChart.destroy();
    }

    let labels = []; // Untuk wadah teks garis x (bawah)

    let dataHistoryKg = [];
    let dataPredictKg = [];
    let dataHistoryKeuntungan = [];
    let dataPredictKeuntungan = [];

    // --- Bagian A: Membuat Tata Riwayat Grafik Historis Kiri ---
    // (Dari rentang H minus lama sampai Hari Ini=H minus nol/0)
    for (let i = historyKg.length; i > 0; i--) {
        labels.push(i === 1 ? "Hari Ini" : `H-${i - 1}`); // Menyusun nama hari bawah
        dataHistoryKg.push(historyKg[historyKg.length - i]);
        dataHistoryKeuntungan.push(historyKeuntungan[historyKeuntungan.length - i]);

        // Masa depan bernilai Null supaya tidak muncul titik merah prediksi di alam historis.
        dataPredictKg.push(null);
        dataPredictKeuntungan.push(null);
    }

    // --- TRICK GRAFIK CANGGIH (Penyambung Tali) ---
    // Paksa agar awal garis Proyeksi (Masa Depan) "Mengakar" bersentuhan menyambung utuh dengan titik penghabisan historis "Hari Ini" 
    dataPredictKg[dataPredictKg.length - 1] = historyKg[historyKg.length - 1];
    dataPredictKeuntungan[dataPredictKeuntungan.length - 1] = historyKeuntungan[historyKeuntungan.length - 1];

    // --- Bagian B: Membuat Tata Riwayat Grafik PREDIKSI Kanan (Esok Harinya) ---
    // Plot hasil ramalan (H+1 sd H+7 ke kanan layar)
    for (let i = 0; i < predictKg.length; i++) {
        labels.push(`H+${i + 1}`);
        dataHistoryKg.push(null);       // Sisi riwayat mati
        dataHistoryKeuntungan.push(null); // Sisi riwayat mati

        dataPredictKg.push(predictKg[i]); // Hidup
        dataPredictKeuntungan.push(predictKeuntungan[i]); // Hidup
    }

    // --- FINALISASI RENDER CHART INSTANCE BARU ---
    predictionChart = new Chart(ctx, {
        type: 'line', // Jenis Grafik Garis Sambung
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Aktual Produksi (Kg)',  // Dataset 1: Biru Terang (Timbangan Pasti)
                    data: dataHistoryKg,
                    borderColor: '#3498db',
                    backgroundColor: '#3498db',
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    tension: 0.4, // Melengkung mulus bak gelombang air, bukan patah zig-zag
                    yAxisID: 'y' // Menginduk pada Timbangan Y bagian Kiri
                },
                {
                    label: 'Proyeksi Produksi (Kg)', // Dataset 2: Kuning Terang (Tebakan MA Masa Depan)
                    data: dataPredictKg,
                    borderColor: '#f39c12',
                    backgroundColor: '#f39c12',
                    borderDash: [5, 5], // Striped / Garis Terputus-putus
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Aktual Keuntungan (Rp)', // Dataset 3: Hijau Berlatar tipis (Dompet Real)
                    data: dataHistoryKeuntungan,
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.15)', // Fill bawah
                    borderWidth: 2,
                    fill: 'origin', // Pewarnaan transparan dari dasar x mengarsir tembus ketas garis line nya.
                    pointRadius: 4,
                    tension: 0.4,
                    yAxisID: 'y1' // Menginduk pada Skala Uang Y1 bagian Kanan Ujung!
                },
                {
                    label: 'Proyeksi Keuntungan (Rp)', // Dataset 4: Merah (Pertaruhan Rupiahnya)
                    data: dataPredictKeuntungan,
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderDash: [5, 5], // Putus-putus
                    borderWidth: 2,
                    fill: 'origin',
                    pointRadius: 4,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Menyesuaikan wadah layar div bungkusnya
            interaction: {
                mode: 'index',
                intersect: false, // Disorot dari jauh aja lgsung muncul semua data vertikal popup nya.
            },
            plugins: {
                legend: {
                    position: 'bottom', // Kotak keterangan ditaruh dasar bawah
                    labels: {
                        usePointStyle: true, // Jadi Ikon titik sircle
                        boxWidth: 8,
                        padding: 20
                    }
                },
                // Aturan Khusus Balon PopUp Angka Detail (Hover Tooltip Mode)
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            // Kita punya 4 dataset.
                            // Idx 0 (His. Kg) dan Idx 1 (Pred. Kg) menggunakan satuan Kilogram serta wujud Butir rahib
                            if (context.parsed.y !== null) {
                                if (context.datasetIndex < 2) {
                                    let butir = Math.round(context.parsed.y * 16);
                                    label += context.parsed.y.toFixed(2) + ' Kg (' + butir.toLocaleString('id-ID') + ' Butir)';
                                } else {
                                    // Idx 2 و Idx 3 memegang satuan Rupiah Rp untuk keuangan/laba bersih.
                                    label += 'Rp ' + Math.round(context.parsed.y).toLocaleString('id-ID');
                                }
                            }
                            return label;
                        }
                    }
                }
            },
            // Struktur Sumbu Ganda (Dual Axes) Skala Kiri VS Kanan 
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left', // Di kiri garis grafis ini
                    title: {
                        display: true,
                        text: 'Produksi (Kg)',
                        font: { weight: 'bold' }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right', // Di kanan membentang paralel sepadan sumbu Y kiri
                    title: {
                        display: true,
                        text: 'Finansial (Rp)',
                        font: { weight: 'bold' }
                    },
                    grid: {
                        drawOnChartArea: false // Mencegah Jala/garis kotak pudar grafik yang bertumpuk kusut 
                    }
                }
            }
        }
    });
}
