/* =========================================================
   LOGIKA JAVASCRIPT UNTUK HALAMAN EDIT PROFIL
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("editProfileForm");
    const avatarInput = document.getElementById("profileImageUpload");
    const avatarPreview = document.getElementById("profileImagePreview");

    // 1. Fitur Live Preview Ganti Foto Profil
    avatarInput.addEventListener("change", function () {
        const file = this.files[0];
        if (file) {
            // FileReader digunakan untuk membaca file dan mengonversinya ke URL Local
            const reader = new FileReader();

            reader.addEventListener("load", function () {
                avatarPreview.setAttribute("src", this.result);
            });

            reader.readAsDataURL(file);
        }
    });

    // 2. Fungsi Validasi & Submit Data
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        // Ambil data masukan string
        const targetName = document.getElementById("fullName").value.trim();
        const targetEmail = document.getElementById("emailAddr").value.trim();

        const currPass = document.getElementById("currentPass").value;
        const newPass = document.getElementById("newPass").value;
        const confPass = document.getElementById("confirmPass").value;

        // Validasi Sederhana: Form Sandi
        if (newPass !== "" || confPass !== "") {
            if (currPass === "") {
                Swal.fire("Peringatan", "Harap masukkan password Anda saat ini untuk mengubah kata sandi.", "warning");
                return;
            }
            if (newPass !== confPass) {
                Swal.fire("Konfirmasi Error!", "Password Baru dan Konfirmasi Password tidak cocok.", "error");
                return;
            }
            if (newPass.length < 6) {
                Swal.fire("Terlalu Singkat", "Password Baru minimal terdiri dari 6 karakter.", "warning");
                return;
            }
        }

        // Jika lewat validasi / Sukses
        Swal.fire({
            title: "Menyimpan Perubahan...",
            html: "Profil Anda sedang diperbarui.",
            timer: 1500,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
            },
            willClose: () => {
                Swal.fire(
                    "Sukses!",
                    `Data atas nama ${targetName} berhasil diubah.`,
                    "success"
                ).then(() => {
                    // Arahkan kembali ke dashboard
                    window.location.href = "dashboardTAalip.html";
                });
            }
        });

    });
});
