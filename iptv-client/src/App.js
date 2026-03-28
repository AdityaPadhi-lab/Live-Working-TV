import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Hls from "hls.js";
import "./App.css";

function App() {
  const [channels, setChannels] = useState([]);
  const [filteredChannels, setFilteredChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [search, setSearch] = useState("");
  const videoRef = useRef(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/channels")
      .then((res) => {
        setChannels(res.data);
        setFilteredChannels(res.data);
      })
      .catch((err) => console.error("Error fetching channels:", err));
  }, []);

  useEffect(() => {
    const filtered = channels.filter((channel) =>
      channel.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredChannels(filtered);
  }, [search, channels]);

  useEffect(() => {
    if (currentChannel && videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(currentChannel.url);
        hls.attachMedia(videoRef.current);
      } else {
        videoRef.current.src = currentChannel.url;
      }
    }
  }, [currentChannel]);

  return (
    <div className="container">
      <div className="sidebar">
        <div className="searchBox">
          <input
            type="text"
            placeholder="Search channels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredChannels.map((channel, index) => (
          <div
            key={index}
            className="channel"
            onClick={() => setCurrentChannel(channel)}
          >
            {channel.logo && (
              <img src={channel.logo} alt="" className="logo" />
            )}
            <span>{channel.name}</span>
          </div>
        ))}
      </div>

      <div className="player">
        {currentChannel ? (
          <>
            <h2>{currentChannel.name}</h2>
            <video ref={videoRef} controls autoPlay width="100%" />
          </>
        ) : (
          <h2>Select a channel</h2>
        )}
      </div>
    </div>
  );
}

export default App;