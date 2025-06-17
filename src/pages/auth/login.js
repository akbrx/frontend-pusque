// login.js
import loginimg from "../../assets/images/login.png";

export function renderLoginForm(onLoginSuccess) {
    var app = document.getElementById('app');
    app.innerHTML = `
    <style>
        /* Import Font */
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');

        .login-section {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 90vh; /* Mengisi tinggi layar */
            padding: 1rem;
            font-family: 'Poppins', sans-serif;
            background-color: #f3f4f6; /* Warna latar belakang abu-abu muda */
        }

        .login-container {
            display: flex;
            width: 100%;
            max-width: 900px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        /* Wrapper untuk form di sisi kiri */
        .login-form-wrapper {
            width: 100%; /* Full width di mobile */
            padding: 2.5rem;
        }

        /* Wrapper untuk gambar di sisi kanan */
        .login-image-wrapper {
            display: none; /* Sembunyikan gambar di mobile */
            width: 50%;
            background-image: url(${loginimg});
            background-size: cover;
            background-position: center;
        }

        .login-form-wrapper h2 {
            font-weight: 600;
            font-size: 2rem;
            margin-bottom: 0.5rem;
            color: #111827;
        }

        .login-form-wrapper .subtitle {
            color: #6b7280;
            margin-bottom: 2rem;
        }

        .form-group {
            margin-bottom: 1.25rem;
        }

        .form-input {
            width: 100%;
            padding: 0.8rem 1rem;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
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
        }

        .submit-btn:hover {
            background-color: #2563eb;
        }

        .message {
            min-height: 24px; /* Beri ruang agar layout tidak "loncat" */
            font-weight: 500;
        }
        
        .text-success { color: #16a34a; }
        .text-danger { color: #dc2626; }

        .register-link {
            text-align: center;
            margin-top: 1.5rem;
            color: #6b7280;
        }

        .register-link a {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 500;
        }

        .register-link a:hover {
            text-decoration: underline;
        }

        /* Aturan untuk layar yang lebih besar (Tablet dan Desktop) */
        @media (min-width: 768px) {
            .login-form-wrapper {
                width: 50%;
            }
            .login-image-wrapper {
                display: block; /* Tampilkan kembali gambar */
            }
        }
    </style>

    <section class="login-section">
        <div class="login-container">
            <div class="login-form-wrapper">
                <h2>Login</h2>
                <p class="subtitle">Silahkan login menggunakan akun Anda.</p>
                <form id="loginForm">
                    <div class="form-group">
                        <input type="text" id="nik" class="form-input" placeholder="Nomor Induk Kependudukan (NIK)" required />
                    </div>
                    <div class="form-group">
                        <input type="password" id="password" class="form-input" placeholder="Password" required />
                    </div>
                    <div class="form-group">
                        <button type="submit" class="submit-btn">Login</button>
                    </div>
                    <div class="message text-center" id="message"></div>
                </form>
                <p class="register-link">
                    Belum punya akun? <a href="#/register">Register di sini</a>
                </p>
            </div>
            <div class="login-image-wrapper"></div>
        </div>
    </section>
    `;

    var form = document.getElementById('loginForm');
    var nikInput = document.getElementById('nik');
    var passwordInput = document.getElementById('password');
    var messageDiv = document.getElementById('message');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        var nik = nikInput.value.trim();
        var password = passwordInput.value.trim();
        messageDiv.textContent = '';
        messageDiv.classList.remove('text-success', 'text-danger');

        fetch('https://backend-pusque-production.up.railway.app/login', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nik: nik, password: password })
        })
        .then(function (res) {
            return res.json().then(function (data) {
                if (!res.ok) {
                    console.error("[LOGIN] Login Gagal:", data);
                    messageDiv.classList.add('text-danger');
                    messageDiv.textContent = data.message || 'NIK atau Password salah';
                    return;
                }
        
                if (!data.accessToken || typeof data.accessToken !== 'string' || data.accessToken.trim() === '') {
                    console.error("[DEBUG - LOGIN] data.accessToken tidak valid atau kosong.");
                    messageDiv.classList.add('text-danger');
                    messageDiv.textContent = 'Token tidak valid dari server. Coba login ulang.';
                    return;
                }
        
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('userRole', data.role);
        
                console.log("[LOGIN] Login Berhasil. Role:", data.role);
        
                messageDiv.classList.add('text-success');
                messageDiv.textContent = 'Login berhasil! Mengarahkan...';
                setTimeout(function () {
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
            messageDiv.textContent = 'Terjadi error koneksi. Periksa jaringan Anda.';
            console.error("[LOGIN] Error koneksi saat login:", err);
        });
    });
}