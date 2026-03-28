import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Hls from "hls.js";
import "./App.css";
import { ReactTyped } from "react-typed";

function App() {
  const [channels, setChannels] = useState([]);
  const [filteredChannels, setFilteredChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [search, setSearch] = useState("");
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  // ✅ Fetch channels (safe)
  useEffect(() => {
    axios
      .get("https://live-working-tv.onrender.com/api/channels")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setChannels(res.data);
          setFilteredChannels(res.data);
        }
      })
      .catch((err) => {
        console.error("Backend error:", err);
        // fallback data (so UI never blank)
        const demo = [
          { name: "Demo Channel", url: "", logo: "" }
        ];
        setChannels(demo);
        setFilteredChannels(demo);
      });
  }, []);

  // 🔍 Search
  useEffect(() => {
    const filtered = channels.filter((channel) =>
      channel.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredChannels(filtered);
  }, [search, channels]);

  // 📺 Video player
  useEffect(() => {
    if (!currentChannel || !videoRef.current) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(currentChannel.url);
      hls.attachMedia(videoRef.current);
      hlsRef.current = hls;
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = currentChannel.url;
    }
  }, [currentChannel]);

  return (
    <div className="container">

      {/* 🔥 PROFILE */}
      <div className="profile">
        <h2 className="glow">
          {/* fallback if typed fails */}
          {ReactTyped ? (
            <ReactTyped
              strings={[
                "Aditya Padhi",
                "Full Stack Developer",
                "AI Enthusiast 🚀"
              ]}
              typeSpeed={80}
              backSpeed={40}
              loop
            />
          ) : (
            "Aditya Padhi"
          )}
        </h2>

        <div className="links">
          <a href="https://github.com/AdityaPadhi-lab" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/aditya-padhi-7aa941278/" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </div>
      </div>

      {/* 📂 SIDEBAR */}
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

      {/* 🎬 PLAYER */}
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