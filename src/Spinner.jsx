// Vi tar emot `className` som en prop för att kunna lägga till
// Tailwind-klasser (som marginaler) från utsidan.
const Spinner = ({ className }) => {
  return (
      <div className={`spinner-stop-container ${className}`}>
        <div className="modern-spinner"></div>
        <div className="stop-square"></div>
      </div>
  );
};

export default Spinner;