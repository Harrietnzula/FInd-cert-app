function SparkleField({ count = 20 }) {
  return (
    <div className="sparkle-field" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className="sparkle"
          style={{
            left: `${(index * 37) % 100}%`,
            top: `${(index * 61) % 100}%`,
            animationDelay: `${(index % 7) * 0.35}s`,
          }}
        />
      ))}
    </div>
  );
}

export default SparkleField;
