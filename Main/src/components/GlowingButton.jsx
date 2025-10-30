import './GlowingButton.css';

const GlowingButton = ({ children, onClick, variant = 'red', type = 'button' }) => {
  return (
    <button
      type={type}
      className={`glowing-btn glowing-btn-${variant}`}
      onClick={onClick}
    >
      <span className="btn-content">{children}</span>
    </button>
  );
};

export default GlowingButton;

