import ktpimg from "../../assets/images/ktp.jpg"
import { authFetch } from "../../fatchauth.js"; // Import authFetch

class DetailPasienView extends HTMLElement {
    set pasien(data) {
      // Mapping data dari backend ke frontend
      this._pasien = {
        id: data.id,
        nama: data.user?.name || '-',
        antrian: data.queue_number || '-',
        tglLahir: data.user?.tanggalLahir || '-',
        nik: data.user?.nik || '-',
        fotoKtp: data.user?.fotoKtp || '',
        poli: data.poli || '-',
        keluhan: Array.isArray(data.keluhan)
          ? data.keluhan
          : (typeof data.keluhan === 'string' ? data.keluhan.split(',').map(k => k.trim()) : [])
      };
      this.render();
    }

    render() {
      if (!this._pasien) {
        this.innerHTML = `<p class="text-danger">Data pasien tidak ditemukan.</p>`;
        return;
      }

      const fotoKtpSrc = this._pasien.fotoKtp
        ? `https://backend-pusque-production.up.railway.app/uploads/ktp/${this._pasien.fotoKtp}`
        : ktpimg;

      this.innerHTML = `
        <section class="container py-5">
        <a class="back-button" href="#/dokter">&#8592; Kembali</a>
        <h2 class="mb-4">Detail Pasien</h2>
        
        <div class="card shadow-sm">
            <div class="card-body">
            <div class="container my-4">
              <table class="table">
                <tbody>
                  <tr>
                    <th scope="row" class="w-50">Nama</th>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>:</td>
                    <td class="text-break">${this._pasien.nama}</td>
                  </tr>
                  <tr>
                    <th scope="row">No Antrian</th>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>:</td>
                    <td>${this._pasien.antrian}</td>
                  </tr>
                  <tr>
                    <th scope="row">Tanggal Lahir</th>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>:</td>
                    <td>${this._pasien.tglLahir}</td>
                  </tr>
                  <tr>
                    <th scope="row" >NIK</th>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>:</td>
                    <td class="text-break">${this._pasien.nik}</td>
                  </tr>
                  <tr>
                    <th scope="row">Poli</th>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>:</td>
                    <td>${this._pasien.poli}</td>
                  </tr>
                  <tr>
                    <th scope="row">Keluhan</th>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>:</td>
                    <td>
                      <ul class="mb-0 ps-3 text-break">
                        ${this._pasien.keluhan.map(k => `<li>${k}</li>`).join('')}
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          <div class="d-grid gap-2 col-4 ms-auto mt-3">
            <a href="#/dokter" class="btn btn-primary mt-3">Selesai</a>
            <button id="btn-turunkan" class="btn btn-warning mt-2">Turunkan Antrian</button>
          </div>
        </div>
        </div>
        </section>
      `;

      // Event listener tombol turunkan
      this.querySelector('#btn-turunkan')?.addEventListener('click', async () => {
        if (!confirm('Yakin ingin menurunkan antrian pasien ini satu tingkat ke bawah?')) return; // Ganti dengan custom modal
        try {
          // Gunakan authFetch dan URL backend yang benar
          const res = await authFetch(`https://backend-pusque-production.up.railway.app/antrian/${this._pasien.id}/mundur`, {
            method: 'PATCH',
          });
          if (res.ok) {
            alert('Antrian berhasil diturunkan.'); // Ganti dengan custom modal
            window.location.hash = '#/dokter';
          } else {
            const data = await res.json().catch(() => ({ message: 'Respons non-JSON atau kosong.' }));
            alert(data.message || 'Gagal menurunkan antrian.'); // Ganti dengan custom modal
          }
        } catch (err) {
          console.error("Error saat menurunkan antrian:", err);
          alert('Terjadi error saat menurunkan antrian.'); // Ganti dengan custom modal
          // Redirect ke login jika error otentikasi
          if (err.message.includes("Authentikasi diperlukan") || err.message.includes("refresh token")) {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('userRole');
              window.location.hash = "#/login";
          }
        }
      });

      this.querySelector('a.btn.btn-primary')?.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!confirm('Tandai antrian ini sebagai selesai?')) return; // Ganti dengan custom modal
        try {
          // Gunakan authFetch dan URL backend yang benar
          const res = await authFetch(`https://backend-pusque-production.up.railway.app/antrian/${this._pasien.id}/selesai`, {
            method: 'PATCH',
          });
          if (res.ok) {
            alert('Antrian berhasil diselesaikan.'); // Ganti dengan custom modal
            window.location.hash = '#/dokter';
          } else {
            const data = await res.json().catch(() => ({ message: 'Respons non-JSON atau kosong.' }));
            alert(data.message || 'Gagal menyelesaikan antrian.'); // Ganti dengan custom modal
          }
        } catch (err) {
          console.error("Error saat menyelesaikan antrian:", err);
          alert('Terjadi error saat menyelesaikan antrian.'); // Ganti dengan custom modal
          // Redirect ke login jika error otentikasi
          if (err.message.includes("Authentikasi diperlukan") || err.message.includes("refresh token")) {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('userRole');
              window.location.hash = "#/login";
          }
        }
      });
    }
  }
  
  if (!customElements.get('detail-pasien-view')) {
    customElements.define('detail-pasien-view', DetailPasienView);
  }
