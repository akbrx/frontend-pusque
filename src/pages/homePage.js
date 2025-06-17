import heroImg from "../assets/images/bennerHome.png";
import bennerImg from "../assets/images/benner.jpg";
import chatBot from "../assets/icons/chatBot.png";
// import { authFetch } from "../../fatchauth.js"; // Tidak diperlukan lagi jika tidak ada fetch API

class PusquePage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    async connectedCallback() {
        // Hapus semua logika pengambilan feedback di sini
        // let feedbacks = [];
        // try { /* ... */ } catch (err) { /* ... */ }

        // Render langsung tanpa menunggu feedback
        this.render(); 

        // Tambahkan event listener untuk tombol chat bot
        this.shadowRoot.querySelector('.chat-button')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = '#/chatbot';
        });
    }

    render() { // Hapus parameter feedbacks
        this.shadowRoot.innerHTML = `
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <style>
                /* Custom CSS if needed */
                body { font-family: 'Inter', sans-serif; }
                .hero-img-responsive {
                    max-width: 100%;
                    height: auto;
                }
                .hero-overlay {
                    background-image: linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.3));
                }
            </style>

            <div class="container mx-auto px-4 py-8 font-inter">
                <section class="flex flex-col lg:flex-row items-center justify-between py-8 md:py-16 bg-blue-500 text-white rounded-xl shadow-lg">
                    <div class="hero-text text-center lg:text-left p-6 lg:w-1/2">
                        <h2 class="text-4xl md:text-5xl font-extrabold mb-4 border-b-4 border-white pb-2 inline-block">PusQue</h2>
                        <p class="text-lg md:text-xl leading-relaxed mb-6">PusQue hadir untuk memudahkan Anda dalam mengakses layanan puskesmas dengan lebih cepat dan praktis. Melalui sistem ini, Anda dapat melakukan pendaftaran secara online dan mengambil nomor antrian tanpa harus menunggu lama di lokasi. Silakan gunakan menu yang tersedia untuk memulai.</p>
                        <a href="#/daftar">
                            <button class="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg shadow-md hover:bg-gray-100 transition duration-300 transform hover:scale-105">Daftar Antrean</button>
                        </a>
                    </div>
                    <img src="${heroImg}" alt="Antrian" class="hero-img-responsive w-full lg:w-1/2 rounded-xl mt-6 lg:mt-0" />
                </section>

                <!-- Bagian Feedback Dihapus/Dikomendasikan -->
                <!-- <div class="feedback-section my-12 text-center">
                    <h3 class="text-3xl font-bold mb-6 text-gray-800">Feedback</h3>
                    <feedback-carousel></feedback-carousel> 
                    <p class="text-gray-500 italic mt-8">Fitur feedback saat ini tidak aktif.</p>
                </div> -->
            
                <section class="jadwal-section my-12">
                    <h3 class="text-3xl font-bold text-center mb-8 text-gray-800">Jadwal Pelayanan</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${this._renderJadwalCard("Senin")}
                        ${this._renderJadwalCard("Selasa")}
                        ${this._renderJadwalCard("Rabu")}
                        ${this._renderJadwalCard("Kamis")}
                        ${this._renderJadwalCard("Jumat")}
                        ${this._renderJadwalCard("Sabtu")}
                    </div>
                </section>
            
                <section class="banner-section my-12 text-center">
                    <img src="${bennerImg}" alt="Kampanye Kesehatan" class="w-full max-w-2xl mx-auto rounded-lg shadow-md" />
                </section>
            </div>

            <a href="#/chatbot" class="chat-button fixed bottom-6 right-6 bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105 z-50">
                <img src="${chatBot}" alt="Bot Icon" class="w-10 h-10" />
            </a>
            
            <footer class="bg-gray-800 text-white text-center py-4 mt-8 rounded-t-xl">
                © 2025 PusQue
            </footer>
        `;
    }

    _renderJadwalCard(day) {
        return `
            <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div class="flex items-center justify-between mb-4">
                    <span class="text-lg font-semibold text-gray-800">${day}</span>
                    <img src="https://cdn-icons-png.flaticon.com/512/747/747310.png" alt="calendar" class="w-5 h-5 opacity-70">
                </div>
                <div class="space-y-1 text-sm text-gray-700">
                    <div class="flex justify-between"><span>Buka & Tutup</span><span>08:00 | 17:00</span></div>
                    <div class="flex justify-between"><span>Poli Umum</span><span>Setiap Hari</span></div>
                    <div class="flex justify-between"><span>Poli Gigi</span><span>Setiap Hari</span></div>
                    <div class="flex justify-between"><span>Poli Anak</span><span>Setiap Hari</span></div>
                    <div class="flex justify-between"><span>Imunisasi</span><span>Setiap Hari</span></div>
                    <div class="flex justify-between"><span>IGD</span><span>Setiap Hari</span></div>
                    <div class="flex justify-between"><span>Poli Kandungan</span><span>Setiap Hari</span></div>
                </div>
            </div>
        `;
    }
}

customElements.define('pusque-page', PusquePage);
