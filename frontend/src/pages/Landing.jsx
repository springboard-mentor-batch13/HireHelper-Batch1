import { Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import WorkIcon from "@mui/icons-material/Work";
import PeopleIcon from "@mui/icons-material/People";
import SpeedIcon from "@mui/icons-material/Speed";
import SecurityIcon from "@mui/icons-material/Security";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FeedIcon from "@mui/icons-material/DynamicFeed";
import TaskIcon from "@mui/icons-material/Task";
import AddIcon from "@mui/icons-material/AddBox";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useState, useEffect } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={styles.container}>
      {/* Navigation Bar */}
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <div style={styles.logo}>HireHelper</div>
          <div style={styles.navButtons}>
            <Button
              variant="outlined"
              startIcon={<LoginIcon />}
              onClick={() => navigate("/login")}
              sx={styles.navButton}
            >
              Login
            </Button>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => navigate("/register")}
              sx={styles.navButtonPrimary}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Dashboard Preview */}
      <div style={styles.hero}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: "60px",
            alignItems: "center",
          }}
        >
          <div style={styles.heroText}>
            <div style={styles.badge}>
              <TrendingUpIcon style={{ fontSize: "1rem", marginRight: "5px" }} />
              Trusted by 10,000+ users
            </div>
            <h1 style={styles.title}>
              Get Help. Get Things Done.
              <span style={styles.titleHighlight}> Faster.</span>
            </h1>
            <p style={styles.description}>
              Connect with skilled professionals and get your tasks completed efficiently. 
              Whether you need help with projects, errands, or specialized services, 
              HireHelper makes it easy to find the right person for the job.
            </p>
            
            <div style={{ ...styles.buttonGroup, justifyContent: "flex-start" }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<PersonAddIcon />}
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate("/register")}
                sx={styles.primaryButton}
              >
                Get Started Free
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<LoginIcon />}
                onClick={() => navigate("/login")}
                sx={styles.secondaryButton}
              >
                Sign In
              </Button>
            </div>

            <div style={styles.statsRow}>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>10K+</div>
                <div style={styles.statLabel}>Active Users</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>50K+</div>
                <div style={styles.statLabel}>Tasks Completed</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>4.9★</div>
                <div style={styles.statLabel}>Average Rating</div>
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <div style={styles.dashboardPreview}>
              <div style={styles.dashboardMockup}>
              <div style={styles.dashboardHeader}>
                <div style={styles.dashboardHeaderContent}>
                  <div style={styles.dashboardLogo}>HireHelper</div>
                  <div style={styles.dashboardHeaderRight}>
                    <div style={styles.notificationDot}>🔔</div>
                    <div style={styles.userAvatar}>👤</div>
                  </div>
                </div>
              </div>
              <div style={styles.dashboardBody}>
                <div style={styles.dashboardSidebar}>
                  <div style={styles.sidebarItem}><DashboardIcon /> Dashboard</div>
                  <div style={styles.sidebarItemActive}><FeedIcon /> Feed</div>
                  <div style={styles.sidebarItem}><TaskIcon /> My Tasks</div>
                  <div style={styles.sidebarItem}><AddIcon /> Add Task</div>
                  <div style={styles.sidebarItem}><SettingsIcon /> Settings</div>
                </div>
                <div style={styles.dashboardMain}>
                  <div style={styles.dashboardCard}>
                    <h3 style={styles.dashboardCardTitle}>Welcome Back!</h3>
                    <p style={styles.dashboardCardText}>You have 3 active tasks</p>
                  </div>
                  <div style={styles.dashboardGrid}>
                    <div style={styles.dashboardMiniCard}>
                      <div style={styles.miniCardIcon}>📋</div>
                      <div style={styles.miniCardText}>12 Tasks</div>
                    </div>
                    <div style={styles.dashboardMiniCard}>
                      <div style={styles.miniCardIcon}>✅</div>
                      <div style={styles.miniCardText}>8 Completed</div>
                    </div>
                    <div style={styles.dashboardMiniCard}>
                      <div style={styles.miniCardIcon}>👥</div>
                      <div style={styles.miniCardText}>24 Helpers</div>
                    </div>
                  </div>
                  <div style={styles.dashboardFeed}>
                    <div style={styles.feedItem}>
                      <div style={styles.feedAvatar}>JD</div>
                      <div style={styles.feedContent}>
                        <div style={styles.feedName}>John Doe</div>
                        <div style={styles.feedTask}>Completed: Website Design</div>
                      </div>
                      <CheckCircleIcon style={{ color: "#10b981" }} />
                    </div>
                    <div style={styles.feedItem}>
                      <div style={styles.feedAvatar}>JS</div>
                      <div style={styles.feedContent}>
                        <div style={styles.feedName}>Jane Smith</div>
                        <div style={styles.feedTask}>New task: Logo Design</div>
                      </div>
                      <div style={styles.feedBadge}>New</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </Box>
        </Box>
      </div>

      {/* Features Section */}
      <div style={styles.features}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Why Choose HireHelper?</h2>
          <p style={styles.sectionSubtitle}>
            Everything you need to get things done, all in one place
          </p>
        </div>
        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <div style={styles.featureIconWrapper}>
              <WorkIcon style={styles.featureIcon} />
            </div>
            <h3 style={styles.featureTitle}>Find Quality Help</h3>
            <p style={styles.featureDescription}>
              Browse through verified professionals and find the perfect match for your needs.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIconWrapper}>
              <SpeedIcon style={styles.featureIcon} />
            </div>
            <h3 style={styles.featureTitle}>Quick & Efficient</h3>
            <p style={styles.featureDescription}>
              Get tasks completed faster with our streamlined platform and easy communication.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIconWrapper}>
              <PeopleIcon style={styles.featureIcon} />
            </div>
            <h3 style={styles.featureTitle}>Trusted Community</h3>
            <p style={styles.featureDescription}>
              Join a community of reliable professionals and satisfied clients.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIconWrapper}>
              <SecurityIcon style={styles.featureIcon} />
            </div>
            <h3 style={styles.featureTitle}>Secure & Safe</h3>
            <p style={styles.featureDescription}>
              Your data and transactions are protected with industry-standard security measures.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIconWrapper}>
              <VerifiedUserIcon style={styles.featureIcon} />
            </div>
            <h3 style={styles.featureTitle}>Verified Professionals</h3>
            <p style={styles.featureDescription}>
              All helpers go through a verification process to ensure quality and reliability.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIconWrapper}>
              <DashboardIcon style={styles.featureIcon} />
            </div>
            <h3 style={styles.featureTitle}>Easy Dashboard</h3>
            <p style={styles.featureDescription}>
              Manage all your tasks, messages, and payments from one intuitive dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div style={styles.howItWorks}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>How It Works</h2>
          <p style={styles.sectionSubtitle}>
            Get started in just three simple steps
          </p>
        </div>
        <Box
          sx={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: "20px", md: "30px" },
            flexWrap: { xs: "wrap", md: "nowrap" },
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          <Box
            sx={{
              flex: { xs: "0 1 100%", md: "1 1 0" },
              minWidth: { xs: "100%", md: "250px" },
              maxWidth: { xs: "100%", md: "350px" },
              background: "rgba(255, 255, 255, 0.05)",
              padding: "40px 30px",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              textAlign: "center",
            }}
          >
            <div style={styles.stepNumber}>1</div>
            <h3 style={styles.stepTitle}>Create Your Account</h3>
            <p style={styles.stepDescription}>
              Sign up in seconds with your email. Verify your account and you're ready to go!
            </p>
          </Box>
          <Box
            sx={{
              fontSize: { xs: "2rem", md: "2.5rem" },
              color: "#60a5fa",
              fontWeight: "300",
              display: { xs: "none", md: "block" },
            }}
          >
            →
          </Box>
          <Box
            sx={{
              flex: { xs: "0 1 100%", md: "1 1 0" },
              minWidth: { xs: "100%", md: "250px" },
              maxWidth: { xs: "100%", md: "350px" },
              background: "rgba(255, 255, 255, 0.05)",
              padding: "40px 30px",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              textAlign: "center",
            }}
          >
            <div style={styles.stepNumber}>2</div>
            <h3 style={styles.stepTitle}>Post Your Task</h3>
            <p style={styles.stepDescription}>
              Describe what you need help with. Our platform will match you with qualified helpers.
            </p>
          </Box>
          <Box
            sx={{
              fontSize: { xs: "2rem", md: "2.5rem" },
              color: "#60a5fa",
              fontWeight: "300",
              display: { xs: "none", md: "block" },
            }}
          >
            →
          </Box>
          <Box
            sx={{
              flex: { xs: "0 1 100%", md: "1 1 0" },
              minWidth: { xs: "100%", md: "250px" },
              maxWidth: { xs: "100%", md: "350px" },
              background: "rgba(255, 255, 255, 0.05)",
              padding: "40px 30px",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              textAlign: "center",
            }}
          >
            <div style={styles.stepNumber}>3</div>
            <h3 style={styles.stepTitle}>Get It Done</h3>
            <p style={styles.stepDescription}>
              Review proposals, choose your helper, and watch your task get completed efficiently.
            </p>
          </Box>
        </Box>
      </div>

      {/* CTA Section */}
      <div style={styles.cta}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>Ready to Get Started?</h2>
          <p style={styles.ctaDescription}>
            Join thousands of users who are already getting things done with HireHelper.
            Start your journey today - it's free!
          </p>
          <div style={styles.buttonGroup}>
            <Button
              variant="contained"
              size="large"
              startIcon={<PersonAddIcon />}
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate("/register")}
              sx={styles.primaryButton}
            >
              Create Account
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<LoginIcon />}
              onClick={() => navigate("/login")}
              sx={styles.secondaryButton}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerLogo}>HireHelper</div>
          <div style={styles.footerLinks}>
            <a href="#" style={styles.footerLink}>About</a>
            <a href="#" style={styles.footerLink}>Privacy</a>
            <a href="#" style={styles.footerLink}>Terms</a>
            <a href="#" style={styles.footerLink}>Contact</a>
          </div>
          <div style={styles.footerCopyright}>
            © 2026 HireHelper. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a, #020617)",
    color: "#ffffff",
  },
  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    background: "rgba(15, 23, 42, 0.8)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "15px 0",
  },
  navContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: "1.5rem",
    fontWeight: "700",
    background: "linear-gradient(135deg, #60a5fa, #3b82f6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  navButtons: {
    display: "flex",
    gap: "10px",
  },
  navButton: {
    color: "#ffffff",
    borderColor: "rgba(255, 255, 255, 0.3)",
    "&:hover": {
      borderColor: "#ffffff",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
  },
  navButtonPrimary: {
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    "&:hover": {
      background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    },
  },
  hero: {
    padding: "100px 20px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  heroText: {
    maxWidth: "600px",
    textAlign: "left",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 16px",
    background: "rgba(59, 130, 246, 0.2)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    borderRadius: "20px",
    fontSize: "0.9rem",
    marginBottom: "30px",
    color: "#60a5fa",
  },
  title: {
    fontSize: "3.5rem",
    fontWeight: "800",
    marginBottom: "20px",
    lineHeight: "1.2",
    textAlign: "left",
    background: "linear-gradient(135deg, #ffffff, #cbd5e1)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  titleHighlight: {
    background: "linear-gradient(135deg, #60a5fa, #3b82f6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  description: {
    fontSize: "1.2rem",
    color: "#cbd5e1",
    lineHeight: "1.8",
    marginBottom: "40px",
    textAlign: "left",
  },
  buttonGroup: {
    display: "flex",
    gap: "20px",
    marginBottom: "50px",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButton: {
    padding: "16px 36px",
    fontSize: "1.1rem",
    fontWeight: "600",
    textTransform: "none",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)",
    "&:hover": {
      background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
      boxShadow: "0 15px 40px rgba(59, 130, 246, 0.4)",
      transform: "translateY(-2px)",
    },
  },
  secondaryButton: {
    padding: "16px 36px",
    fontSize: "1.1rem",
    fontWeight: "600",
    textTransform: "none",
    borderRadius: "10px",
    borderColor: "rgba(255, 255, 255, 0.3)",
    color: "#ffffff",
    "&:hover": {
      borderColor: "#ffffff",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
  },
  statsRow: {
    display: "flex",
    gap: "40px",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  statItem: {
    textAlign: "left",
  },
  statNumber: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#60a5fa",
    marginBottom: "5px",
  },
  statLabel: {
    fontSize: "0.9rem",
    color: "#94a3b8",
  },
  dashboardPreview: {
    position: "relative",
  },
  dashboardMockup: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    transform: "perspective(1000px) rotateY(-5deg)",
    transition: "transform 0.3s ease",
    "&:hover": {
      transform: "perspective(1000px) rotateY(0deg)",
    },
  },
  dashboardHeader: {
    background: "rgba(255, 255, 255, 0.08)",
    padding: "15px 20px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  dashboardHeaderContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dashboardLogo: {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#60a5fa",
  },
  dashboardHeaderRight: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
  },
  notificationDot: {
    fontSize: "1.2rem",
  },
  userAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "rgba(59, 130, 246, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1rem",
  },
  dashboardBody: {
    display: "flex",
    minHeight: "400px",
  },
  dashboardSidebar: {
    width: "200px",
    background: "rgba(0, 0, 0, 0.2)",
    padding: "20px 0",
    borderRight: "1px solid rgba(255, 255, 255, 0.1)",
  },
  sidebarItem: {
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#94a3b8",
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      background: "rgba(255, 255, 255, 0.05)",
      color: "#ffffff",
    },
  },
  sidebarItemActive: {
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#60a5fa",
    fontSize: "0.9rem",
    background: "rgba(59, 130, 246, 0.1)",
    borderLeft: "3px solid #3b82f6",
  },
  dashboardMain: {
    flex: 1,
    padding: "25px",
    background: "rgba(255, 255, 255, 0.02)",
  },
  dashboardCard: {
    background: "rgba(59, 130, 246, 0.1)",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
    border: "1px solid rgba(59, 130, 246, 0.2)",
  },
  dashboardCardTitle: {
    fontSize: "1.2rem",
    fontWeight: "600",
    marginBottom: "8px",
    color: "#ffffff",
  },
  dashboardCardText: {
    fontSize: "0.9rem",
    color: "#cbd5e1",
  },
  dashboardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "15px",
    marginBottom: "20px",
  },
  dashboardMiniCard: {
    background: "rgba(255, 255, 255, 0.05)",
    padding: "15px",
    borderRadius: "8px",
    textAlign: "center",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  miniCardIcon: {
    fontSize: "1.5rem",
    marginBottom: "8px",
  },
  miniCardText: {
    fontSize: "0.85rem",
    color: "#cbd5e1",
  },
  dashboardFeed: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  feedItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    background: "rgba(255, 255, 255, 0.03)",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  feedAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  feedContent: {
    flex: 1,
  },
  feedName: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: "4px",
  },
  feedTask: {
    fontSize: "0.8rem",
    color: "#94a3b8",
  },
  feedBadge: {
    padding: "4px 10px",
    background: "rgba(59, 130, 246, 0.2)",
    borderRadius: "12px",
    fontSize: "0.75rem",
    color: "#60a5fa",
  },
  features: {
    padding: "100px 20px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  sectionHeader: {
    textAlign: "center",
    marginBottom: "60px",
  },
  sectionTitle: {
    fontSize: "2.8rem",
    fontWeight: "700",
    marginBottom: "15px",
    color: "#ffffff",
  },
  sectionSubtitle: {
    fontSize: "1.2rem",
    color: "#94a3b8",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "30px",
  },
  featureCard: {
    background: "rgba(255, 255, 255, 0.05)",
    padding: "35px",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    textAlign: "center",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-8px)",
      borderColor: "rgba(59, 130, 246, 0.5)",
      boxShadow: "0 20px 40px rgba(59, 130, 246, 0.2)",
    },
  },
  featureIconWrapper: {
    width: "70px",
    height: "70px",
    margin: "0 auto 25px",
    background: "rgba(59, 130, 246, 0.2)",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  featureIcon: {
    fontSize: "2.5rem",
    color: "#60a5fa",
  },
  featureTitle: {
    fontSize: "1.4rem",
    fontWeight: "600",
    marginBottom: "15px",
    color: "#ffffff",
  },
  featureDescription: {
    fontSize: "1rem",
    color: "#cbd5e1",
    lineHeight: "1.7",
  },
  howItWorks: {
    padding: "100px 20px",
    background: "rgba(59, 130, 246, 0.05)",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  stepNumber: {
    width: "60px",
    height: "60px",
    margin: "0 auto 20px",
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#ffffff",
  },
  stepTitle: {
    fontSize: "1.3rem",
    fontWeight: "600",
    marginBottom: "15px",
    color: "#ffffff",
  },
  stepDescription: {
    fontSize: "1rem",
    color: "#cbd5e1",
    lineHeight: "1.7",
  },
  cta: {
    padding: "100px 20px",
    textAlign: "center",
    background: "rgba(59, 130, 246, 0.1)",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  },
  ctaContent: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  ctaTitle: {
    fontSize: "3rem",
    fontWeight: "700",
    marginBottom: "20px",
    color: "#ffffff",
  },
  ctaDescription: {
    fontSize: "1.2rem",
    color: "#cbd5e1",
    marginBottom: "40px",
    lineHeight: "1.8",
  },
  footer: {
    padding: "60px 20px 30px",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(0, 0, 0, 0.2)",
  },
  footerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    textAlign: "center",
  },
  footerLogo: {
    fontSize: "1.5rem",
    fontWeight: "700",
    marginBottom: "20px",
    background: "linear-gradient(135deg, #60a5fa, #3b82f6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  footerLinks: {
    display: "flex",
    justifyContent: "center",
    gap: "30px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },
  footerLink: {
    color: "#94a3b8",
    textDecoration: "none",
    fontSize: "0.95rem",
    transition: "color 0.2s ease",
    "&:hover": {
      color: "#60a5fa",
    },
  },
  footerCopyright: {
    color: "#64748b",
    fontSize: "0.9rem",
  },
};

export default Landing;
