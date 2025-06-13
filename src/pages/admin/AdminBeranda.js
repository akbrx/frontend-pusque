class AdminBeranda extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = `<div>Loading statistik...</div>`;
    let pasienPerBulan = [];
    try {
      const res = await fetch('https://backend-pusque-production.up.railway.app/statistik/pasien-per-bulan', { credentials: 'include' });
      pasienPerBulan = await res.json();
    } catch (err) {
      this.innerHTML = `<div style="color:red;">Gagal memuat data statistik.</div>`;
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
</div>
      `;
  
      const labels = pasienPerBulan.map(item => item.bulan);
      const dataValues = pasienPerBulan.map(item => item.jumlah);
  
      setTimeout(() => {
        const barCtx = this.querySelector('#barChart').getContext('2d');
        const pieCtx = this.querySelector('#pieChart').getContext('2d');
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
              data: dataValues
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
          }
        });
      }, 0);
    }
  }
  
  if (!customElements.get('admin-beranda')) {
    customElements.define('admin-beranda', AdminBeranda);
  }
