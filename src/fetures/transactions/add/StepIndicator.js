import './StepIndicator.css';

const steps = ['פרטי הלקוח', 'פרטי העסקה', 'פרטי הגביה'];

function StepIndicator({ currentStep }) {
 return (
    <div className="step-indicator">
      {steps.map((label, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div key={index} className="step">
            <div className={`circle ${isCompleted ? 'completed' : isActive ? 'active' : ''}`}>
              {isCompleted ? '✓' : index + 1}
            </div>
            <div className="label">{label}</div>
            {/* {index < steps.length - 1 && <div className="line"></div>} */}
          </div>
        );
      })}
    </div>
  );
}

export default StepIndicator