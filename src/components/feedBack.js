class FeedbackCarousel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.feedbacks = [
      {
        text: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
        rating: "3.5",
        date: "09/06/2025",
      },
      {
        text: "Sangat memuaskan! Pelayanannya cepat dan ramah.",
        rating: "4.0",
        date: "10/06/2025",
      },
      {
        text: "Antrian tertata dengan baik dan informatif.",
        rating: "4.2",
        date: "11/06/2025",
      }
    ];

    this.resumeTimer = null;
  }

  connectedCallback() {
    this.render();
    this.startAutoScroll();
  }

  startAutoScroll() {
    const track = this.shadowRoot.querySelector('.track');
    track.style.animationPlayState = "running";
  }

  pauseAutoScroll() {
    const track = this.shadowRoot.querySelector('.track');
    track.style.animationPlayState = "paused";
  }

  resetResumeTimer() {
    clearTimeout(this.resumeTimer);
    this.resumeTimer = setTimeout(() => {
      this.startAutoScroll();
    }, 2000);
  }

  render() {
    const doubledFeedbacks = [...this.feedbacks, ...this.feedbacks];

    this.shadowRoot.innerHTML = `
      <style>
        .carousel {
          overflow-x: auto;
          width: 100%;
          max-width: 1000px;
          margin: auto;
          box-sizing: border-box;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .carousel::-webkit-scrollbar {
          display: none;
        }

        .track {
          display: flex;
          width: max-content;
          animation: scrollLeft 30s linear infinite;
        }

        @keyframes scrollLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .card {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 10px;
          width: 240px;
          margin: 0 12px;
          padding: 15px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          flex-shrink: 0;
          text-align: center;
          font-family: sans-serif;
        }

        .card img {
          width: 40px;
          height: 40px;
          margin-bottom: 10px;
        }

        .card p {
          font-size: 14px;
          margin-bottom: 10px;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }

        .card-footer .rating {
          color: #fbc02d;
          font-weight: bold;
        }

        .card-footer .date {
          font-weight: bold;
          color: #333;
        }
          
        .carousel-wrapper {
          position: relative;
          overflow: hidden;
        }
    
        .nav-button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.8);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          font-size: 20px;
          font-weight: bold;
          cursor: pointer;
          z-index: 2;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          transition: background 0.2s ease;
        }
    
        .nav-button:hover {
          background: rgba(255, 255, 255, 1);
        }
    
        .left-button {
          left: 10px;
        }
    
        .right-button {
          right: 10px;
        }

        @media (max-width: 768px) {
          .card {
            width: 200px;
          }
            
          .nav-button {
            display: none;
          }
        }
      </style>

      <div class="carousel-wrapper">
        <button class="nav-button left-button">◀</button>
        <button class="nav-button right-button">▶</button>
        <div class="carousel">
          <div class="track">
            ${doubledFeedbacks.map(f => `
              <div class="card">
                <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="user" />
                <p>${f.text}</p>
                <div class="card-footer">
                  <span class="rating">⭐ ${f.rating}</span>
                  <span class="date">${f.date}</span>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;

    const carousel = this.shadowRoot.querySelector(".carousel");
    const leftBtn = this.shadowRoot.querySelector(".left-button");
    const rightBtn = this.shadowRoot.querySelector(".right-button");
    
    leftBtn.addEventListener("click", () => {
      carousel.scrollBy({ left: -300, behavior: "smooth" });
      this.pauseAutoScroll();
      this.resetResumeTimer();
    });
    
    rightBtn.addEventListener("click", () => {
      carousel.scrollBy({ left: 300, behavior: "smooth" });
      this.pauseAutoScroll();
      this.resetResumeTimer();
    });

    carousel.addEventListener("touchstart", () => {
      this.pauseAutoScroll();
      this.resetResumeTimer();
    });
    carousel.addEventListener("touchmove", () => {
      this.pauseAutoScroll();
      this.resetResumeTimer();
    });
    carousel.addEventListener("mousedown", () => {
      this.pauseAutoScroll();
      this.resetResumeTimer();
    });
    carousel.addEventListener("wheel", () => {
      this.pauseAutoScroll();
      this.resetResumeTimer();
    });
  }
}

customElements.define("feedback-carousel", FeedbackCarousel);
