class LoginPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        .login-container {
          max-width: 400px;
          margin: 100px auto;
          padding: 2rem;
          border: 1px solid #ccc;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          font-family: Arial, sans-serif;
        }
        input, select {
          display: block;
          width: 100%;
          margin-top: 1rem;
          padding: 0.75rem;
          border-radius: 5px;
          border: 1px solid #ccc;
        }
        button {
          margin-top: 1.5rem;
          padding: 0.75rem;
          width: 100%;
          background-color: #407BFF;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
      </style>

      <div class="login-container">
        <h2>Login PusQue</h2>
        <input type="text" id="username" placeholder="Masukkan username" />
        <select id="role">
          <option value="">-- Pilih Role --</option>
          <option value="admin">Admin</option>
          <option value="dokter">Dokter</option>
          <option value="pasien">Pasien</option>
        </select>
        <button id="loginBtn">Login</button>
      </div>
    `;

    this.querySelector("#loginBtn").addEventListener("click", () => {
      const role = this.querySelector("#role").value;
      const username = this.querySelector("#username").value;

      if (!role || !username) {
        alert("Isi semua kolom!");
        return;
      }

      localStorage.setItem("userRole", role);
      localStorage.setItem("username", username);

      // Optional: refresh navbar
      const navbar = document.querySelector("my-navbar");
      if (navbar && typeof navbar.render === "function") {
        navbar.render();
      }

      window.location.hash = "#/";
    });
  }
}

customElements.define("login-page", LoginPage);
