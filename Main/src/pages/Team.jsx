import './Compare.css';

const Compare = () => {
  const teamMembers = [
    { name: 'Natansh', role: 'Full-Stack Developer', task: 'Website Development & Backend' },
    { name: 'Member 2', role: 'ML Engineer', task: 'Model Training' },
    { name: 'Member 3', role: 'Data Scientist', task: 'Data Analysis' },
    { name: 'Member 4', role: 'ML Specialist', task: 'Python Scripts' },
  ];

  return (
    <div className="compare-page">
      <div className="container">
        <div className="compare-header">
          <h1>Compare Runs</h1>
          <p>Select two datasets to compare metrics</p>
        </div>
        
        <div className="compare-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="compare-card glass">
              <div className="compare-card-content">
                <div className="compare-avatar">{member.name.charAt(0)}</div>
                <h3>{member.name}</h3>
                <p className="compare-role">{member.role}</p>
                <p className="compare-task">{member.task}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Compare;

