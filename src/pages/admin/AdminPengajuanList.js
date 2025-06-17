//AdminPengajuanList.js
import { authFetch } from "../../fatchauth.js"; // Import authFetch

class AdminPengajuanList extends HTMLElement {
    set dataPasien(value) {
        this._dataPasien = value;
        this.render();
    }

    connectedCallback() {
        this.statusFilter = 'ditolak'; // default filter bawah
        this.fetchAntrian();
    }

    async fetchAntrian() {
        try {
            // Gunakan authFetch dan URL backend yang benar
            const res = await authFetch('https://backend-pusque-production.up.railway.app/antrian');
            
            if (!res.ok) {
                // Tangani respons non-OK (misalnya 401/403 dari backend)
                const errorData = await res.json().catch(() => ({ message: 'Respons non-JSON atau kosong.' }));
                throw new Error(errorData.message || `Gagal mengambil data antrian: ${res.status} ${res.statusText}`);
            }
            const data = await res.json();
            
            this.antrianMenunggu = data.filter(a => a.status === 'menunggu acc admin');
            this.antrianLain = data.filter(a => a.status === 'ditolak' || a.status === 'dalam antrian');
            this._allData = data; // simpan semua untuk filter dinamis
            this.render();
        } catch (err) {
            console.error("Error fetching antrian:", err);
            this.innerHTML = `<p class="text-center text-danger">Gagal memuat data antrian. ${err.message || ''}</p>`;
            // Redirect ke login jika error otentikasi
            if (err.message.includes("Authentikasi diperlukan") || err.message.includes("refresh token")) {
                alert("Sesi Anda telah berakhir atau token tidak valid. Silakan login kembali.");
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userRole');
                window.location.hash = "#/login";
            }
        }
    }

