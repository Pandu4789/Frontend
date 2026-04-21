import "./Footer.css";

const Footer = () => {
  return (
    <footer
      className="priestify-footer-slim"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="footer-slim-container">
        {/* Left Side: Brand & Copyright */}
        <div className="footer-left">
          <div className="footer-brand-mini">
            <span className="brand-priest">PRIEST</span>
            <span className="brand-ify">IFY</span>
          </div>
          <span className="footer-copyright">
            © {new Date().getFullYear()} All rights reserved.
          </span>
        </div>

        {/* Center: Motto (Hidden on mobile for space) */}
        <div className="footer-center-motto">
          Connecting Priests & Customers Seamlessly
        </div>

        {/* Right Side: Credits */}
        <div className="footer-right-credits">
          Developed & Maintained by <span>Mohit Kumar Nagubandi</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
