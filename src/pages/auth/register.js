import loginimg from "../../assets/images/login.png";

export function renderRegisterForm(onRegisterSuccess) {
    const app = document.getElementById('app');
    app.innerHTML = `
    <style>
        /* Import Font */
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');

        .register-section {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 90vh;
            padding: 2rem 1rem; /* Tambah padding atas bawah */
            font-family: 'Poppins', sans-serif;
            background-color: #f3f4f6;
        }

        .register-container {
            display: flex;
            width: 100%;
            max-width: 900px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        /* Wrapper untuk form di sisi kiri */
        .register-form-wrapper {
            width: 100%; /* Full width di mobile */
            padding: 2rem 2.5rem;
            overflow-y: auto; /* Agar bisa scroll jika konten panjang di mobile */
        }

        /* Wrapper untuk gambar di sisi kanan */
        .register-image-wrapper {
            display: none; /* Sembunyikan gambar di mobile */
            width: 50%;
            background-image: url(${loginimg});
            background-size: cover;
            background-position: center;
        }

        .register-form-wrapper h2 {
            font-weight: 600;
            font-size: 2rem;
            margin-bottom: 0.5rem;
            color: #111827;
        }

        .register-form-wrapper .subtitle {
            color: #6b7280;
            margin-bottom: 2rem;
        }

        .form-grid {
            display: grid;
            gap: 1.25rem; /* Jarak antar input */
        }

        .form-input, .form-control {
            width: 100%;
            padding: 0.8rem 1rem;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 1rem;
            font-family: 'Poppins', sans-serif;
            transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-input:focus, .form-control:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }
        
        /* Styling khusus untuk input file */
        .form-control[type="file"] {
            padding: 0.65rem 1rem;
        }
        .form-control[type="file"]::file-selector-button {
            margin: -0.65rem 1rem -0.65rem -1rem; /* Trick agar tombol menempel */
            padding: 0.65rem 1rem;
            border: none;
            background-color: #e5e7eb;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        .form-control[type="file"]:hover::file-selector-button {
            background-color: #d1d5db;
        }

        .submit-btn {
            width: 100%;
            padding: 0.8rem;
            border: none;
            border-radius: 8px;
            background-color: #3b82f6;
            color: white;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
            margin-top: 0.5rem;
        }

        .submit-btn:hover {
            background-color: #2563eb;
        }

        .message {
            min-height: 24px;
            font-weight: 500;
            margin-top: 1rem;
        }
        
        .text-success { color: #16a34a; }
        .text-danger { color: #dc2626; }

        .login-link {
            text-align: center;
            margin-top: 1.5rem;
            color: #6b7280;
        }

        .login-link a {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 500;
        }

        .login-link a:hover {
            text-decoration: underline;
        }

        #loading-spinner {
            display: none;
            text-align: center;
            margin-top: 1rem;
        }
        .spinner {
            margin: 0 auto 8px auto;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Aturan untuk layar yang lebih besar (Tablet dan Desktop) */
        @media (min-width: 768px) {
            .register-form-wrapper {
                width: 50%;
            }
            .register-image-wrapper {
                display: block;
            }
            .form-grid {
                grid-template-columns: 1fr 1fr; /* Dua kolom untuk input */
                gap: 1rem 1.25rem;
            }
            .form-group.full-width {
                grid-column: 1 / -1; /* Mengambil lebar penuh */
            }
        }
    </style>

    <section class="register-section">
        <div class="register-container">
            <!-- Form Register -->
            <div class="register-form-wrapper">
                <h2>Buat Akun Baru</h2>
                <p class="subtitle">Isi data diri Anda dengan lengkap dan benar.</p>
                <form id="registerForm">
                    <div class="form-grid">
                        <div class="form-group full-width">
                            <input type="text" id="name" class="form-input" placeholder="Nama Lengkap" required />
                        </div>
                        <div class="form-group">
                            <input type="text" id="nik" class="form-input" placeholder="NIK (16 digit)" required pattern="[0-9]{16}" title="NIK harus terdiri dari 16 digit angka." />
                        </div>
                        <div class="form-group">
                            <input type="date" id="tanggalLahir" class="form-input" placeholder="Tanggal Lahir" required />
                        </div>
                        <div class="form-group full-width">
                            <input type="text" id="domisili" class="form-input" placeholder="Domisili (contoh: Kota Padang)" required />
                        </div>
                        <div class="form-group">
                            <input type="password" id="password" class="form-input" placeholder="Password" required />
                        </div>
                        <div class="form-group">
                            <input type="password" id="confPassword" class="form-input" placeholder="Konfirmasi Password" required />
                        </div>
                        <div class="form-group full-width">
                             <label for="fotoKtp" class="form-label" style="font-size: 0.9em; color: #6b7280;">Unggah Foto KTP Anda</label>
                            <input type="file" id="fotoKtp" name="fotoKtp" accept="image/*" class="form-control" required />
                        </div>
                    </div>
                    
                    <button type="submit" class="submit-btn">Register</button>
                    
                    <div id="loading-spinner">
                        <div class="spinner"></div>
                        <div>Memvalidasi data...</div>
                    </div>
                    
                    <div class="message text-center" id="regMessage"></div>
                </form>
                <p class="login-link">
                    Sudah punya akun? <a href="#/login">Login di sini</a>
                </p>
            </div>
            <!-- Gambar Register (hanya muncul di desktop) -->
            <div class="register-image-wrapper"></div>
        </div>
    </section>
    `;

    const form = document.getElementById('registerForm');
    const loadingSpinner = document.getElementById('loading-spinner');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        loadingSpinner.style.display = 'block';
        const submitButton = form.querySelector('.submit-btn');
        submitButton.disabled = true; // Nonaktifkan tombol saat loading
        submitButton.textContent = 'Memproses...';

        const name = document.getElementById('name').value.trim();
        const nik = document.getElementById('nik').value.trim();
        const tanggalLahir = document.getElementById('tanggalLahir').value;
        const domisili = document.getElementById('domisili').value.trim();
        const password = document.getElementById('password').value;
        const confPassword = document.getElementById('confPassword').value;
        const messageDiv = document.getElementById('regMessage');
        messageDiv.textContent = '';
        messageDiv.className = 'message text-center';

        if (password !== confPassword) {
            messageDiv.classList.add('text-danger');
            messageDiv.textContent = 'Password dan konfirmasi password tidak sama!';
            loadingSpinner.style.display = 'none';
            submitButton.disabled = false;
            submitButton.textContent = 'Register';
            return;
        }

        const registerData = new FormData();
        registerData.append('name', name);
        registerData.append('nik', nik);
        registerData.append('tanggalLahir', tanggalLahir);
        registerData.append('domisili', domisili);
        registerData.append('password', password);
        registerData.append('confPassword', confPassword);
        
        const fotoKtpFile = document.getElementById('fotoKtp').files[0];
        if (fotoKtpFile) {
            registerData.append('fotoKtp', fotoKtpFile);
        } else {
            messageDiv.classList.add('text-danger');
            messageDiv.textContent = 'Foto KTP wajib diunggah!';
            loadingSpinner.style.display = 'none';
            submitButton.disabled = false;
            submitButton.textContent = 'Register';
            return;
        }

        try {
            const res = await fetch('https://backend-pusque-production.up.railway.app/users', {
                method: 'POST',
                body: registerData,
            });

            const responseData = await res.json();
            
            if (res.ok) {
                messageDiv.classList.add('text-success');
                messageDiv.textContent = 'Register berhasil! Anda akan diarahkan ke halaman login.';
                form.reset();
                setTimeout(() => {
                    if (typeof onRegisterSuccess === 'function') {
                        onRegisterSuccess();
                    } else {
                        window.location.hash = "#/login";
                    }
                }, 2000);
            } else {
                messageDiv.classList.add('text-danger');
                messageDiv.textContent = responseData.message || 'Register gagal. Periksa kembali data Anda.';
            }
        } catch (err) {
            console.error("Error saat registrasi:", err);
            messageDiv.classList.add('text-danger');
            messageDiv.textContent = 'Terjadi error koneksi ke server.';
        } finally {
            loadingSpinner.style.display = 'none';
            submitButton.disabled = false;
            submitButton.textContent = 'Register';
        }
    });
}