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
import './pages/auth/login.js';
import './pages/pasien/feedback-page.js';

function isLoggedIn() {
  // Cek token di localStorage, sesuaikan dengan nama token yang kamu simpan setelah login
  return !!localStorage.getItem('accessToken');
}

function router() {
  const app = document.getElementById('app');
  const hash = window.location.hash;

  app.innerHTML = '';

  // Jika belum login, hanya boleh akses login & register
  if (!isLoggedIn()) {
    if (hash === "#/register") {
      renderRegisterForm(() => {
        window.location.hash = "#/login";
      });
      return;
    }
    // Default: tampilkan login
    renderLoginForm(() => {
      window.location.hash = "#/";
    });
    return;
  }

  // Jika sudah login, render halaman sesuai hash
  const role = localStorage.getItem("userRole");

  const navbar = document.querySelector('my-navbar');
  if (navbar) {
    navbar.render(); // Pastikan navbar dirender ulang
  }

  app.innerHTML = '';

  if (hash === "" || hash === "#/" || hash === "#/home") {
    const home = document.createElement("pusque-page");
    app.appendChild(home);
  }

  else if (hash === "#/antrian" && role === "pasien") {
    const antrian = document.createElement("antrian-puskesmas");
    app.appendChild(antrian);
  }

  else if (hash === "#/daftar" && role === "pasien") {
    const form = document.createElement("daftar-antrian-form");
    app.appendChild(form);
  }

  else if (hash === "#/profile") {
    const profile = document.createElement("profile-view");
    app.appendChild(profile);
  }

  else if (hash === "#/chatbot" && role === "pasien") {
    const chat = document.createElement("chat-view");
    app.appendChild(chat);
  }

  else if (hash === "#/dokter" && role === "dokter") {
    const listView = document.createElement("pasien-list-view");
    // Fetch data dari backend
    fetch('http://localhost:5000/antrian', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        listView.dataPasien = data;
      })
      .catch(err => {
        listView.innerHTML = `<p class="text-danger">Gagal memuat data pasien</p>`;
        console.error(err);
      });
    app.appendChild(listView);
  }

  else if (hash === "#/pengajuan" && role === "admin") {
    const adminList = document.createElement("admin-pengajuan-list");
    // Fetch data dari backend
    fetch('http://localhost:5000/antrian', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        adminList.dataPasien = data;
      })
      .catch(err => {
        adminList.innerHTML = `<p class="text-danger">Gagal memuat data antrian</p>`;
        console.error(err);
      });
    app.appendChild(adminList);
  }

  else if (hash === "#/beranda" && role === "admin") {
    const beranda = document.createElement("admin-beranda");
    app.appendChild(beranda);
  }

  else if (hash.startsWith('#/detailpasien/') && role === "dokter") {
    const id = parseInt(hash.split('/')[2]);
    const detailView = document.createElement("detail-pasien-view");
    // Fetch detail pasien dari backend
    fetch(`http://localhost:5000/antrian/${id}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Pasien tidak ditemukan');
        return res.json();
      })
      .then(data => {
        detailView.pasien = data;
        app.appendChild(detailView);
      })
      .catch(err => {
        app.innerHTML = "<h2>Pasien tidak ditemukan</h2>";
        console.error(err);
      });
  }

  else if (hash.startsWith('#/detailpengajuan/') && role === "admin") {
    const detailPengajuan = document.createElement("admin-detail-pengajuan");
    app.appendChild(detailPengajuan);
  }

  else if (hash === "#/login") {
    const login = document.createElement("login-page");
    app.appendChild(login);
  }

  else if (hash === "#/feedback" && role === "pasien") {
    const feedbackPage = document.createElement("feedback-page");
    app.appendChild(feedbackPage);
  }

  else {
    const notFound = document.createElement("not-found-page");
    app.appendChild(notFound);
  }
}

function logout() {
  localStorage.removeItem('accessToken');
  window.location.hash = "#/login";
}




window.addEventListener('hashchange', router);
window.addEventListener('load', router);
