class PasienListView extends HTMLElement {

  set dataPasien(value) {
    // Simpan semua data untuk kebutuhan filter
    this._allPasien = value.filter(p => p.status === 'dalam antrian');
    // Default: tampilkan semua poli
    this._selectedPoli = this._selectedPoli || 'semua';
    this.applyFilter();
  }

  applyFilter() {
    let filtered = this._allPasien;
    if (this._selectedPoli && this._selectedPoli !== 'semua') {
      filtered = filtered.filter(p => p.poli === this._selectedPoli);
    }
    // Urutkan berdasarkan queue_number (bukan createdAt)
    filtered.sort((a, b) => a.queue_number - b.queue_number);
    this._dataPasien = filtered.map((p, idx) => ({
      id: p.id,
      antrian: p.queue_number, // tampilkan queue_number asli dari backend
      nama: p.user?.name || '-',
      poli: p.poli,
      status: p.status
    }));
    this.render();
  }

  connectedCallback() {
    this._selectedPoli = this._selectedPoli || 'semua';
  }

  render() {
    if (!this._dataPasien) {
      this.innerHTML = `<p class="text-center">Loading...</p>`;
      return;
    }

    this.innerHTML = `
    <style>
    .bg-pink {
      background-color: #e83e8c !important; /* warna pink bootstrap-ish */
      color: white;
    }   
    </style>

      <section class="pasien-container container-xl py-5">
        <h1 class="text-center mb-4">Daftar Pasien</h1>
        <div class="mb-3">
          <label for="filter-poli" class="form-label">Filter Poli:</label>
          <select id="filter-poli" class="form-select" style="max-width: 300px;">
            <option value="semua"${this._selectedPoli === 'semua' ? ' selected' : ''}>Semua</option>
            <option value="umum"${this._selectedPoli === 'umum' ? ' selected' : ''}>Umum</option>
            <option value="gigi"${this._selectedPoli === 'gigi' ? ' selected' : ''}>Gigi</option>
            <option value="anak"${this._selectedPoli === 'anak' ? ' selected' : ''}>Anak</option>
            <option value="kandungan"${this._selectedPoli === 'kandungan' ? ' selected' : ''}>Kandungan</option>
          </select>
        </div>
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table" id="pasienTable">
                <thead class="table-secondary">
                  <tr>
                    <th>No</th>
                    <th>Nomor Antrian</th>
                    <th>Nama Pasien</th>
                    <th>Poli</th>
                    <th class="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  ${this._dataPasien.map((pasien, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${pasien.antrian}</td>
                      <td>${pasien.nama}</td>
                      <td>
                        ${
                          pasien.poli === 'umum'
                            ? '<span class="badge rounded-pill bg-primary">Umum</span>'
                            : pasien.poli === 'gigi'
                            ? '<span class="badge rounded-pill bg-secondary">Gigi</span>'
                            : pasien.poli === 'anak'
                            ? '<span class="badge rounded-pill bg-info text-dark">Anak</span>'
                            : pasien.poli === 'kandungan'
                            ? '<span class="badge rounded-pill bg-pink">Kandungan</span>'
                            : '-'
                        }
                      </td>
                      <td>
                        <div class="d-flex justify-content-center align-items-center">
                          <button class="btn btn-info btn-sm btn-detail me-3" data-id="${pasien.id}">Detail</button>
                          <button class="btn btn-success btn-sm btn-selesai" data-id="${pasien.id}">Selesai</button>
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

    // Event listener untuk filter poli
    this.querySelector('#filter-poli').addEventListener('change', (e) => {
      this._selectedPoli = e.target.value;
      this.applyFilter();
    });

    // Event listener untuk tombol detail
    this.querySelectorAll('.btn-detail').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        window.location.hash = `#/detailpasien/${id}`;
      });
    });
    // Event listener untuk tombol selesai
    this.querySelectorAll('.btn-selesai').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Tandai antrian ini sebagai selesai?')) return;
        const id = btn.getAttribute('data-id');
        try {
          const res = await fetch(`https://backend-pusque-production.up.railway.app/antrian/${id}/selesai`, {
            method: 'PATCH',
            credentials: 'include'
          });
          if (res.ok) {
            alert('Antrian berhasil diselesaikan.');
            window.location.reload();
          } else {
            const data = await res.json().catch(() => ({}));
            alert(data.message || 'Gagal menyelesaikan antrian.');
          }
        } catch (err) {
          alert('Terjadi error saat menyelesaikan antrian.');
        }
      });
    });
  }
}

if (!customElements.get('pasien-list-view')) {
  customElements.define('pasien-list-view', PasienListView);
}
