const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const { default: axios } = require("axios");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));

app.use(express.json());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json({ message: "api route hit successfully" });
});

app.post("/api", async (req, res) => {
  let totalTime = [];

  try {
    const { playlist } = req.body;

    if (playlist) {
      const youtubePlaylistLink = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${playlist}&maxResults=50&key=${process.env.YOUTUBE_API}`;

      const response = await axios.get(youtubePlaylistLink);

      const videoDetails = response.data.items.map((item) => ({
        videoId: item.contentDetails.videoId,
        videoPublishedAt: item.contentDetails.videoPublishedAt,
      }));

      let totalTimeInHMS = 0;
      await Promise.all(
        videoDetails.map(async (item) => {
          const response = await axios.get(
            `https://www.googleapis.com/youtube/v3/videos`,
            {
              params: {
                part: "contentDetails",
                id: item.videoId,
                key: process.env.YOUTUBE_API,
              },
            }
          );
          const TotalTime = await response.data.items[0].contentDetails
            .duration;

          const Iso8601InSecond = iso8601ToSeconds(TotalTime);
          totalTime.push(Iso8601InSecond);
        })
      );
      const IsoIntProperTIme = secondsToHMS(totalTimeInHMS, totalTime);

      res.json({
        success: true,
        playlistVideos: IsoIntProperTIme,
      });
      return;
    } else {
      res.status(400).json({ success: false, message: "someThing went wrong" });
    }
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.status(400).json({ success: false, message: "someThing went wrong" });
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

function iso8601ToSeconds(iso) {
  const match = iso.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  return hours * 3600 + minutes * 60 + seconds;
}

function secondsToHMS(totalTimeInHMS, totalTime) {
  const totalSeconds = totalTime.reduce((sum, sec) => sum + sec, 0);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  totalTimeInHMS = `${h}h ${m}m ${s}s`;
  return totalTimeInHMS;
}
