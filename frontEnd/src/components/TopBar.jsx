const TopBar = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initial = user.first_name ? user.first_name.charAt(0).toUpperCase() : "👤";

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
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "#2563eb",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "600"
        }}>
          {user.profile_picture ? (
            <img src={user.profile_picture} alt="Profile" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
          ) : (
            initial
          )}
        </div>
        <div>
          <div style={{ fontSize: "14px", fontWeight: "600" }}>
            {user.first_name} {user.last_name}
          </div>
          <div style={{ fontSize: "12px", color: "#64748b" }}>
            {user.email_id}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
