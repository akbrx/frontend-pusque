import { authFetch } from "../../fatchauth.js"; // Import authFetch

class AdminBeranda extends HTMLElement {
    async connectedCallback() {
        this.innerHTML = `<div>Loading statistik...</div>`;
        let pasienPerBulan = [];
        try {
            // Gunakan authFetch dan URL backend yang benar
            const res = await authFetch('https://backend-pusque-production.up.railway.app/statistik/pasien-per-bulan');
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: 'Respons non-JSON atau kosong.' }));
                throw new Error(errorData.message || `Gagal memuat data statistik: ${res.status} ${res.statusText}`);
            }
            pasienPerBulan = await res.json();
            
        } catch (err) {
            console.error("Error memuat data statistik:", err);
            this.innerHTML = `<div style="color:red;">Gagal memuat data statistik. ${err.message || ''}</div>`;
            // Redirect ke login jika error otentikasi
            if (err.message.includes("Authentikasi diperlukan") || err.message.includes("refresh token")) {
                alert("Sesi Anda telah berakhir atau token tidak valid. Silakan login kembali."); // Ganti dengan custom modal
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userRole');
                window.location.hash = "#/login";
            }
            return;
        }
        this.render(pasienPerBulan);
    }
    
    render(pasienPerBulan = []) {
        this.innerHTML = `
            <div class="card shadow-sm mx-4 mt-4">
                <div class="card-body px-4">
                    <div class="d-flex justify-content-end mb-3">
                        <label for="filterSelect" class="me-2">Filter :</label>
                        <select id="filterSelect" class="form-select w-auto">
                            <option value="tahun">2025</option>
                        </select>
                    </div>
                    <div class="container py-5">
                        <h2 class="text-center mb-4">Statistik Jumlah Pasien per Bulan</h2>
                        <div class="row">
                            <div class="col-md-6">
                                <canvas id="barChart" height="200"></canvas>
                            </div>
                            <div class="col-md-6 d-flex justify-content-center align-items-center">
                                <canvas id="pieChart" width="350" height="350"></canvas>
                            </div>
                        </div>

                        <!-- Tabel Jumlah Pasien -->
                        <div class="mt-5">
                            <h4 class="mb-3">Tabel Jumlah Pasien per Bulan</h4>
                            <div class="table-responsive">
                                <table class="table">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Bulan</th>
                                            <th>Jumlah Pasien</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${pasienPerBulan.map(item => `
                                            <tr>
                                                <td>${item.bulan}</td>
                                                <td>${item.jumlah}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    
        const labels = pasienPerBulan.map(item => item.bulan);
        const dataValues = pasienPerBulan.map(item => item.jumlah);
    
        setTimeout(() => {
            const barCtx = this.querySelector('#barChart').getContext('2d');
            const pieCtx = this.querySelector('#pieChart').getContext('2d');
            // Pastikan Chart.js diimpor di app.js atau index.html
            // Contoh: <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            new Chart(barCtx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Jumlah Pasien',
                        data: dataValues,
                        backgroundColor: '#367AFF',
                        borderRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } }
                }
            });
            new Chart(pieCtx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Jumlah Pasien',
                        data: dataValues,
                        backgroundColor: [ // Tambahkan warna untuk setiap bagian pie chart
                            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FFCD56', '#C9CBCF',
                            '#7BFF36', '#FF367B', '#36FF7B', '#7B36FF'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: true, position: 'right' } } // Tampilkan legend untuk pie chart
                }
            });
        }, 0);
    }
}

if (!customElements.get('admin-beranda')) {
    customElements.define('admin-beranda', AdminBeranda);
}
