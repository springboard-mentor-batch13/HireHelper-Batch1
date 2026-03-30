import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Rating, TextField, Box, Typography } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { api } from "../lib/api";
import { toast } from "react-toastify";

const RatingModal = ({ open, onClose, taskId, taskTitle, helperName }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await api.post("/api/reviews", {
        taskId,
        rating,
        comment: comment.trim(),
      });
      toast.success("Thank you for your rating!");
      onClose(true); // pass true to indicate successful submission
    } catch (err) {
      toast.error(err.message || "Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} fullWidth maxWidth="xs">
      <DialogTitle sx={{ textAlign: "center", pt: 3 }}>
        Rate your Helper
      </DialogTitle>
      <DialogContent sx={{ textAlign: "center" }}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          How was your experience with <strong>{helperName}</strong> for the task <strong>"{taskTitle}"</strong>?
        </Typography>

        <Box sx={{ my: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <Rating
            name="task-rating"
            value={rating}
            precision={0.5}
            onChange={(event, newValue) => {
              setRating(newValue);
            }}
            size="large"
            emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
          />
          <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
            {rating} / 5
          </Typography>
        </Box>

        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Leave a comment about the service (optional)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          variant="outlined"
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, justifyContent: "center" }}>
        <Button 
          onClick={() => onClose(false)} 
          disabled={submitting}
          sx={{ textTransform: "none", mr: 1 }}
        >
          Skip
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || !rating}
          sx={{ 
            textTransform: "none", 
            px: 4, 
            borderRadius: "8px",
            background: "var(--accent)",
            '&:hover': { background: "var(--accent-hover)" }
          }}
        >
          {submitting ? "Submitting..." : "Submit Rating"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RatingModal;
