import { authFetch } from "../../fatchauth.js"; // Import authFetch

class FeedbackPage extends HTMLElement {
    async connectedCallback() {
        this.innerHTML = `<div class="loading-feedback">Loading...</div>`;

        // Tidak perlu mendapatkan token secara manual, authFetch akan menanganinya
        // const token = localStorage.getItem('accessToken');
        // if (!token) { ... } // authFetch akan melempar error jika token tidak ada

        let riwayat = [];
        let feedbacks = [];

        try {
            // Ambil riwayat antrian yang selesai milik user (gunakan authFetch dan URL backend yang benar)
            const resRiwayat = await authFetch('https://backend-pusque-production.up.railway.app/antrian/riwayat', {
                method: 'GET',
            });

            // Ambil feedback yang sudah pernah dikirim (gunakan authFetch dan URL backend yang benar)
            const resFb = await authFetch('https://backend-pusque-production.up.railway.app/feedback/user', {
                method: 'GET',
            });

            // Pastikan respons OK sebelum parsing JSON
            if (!resRiwayat.ok) {
                const errText = await resRiwayat.text(); // Baca sebagai teks untuk debugging
                throw new Error(`Gagal mengambil data riwayat: ${resRiwayat.status} - ${errText}`);
            }
            if (!resFb.ok) {
                const errText = await resFb.text(); // Baca sebagai teks untuk debugging
                throw new Error(`Gagal mengambil data feedback: ${resFb.status} - ${errText}`);
            }

            riwayat = await resRiwayat.json();
            feedbacks = await resFb.json();

        } catch (err) {
            console.error("Fetch Error:", err);
            this.innerHTML = `<div class="text-danger">Gagal mengambil data riwayat/feedback.<br>${err.message}</div>`;
            // Redirect ke login jika error otentikasi
            if (err.message.includes("Authentikasi diperlukan") || err.message.includes("refresh token")) {
                alert("Sesi Anda telah berakhir atau token tidak valid. Silakan login kembali."); // Ganti dengan custom modal
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userRole');
                window.location.hash = "#/login";
            }
            return;
        }

        // Render jika semua data sudah berhasil diambil
        this.render(riwayat, feedbacks);
    }


