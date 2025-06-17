// profile.js
import ktpimg from "../assets/images/ktp.jpg";
import { authFetch } from "../fatchauth.js";

class ProfileView extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        // Fungsi untuk memformat tanggal ke format Indonesia
        this.formatTanggal = (dateString) => {
            // Jika tidak ada tanggal, kembalikan strip
            if (!dateString) return '-';
            
            try {
                const date = new Date(dateString);
                // Cek jika tanggal tidak valid setelah parsing
                if (isNaN(date.getTime())) {
                    return dateString; // Kembalikan string asli jika formatnya tidak dikenali
                }
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                return date.toLocaleDateString('id-ID', options);
            } catch (e) {
                // Jika terjadi error saat parsing, kembalikan string aslinya
                return dateString;
            }
        };
    }

    async connectedCallback() {
        let user = {};
        try {
            const res = await authFetch('https://backend-pusque-production.up.railway.app/user/me');
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: 'Respons non-JSON atau kosong.' }));
                throw new Error(errorData.message || `Gagal mengambil data user: ${res.status} ${res.statusText}`);
            }
            
            user = await res.json();
        } catch (err) {
            user = { name: 'Gagal memuat data', nik: '-', tanggalLahir: '-', domisili: '-', fotoKtp: '' };
            console.error("[PROFILE_VIEW] Error mengambil data user:", err);

            if (err.message.includes("Authentikasi diperlukan") || err.message.includes("refresh token")) {
                alert("Sesi Anda telah berakhir atau token tidak valid. Silakan login kembali.");
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userRole');
                window.location.hash = "#/login";
            }
        }

        this.render(user);
    }

    render(user) {
        this.shadowRoot.innerHTML = `
            <style>
                /* Import Font */
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');

                /* CSS Variables untuk tema */
                :host {
                    display: flex;
                    justify-content: center;
                    padding: 2rem 1rem;
                    --primary-color: #3B82F6;
                    --text-color-dark: #1F2937;
                    --text-color-light: #6B7280;
                    --border-color: #E5E7EB;
                    --background-color: #ffffff;
                    --shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                    --font-family: 'Poppins', sans-serif;
                }

                .profile-card {
                    background: var(--background-color);
                    border-radius: 16px;
                    box-shadow: var(--shadow);
                    max-width: 600px;
                    width: 100%;
                    font-family: var(--font-family);
                    overflow: hidden; /* Agar border-radius bekerja dengan baik */
                }

                .profile-header {
                    background-color: var(--primary-color);
                    color: white;
                    padding: 2rem;
                    text-align: center;
                }

                .profile-header h2 {
                    margin: 0;
                    font-size: 1.75rem;
                    font-weight: 600;
                }

                .profile-header p {
                    margin: 0.25rem 0 0;
                    font-size: 1rem;
                    opacity: 0.9;
                }

                .profile-body {
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem; /* Jarak antar item informasi */
                }

                .info-item {
                    display: flex;
                    flex-direction: column;
                }
                
                .info-item .label {
                    color: var(--text-color-light);
                    font-size: 0.9rem;
                    font-weight: 500;
                    margin-bottom: 0.25rem;
                }

                .info-item .value {
                    color: var(--text-color-dark);
                    font-size: 1.1rem;
                    font-weight: 500;
                    word-wrap: break-word; /* Agar teks panjang tidak keluar dari card */
                }

                .divider {
                    border: none;
                    border-top: 1px solid var(--border-color);
                }

                .ktp-section .label {
                     margin-bottom: 0.75rem;
                }

                .ktp-image {
                    width: 100%;
                    max-width: 350px; /* Batasi lebar maksimum KTP */
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                    display: block; /* Agar margin auto bekerja jika diperlukan */
                }

            </style>
            
            <div class="profile-card">
                <div class="profile-header">
                    <h2>${user.name || 'Nama Tidak Ditemukan'}</h2>
                    <p>Kartu Tanda Penduduk (KTP)</p>
                </div>
                <div class="profile-body">
                    <div class="info-item">
                        <span class="label">Nomor Induk Kependudukan (NIK)</span>
                        <p class="value">${user.nik || '-'}</p>
                    </div>

                    <div class="info-item">
                        <span class="label">Tanggal Lahir</span>
                        <p class="value">${this.formatTanggal(user.tanggalLahir)}</p>
                    </div>

                    <div class="info-item">
                        <span class="label">Domisili</span>
                        <p class="value">${user.domisili || '-'}</p>
                    </div>

                    <hr class="divider">
                    
                    <div class="info-item ktp-section">
                        <span class="label">Foto KTP</span>
                        <img class="ktp-image" src="${user.fotoKtp ? `https://backend-pusque-production.up.railway.app/uploads/ktp/${user.fotoKtp}` : ktpimg}" alt="Foto KTP" />
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('profile-view', ProfileView);