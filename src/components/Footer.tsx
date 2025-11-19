import chaoticLabsLogo from '../assets/chaoticlabs.svg';
import './Footer.css';

export const Footer = () => {
  return (
    <footer className="footer">
      <a 
        href="https://chaoticlabs.github.io/chaoticlabs/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="footer-link"
      >
        <img 
          src={chaoticLabsLogo} 
          alt="Chaotic Labs" 
          className="footer-logo"
        />
        <span className="footer-text">Chaotic Labs</span>
      </a>
    </footer>
  );
};
