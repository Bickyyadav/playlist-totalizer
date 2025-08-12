import { useState } from "react";
import axios from "axios";
import "./App.css";
// Removed dotenv import and config for frontend environment variables

const PlaylistExtractor = () => {
  const [playlistURL, setPlaylistURL] = useState("");
  const [playlistVideoId, setPlaylistVideoId] = useState("");
  const [totalTime, setTotalTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setPlaylistURL(e.target.value);
  };

  const handleExtractAndSend = async () => {
    setError("");
    setTotalTime("");
    setLoading(true);

    try {
      const urlObj = new URL(playlistURL);
      const params = new URLSearchParams(urlObj.search);
      const key = params.get("list");
      setPlaylistVideoId(key);

      if (!key) {
        setError("❌ Playlist ID not found in the URL.");
        setLoading(false);
        return;
      }
      const PORT = import.meta.env.VITE_API_KEY_PORT;

      const response = await axios.post(
        `${PORT}api`,
        {
          playlist: playlistVideoId,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      console.log("🚀 ~ handleExtractAndSend ~ response:", response);

      if (response.data.success) {
        setTotalTime(response.data.playlistVideos);
      } else {
        setError("⚠️ Unable to fetch playlist time.");
      }
    } catch (err) {
      console.log("🚀 ~ handleExtractAndSend ~ err:", err);
      setError("❌ Invalid playlist URL or server error.");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h2 className="title">⏳ YouTube Playlist Time Calculator</h2>

      <div className="input-section">
        <input
          className="input-bar"
          type="text"
          placeholder="Paste YouTube Playlist URL here..."
          value={playlistURL}
          onChange={handleInputChange}
        />
        <button
          className="fetch-btn"
          onClick={handleExtractAndSend}
          disabled={loading}
        >
          {loading ? "Fetching..." : "Get Total Time"}
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {totalTime && (
        <div className="result-box">
          <h3>📅 Total Playlist Time:</h3>
          <p className="time-text">{totalTime}</p>
        </div>
      )}
    </div>
  );
};

export default PlaylistExtractor;
