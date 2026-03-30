import React from "react";
import { Box, Rating, Typography } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

const UserRating = ({ rating, count, size = "small", showCount = true }) => {
  if (!count || count === 0) {
    return (
      <Typography 
        variant="caption" 
        sx={{ 
          color: "rgba(255, 255, 255, 0.4)", 
          fontStyle: "italic",
          display: "block",
          marginTop: "2px" 
        }}
      >
        No ratings yet
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Rating
        value={rating || 0}
        readOnly
        precision={0.1}
        size={size}
        emptyIcon={<StarIcon style={{ opacity: 0.3 }} fontSize="inherit" />}
        sx={{
          '& .MuiRating-icon': {
            width: '1.1em', // Give slightly more space to prevent clipping
          }
        }}
      />
      {showCount && (
        <Typography variant="caption" sx={{ fontWeight: 600, color: "var(--text-main)" }}>
          {rating?.toFixed(1)} ({count})
        </Typography>
      )}
    </Box>
  );
};

export default UserRating;
