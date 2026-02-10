const TopBar = () => {
  return (
    <div style={{
      height: "60px",
      background: "#f8fafc",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      borderBottom: "1px solid #e5e7eb"
    }}>
      <h3>Dashboard</h3>
      <div>🔔 👤</div>
    </div>
  );
};

export default TopBar;