    render() {
        // ... (bagian render HTML)
        if (!this.antrianMenunggu || !this.antrianLain) {
            this.innerHTML = `<p class="text-center">Loading...</p>`;
            return;
        }

        // Filter bawah sesuai status
        const filteredLain = this._allData
            ? this._allData.filter(a => a.status === this.statusFilter)
            : [];

        this.innerHTML = `
            <section class="pasien-container container-xl py-5">
                <h1 class="text-center mb-4">Menunggu Persetujuan</h1>
                <div class="card shadow-sm mb-5">
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table" id="pasienTable">
                                <thead class="table-secondary">
                                    <tr>
                                        <th>No</th>
                                        <th>Nama Pasien</th>
                                        <th class="text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.antrianMenunggu.map((antrian, index) => `
                                        <tr>
                                            <td>${index + 1}</td>
                                            <td>${antrian.user ? antrian.user.name : '-'}</td>
                                            <td>
                                                <div class="d-flex justify-content-center align-items-center">
                                                    <button class="btn btn-info btn-sm btn-detail me-3" data-id="${antrian.id}">Detail</button>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <h2 class="text-center mb-4">Riwayat Antrian</h2>
                <div class="mb-3">
                    <label for="filter-status" class="form-label">Filter Status:</label>
                    <select id="filter-status" class="form-select" style="max-width: 300px;">
                        <option value="ditolak"${this.statusFilter === 'ditolak' ? ' selected' : ''}>Ditolak</option>
                        <option value="dalam antrian"${this.statusFilter === 'dalam antrian' ? ' selected' : ''}>Dalam Antrian</option>
                    </select>
                </div>
                <div class="card shadow-sm">
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table" id="riwayatTable">
                                <thead class="table-secondary">
                                    <tr>
                                        <th>No</th>
                                        <th>Nama Pasien</th>
                                        <th>Poli</th>
                                        <th>Status</th>
                                        <th class="text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${filteredLain.map((antrian, index) => `
                                        <tr>
                                            <td>${index + 1}</td>
                                            <td>${antrian.user ? antrian.user.name : '-'}</td>
                                            <td>${antrian.poli || '-'}
                                            <td>
                                                ${antrian.status === 'ditolak'
                                                    ? '<span class="badge rounded-pill bg-danger">Ditolak</span>'
                                                    : '<span class="badge rounded-pill bg-warning text-dark">Dalam Antrian</span>'}
                                            </td>
                                            <td>
                                                <div class="d-flex justify-content-center align-items-center">
                                                    ${antrian.status === 'ditolak' ? `
                                                        <button class="btn btn-danger btn-sm me-2" data-id="${antrian.id}" data-action="hapus">Hapus</button>
                                                        <button class="btn btn-warning btn-sm" data-id="${antrian.id}" data-action="kembalikan">Kembalikan</button>
                                                    ` : ''}
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        `;
    
        // Event listener filter status
        this.querySelector('#filter-status')?.addEventListener('change', (e) => {
            this.statusFilter = e.target.value;
            this.render();
        });
    
        // Event listener tombol hapus 
        this.querySelectorAll('button[data-action="hapus"]').forEach(btn => {
            btn.onclick = async (e) => { // Menggunakan async
                const id = btn.getAttribute('data-id');
                if (confirm('Yakin ingin menghapus antrian ini?')) { // Gunakan custom modal, bukan confirm()
                    try {
                        // Gunakan authFetch dan URL backend yang benar
                        const res = await authFetch(`https://backend-pusque-production.up.railway.app/antrian/${id}`, {
                            method: 'DELETE',
                        });
                        if (res.ok) {
                            alert('Antrian berhasil dihapus.'); // Gunakan custom modal, bukan alert()
                            this.fetchAntrian();
                        } else {
                            const data = await res.json().catch(() => ({ message: 'Respons non-JSON atau kosong.' }));
                            alert(data.message || 'Gagal menghapus antrian.'); // Gunakan custom modal, bukan alert()
                        }
                    } catch (err) {
                        alert('Terjadi error saat menghapus antrian.'); // Gunakan custom modal, bukan alert()
                        console.error(err);
                        // Redirect ke login jika error otentikasi
                        if (err.message.includes("Authentikasi diperlukan") || err.message.includes("refresh token")) {
                            localStorage.removeItem('accessToken');
                            localStorage.removeItem('userRole');
                            window.location.hash = "#/login";
                        }
                    }
                }
            };
        });
        
        // Event listener tombol kembalikan
        this.querySelectorAll('button[data-action="kembalikan"]').forEach(btn => {
            btn.addEventListener('click', async (e) => { // Menggunakan async
                const id = btn.getAttribute('data-id');
                if (confirm('Kembalikan antrian ini ke status "menunggu acc admin"?')) { // Gunakan custom modal, bukan confirm()
                    try {
                        // Gunakan authFetch dan URL backend yang benar
                        const res = await authFetch(`https://backend-pusque-production.up.railway.app/antrian/${id}/kembalikan`, {
                            method: 'PATCH',
                        });
                        if (res.ok) {
                            alert('Antrian berhasil dikembalikan ke menunggu acc admin.'); // Gunakan custom modal, bukan alert()
                            this.fetchAntrian();
                        } else {
                            const data = await res.json().catch(() => ({ message: 'Respons non-JSON atau kosong.' }));
                            alert(data.message || 'Gagal mengembalikan antrian.'); // Gunakan custom modal, bukan alert()
                        }
                    } catch (err) {
                        alert('Terjadi error saat mengembalikan antrian.'); // Gunakan custom modal, bukan alert()
                        console.error(err);
                        // Redirect ke login jika error otentikasi
                        if (err.message.includes("Authentikasi diperlukan") || err.message.includes("refresh token")) {
                            localStorage.removeItem('accessToken');
                            localStorage.removeItem('userRole');
                            window.location.hash = "#/login";
                        }
                    }
                }
            });
        });
    
        // Event listener tombol detail
        this.querySelectorAll('.btn-detail').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                // URL ini perlu diperbaiki jika detail pengajuan juga memanggil backend
                window.location.hash = `#/detailpengajuan/${id}`;
            });
        });
    }
}

if (!customElements.get('admin-pengajuan-list')) {
    customElements.define('admin-pengajuan-list', AdminPengajuanList);
}