    render(riwayat, feedbacks) {
        this.innerHTML = `
            <style>
                .feedback-container {
                    max-width: 900px;
                    margin: 2rem auto;
                    background: #fff;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
                    padding: 2rem;
                }
                h2 {
                    text-align: center;
                    margin-bottom: 2rem;
                    color: #407BFF;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 1rem;
                }
                th, td {
                    padding: 0.8rem;
                    border-bottom: 1px solid #eee;
                    text-align: center;
                }
                th {
                    background: #f6f8fa;
                    color: #407BFF;
                }
                tr:last-child td {
                    border-bottom: none;
                }
                .feedback-form {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                }
                .star-rating {
                    display: flex;
                    flex-direction: row-reverse;
                    justify-content: center;
                }
                .star-rating input[type="radio"] {
                    display: none;
                }
                .star-rating label {
                    font-size: 1.5rem;
                    color: #ccc;
                    cursor: pointer;
                    transition: color 0.2s;
                }
                .star-rating input[type="radio"]:checked ~ label,
                .star-rating label:hover,
                .star-rating label:hover ~ label {
                    color: #FFD600;
                }
                .feedback-comment {
                    width: 100%;
                    max-width: 250px;
                    padding: 0.5rem;
                    border-radius: 5px;
                    border: 1px solid #ccc;
                }
                .feedback-form button {
                    background: #407BFF;
                    color: #fff;
                    border: none;
                    padding: 0.5rem 1.2rem;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    margin-top: 0.5rem;
                }
                .feedback-form button:hover {
                    background: #265bb5;
                }
                .feedback-result {
                    text-align: left;
                }
                .feedback-result .stars {
                    color: #FFD600;
                    font-size: 1.2rem;
                }
                .feedback-result .comment {
                    color: #333;
                    font-size: 0.95rem;
                }
                .no-data {
                    text-align: center;
                    color: #888;
                    padding: 2rem 0;
                }
                @media (max-width: 700px) {
                    .feedback-container { padding: 0.5rem; }
                    th, td { font-size: 0.95rem; padding: 0.5rem; }
                }
            </style>
            <div class="feedback-container">
                <h2>Feedback Pelayanan</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th>Poli</th>
                            <th>Keluhan</th>
                            <th>Feedback</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${
                            riwayat.length === 0
                                ? `<tr><td colspan="4" class="no-data">Belum ada riwayat antrian selesai.</td></tr>`
                                : riwayat.map(antrian => {
                                    const fb = feedbacks.find(f => f.antrianId === antrian.id);
                                    return `
                                        <tr>
                                            <td>${new Date(antrian.updatedAt).toLocaleDateString()}</td>
                                            <td>${antrian.poli.charAt(0).toUpperCase() + antrian.poli.slice(1)}</td>
                                            <td>${antrian.keluhan}</td>
                                            <td>
                                                ${
                                                    fb
                                                        ? `<div class="feedback-result">
                                                                <div class="stars">${'★'.repeat(fb.rating)}${'☆'.repeat(5-fb.rating)}</div>
                                                                <div class="comment">${fb.komentar ? fb.komentar : '<span style="color:#aaa;">(Tanpa komentar)</span>'}</div>
                                                            </div>`
                                                        : `
                                                            <form class="feedback-form" data-antrianid="${antrian.id}">
                                                                <div class="star-rating">
                                                                    <input type="radio" id="star5-${antrian.id}" name="rating" value="5" required /><label for="star5-${antrian.id}" title="5 stars">★</label>
                                                                    <input type="radio" id="star4-${antrian.id}" name="rating" value="4" /><label for="star4-${antrian.id}" title="4 stars">★</label>
                                                                    <input type="radio" id="star3-${antrian.id}" name="rating" value="3" /><label for="star3-${antrian.id}" title="3 stars">★</label>
                                                                    <input type="radio" id="star2-${antrian.id}" name="rating" value="2" /><label for="star2-${antrian.id}" title="2 stars">★</label>
                                                                    <input type="radio" id="star1-${antrian.id}" name="rating" value="1" /><label for="star1-${antrian.id}" title="1 star">★</label>
                                                                </div>
                                                                <input class="feedback-comment" type="text" name="komentar" placeholder="Komentar (opsional)" maxlength="200" />
                                                                <button type="submit">Kirim</button>
                                                            </form>
                                                        `
                                                }
                                            </td>
                                        </tr>
                                    `;
                                }).join('')
                        }
                    </tbody>
                </table>
                <div id="feedback-message" class="mt-2"></div>
            </div>
        `;

        // Event submit feedback
        this.querySelectorAll('.feedback-form').forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const antrianId = form.getAttribute('data-antrianid');
                const rating = form.querySelector('input[name="rating"]:checked')?.value;
                const komentar = form.komentar.value;
                const feedbackMessageDiv = this.querySelector('#feedback-message'); // Ambil elemen pesan

                if (!rating) {
                    feedbackMessageDiv.textContent = 'Silakan pilih rating bintang!';
                    return;
                }
                try {
                    // Gunakan authFetch dan URL backend yang benar untuk POST feedback
                    const res = await authFetch('https://backend-pusque-production.up.railway.app/feedback', {
                        method: 'POST',
                        // authFetch sudah menangani headers dan credentials
                        body: JSON.stringify({ antrianId, rating, komentar })
                    });
                    
                    if (res.ok) {
                        feedbackMessageDiv.textContent = 'Feedback berhasil dikirim!';
                        this.connectedCallback(); // reload data
                    } else {
                        const data = await res.json().catch(() => ({ message: 'Respons non-JSON atau kosong.' }));
                        feedbackMessageDiv.textContent = data.message || 'Gagal mengirim feedback';
                    }
                } catch (err) {
                    console.error("Error mengirim feedback:", err);
                    feedbackMessageDiv.textContent = 'Gagal mengirim feedback. Silakan login kembali.';
                    // Redirect ke login jika error otentikasi
                    if (err.message.includes("Authentikasi diperlukan") || err.message.includes("refresh token")) {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('userRole');
                        window.location.hash = "#/login";
                    }
                }
            });
        });
    }
}

if (!customElements.get('feedback-page')) {
    customElements.define('feedback-page', FeedbackPage);
}
