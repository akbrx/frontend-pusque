// app.js

// Import komponen-komponen dan halaman-halaman yang diperlukan
import "./components/navbar.js";
import "./components/navbar_a.js";
import "./pages/homePage.js";
import "./components/feedBack.js";
import "./pages/pasien/antrianPage.js";
import "./pages/pasien/formPendaftaranAntrian.js";
import "./pages/profile.js";
import { renderLoginForm } from './pages/auth/login.js';
import { renderRegisterForm } from './pages/auth/register.js';
import "./pages/pasien/chatBot.js";
import './pages/dokter/PasienListView.js';
import './pages/dokter/DetailPasienView.js';
import './pages/admin/AdminPengajuanList.js';
import './pages/admin/AdminDetailPengajuan.js';
import './pages/admin/AdminBeranda.js';
import './pages/loginPage.js';
import './pages/notFound/notFoundPage.js';
// import './pages/auth/login.js'; // BARIS INI DUPLIKAT DAN TELAH DIHAPUS
import './pages/pasien/feedback-page.js';

// Impor fungsi authFetch yang telah kita perbaiki
import { authFetch } from "./fatchauth.js"; // Pastikan path ini benar

/**
 * Memeriksa apakah pengguna sudah login berdasarkan keberadaan accessToken di localStorage.
 * @returns {boolean} True jika accessToken ada, false jika tidak.
 */
function isLoggedIn() {
    return !!localStorage.getItem('accessToken');
}

/**
 * Fungsi router utama yang menangani navigasi berdasarkan hash URL.
 * Ini bertanggung jawab untuk merender konten yang sesuai dan memanggil API yang dilindungi.
 * Fungsi ini kini ASYNC untuk mendukung await pada authFetch.
 */
