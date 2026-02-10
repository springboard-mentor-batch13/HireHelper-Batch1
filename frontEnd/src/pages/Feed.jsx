import LocationOnIcon from "@mui/icons-material/LocationOn";
import "./Feed.css";

const Feed = () => {
  return (
    <div className="page">
      <h2>Available Tasks</h2>

      <div className="feed-card">
        <h3>Help with groceries</h3>

        <p className="location">
          <LocationOnIcon fontSize="small" />
          Delhi
        </p>

        <button className="primary-btn">Request</button>
      </div>
    </div>
  );
};

export default Feed;
