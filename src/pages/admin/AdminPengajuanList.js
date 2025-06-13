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
        const res = await fetch('http://localhost:5000/antrian', {
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Gagal mengambil data antrian');
        const data = await res.json();
        // Pisahkan sesuai kebutuhan
        this.antrianMenunggu = data.filter(a => a.status === 'menunggu acc admin');
        this.antrianLain = data.filter(a => a.status === 'ditolak' || a.status === 'dalam antrian');
        this._allData = data; // simpan semua untuk filter dinamis
        this.render();
      } catch (err) {
        this.innerHTML = `<p class="text-center text-danger">Gagal memuat data antrian</p>`;
      }
    }
  
    render() {
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
        btn.onclick = async (e) => {
          const id = btn.getAttribute('data-id');
          if (confirm('Yakin ingin menghapus antrian ini?')) {
            try {
              const res = await fetch(`http://localhost:5000/antrian/${id}`, {
                method: 'DELETE',
                credentials: 'include'
              });
              if (res.ok) {
                alert('Antrian berhasil dihapus.');
                this.fetchAntrian();
              } else {
                const data = await res.json().catch(() => ({}));
                alert(data.message || 'Gagal menghapus antrian.');
              }
            } catch (err) {
              alert('Terjadi error saat menghapus antrian.');
              console.error(err);
            }
          }
        };
      });
      
      // Event listener tombol kembalikan
      this.querySelectorAll('button[data-action="kembalikan"]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = btn.getAttribute('data-id');
          if (confirm('Kembalikan antrian ini ke status "menunggu acc admin"?')) {
            try {
              const res = await fetch(`http://localhost:5000/antrian/${id}/kembalikan`, {
                method: 'PATCH',
                credentials: 'include'
              });
              if (res.ok) {
                alert('Antrian berhasil dikembalikan ke menunggu acc admin.');
                this.fetchAntrian();
              } else {
                alert('Gagal mengembalikan antrian.');
              }
            } catch (err) {
              alert('Terjadi error saat mengembalikan antrian.');
            }
          }
        });
      });
  
      // Event listener tombol detail
      this.querySelectorAll('.btn-detail').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          window.location.hash = `#/detailpengajuan/${id}`;
        });
      });
    }
  }
  
  if (!customElements.get('admin-pengajuan-list')) {
    customElements.define('admin-pengajuan-list', AdminPengajuanList);
  }