async function router() {
    const app = document.getElementById('app');
    const hash = window.location.hash;
    app.innerHTML = ''; // Kosongkan konten aplikasi sebelum merender yang baru

    // Logika otentikasi awal: Jika belum login, paksa ke halaman login/register
    if (!isLoggedIn()) {
        if (hash === "#/register") {
            renderRegisterForm(() => {
                window.location.hash = "#/login"; // Arahkan ke login setelah register sukses
            });
            return; // Hentikan eksekusi router
        }
        // Default ke halaman login jika tidak login dan bukan '#/register'
        renderLoginForm(() => {
            window.location.hash = "#/"; // Arahkan ke beranda setelah login sukses
        });
        return; // Hentikan eksekusi router
    }

    // Ambil peran pengguna setelah memastikan sudah login
    const role = localStorage.getItem("userRole");

    // Render navbar (jika ada custom element 'my-navbar')
    const navbar = document.querySelector('my-navbar');
    if (navbar) {
        navbar.render();
    }

    // Logika routing utama berdasarkan hash URL dan peran pengguna
    if (hash === "" || hash === "#/" || hash === "#/home") {
        const home = document.createElement("pusque-page");
        app.appendChild(home);
    }
    // Halaman Antrian Pasien
    else if (hash === "#/antrian" && role === "pasien") {
        // Element antrian-puskesmas akan melakukan fetch data-nya sendiri di connectedCallback
        // Pastikan AntrianPuskesmas sudah diimport dan menggunakan authFetch di dalamnya.
        const antrian = document.createElement("antrian-puskesmas");
        app.appendChild(antrian);
    }
    // Halaman Form Pendaftaran Antrian
    else if (hash === "#/daftar" && role === "pasien") {
        const form = document.createElement("daftar-antrian-form");
        app.appendChild(form);
    }
    // Halaman Profil Pengguna
    else if (hash === "#/profile") {
        const profile = document.createElement("profile-view");
        app.appendChild(profile);
    }
    // Halaman Chatbot Pasien
    else if (hash === "#/chatbot" && role === "pasien") {
        const chat = document.createElement("chat-view");
        app.appendChild(chat);
    }
    // Halaman Daftar Pasien (Dokter)
    else if (hash === "#/dokter" && role === "dokter") {
        const listView = document.createElement("pasien-list-view");
        app.appendChild(listView);
        try {
            const res = await authFetch('https://serverpusque-production.up.railway.app/antrian');
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: 'Respons non-JSON atau kosong.' }));
                throw new Error(errorData.message || `Gagal memuat data pasien: ${res.status} ${res.statusText}`);
            }
            const data = await res.json();
            listView.dataPasien = data;
        } catch (err) {
            console.error('Error saat memuat data pasien:', err);
            listView.innerHTML = `<p class="text-danger">Gagal memuat data pasien. ${err.message || ''}</p>`;
            if (err.message.includes("Authentikasi diperlukan") || err.message.includes("refresh token")) {
                alert("Sesi Anda telah berakhir atau token tidak valid. Silakan login kembali.");
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userRole');
                window.location.hash = "#/login";
            }
        }
    }
    // Halaman Pengajuan Admin
    else if (hash === "#/pengajuan" && role === "admin") {
        const adminList = document.createElement("admin-pengajuan-list");
        app.appendChild(adminList);
        try {
            // URL ini mungkin perlu disesuaikan (misal: '/pengajuan-list')
            const res = await authFetch('https://serverpusque-production.up.railway.app/pengajuan');
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: 'Respons non-JSON atau kosong.' }));
                throw new Error(errorData.message || `Gagal memuat data pengajuan: ${res.status} ${res.statusText}`);
            }
            const data = await res.json();
            adminList.dataPasien = data; // Sesuaikan properti jika 'dataPasien' tidak sesuai untuk pengajuan
        } catch (err) {
            console.error('Error saat memuat data pengajuan:', err);
            adminList.innerHTML = `<p class="text-danger">Gagal memuat data pengajuan. ${err.message || ''}</p>`;
            if (err.message.includes("Authentikasi diperlukan") || err.message.includes("refresh token")) {
                alert("Sesi Anda telah berakhir atau token tidak valid. Silakan login kembali.");
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userRole');
                window.location.hash = "#/login";
            }
        }
    }
    // Halaman Beranda Admin
    else if (hash === "#/beranda" && role === "admin") {
        const beranda = document.createElement("admin-beranda");
        app.appendChild(beranda);
    }
    // Halaman Detail Pasien (Dokter)
    else if (hash.startsWith('#/detailpasien/') && role === "dokter") {
        const id = parseInt(hash.split('/')[2]);
        if (isNaN(id)) {
            app.innerHTML = `<h2 class="text-danger">ID pasien tidak valid.</h2>`;
            return;
        }
        const detailView = document.createElement("detail-pasien-view");
        app.appendChild(detailView);
        try {
            const res = await authFetch(`https://serverpusque-production.up.railway.app/antrian/${id}`);
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: 'Respons non-JSON atau kosong.' }));
                throw new Error(errorData.message || `Pasien tidak ditemukan atau respons server tidak OK: ${res.status} ${res.statusText}`);
            }
            const data = await res.json();
            detailView.pasien = data;
        } catch (err) {
            console.error('Error saat memuat detail pasien:', err);
            app.innerHTML = `<h2 class="text-danger">Gagal memuat detail pasien. ${err.message || ''}</h2>`;
            if (err.message.includes("Authentikasi diperlukan") || err.message.includes("refresh token")) {
                alert("Sesi Anda telah berakhir atau token tidak valid. Silakan login kembali.");
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userRole');
                window.location.hash = "#/login";
            }
        }
    }
    // Halaman Detail Pengajuan (Admin)
    else if (hash.startsWith('#/detailpengajuan/') && role === "admin") {
        const detailPengajuan = document.createElement("admin-detail-pengajuan");
        app.appendChild(detailPengajuan);
        // Anda mungkin perlu mengambil ID dari hash dan melakukan fetch ke API
        // const id = parseInt(hash.split('/')[2]);
        // try {
        //     const res = await authFetch(`https://serverpusque-production.up.railway.app/pengajuan/${id}`);
        //     if (!res.ok) throw new Error('Pengajuan tidak ditemukan');
        //     const data = await res.json();
        //     detailPengajuan.data = data;
        // } catch (err) {
        //     console.error(err);
        //     app.innerHTML = `<h2 class="text-danger">Gagal memuat detail pengajuan. ${err.message || ''}</h2>`;
        // }
    }
    // Halaman Login (jika menggunakan custom element 'login-page')
    else if (hash === "#/login") {
        const login = document.createElement("login-page");
        app.appendChild(login);
    }
    // Halaman Feedback Pasien
    else if (hash === "#/feedback") {
        const feedbackPage = document.createElement("feedback-page");
        app.appendChild(feedbackPage);
    }
    // Halaman Tidak Ditemukan (404)
    else {
        const notFound = document.createElement("not-found-page");
        app.appendChild(notFound);
    }
}

// Tambahkan event listener untuk perubahan hash dan saat halaman dimuat
window.addEventListener('hashchange', router);
window.addEventListener('load', router);
