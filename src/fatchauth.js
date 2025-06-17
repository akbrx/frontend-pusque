// fatchauth.js

/**
 * Fungsi untuk melakukan fetch request dengan menyertakan token otentikasi dari localStorage.
 * Jika Access Token kadaluarsa (respons 401), fungsi ini akan mencoba me-refresh token
 * dan mengulangi request asli.
 *
 * @param {string} url - URL endpoint API yang akan di-fetch.
 * @param {Object} options - Objek opsi untuk fetch API (seperti method, headers, body).
 * @returns {Promise<Response>} - Promise yang menghasilkan objek Response dari fetch API.
 * @throws {Error} Jika token tidak ada, tidak dapat di-refresh, atau ada masalah jaringan/server.
 */
export async function authFetch(url, options = {}) {
    let accessToken = localStorage.getItem('accessToken');
    
    // --- LOGGING TAMBAHAN UNTUK DEBUGGING ---
    console.log(`[AUTH_FETCH] Memanggil authFetch untuk URL: ${url}`);
    console.log(`[AUTH_FETCH] Token dari localStorage: ${accessToken ? 'Ada' : 'Tidak Ada'}`);
    if (accessToken) {
        console.log(`[AUTH_FETCH] Tipe accessToken: ${typeof accessToken}`);
        // Gunakan Math.min untuk mencegah error jika string token lebih pendek dari 30 karakter
        console.log(`[AUTH_FETCH] Token (sebagian): ${accessToken.substring(0, Math.min(accessToken.length, 30))}...`);
    }
    // --- AKHIR LOGGING TAMBAHAN ---

    // Tambahkan kondisi untuk memeriksa jika accessToken adalah string "undefined", "null", atau string kosong
    // Ini menangani kasus di mana string "undefined" atau "null" disimpan di localStorage
    if (!accessToken || accessToken === 'undefined' || accessToken === 'null' || accessToken.trim() === '') {
        console.error("Error (authFetch): Access Token tidak ditemukan atau tidak valid di localStorage. Pengguna mungkin belum login.");
        throw new Error("Authentikasi diperlukan. Silakan login kembali.");
    }

    const initialHeaders = {
        ...options.headers,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
    };

    const fetchOptions = {
        ...options,
        headers: initialHeaders,
        credentials: 'include'
    };

    // --- LOGGING TAMBAHAN UNTUK DEBUGGING ---
    console.log(`[AUTH_FETCH] Header Authorization yang dikirim: ${fetchOptions.headers.Authorization}`);
    // --- AKHIR LOGGING TAMBAHAN ---

    let response = await fetch(url, fetchOptions);

    if (response.status === 401) {
        console.warn("[AUTH_FETCH] Access Token kadaluarsa atau tidak valid. Mencoba me-refresh token...");

        try {
            // URL ini sudah menggunakan URL deploy Anda yang benar
            const tokenRes = await fetch('https://backend-pusque-production.up.railway.app/token', {
                method: 'GET',
                credentials: 'include'
            });

            if (tokenRes.ok) {
                const tokenData = await tokenRes.json();
                const newAccessToken = tokenData.accessToken;

                // --- LOGGING TAMBAHAN UNTUK DEBUGGING ---
                console.log("[AUTH_FETCH] Refresh token berhasil. Token baru diterima:", newAccessToken ? 'Ada' : 'Tidak Ada');
                if (newAccessToken) {
                    console.log(`[AUTH_FETCH] Tipe newAccessToken: ${typeof newAccessToken}`);
                    console.log(`[AUTH_FETCH] Token baru (sebagian): ${newAccessToken.substring(0, Math.min(newAccessToken.length, 30))}...`);
                }
                // --- AKHIR LOGGING TAMBAHAN ---

                // Pastikan newAccessToken adalah string yang valid, bukan "undefined", "null", atau kosong
                if (!newAccessToken || newAccessToken === 'undefined' || newAccessToken === 'null' || newAccessToken.trim() === '') {
                    throw new Error('Refresh token berhasil, tetapi accessToken baru tidak valid atau kosong.');
                }

                localStorage.setItem('accessToken', newAccessToken);
                accessToken = newAccessToken;

                console.log("[AUTH_FETCH] Access Token berhasil di-refresh. Mengulang request asli...");

                fetchOptions.headers['Authorization'] = `Bearer ${accessToken}`;
                response = await fetch(url, fetchOptions);
            } else {
                const errorData = await tokenRes.json().catch(() => ({ message: 'Tidak dapat refresh token.' }));
                console.error("[AUTH_FETCH] Gagal me-refresh token:", errorData);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userRole');
                throw new Error(errorData.message || 'Tidak dapat me-refresh token. Silakan login kembali.');
            }
        } catch (refreshError) {
            console.error("[AUTH_FETCH] Error selama proses refresh token:", refreshError);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userRole');
            throw new Error(refreshError.message || 'Terjadi masalah saat me-refresh token. Silakan login kembali.');
        }
    }

    return response;
}
