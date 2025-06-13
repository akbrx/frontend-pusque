class FeedbackPage extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = `<div class="loading-feedback">Loading...</div>`;
    let riwayat = [];
    let feedbacks = [];
    try {
      // Ambil riwayat antrian selesai user
      const res = await fetch('http://localhost:5000/antrian/riwayat', { credentials: 'include' });
      riwayat = await res.json();
      // Ambil feedback yang sudah pernah diberikan user
      const resFb = await fetch('http://localhost:5000/feedback/user', { credentials: 'include' });
      feedbacks = await resFb.json();
    } catch (err) {
      this.innerHTML = `<div class="text-danger">Gagal mengambil data riwayat/feedback.</div>`;
      return;
    }
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
        if (!rating) {
          document.getElementById('feedback-message').textContent = 'Silakan pilih rating bintang!';
          return;
        }
        try {
          const res = await fetch('http://localhost:5000/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ antrianId, rating, komentar })
          });
          if (res.ok) {
            document.getElementById('feedback-message').textContent = 'Feedback berhasil dikirim!';
            this.connectedCallback(); // reload data
          } else {
            const data = await res.json();
            document.getElementById('feedback-message').textContent = data.message || 'Gagal mengirim feedback';
          }
        } catch (err) {
          document.getElementById('feedback-message').textContent = 'Gagal mengirim feedback';
        }
      });
    });
  }
}

if (!customElements.get('feedback-page')) {
  customElements.define('feedback-page', FeedbackPage);
}