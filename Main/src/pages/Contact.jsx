import './Contact.css';

const Contact = () => {
  return (
    <div className="contactus-page">
      <header className="contactus-hero">
        <h1>Contact Us</h1>
        <nav className="contactus-breadcrumb">Home / Contact</nav>
      </header>

      <section className="contactus-section container">
        <div className="contactus-grid">
          {/* Left: form card */}
          <div className="contactus-card form-card">
            <h2>Get In Touch</h2>
            <form className="form">
              <input type="text" placeholder="Your Name" />
              <input type="email" placeholder="Email Address" />
              <input type="text" placeholder="Phone" />
              <input type="text" placeholder="Subject" />
              <textarea rows="5" placeholder="Type here..."></textarea>
              <button type="submit" className="send-btn">Send now</button>
            </form>
          </div>

          {/* Right: info block (icons + text) */}
          <div className="contactus-card info-card">
            <p className="info-lead">Our engineers are available Monday to Saturday. Contact us via phone, email or WhatsApp, or visit our office.</p>
            <div className="info-row">
              <div className="info-item">
                <div className="ii">📞</div>
                <div>
                  <div className="label">Phone Number</div>
                  <div className="value">+91 8260 432 897</div>
                </div>
              </div>
              <div className="info-item">
                <div className="ii">✉️</div>
                <div>
                  <div className="label">Email Address</div>
                  <div className="value">contact@aerovelocity.com</div>
                </div>
              </div>
            </div>
            <div className="info-row">
              <div className="info-item">
                <div className="ii">💬</div>
                <div>
                  <div className="label">Whatsapp</div>
                  <div className="value">+91 8260 432 897</div>
                </div>
              </div>
              <div className="info-item">
                <div className="ii">📍</div>
                <div>
                  <div className="label">Our Office</div>
                  <div className="value">2440 Oak Ridge, Omaha, CA 68005</div>
                </div>
              </div>
            </div>
            {/* Image placeholder under contact info (map/photo). Replace via CSS background-image */}
            <div className="info-image" aria-label="Location / banner image" />
          </div>
        </div>
      </section>

      {/* Bottom banner — you add the image here: public/contact-banner.jpg (for example) */}
      <section className="contactus-banner">
        {/* Replace the placeholder with your own image path, e.g. /contact-hero.jpg */}
        {/* <img src="/contact-hero.jpg" alt="Contact banner" /> */}
        <div className="banner-overlay">
          <div className="banner-text">
            <h3>We Are Always Ready To Take A Perfect Shot</h3>
            <a className="banner-btn" href="#features">Get Started</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;

