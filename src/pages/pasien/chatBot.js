import logoPusQue from "../../assets/logo/logoPusQue.jpg";
import chatBot from "../../assets/icons/chatBot.png";

class ChatView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          overflow: hidden;
          font-family: Arial, sans-serif;
        }

        .container-chatbot {
          display: flex;
          flex-direction: column;
          height: 85vh;
          max-width: 1000px;
          margin: 0 auto;
        }

        .main-content {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .logo-wrapper {
          flex: 0 0 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          padding: 1rem;
        }

        .logo {
          width: 100%;
          max-width: 700px;
          height: auto;
        }

        .chat-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: #fff;
        }

        .box-chat {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
        }

         .box-chat::-webkit-scrollbar {
          display: none;
        }

        .chat {
          display: flex;
          align-items: flex-end;
          gap: 0.5rem;
        }

        .chat.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .chat.user .bubble {
          background: #ccc;
          color: black;
        }

        .chat.bot .bubble {
          background: #2979ff;
          color: white;
        }

        .bubble {
          padding: 1rem;
          border-radius: 10px;
          max-width: 300px;
        }

        .icon {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          object-fit: cover;
        }

        .input-area {
          display: flex;
          border-top: 1px solid #ccc;
          padding: 1rem;
        }

        .input-area input {
          flex: 1;
          border: 1px solid #ccc;
          border-radius: 20px;
          padding: 0.8rem;
          font-size: 1rem;
          outline: none;
        }

        .input-area button {
          background: #2979ff;
          border: none;
          border-radius: 20px;
          margin-left: 0.5rem;
          padding: 0 1.2rem;
          color: white;
          cursor: pointer;
          font-size: 1.2rem;
        }

        @media (max-width: 768px) {
          .logo-wrapper {
            display: none;
          }
          .container-chatbot {
            height : 90vh;
          }
        }
        .back-button {
          display: inline-block;
          color: #2979ff;
          text-decoration: none;
          padding: 1rem;
          font-size: 1rem;
          font-weight: bold;
        }
        
        .back-button:hover {
          text-decoration: underline;
          color: #004ecb;
        }
        
      </style>

     
            <div class="container-chatbot">
            <a class="back-button" href="#/">&#8592; Kembali</a>
              <div class="main-content">
                <div class="logo-wrapper">
                  <img class="logo" src="${logoPusQue}" alt="Logo PusQue" />
                </div>
                <div class="chat-area">
                  <div class="box-chat" id="chatBox">
                    <div class="chat bot">
                      <img class="icon" src="${chatBot}" alt="Bot Icon" />
                      <div class="bubble">Halo! Ada yang bisa saya bantu?</div>
                    </div>
                  </div>
                  <div class="input-area">
                    <input type="text" placeholder="Tulis pesan..." />
                    <button>&#10148;</button>
                  </div>
                </div>
              </div>
            </div>
          `;
      
          // Query elemen dan pasang event listener DI SINI
          this.chatBox = this.shadowRoot.getElementById("chatBox");
          this.input = this.shadowRoot.querySelector("input");
          this.button = this.shadowRoot.querySelector("button");
      
          this.button.addEventListener("click", () => this.sendMessage());
          this.input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") this.sendMessage();
          });
        }
      
        connectedCallback() {
          this.scrollToBottom();
        }
      
        scrollToBottom() {
          this.chatBox.scrollTop = this.chatBox.scrollHeight;
        }
      
        appendMessage(message, sender = "bot") {
          const chatDiv = document.createElement("div");
          chatDiv.classList.add("chat", sender);
          if (sender === "bot") {
            chatDiv.innerHTML = `
              <img class="icon" src="${chatBot}" alt="Bot Icon" />
              <div class="bubble">${message}</div>
            `;
          } else {
            chatDiv.innerHTML = `
              <div class="bubble">${message}</div>
            `;
          }
          this.chatBox.appendChild(chatDiv);
          this.scrollToBottom();
        }
      
        async sendMessage() {
          const message = this.input.value.trim();
          if (!message) return;
      
          console.log("Mengirim pesan:", message);
          this.appendMessage(message, "user");
          this.input.value = "";
          this.input.disabled = true;
          this.button.disabled = true;
      
          try {
            const response = await fetch("https://web-production-7496e.up.railway.app/chat", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ message }),
            });
      
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
      
            const data = await response.json();
      
            console.log("Response API:", data);
      
            this.appendMessage(data.response || "Maaf, saya tidak mengerti.", "bot");
          } catch (error) {
            console.error("Error saat kirim pesan:", error);
            this.appendMessage("Terjadi kesalahan koneksi. Silakan coba lagi.", "bot");
          } finally {
            this.input.disabled = false;
            this.button.disabled = false;
            this.input.focus();
          }
        }
      }
      
      customElements.define("chat-view", ChatView);
      