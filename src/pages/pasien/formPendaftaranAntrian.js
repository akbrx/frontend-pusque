// formPendaftaranAntrian.js
import { authFetch } from "../../fatchauth.js"; // Import authFetch

class DaftarAntrianForm extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        // Fungsi untuk memformat tanggal ke format Indonesia
        this.formatDate = (date) => {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return date.toLocaleDateString('id-ID', options);
        };
    }

    connectedCallback() {
        this.render();
        this.shadowRoot.querySelectorAll('input[name="poli"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateCheckboxes());
        });

        // Pastikan updateCheckboxes dipanggil pertama kali untuk inisialisasi
        this.updateCheckboxes();

        // Tambahkan event listener submit
        this.shadowRoot.querySelector('form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const form = this.shadowRoot.querySelector('form');
            const submitBtn = form.querySelector('button[type="submit"]');
            const spinner = this.shadowRoot.querySelector('#loading-spinner');

            // Tampilkan loading
            spinner.style.display = 'block';
            submitBtn.disabled = true;

            // Ambil data keluhan (bisa lebih dari satu)
            const keluhanArr = Array.from(this.shadowRoot.querySelectorAll('input[name="keluhan"]:checked')).map(cb => cb.value);
            const keluhan = keluhanArr.join(', ');

            // Ambil poli yang dipilih
            const poli = this.shadowRoot.querySelector('input[name="poli"]:checked').value;

            // Validasi sederhana: pastikan keluhan dipilih
            if (keluhanArr.length === 0) {
                alert('Silakan pilih setidaknya satu keluhan.');
                spinner.style.display = 'none';
                submitBtn.disabled = false;
                return;
            }

            // Kirim ke backend menggunakan authFetch
            try {
                // Ganti fetch native dengan authFetch dan gunakan URL backend yang benar
                const res = await authFetch('https://backend-pusque-production.up.railway.app/antrian', {
                    method: 'POST',
                    body: JSON.stringify({ keluhan, poli })
                });

                const data = await res.json();

                if (res.ok) {
                    alert('Antrian berhasil didaftarkan!');
                    // Reset form setelah sukses
                    this.shadowRoot.querySelector('form').reset();
                    this.updateCheckboxes(); // Perbarui checkbox setelah reset
                    window.location.hash = "#/antrian"; // Redirect ke halaman antrian
                } else {
                    alert(data.message || 'Gagal mendaftar antrian');
                    console.error("Gagal mendaftar antrian:", data);
                }
            } catch (err) {
                console.error("Error saat mendaftar antrian:", err);
                alert('Terjadi error koneksi atau otentikasi. Silakan login kembali.');
                // Redirect ke login jika error otentikasi
                if (err.message.includes("Authentikasi diperlukan") || err.message.includes("refresh token")) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('userRole');
                    window.location.hash = "#/login";
                }
            } finally {
                spinner.style.display = 'none';
                submitBtn.disabled = false;
            }
        });
    }

    updateCheckboxes() {
        const keluhanContainer = this.shadowRoot.querySelector('#keluhan-container');
        const selectedPoliRadio = this.shadowRoot.querySelector('input[name="poli"]:checked');
        
        const selectedPoli = selectedPoliRadio ? selectedPoliRadio.value : 'umum'; // Default ke umum

        const keluhanOptions = {
            umum: ['Sakit Kepala', 'Demam', 'Batuk', 'Pilek', 'Lemas', 'Mual', 'Sakit Perut', 'Pusing'],
            gigi: ['Sakit Gigi', 'Gusi Bengkak', 'Tambal Gigi', 'Cabut Gigi', 'Kontrol', 'Pembersihan'],
            anak: ['Imunisasi', 'Demam Anak', 'Batuk Anak', 'Tumbuh Gigi', 'Kontrol Rutin'],
            kandungan: ['Kontrol kehamilan', 'Sakit Perut', 'Pendarahan', 'Konsultasi KB', 'Konsultasi Kehamilan']
        };

        keluhanContainer.innerHTML = keluhanOptions[selectedPoli]
            .map(keluhan => `
                <label class="checkbox-label">
                    <input type="checkbox" name="keluhan" value="${keluhan}" /> 
                    <span>${keluhan}</span>
                </label>
            `)
            .join('');
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                /* Import Font */
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

                /* CSS Variables untuk tema */
                :host {
                    --primary-color: #3B82F6; /* Biru */
                    --primary-hover: #2563EB;
                    --secondary-color: #F3F4F6; /* Abu-abu muda */
                    --text-color: #374151;
                    --border-color: #D1D5DB;
                    --background-color: #ffffff;
                    --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
                    --font-family: 'Poppins', sans-serif;
                }

                .container-daftar {
                    max-width: 700px;
                    margin: 2rem auto;
                    padding: 2.5rem;
                    border-radius: 16px;
                    background: var(--background-color);
                    box-shadow: var(--shadow);
                    font-family: var(--font-family);
                    color: var(--text-color);
                }
                .form-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 1.5rem;
                    margin-bottom: 1.5rem;
                }
                h2 {
                    margin: 0;
                    font-size: 1.75rem;
                    font-weight: 600;
                    color: var(--text-color);
                }
                .date-display {
                    background-color: var(--secondary-color);
                    color: var(--text-color);
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .date-display svg {
                    width: 16px;
                    height: 16px;
                }
                .form-group {
                    margin-bottom: 1.5rem;
                }
                strong.group-title {
                    display: block;
                    font-weight: 600;
                    font-size: 1.1rem;
                    margin-bottom: 1rem;
                }

                /* Styling untuk Radio Button Poli */
                .poli-options {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.75rem;
                }
                .poli-options label {
                    display: block;
                    padding: 1rem;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease-in-out;
                    text-align: center;
                }
                .poli-options input[type="radio"] {
                    display: none; /* Sembunyikan radio button asli */
                }
                .poli-options label:hover {
                    border-color: var(--primary-color);
                    background-color: #EFF6FF; /* Biru sangat muda */
                }
                .poli-options input[type="radio"]:checked + span {
                    color: var(--primary-color);
                    font-weight: 600;
                }
                .poli-options input[type="radio"]:checked ~ .radio-indicator {
                    border-color: var(--primary-color);
                }
                .poli-options label.checked {
                    border-color: var(--primary-color);
                    background-color: #EFF6FF;
                    box-shadow: 0 0 0 2px var(--primary-color);
                }
                
                /* Styling untuk Checkbox Keluhan */
                .grid-checkboxes {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 0.75rem;
                }
                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: var(--secondary-color);
                    padding: 0.75rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                 .checkbox-label:hover {
                    background-color: #E5E7EB; /* Abu-abu sedikit lebih gelap */
                }
                .checkbox-label input[type="checkbox"] {
                   accent-color: var(--primary-color);
                   width: 18px;
                   height: 18px;
                }

                /* Tombol Submit */
                button[type="submit"] {
                    width: 100%;
                    padding: 0.85rem;
                    font-size: 1rem;
                    font-weight: 500;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background-color 0.2s, transform 0.1s;
                    margin-top: 1rem;
                }
                button[type="submit"]:hover {
                    background: var(--primary-hover);
                }
                 button[type="submit"]:active {
                    transform: scale(0.99);
                }

                .back-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--primary-color);
                    text-decoration: none;
                    font-size: 1rem;
                    font-weight: 500;
                    margin-bottom: 2rem;
                }
                .back-button:hover {
                    text-decoration: underline;
                    color: var(--primary-hover);
                }

                .spinner {
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid var(--primary-color);
                    border-radius: 50%;
                    width: 28px;
                    height: 28px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
            </style>

            <div class="container-daftar">
                <a class="back-button" href="#/">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:20px; height:20px;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                    Kembali
                </a>
                
                <form>
                    <div class="form-header">
                        <h2>Daftar Antrian</h2>
                        <div id="tanggal-sekarang" class="date-display">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18" />
                            </svg>
                            <span>${this.formatDate(new Date())}</span>
                        </div>
                    </div>

                    <div class="form-group">
                        <strong class="group-title">Pilih Poli Tujuan</strong>
                        <div class="poli-options">
                            <label>
                                <input type="radio" name="poli" value="umum" checked />
                                <span>Poli Umum</span>
                            </label>
                            <label>
                                <input type="radio" name="poli" value="gigi" />
                                <span>Poli Gigi</span>
                            </label>
                            <label>
                                <input type="radio" name="poli" value="anak" />
                                <span>Poli Anak</span>
                            </label>
                            <label>
                                <input type="radio" name="poli" value="kandungan" />
                                <span>Poli Kandungan</span>
                            </label>
                        </div>
                    </div>

                    <div class="form-group">
                        <strong class="group-title">Pilih Keluhan Anda</strong>
                        <div id="keluhan-container" class="grid-checkboxes"></div>
                    </div>

                    <button type="submit">Daftar Sekarang</button>
                    <div id="loading-spinner" style="display:none;" class="text-center mt-2">
                        <div class="spinner"></div>
                        <div style="font-size: 0.9em;">Memproses pendaftaran...</div>
                    </div>
                </form>
            </div>
        `;
        
        // Menambahkan listener untuk radio button poli setelah render
        this.shadowRoot.querySelectorAll('.poli-options input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', (event) => {
                // Hapus class 'checked' dari semua label
                this.shadowRoot.querySelectorAll('.poli-options label').forEach(label => {
                    label.classList.remove('checked');
                });
                // Tambahkan class 'checked' ke label dari radio yang dipilih
                if (event.target.checked) {
                    event.target.parentElement.classList.add('checked');
                }
            });
        });

        // Memicu 'change' untuk radio yang terpilih saat pertama kali load
        const checkedRadio = this.shadowRoot.querySelector('.poli-options input[type="radio"]:checked');
        if (checkedRadio) {
            checkedRadio.parentElement.classList.add('checked');
        }

        this.updateCheckboxes();
    }
}

customElements.define('daftar-antrian-form', DaftarAntrianForm);