class MyNavbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  render() {
      const role = localStorage.getItem("userRole");
      const currentHash = window.location.hash;
    
      // Jika di halaman login atau register, tampilkan navbar hanya logo, tanpa menu
      if (currentHash === '#/login' || currentHash === '#/register') {
        this.shadowRoot.innerHTML = `
          <style>
            :host {
              display: block;
              font-family: Arial, sans-serif;
            }
            nav {
              background-color: #407BFF;
              color: white;
              padding: 1rem 2rem;
              position: sticky;
              top: 0;
              z-index: 99999;
              display: flex;
              align-items: center;
              font-weight: bold;
              font-size: 1.5rem;
            }
          </style>
          <nav>
            PusQue
          </nav>
        `;
        return; // langsung keluar agar menu tidak ditampilkan
      }
    
      // Jika bukan login/register, tampilkan navbar sesuai role
      let menuItems = `<li><a href="#/">Home</a></li>`;

    if (role === 'pasien') {
        menuItems += `
          <li><a href="#/antrian">Antrian</a></li>
          <li><a href="#/daftar">Daftar</a></li>
          <li><a href="#/feedback">Feedback</a></li>
        `;
      } else if (role === 'admin') {
        menuItems += `
          <li><a href="#/beranda">Beranda</a></li>
          <li><a href="#/pengajuan">Pengajuan</a></li>
        `;
      } else if (role === 'dokter') {
        menuItems += `
          <li><a href="#/dokter">Daftar Pasien</a></li>
        `;
      }
    
      menuItems += `<li><a href="#/profile">Profil</a></li>`;
      menuItems += `<li><a href="#/login" id="logoutBtn">Logout</a></li>`;
    
      this.shadowRoot.innerHTML = `
        <style>
          /* style navbar Anda sesuai original */
          :host {
            display: block;
            font-family: Arial, sans-serif;
          }
          nav {
            background-color: #407BFF;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 2rem;
            position: sticky;
            top: 0;
            z-index: 99999;
          }
          .logo {
            font-weight: bold;
            font-size: 1.5rem;
          }
          .menu {
            display: flex;
            list-style: none;
            gap: 1rem;
            margin: 0;
            padding: 0;
          }
          .menu li a {
            color: white;
            text-decoration: none;
          }
          .hamburger {
            display: none;
            flex-direction: column;
            cursor: pointer;
          }
          .hamburger div {
            width: 25px;
            height: 3px;
            background-color: white;
            margin: 4px 0;
          }
          @media (max-width: 768px) {
            .menu {
              display: none;
              flex-direction: column;
              background-color: #333;
              position: absolute;
              top: 60px;
              right: 20px;
              width: 150px;
              border: 1px solid #444;
              padding: 1rem;
            }
            .menu.show {
              display: flex;
            }
            .hamburger {
              display: flex;
            }
          }
        </style>
        <nav>
          <div class="logo">PusQue</div>
          <div class="hamburger" id="hamburger" aria-label="Toggle menu" tabindex="0" role="button">
            <div></div>
            <div></div>
            <div></div>
          </div>
          <ul class="menu" id="menu">
            ${menuItems}
          </ul>
        </nav>
      `;

      const hamburger = this.shadowRoot.querySelector("#hamburger");
      const menu = this.shadowRoot.querySelector("#menu");
      const logoutBtn = this.shadowRoot.querySelector("#logoutBtn");
      
      hamburger.addEventListener("click", () => {
        menu.classList.toggle("show");
      });
      
      if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
          e.preventDefault();
          localStorage.removeItem("userRole");
          localStorage.removeItem("accessToken");
          window.location.hash = "#/login";
          this.render();
        });
      }
  }
}

customElements.define("my-navbar", MyNavbar);
