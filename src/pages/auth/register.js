import loginimg from "../../assets/images/login.png"
// Tidak perlu mengimpor authFetch di sini karena register biasanya tidak memerlukan token
// dan FormData ditangani langsung oleh fetch native tanpa set header manual
// import { authFetch } from "../../fatchauth.js";

export function renderRegisterForm(onRegisterSuccess) {
    const app = document.getElementById('app');
    app.innerHTML = `
    <section class="container py-5">
    <div class="d-flex justify-content-center align-items-center min-vh-10">
        <div class="card shadow" style="width: 100%; max-width: 800px; border-radius: 15px;">
            <div class="card-body p-0">
                <div class="d-flex" style="height: 100%;">
                    <!-- Form Register (50%) -->
                    <div class="register-wrap p-4 p-md-5" style="width: 50%;">
                        <h2 class="mb-3 text-start">Register</h2>
                        <p class="mb-3 text-start small">Silakan isi data untuk membuat akun baru.</p>
                        <form id="registerForm" class="register-form">
                            <div class="form-floating mb-3">
                                <input type="text" id="name" class="form-control" placeholder="Nama" required />
                                <label for="name">Nama</label>
                            </div>
                            <div class="form-floating mb-3">
                                <input type="text" id="nik" class="form-control" placeholder="NIK" required />
                                <label for="nik">NIK</label>
                            </div>
                            <div class="form-floating mb-3">
                                <input type="date" id="tanggalLahir" class="form-control" placeholder="Tanggal Lahir" required />
                                <label for="tanggalLahir">Tanggal Lahir</label>
                            </div>
                            <div class="form-floating mb-3">
                                <input type="text" id="domisili" class="form-control" placeholder="Domisili" required />
                                <label for="domisili">Domisili</label>
                            </div>
                            <div class="form-floating mb-3">
                                <input type="password" id="password" class="form-control" placeholder="Password" required />
                                <label for="password">Password</label>
                            </div>
                            <div class="form-floating mb-3">
                                <input type="password" id="confPassword" class="form-control" placeholder="Konfirmasi Password" required />
                                <label for="confPassword">Konfirmasi Password</label>
                            </div>
                            <div class="mb-3">
                                <label for="fotoKtp" class="form-label">Foto KTP</label>
                                <input type="file" id="fotoKtp" name="fotoKtp" accept="image/*" class="form-control" required />
                            </div>
                            <button type="submit" class="btn btn-primary w-100 rounded submit px-3">Register</button>
                            <div class="message mt-2 text-center" id="regMessage"></div>
                            <div id="loading-spinner" style="display:none;" class="text-center mb-2">
                                <div class="spinner"></div>
                                <div style="font-size: 0.9em;">Memeriksa KTP...</div>
                            </div>
                            <p class="mt-3 text-center">
                                Sudah punya akun? <a href="#/login">Login di sini</a>
                            </p>
                        </form>
                    </div>

                    <!-- Gambar Register (50%) -->
                    <div class="register-img" style="width: 50%; background-image: url(${loginimg}); background-size: cover; background-position: center; border-radius: 15px;"></div>
                </div>
            </div>
        </div>
    </div>
</section>
    `;

    const form = document.getElementById('registerForm');
    const loadingSpinner = document.getElementById('loading-spinner');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        loadingSpinner.style.display = 'block'; // Tampilkan spinner
        
        const name = document.getElementById('name').value.trim();
        const nik = document.getElementById('nik').value.trim();
        const tanggalLahir = document.getElementById('tanggalLahir').value;
        const domisili = document.getElementById('domisili').value.trim();
        const password = document.getElementById('password').value;
        const confPassword = document.getElementById('confPassword').value;
        const messageDiv = document.getElementById('regMessage');
        messageDiv.textContent = '';

        // Validasi frontend: Password dan Konfirmasi Password harus sama
        if (password !== confPassword) {
            messageDiv.classList.remove('text-success');
            messageDiv.classList.add('text-danger');
            messageDiv.textContent = 'Password dan konfirmasi password tidak sama!';
            loadingSpinner.style.display = 'none';
            return;
        }

        // Buat FormData untuk mengirim file dan data lainnya
        const registerData = new FormData();
        registerData.append('name', name);
        registerData.append('nik', nik);
        registerData.append('tanggalLahir', tanggalLahir);
        registerData.append('domisili', domisili);
        registerData.append('password', password);
        registerData.append('confPassword', confPassword);
        
        // Pastikan file dipilih sebelum mencoba mengakses files[0]
        const fotoKtpFile = document.getElementById('fotoKtp').files[0];
        if (fotoKtpFile) {
            registerData.append('fotoKtp', fotoKtpFile);
        } else {
            messageDiv.classList.remove('text-success');
            messageDiv.classList.add('text-danger');
            messageDiv.textContent = 'Foto KTP wajib diunggah!';
            loadingSpinner.style.display = 'none';
            return;
        }

        try {
            // Gunakan fetch native. Hapus header 'Content-Type' untuk FormData.
            const res = await fetch('https://backend-pusque-production.up.railway.app/users', {
                method: 'POST',
                body: registerData,
            });

            // --- PERBAIKAN DI SINI: Baca body respons sekali saja ---
            let registerDataResponse;
            const responseText = await res.text(); // Baca body sebagai teks dulu
            try {
                registerDataResponse = JSON.parse(responseText); // Coba parse teks sebagai JSON
            } catch (jsonParseErr) {
                // Jika parsing JSON gagal, berarti respons bukan JSON.
                // Gunakan teks respons asli sebagai pesan error.
                console.error("Respon server bukan JSON yang valid. Error parsing:", jsonParseErr);
                throw new Error("Respon server tidak valid: " + responseText.substring(0, Math.min(responseText.length, 100)) + "...");
            }
            // --- AKHIR PERBAIKAN ---
            
            console.log('Respon server:', registerDataResponse);

            if (res.ok) {
                messageDiv.classList.remove('text-danger');
                messageDiv.classList.add('text-success');
                messageDiv.textContent = 'Register berhasil! Silakan login.';
                // Reset form setelah sukses
                form.reset();
                setTimeout(() => {
                    if (typeof onRegisterSuccess === 'function') {
                        onRegisterSuccess();
                    } else {
                        window.location.hash = "#/login";
                    }
                }, 1500);
            } else {
                messageDiv.classList.remove('text-success');
                messageDiv.classList.add('text-danger');
                messageDiv.textContent = registerDataResponse.message || 'Register gagal';
            }
        } catch (err) {
            console.error("Error koneksi atau respons tidak valid:", err); // Log error lengkap
            messageDiv.classList.remove('text-success');
            messageDiv.classList.add('text-danger');
            messageDiv.textContent = 'Terjadi error koneksi ke server atau format respons tidak valid.';
        } finally {
            loadingSpinner.style.display = 'none'; // Sembunyikan spinner
        }
    });

    // Tambahkan CSS spinner ke halaman
    const spinnerStyle = document.createElement('style');
    spinnerStyle.innerHTML = `
    .spinner {
        margin: 0 auto 8px auto;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        0% { transform: rotate(0deg);}
        100% { transform: rotate(360deg);}
    }
    `;
    document.head.appendChild(spinnerStyle);
}
