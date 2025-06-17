// antrianPage.js
import imgpuskes from "../../assets/images/download.jpg";
import { authFetch } from "../../fatchauth.js";

class AntrianPuskesmas extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._antrian = null;
        this._semuaAntrian = null;
        this._fetchError = false;
    }

    async connectedCallback() {
        if (Notification.permission === "default") {
            // Ditunda sedikit agar tidak terlalu mengganggu saat load halaman
            setTimeout(() => {
                alert("Klik 'Izinkan' agar kami dapat memberi notifikasi saat antrian Anda diverifikasi.");
                Notification.requestPermission();
            }, 3000);
        }
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                this._fetchError = true;
                this._semuaAntrian = [];
                this._antrian = null;
                return this.render();
            }

            const resAllAntrian = await authFetch('https://backend-pusque-production.up.railway.app/antrian');
            if (!resAllAntrian.ok) throw new Error('Gagal mengambil semua antrian.');
            this._semuaAntrian = await resAllAntrian.json();

            const resUserAntrian = await authFetch('https://backend-pusque-production.up.railway.app/antrian/user');
            if (resUserAntrian.ok) {
                const antrianData = await resUserAntrian.json();
                
                // Cek notifikasi hanya jika status berubah menjadi 'dalam antrian'
                const notifKey = `notif_${antrianData.id}`;
                if (antrianData.status === 'dalam antrian' && !localStorage.getItem(notifKey)) {
                    this.showNotifikasiVerifikasi(antrianData);
                    localStorage.setItem(notifKey, 'true');
                }
                this._antrian = antrianData;
            } else {
                this._antrian = null;
            }
            this._fetchError = false;
        } catch (err) {
            console.error("Error fetching antrian data:", err);
            this._fetchError = true;
            this._antrian = null;
            this._semuaAntrian = [];
        } finally {
            this.render();
        }
    }

    showNotifikasiVerifikasi(antrian) {
        const title = "✅ Antrian Diverifikasi";
        const options = {
            body: `Antrian Anda di ${antrian.poli.charAt(0).toUpperCase() + antrian.poli.slice(1)} telah dikonfirmasi.`,
            icon: "https://cdn-icons-png.flaticon.com/512/943/943268.png"
        };
        if (Notification.permission === "granted") {
            new Notification(title, options);
        }
    }

    // --- Helper Functions (Logika tidak berubah, hanya digunakan di render baru) ---
    formatTimeFromMinutes(minutes) {
        if (minutes === null || isNaN(minutes)) return '-';
        const baseHour = 8;
        const totalMinutes = baseHour * 60 + minutes;
        const jam = Math.floor(totalMinutes / 60);
        const menit = Math.floor(totalMinutes % 60);
        return `${jam.toString().padStart(2, '0')}:${menit.toString().padStart(2, '0')}`;
    }

    hitungEstimasi(antrianUser) {
        if (!antrianUser || !this._semuaAntrian || !this._semuaAntrian.length || antrianUser.status !== 'dalam antrian') {
            return { masuk: '-', keluar: '-' };
        }
        const poli = antrianUser.poli;
        const antrianPoli = this._semuaAntrian
            .filter(a => a.poli === poli && a.status === 'dalam antrian')
            .sort((a, b) => a.queue_number - b.queue_number);

        let estimasiWaktu = 0;
        let waktuMasuk = 0;
        let waktuKeluar = 0;

        for (const pasien of antrianPoli) {
            const masuk = estimasiWaktu + (pasien.estimasi_masuk || 0);
            const keluar = masuk + (pasien.durasi_periksa || 0);
            if (pasien.id === antrianUser.id) {
                waktuMasuk = masuk;
                waktuKeluar = keluar;
                break;
            }
            estimasiWaktu = keluar;
        }
        return {
            masuk: this.formatTimeFromMinutes(waktuMasuk),
            keluar: this.formatTimeFromMinutes(waktuKeluar),
        };
    }

    getAntrianSaatIniPerPoli(poli) {
        const kodeAwal = { umum: 'A', gigi: 'B', anak: 'C', kandungan: 'D' };
        if (!this._semuaAntrian) return '-';
        const poliQueue = this._semuaAntrian
            .filter(a => a.poli === poli && a.status === 'dalam antrian')
            .sort((a, b) => a.queue_number - b.queue_number);
        const pertama = poliQueue[0];
        return pertama ? `${kodeAwal[poli]}-${pertama.queue_number}` : '-';
    }

    getKodeAntrianPasien() {
        if (!this._antrian || this._antrian.status !== 'dalam antrian') return '-';
        const kodeAwal = { umum: 'A', gigi: 'B', anak: 'C', kandungan: 'D' };
        const huruf = kodeAwal[this._antrian.poli] || '?';
        return `${huruf}-${this._antrian.queue_number}`;
    }

    getJumlahAntrianPerPoli(poli) {
        if (!this._semuaAntrian) return 0;
        return this._semuaAntrian.filter(a => a.poli === poli && a.status === 'dalam antrian').length;
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
                :host {
                    --primary-color: #3B82F6;
                    --success-color: #22C55E;
                    --warning-color: #F97316;
                    --danger-color: #EF4444;
                    --bg-light: #F3F4F6;
                    --border-color: #E5E7EB;
                    --text-dark: #1F2937;
                    --text-light: #6B7280;
                    --font-family: 'Poppins', sans-serif;
                }
                .dashboard {
                    font-family: var(--font-family);
                    padding: 1.5rem;
                    background-color: var(--bg-light);
                    max-width: 1200px;
                    margin: auto;
                }
                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                .dashboard-header h1 { margin: 0; color: var(--text-dark); font-size: 1.8rem; }
                .today-date { font-size: 1rem; color: var(--text-light); font-weight: 500;}
                .info-alert {
                    background-color: #FEFCE8;
                    color: #A16207;
                    border: 1px solid #FDE047;
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 1.5rem;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .main-content {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                }
                @media (min-width: 992px) {
                    .main-content { grid-template-columns: 3fr 2fr; }
                }
                .your-queue-card {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                }
                .your-queue-card .status {
                    font-size: 0.9rem;
                    font-weight: 600;
                    padding: 0.25rem 0.75rem;
                    border-radius: 99px;
                    margin-bottom: 1rem;
                }
                .status-verified { background-color: #DCFCE7; color: #16A34A; }
                .status-waiting { background-color: #FEF3C7; color: #B45309; }
                .status-none { background-color: var(--bg-light); color: var(--text-light); }
                .queue-number {
                    font-size: 4rem;
                    font-weight: 700;
                    color: var(--primary-color);
                    margin: 0.5rem 0;
                }
                .queue-text { font-size: 1.2rem; font-weight: 500; color: var(--text-dark); }
                .estimasi-grid { display: flex; gap: 2rem; margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1.5rem; width: 100%; justify-content: space-around; }
                .estimasi-item h4 { margin: 0 0 0.25rem; font-size: 0.9rem; color: var(--text-light); font-weight: 500; }
                .estimasi-item p { margin: 0; font-size: 1.5rem; font-weight: 600; color: var(--text-dark); }
                .no-queue-cta { margin-top: 1rem; }
                .no-queue-cta a { color: var(--primary-color); text-decoration: none; font-weight: 600; }
                .puskesmas-info { background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .puskesmas-info img { width: 100%; height: 200px; object-fit: cover; border-radius: 12px 12px 0 0; }
                .puskesmas-info .details { padding: 1.5rem; }
                .details h3 { margin: 0 0 0.5rem; }
                .details p { margin: 0; color: var(--text-light); line-height: 1.6; }
                .poli-status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1.5rem; }
                .poli-card { background: white; border-radius: 12px; padding: 1.25rem; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .poli-card h4 { margin: 0 0 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; font-size: 1.1rem;}
                .poli-data { display: flex; justify-content: space-between; align-items: center; }
                .poli-data .label { font-size: 0.9rem; color: var(--text-light); }
                .poli-data .value { font-size: 1.5rem; font-weight: 600; }
                .error-message { text-align: center; padding: 2rem; background-color: #FFF1F2; color: var(--danger-color); border-radius: 12px; }
            </style>
            <div class="dashboard">
                <div class="dashboard-header">
                    <h1>Dashboard Antrian</h1>
                    <div class="today-date">${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                <div class="info-alert">
                    <span>💡</span>
                    <span>Waktu yang tercantum bersifat estimasi dan dapat berubah sewaktu-waktu tergantung kondisi di lapangan.</span>
                </div>

                ${this._fetchError ? this.renderError() : `
                <div class="main-content">
                    <div>
                        ${this.renderYourQueueCard()}
                        <h2 style="margin-top: 2rem; margin-bottom: 1rem;">Status Antrian Poli</h2>
                        <div class="poli-status-grid">
                            ${this.renderPoliCards()}
                        </div>
                    </div>
                    <div class="puskesmas-info">
                        <img src="${imgpuskes}" alt="Foto Puskesmas">
                        <div class="details">
                            <h3>Puskesmas XYZ</h3>
                            <p>Selamat datang di layanan antrian online kami. Pastikan Anda datang sebelum waktu estimasi untuk kelancaran proses. Terima kasih.</p>
                        </div>
                    </div>
                </div>
                `}
            </div>
        `;
    }

    renderError() {
        return `<div class="error-message">Gagal memuat data antrian. Pastikan Anda sudah login dan memiliki koneksi internet.</div>`;
    }

    renderYourQueueCard() {
        if (this._antrian) {
            const isVerified = this._antrian.status === 'dalam antrian';
            const estimasi = this.hitungEstimasi(this._antrian);
            
            return `
            <div class="your-queue-card">
                ${isVerified 
                    ? `<div class="status status-verified">Antrian Diverifikasi</div>` 
                    : `<div class="status status-waiting">Menunggu Verifikasi</div>`
                }
                <p class="queue-text">Nomor Antrian Anda di ${this._antrian.poli.charAt(0).toUpperCase() + this._antrian.poli.slice(1)}</p>
                <div class="queue-number">${this.getKodeAntrianPasien()}</div>
                <div class="estimasi-grid">
                    <div class="estimasi-item">
                        <h4>Estimasi Masuk</h4>
                        <p>${estimasi.masuk}</p>
                    </div>
                    <div class="estimasi-item">
                        <h4>Estimasi Keluar</h4>
                        <p>${estimasi.keluar}</p>
                    </div>
                </div>
            </div>`;
        } else {
            return `
            <div class="your-queue-card">
                <div class="status status-none">Tidak Ada Antrian</div>
                <p class="queue-text" style="margin-top: 1rem;">Anda belum terdaftar dalam antrian hari ini.</p>
                <div class="no-queue-cta">
                    <a href="#/daftar-antrian">Daftar Antrian Sekarang &rarr;</a>
                </div>
            </div>`;
        }
    }

    renderPoliCards() {
        const polis = [
            { name: 'Umum', key: 'umum' },
            { name: 'Gigi', key: 'gigi' },
            { name: 'Anak', key: 'anak' },
            { name: 'Kandungan', key: 'kandungan' }
        ];
        return polis.map(poli => `
            <div class="poli-card">
                <h4>Poli ${poli.name}</h4>
                <div class="poli-data">
                    <span class="label">Jumlah Antrian</span>
                    <span class="value">${this.getJumlahAntrianPerPoli(poli.key)}</span>
                </div>
            </div>
        `).join('');
    }
}

customElements.define('antrian-puskesmas', AntrianPuskesmas);