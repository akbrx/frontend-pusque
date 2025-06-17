    // login.js
    import loginimg from "../../assets/images/login.png"

    export function renderLoginForm(onLoginSuccess) {
        var app = document.getElementById('app');
        app.innerHTML = `
        <section class="container py-5">
        <div class="d-flex justify-content-center align-items-center min-vh-10">
            <div class="card shadow" style="width: 100%; max-width: 800px;  border-radius: 15px;">
                <div class="card-body p-0">
                    <div class="d-flex" style="height: 100%;">
                        <!-- Form Login (50%) -->
                        <div class="login-wrap p-4 p-md-5" style="width: 50%;">
                            <h2 class="mb-3 text-start">Login</h2>
                            <p class="mb-3 text-start small">Silahkan login menggunakan akun anda.</p>
                            <form id="loginForm" class="signin-form">
                                <div class="form-floating mb-3">
                                    <input type="text" id="nik" class="form-control" placeholder="NIK" required />
                                    <label for="nik">NIK</label>
                                </div>
                                <div class="form-floating mb-3">
                                    <input type="password" id="password" class="form-control" placeholder="Password" required />
                                    <label class="label" for="password">Password</label>
                                </div>
                                <div class="form-group">
                                    <button type="submit" class="form-control btn btn-primary rounded submit px-3">Login</button>
                                </div>
                                <div class="message mt-2 text-center" id="message"></div>
                                <div id="loading-spinner" style="display:none;" class="text-center mt-2">
                                    <div class="spinner"></div>
                                    <div style="font-size: 0.9em;">Memproses login...</div>
                                </div>
                                <p class="mt-3 text-center">
                                    Belum punya akun? <a href="#/register">Register di sini</a>
                                </p>
                            </form>
                        </div>

                        <!-- Gambar Login (50%) -->
                        <div class="login-img" style="width: 50%; background-image: url(${loginimg}); background-size: cover; background-position: center;  border-radius: 15px;"></div>
                    </div>
                </div>
            </div>
        </div>
    </section>
        `;

        var form = document.getElementById('loginForm');
        var nikInput = document.getElementById('nik');
        var passwordInput = document.getElementById('password');
        var messageDiv = document.getElementById('message');
        var loadingSpinner = document.getElementById('loading-spinner');
        var submitBtn = form.querySelector('button[type="submit"]');



        form.addEventListener('submit', function (e) {
            e.preventDefault();

            loadingSpinner.style.display = 'block';
            submitBtn.disabled = true;
          
            var nik = nikInput.value.trim();
            var password = passwordInput.value.trim();
            messageDiv.textContent = '';
            messageDiv.classList.remove('text-success', 'text-danger');

            fetch('https://backend-pusque-production.up.railway.app/login', { // Pastikan URL ini benar
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nik: nik, password: password })
            })
                .then(function (res) {
                return res.json().then(function (data) {
                    // --- Jika respons gagal (contoh: password salah, user tidak ditemukan) ---
                    if (!res.ok) {
                        console.error("[LOGIN] Login Gagal:", data);
                        messageDiv.classList.add('text-danger');
                        messageDiv.textContent = data.message || 'Login gagal';
                        return;
                    }
            
                    // --- LOGGING TAMBAHAN UNTUK DEBUGGING ---
                    console.log("[DEBUG - LOGIN] Nilai data.accessToken dari BE:", data.accessToken);
                    console.log("[DEBUG - LOGIN] Tipe data.accessToken:", typeof data.accessToken);
                    // --- AKHIR LOGGING TAMBAHAN ---
            
                    // --- Validasi token ---
                    if (!data.accessToken || typeof data.accessToken !== 'string' || data.accessToken.trim() === '') {
                        console.error("[DEBUG - LOGIN] data.accessToken tidak valid atau kosong. Tidak akan disimpan.");
                        messageDiv.classList.add('text-danger');
                        messageDiv.textContent = 'Token tidak valid dari server. Coba login ulang.';
                        return;
                    }
            
                    // --- Simpan token & redirect ---
                    localStorage.setItem('accessToken', data.accessToken);
                    localStorage.setItem('userRole', data.role);
            
                    console.log("[LOGIN] Login Berhasil. Token diterima:", data.accessToken);
                    console.log("[LOGIN] Token tersimpan di localStorage:", localStorage.getItem('accessToken'));
            
                    messageDiv.classList.add('text-success');
                    messageDiv.textContent = 'Login berhasil!';
                    setTimeout(function () {
                        // Redirect sesuai role
                        if (data.role === 'admin') {
                            window.location.hash = "#/beranda";
                        } else if (data.role === 'dokter') {
                            window.location.hash = "#/dokter";
                        } else {
                            if (typeof onLoginSuccess === 'function') {
                                onLoginSuccess();
                            } else {
                                window.location.hash = "#/";
                            }
                        }
                    }, 1000);
                });
            })
                .catch(function (err) {
                    messageDiv.classList.add('text-danger');
                    messageDiv.textContent = 'Terjadi error koneksi';
                    console.error("[LOGIN] Error koneksi saat login:", err);
                }) 
                .finally(() => {
                    loadingSpinner.style.display = 'none';
                    submitBtn.disabled = false;
                });
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
    