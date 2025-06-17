class NotFoundPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        .not-found {
          text-align: center;
          padding: 100px 20px;
          font-family: Arial, sans-serif;
        }

        h1 {
          font-size: 4rem;
          color: #407BFF;
        }

        p {
          font-size: 1.2rem;
          color: #333;
        }

        a {
          color: #407BFF;
          text-decoration: none;
          font-weight: bold;
        }
      </style>

      <div class="not-found">
        <h1>404</h1>
        <p>Halaman yang kamu cari tidak ditemukan.</p>
        <p><a href="#/">Kembali ke Beranda</a></p>
      </div>
    `;
  }
}

customElements.define("not-found-page", NotFoundPage);
