import ktpimg from "../assets/images/ktp.jpg"
class ProfileView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    // Fetch data user yang sedang login
    let user = {};
    try {
      const res = await fetch('http://localhost:5000/user/me', { credentials: 'include' });
      if (!res.ok) throw new Error('Gagal mengambil data user');
      user = await res.json();
    } catch (err) {
      user = { name: '-', nik: '-', tanggalLahir: '-', domisili: '-', fotoKtp: '' };
      console.error(err);
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .card-profile {
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          max-width: 900px;
          width: 100%;
          display: flex;
          gap: 1.5rem;
          margin-top: 40px;
        }
        .left-profile {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .left-profile img.profile {
          width: 120px;
          height: 120px;
          border-radius: 10px;
          background: #e0e0e0;
        }
        .edit-btn {
          margin-top: 1rem;
          padding: 5px 20px;
          background: #2979ff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .right-profile {
          flex: 1;
          padding: 30px;
        }
        .right-profile .nama {
          font-weight: bold;
          font-size: 1.2rem;
        }
        .right-profile .label {
          font-weight: 500;
        }
        .info-line {
          margin: 0.5rem 0;
          display: flex;
          justify-content: space-beetwen;
          align-items: flex-start;
          gap: 0.5rem;
        }
        .info-line span {
          display: inline-block;
          width: 50%;
          flex-shrink: 0;
        }
        .info-line p {
          display: inline-block;
          flex-shrink: 0;
          margin: 0;
        }
        hr {
          border: none;
          border-top: 1px solid #ddd;
          margin: 1rem 0;
        }
        .ktp-img {
          width: 50%;
          border-radius: 6px;
        }
         @media (max-width: 500px) {
          .card-profile {
            flex-direction: column;
            box-shadow: none;

          }
          .info-line {
            display: flex;
            justify-content: space-beetwen;
          }
          
          .info-line span.label {
            width : 40%
          }
          .info-line p {
            min-width: 120px;
          }
        }
        
      </style>
      <div class="card-profile">
        <div class="left-profile">
          <img class="profile" src="https://img.icons8.com/ios-filled/100/user.png" alt="profile" />
          <button class="edit-btn">Edit</button>
        </div>
        <div class="right-profile">
          <div class="info-line-nama">
            <span class="label">Nama :</span> 
            <h3 class="nama">${user.name || '-'}</h3>
          </div>
          <hr />
          <div class="info-line">
            <span class="label">NIK </span> 
            <p>: ${user.nik || '-'}</p>
          </div>
          <div class="info-line">
            <span class="label">Tanggal Lahir </span> 
            <p>: ${user.tanggalLahir || '-'}</p>
          </div>
          <div class="info-line">
            <span class="label">Domisili</span> 
            <p>: ${user.domisili || '-'}</p>
          </div>
          <div class="info-line">
            <span class="label">KTP</span>
            <img class="ktp-img" src="${user.fotoKtp ? `http://localhost:5000/uploads/ktp/${user.fotoKtp}` : ktpimg}" alt="KTP" />
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('profile-view', ProfileView);
