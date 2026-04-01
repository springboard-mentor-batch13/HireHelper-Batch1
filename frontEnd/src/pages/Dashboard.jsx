import DashboardIcon from "@mui/icons-material/Dashboard";

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <div className="dashboard-header" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
          <DashboardIcon sx={{ color: 'var(--accent)', fontSize: 28 }} /> Dashboard
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px', margin: 0 }}>
          Welcome to HireHelper. Choose an option from the menu.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
