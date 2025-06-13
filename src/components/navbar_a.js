class Navbar_a extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark sticky-top" style="background-color: #367AFF;">
          <div class="container-fluid">
            <a class="navbar-brand text-white" href="#">PusQue</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
              data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false"
              aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNavDropdown">
              <ul class="navbar-nav ms-auto">
                <li class="nav-item">
                  <a class="nav-link active text-white" aria-current="page" href="#">Home</a>
                </li>
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle text-white" href="#" role="button"
                    data-bs-toggle="dropdown" aria-expanded="false">
                    Admin
                  </a>
                  <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#/beranda">Beranda</a></li>
                    <li><a class="dropdown-item" href="#/pengajuan">Pengajuan</a></li>
                  </ul>
                </li>
                <li class="nav-item">
                  <a class="nav-link active text-white" aria-current="page" href="#/dokter">Dokter</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      `;
    }
  }
  
  if (!customElements.get('my-navbar_a')) {
    customElements.define('my-navbar_a', Navbar_a);
  }
  