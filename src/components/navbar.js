class MyNavbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    // Kita perlu memantau perubahan hash untuk me-render ulang navbar
    // Contoh: saat logout, hash berubah ke #/login, navbar harus di-render ulang
    window.addEventListener('hashchange', () => this.render());
  }

  render() {
    const role = localStorage.getItem("userRole");
    const isLoggedIn = !!role; // true jika ada role, false jika tidak
    const currentHash = window.location.hash;
    
    // Tentukan menu berdasarkan role
    let menuItems = `<li><a href="#/">Home</a></li>`;
    if (isLoggedIn) {
      if (role === 'pasien') {
        menuItems += `
          <li><a href="#/antrian">Antrian</a></li>
          <li><a href="#/daftar">Daftar Antrian</a></li>
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
      menuItems += `<li><a href="#" id="logoutBtn">Logout</a></li>`;
    } else {
      // Menu untuk user yang belum login (tamu)
      menuItems += `
        <li><a href="#/login">Login</a></li>
        <li><a href="#/register" class="btn-register">Register</a></li>
      `;
    }

    this.shadowRoot.innerHTML = `
      <style>
        /* CSS Variables untuk tema yang konsisten */
        :host {
          --primary-color: #3B82F6;
          --primary-dark: #2563EB;
          --text-light: #FFFFFF;
          --bg-dark: #1F2937;
          --font-family: 'Poppins', 'Arial', sans-serif;
          display: block;
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        nav {
          background-color: var(--primary-color);
          color: var(--text-light);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .logo {
          font-weight: 700;
          font-size: 1.75rem;
          text-decoration: none;
          color: var(--text-light);
        }

        .desktop-menu {
          display: flex;
          list-style: none;
          gap: 1.5rem;
          margin: 0;
          padding: 0;
        }

        .desktop-menu li a {
          color: var(--text-light);
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 0;
          position: relative;
          transition: color 0.3s;
        }

        .desktop-menu li a::after {
          content: '';
          position: absolute;
          width: 100%;
          transform: scaleX(0);
          height: 2px;
          bottom: 0;
          left: 0;
          background-color: var(--text-light);
          transform-origin: bottom right;
          transition: transform 0.25s ease-out;
        }
        
        .desktop-menu li a:hover::after {
          transform: scaleX(1);
          transform-origin: bottom left;
        }

        .desktop-menu li a.btn-register {
            background-color: var(--text-light);
            color: var(--primary-color);
            padding: 0.5rem 1rem;
            border-radius: 6px;
            transition: background-color 0.2s, color 0.2s;
        }
        .desktop-menu li a.btn-register:hover {
            background-color: #f0f0f0;
        }
        .desktop-menu li a.btn-register::after {
            display: none; /* Hilangkan efek garis bawah untuk tombol */
        }

        /* Tombol Hamburger */
        .hamburger {
          display: none;
          cursor: pointer;
        }

        /* --- STYLING MENU MOBILE (SIDEBAR) --- */
        .mobile-menu {
          position: fixed;
          top: 0;
          right: 0;
          width: 280px;
          height: 100%;
          background-color: var(--bg-dark);
          box-shadow: -5px 0 15px rgba(0,0,0,0.2);
          
          /* Sembunyikan menu di luar layar ke kanan */
          transform: translateX(100%); 
          transition: transform 0.3s ease-in-out;
          
          list-style: none;
          padding: 4rem 2rem;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        /* Kelas 'show' akan menggeser menu ke posisi terlihat */
        .mobile-menu.show {
          transform: translateX(0);
        }

        .mobile-menu li a {
          color: var(--text-light);
          text-decoration: none;
          font-size: 1.2rem;
          font-weight: 500;
        }
        .mobile-menu li a.btn-register {
            background-color: var(--primary-color);
            padding: 0.75rem 1rem;
            border-radius: 6px;
            text-align: center;
        }

        /* Tombol Close di dalam sidebar */
        .close-btn {
            position: absolute;
            top: 1.5rem;
            right: 1.5rem;
            cursor: pointer;
            background: none;
            border: none;
            color: white;
            font-size: 2rem;
        }

        /* Overlay gelap di belakang sidebar */
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
        }

        .overlay.show {
          opacity: 1;
          visibility: visible;
        }

        @media (max-width: 820px) {
          .desktop-menu {
            display: none;
          }
          .hamburger {
            display: block;
          }
        }
      </style>
      
      <nav>
        <a href="#/" class="logo">PusQue</a>
        
        <ul class="desktop-menu">
          ${menuItems}
        </ul>
        
        <div class="hamburger" id="hamburger" role="button" aria-label="Buka menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
          </svg>
        </div>
      </nav>

      <div class="overlay" id="overlay"></div>
      <ul class="mobile-menu" id="mobileMenu">
        <button class="close-btn" id="closeBtn" aria-label="Tutup menu">&times;</button>
        ${menuItems}
      </ul>
    `;
    
    // --- Event Listeners ---
    const hamburger = this.shadowRoot.querySelector("#hamburger");
    const mobileMenu = this.shadowRoot.querySelector("#mobileMenu");
    const closeBtn = this.shadowRoot.querySelector("#closeBtn");
    const overlay = this.shadowRoot.querySelector("#overlay");

    const openMenu = () => {
      mobileMenu.classList.add("show");
      overlay.classList.add("show");
    };

    const closeMenu = () => {
      mobileMenu.classList.remove("show");
      overlay.classList.remove("show");
    };

    hamburger.addEventListener("click", openMenu);
    closeBtn.addEventListener("click", closeMenu);
    overlay.addEventListener("click", closeMenu);

    // Menutup menu saat salah satu link di dalamnya diklik
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    const logoutBtn = this.shadowRoot.querySelector("#logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("userRole");
        localStorage.removeItem("accessToken");
        window.location.hash = "#/login";
        // `render()` akan otomatis dipanggil oleh event 'hashchange'
      });
    }
  }
}

customElements.define("my-navbar", MyNavbar);