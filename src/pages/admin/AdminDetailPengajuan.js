import ktpimg from "../../assets/images/ktp.jpg";
import { authFetch } from "../../fatchauth.js"; // Import authFetch

class AdminDetailPengajuan extends HTMLElement {
    set pasien(data) {
        this._pasien = data;
        this.render();
    }

    connectedCallback() {
        const id = window.location.hash.split('/')[2];
        this.fetchDetailAntrian(id);
    }

    async fetchDetailAntrian(id) {
        console.log("ID dari URL:", id);
        try {
            // Ambil semua antrian (gunakan authFetch dan URL backend yang benar)
            const resAll = await authFetch('https://backend-pusque-production.up.railway.app/antrian');
            const allData = await resAll.json();

            // Filter hanya antrian aktif (bukan ditolak)
            const aktifData = allData.filter(a => a.status !== 'ditolak');

            // Urutkan berdasarkan createdAt
            aktifData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

            // Cari index antrian yang sedang dibuka di antrian aktif
            const idx = aktifData.findIndex(a => a.id == id);

            // Ambil detail antrian yang sedang dibuka (gunakan authFetch dan URL backend yang benar)
            const res = await authFetch(`https://backend-pusque-production.up.railway.app/antrian/${id}`);
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: 'Respons non-JSON atau kosong.' }));
                throw new Error(errorData.message || `Gagal mengambil detail antrian: ${res.status} ${res.statusText}`);
            }
            const data = await res.json();

            this.pasien = {
                nama: data.user?.name || '-',
                antrian: (data.status === 'dalam antrian') ? (data.queue_number || '-') : '-',
                tglLahir: data.user?.tanggalLahir || '-',
                nik: data.user?.nik || '-',
                fotoKtp: data.user?.fotoKtp || '',
                poli: data.poli || '-',
                keluhan: data.keluhan ? data.keluhan.split(',').map(k => k.trim()) : []
            };
        } catch (err) {
            console.error("Error memuat detail antrian:", err);
            this.innerHTML = `<p class="text-danger">Gagal memuat detail antrian. ${err.message || ''}</p>`;
            // Redirect ke login jika error otentikasi
            if (err.message.includes("Authentikasi diperlukan") || err.message.includes("refresh token")) {
                alert("Sesi Anda telah berakhir atau token tidak valid. Silakan login kembali."); // Ganti dengan custom modal
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userRole');
                window.location.hash = "#/login";
            }
        }
    }

    render() {
        console.log("Data pasien di render:", this._pasien);
        if (!this._pasien) {
            this.innerHTML = `<p class="text-danger">Data pasien tidak ditemukan.</p>`;
            return;
        }

        // Perbaiki URL backend untuk foto KTP
        const fotoKtpSrc = this._pasien.fotoKtp
            ? `https://backend-pusque-production.up.railway.app/uploads/ktp/${this._pasien.fotoKtp}`
            : ktpimg;

        this.innerHTML = `
            <section class="container py-5">
            <a class="back-button" href="#/pengajuan">&#8592; Kembali</a>
                <h2 class="mb-4">Detail Pasien</h2>
                <div class="card shadow-sm mx-4 mt-4">
                    <div class="card-body">
                        <table class="table">
                            <tbody>
                                <tr>
                                    <th scope="row" class="w-75">Nama</th>
                                    <td >${this._pasien.nama}</td>
                                </tr>
                                <tr>
                                    <th scope="row">No Antrian</th>
                                    <td >${this._pasien.antrian}</td>
                                </tr>
                                <tr>
                                    <th scope="row">Tanggal Lahir</th>
                                    <td >${this._pasien.tglLahir}</td>
                                </tr>
                                <tr>
                                    <th scope="row">NIK</th>
                                    <td >${this._pasien.nik}</td>
                                </tr>
                                <tr>
                                    <th scope="row">Foto KTP</th>
                                    <td ">
                                        <img class="ktp-img img-fluid" src="${fotoKtpSrc}" alt="KTP"/>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">Poli</th>
                                    <td ">${this._pasien.poli}</td>
                                </tr>
                                <tr>
                                <tr>
                                    <th scope="row">Keluhan</th>
                                    <td ">
                                        <ul class="mb-0">
                                            ${this._pasien.keluhan.map(k => `<li>${k}</li>`).join('')}
                                        </ul>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div class="row mt-3 justify-content-end">
                            <div class="col-4">
                                <button id="btn-tolak" class="btn w-100" style="background-color: #FF0000; color: white;">Tolak</button>
                            </div>
                            <div class="col-4">
                                <button id="btn-acc" class="btn btn-primary w-100">Setujui</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;

        // Event listener tombol
        this.querySelector('#btn-tolak')?.addEventListener('click', () => this.tolakAntrian());
        this.querySelector('#btn-acc')?.addEventListener('click', () => this.accAntrian());
    }

    async tolakAntrian() {
        // Ganti confirm() dengan custom modal
        if (!confirm('Yakin ingin menolak antrian ini?')) return;
        try {
            const id = window.location.hash.split('/')[2];
            // Gunakan authFetch dan URL backend yang benar
            const res = await authFetch(`https://backend-pusque-production.up.railway.app/antrian/${id}/tolak`, {
                method: 'PATCH',
            });
            const data = await res.json();
            if (res.ok) {
                alert('Antrian berhasil ditolak.'); // Ganti dengan custom modal
                window.location.hash = '#/pengajuan';
            } else {
                const data = await res.json().catch(() => ({ message: 'Respons non-JSON atau kosong.' }));
                alert(data.message || 'Gagal menolak antrian'); // Ganti dengan custom modal
            }
        } catch (err) {
            console.error("Error saat menolak antrian:", err);
            alert('Terjadi error saat menolak antrian'); // Ganti dengan custom modal
            // Redirect ke login jika error otentikasi
            if (err.message.includes("Authentikasi diperlukan") || err.message.includes("refresh token")) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userRole');
                window.location.hash = "#/login";
            }
        }
    }

    async accAntrian() {
        // Ganti confirm() dengan custom modal
        if (!confirm('Yakin ingin menyetujui antrian ini?')) return;
        try {
            const id = window.location.hash.split('/')[2];
        
            // Ambil data detail antrian dulu (gunakan authFetch dan URL backend yang benar)
            const resDetail = await authFetch(`https://backend-pusque-production.up.railway.app/antrian/${id}`);
            const antrianData = await resDetail.json();
        
            // Jalankan prediksi durasi dan jam masuk
            const prediction = await this.predictDurations(antrianData);
        
            if (prediction) {
                console.log("✅ Hasil Prediksi:");
                console.log("Estimasi Masuk (menit):", prediction.entryMinutes);
                console.log("Estimasi Durasi (menit):", prediction.durationMinutes);
        
                // Simpan ke variabel global (opsional)
                this.predictedDuration = prediction.durationMinutes;
                this.predictedEntry = prediction.entryMinutes;
        
                // PATCH hasil prediksi ke backend (gunakan authFetch dan URL backend yang benar)
                await authFetch(`https://backend-pusque-production.up.railway.app/antrian/${id}/prediksi`, {
                    method: 'PATCH',
                    // authFetch sudah menangani headers['Content-Type'], credentials
                    body: JSON.stringify({
                        durationMinutes: prediction.durationMinutes,
                        entryMinutes: prediction.entryMinutes
                    })
                });
            }
        
            // Kirim permintaan ACC (gunakan authFetch dan URL backend yang benar)
            const res = await authFetch(`https://backend-pusque-production.up.railway.app/antrian/${id}/acc`, {
                method: 'PATCH',
            });
            const data = await res.json();
        
            if (res.ok) {
                alert('Antrian berhasil disetujui.'); // Ganti dengan custom modal
                window.location.hash = '#/pengajuan';
            } else {
                const data = await res.json().catch(() => ({ message: 'Respons non-JSON atau kosong.' }));
                alert(data.message || 'Gagal menyetujui antrian'); // Ganti dengan custom modal
            }
        } catch (err) {
            console.error("❌ Error saat menyetujui antrian:", err.message);
            alert('Terjadi error saat menyetujui antrian'); // Ganti dengan custom modal
            // Redirect ke login jika error otentikasi
            if (err.message.includes("Authentikasi diperlukan") || err.message.includes("refresh token")) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userRole');
                window.location.hash = "#/login";
            }
        }
    }
    
    async predictDurations(antrianData) {
        try {
            const createdAt = new Date(antrianData.createdAt);
            const year = createdAt.getFullYear();
            const month = createdAt.getMonth() + 1;
            const day = createdAt.getDate();
            const dayOfWeek = createdAt.getDay(); // 0 = Minggu, 1 = Senin, dst
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0;
            const quarter = Math.floor((month - 1) / 3) + 1;
        
            const poliMap = {
                "Poli_Gigi": [0.05, 0, 0, 0],
                "Poli_KIA_KB": [0, 0.05, 0, 0],
                "Poli_Lansia": [0, 0, 0.05, 0],
                "Poli_Umum": [0, 0, 0, 0.65],
            };
            const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);
            const poliKey = `Poli_${capitalize(antrianData.poli)}`;
            const poliInput = poliMap[poliKey] || [0, 0, 0, 0];
        
            const inputEntry = {
                input: {
                    TotalDelayTime: 151.22,
                    TriageToProviderStartTime: 49.53,
                    TestsToDischargeTime: 44.88,
                    ProviderEndToTestsCompleteTime: 38.27,
                    Department_Poli_Gigi: poliInput[0],
                    Department_Poli_KIA_KB: poliInput[1],
                    Department_Poli_Lansia: poliInput[2],
                    Department_Poli_Umum: poliInput[3],
                    ProvidersOnShift: 4,
                    NursesOnShift: 15,
                    StaffToPatientRatio: 0.3,
                    Year: year,
                    Month: month,
                    Day: day,
                    DayOfWeek: dayOfWeek,
                    IsWeekend: isWeekend,
                    Quarter: quarter
                }
            };
        
            const inputDuration = {
                input: {
                    FacilityOccupancyRate: 0.63,
                    ProvidersOnShift: 4,
                    NursesOnShift: 15,
                    StaffToPatientRatio: 0.3,
                    IsRegistered: 0.0,
                    IsOnlineBooking: 1.0,
                    Year: year,
                    Day: day,
                    IsWeekend: isWeekend,
                    Quarter: quarter,
                    ArrivalDelayTime: -10.025,
                    RegistrationWaitTimeTime: 5.982510967,
                    RegistrationToCheckInTime: -2.9860069,
                    CheckInToNurseTime: 3.0696716915,
                    NurseToTriageCompleteTime: 3.949069575,
                    TriageToProviderStartTime: 38.2,
                    ConsultationDurationTime: 17.958333335,
                    ProviderEndToTestsCompleteTime: 33.325,
                    TestsToDischargeTime: 22.166666665,
                    TotalTimeInHospital: 156.93333335,
                    TotalDelayTime: 144.8583333,
                    ArrivalHour: 12.0,
                    ArrivalDayOfWeek: dayOfWeek,
                    ArrivalMonth: month,
                    RegistrationTime_missing: 1.0,
                    TimeFromArrivalToNurse: 319.4,
                    TimeFromNurseToDoctor: 216.35,
                    AppointmentHour: 12.0,
                    VisitDayOfWeek: dayOfWeek,
                    VisitMonth: month,
                    VisitYear: year,
                    VisitDayOfMonth: day
                }
            };
        
            const [resEntry, resDuration] = await Promise.all([
                // Permintaan ke prediksi API eksternal (tidak perlu authFetch)
                fetch('https://prediksi-akhmadramedhonjl3858-dgkc9iy9.leapcell.dev/predict-duration', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(inputDuration)
                }).then(res => res.json()),

                // Permintaan ke prediksi API eksternal (tidak perlu authFetch)
                fetch('https://prediksi-akhmadramedhonjl3858-dgkc9iy9.leapcell.dev/predict-entry', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(inputEntry)
                }).then(res => res.json())
            ]);
        
            return {
                durationMinutes: resDuration.prediction_minutes,
                entryMinutes: resEntry.prediction_minutes
            };
        } catch (err) {
            console.error("❌ Error during prediction:", err.message);
            return null;
        }
    }
}

if (!customElements.get('admin-detail-pengajuan')) {
    customElements.define('admin-detail-pengajuan', AdminDetailPengajuan);
}
