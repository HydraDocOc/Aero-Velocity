import './AnimatedCard.css';

const AnimatedCard = ({ title, description, icon, gradient = 'red' }) => {
  return (
    <div className={`animated-card gradient-${gradient}`}>
      <div className="card-glow"></div>
      <div className="card-content">
        {icon && <div className="card-icon">{icon}</div>}
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default AnimatedCard;

