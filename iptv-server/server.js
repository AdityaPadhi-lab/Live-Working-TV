const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PLAYLIST_URL = "https://iptv-org.github.io/iptv/countries/in.m3u";

app.get("/api/channels", async (req, res) => {
  try {
    const response = await axios.get(PLAYLIST_URL, {
      timeout: 15000
    });

    const lines = response.data.split("\n");

    const channels = [];
    let currentChannel = null;

    for (let line of lines) {
      line = line.trim();

      // When metadata line found
      if (line.startsWith("#EXTINF")) {

        const nameMatch = line.match(/,(.*)$/);
        const logoMatch = line.match(/tvg-logo="(.*?)"/);
        const groupMatch = line.match(/group-title="(.*?)"/);

        currentChannel = {
          name: nameMatch ? nameMatch[1].trim() : "Unknown",
          logo: logoMatch ? logoMatch[1] : "",
          group: groupMatch ? groupMatch[1] : "Other",
          url: ""
        };
      }

      // When actual stream URL found
      else if (line && !line.startsWith("#") && currentChannel) {

        // Only accept HLS streams (browser friendly)
        if (line.endsWith(".m3u8")) {
          currentChannel.url = line;
          channels.push(currentChannel);
        }

        currentChannel = null;
      }
    }

    res.json(channels);

  } catch (error) {
    console.error("Error fetching playlist:", error.message);
    res.status(500).json({ error: "Failed to fetch playlist" });
  }
});

app.get("/", (req, res) => {
  res.send("IPTV Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});