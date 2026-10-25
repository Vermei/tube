
const statusEl = document.getElementById("status");
const thumbnailEl = document.getElementById("thumbnail");
const titleEl = document.getElementById("videoTitle");
const channelEl = document.getElementById("channel");
const durationEl = document.getElementById("duration");
const formatList = document.getElementById("formatList");
const tabs = document.querySelectorAll(".tab");

const params = new URLSearchParams(window.location.search);
const videoUrl = params.get("url");

let activeMode = "audio";

// Ini hanya daftar tampilan, bukan kualitas unduhan yang
// sudah tersedia dari server.
const formats = {
  audio: [
    { quality: "320 kbps", format: "MP3" },
    { quality: "256 kbps", format: "MP3" },
    { quality: "128 kbps", format: "MP3" },
    { quality: "96 kbps", format: "MP3" },
    { quality: "64 kbps", format: "MP3" },
    { quality: "Audio", format: "M4A" },
    { quality: "Audio", format: "OPUS" }
  ],
  video: [
    { quality: "2160p (4K)", format: "MP4" },
    { quality: "1440p (2K)", format: "MP4" },
    { quality: "1080p", format: "MP4" },
    { quality: "720p", format: "MP4" },
    { quality: "480p", format: "MP4" },
    { quality: "360p", format: "MP4" },
    { quality: "240p", format: "MP4" },
    { quality: "144p", format: "MP4" }
  ]
};

function renderFormats() {
  formatList.replaceChildren();

  formats[activeMode].forEach((item) => {
    const row = document.createElement("tr");

    const qualityCell = document.createElement("td");
    qualityCell.textContent = item.quality;

    const formatCell = document.createElement("td");
    formatCell.className = "format";
    formatCell.textContent = item.format;

    const actionCell = document.createElement("td");
    const button = document.createElement("button");

    button.type = "button";
    button.className = "download-btn";
    button.textContent = "Belum tersedia";
    button.disabled = true;
    button.title =
      "Hubungkan sumber file yang memiliki izin unduh.";

    actionCell.appendChild(button);
    row.append(qualityCell, formatCell, actionCell);
    formatList.appendChild(row);
  });
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activeMode = tab.dataset.mode;

    tabs.forEach((item) => {
      const selected = item === tab;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-selected", String(selected));
    });

    renderFormats();
  });
});

async function loadVideo() {
  renderFormats();

  if (!videoUrl) {
    statusEl.textContent =
      "Belum ada URL. Kembali ke halaman utama untuk memasukkan tautan.";
    return;
  }

  statusEl.textContent = "Mengambil informasi video...";

  try {
    const response = await fetch("/api/video-info", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url: videoUrl })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Gagal mengambil video.");
    }

    titleEl.textContent = data.title;
    channelEl.textContent = "Channel: " + data.channel;
    durationEl.textContent = "Durasi: " + data.duration;

    if (data.thumbnail) {
      thumbnailEl.src = data.thumbnail;
      thumbnailEl.hidden = false;
    } else {
      thumbnailEl.hidden = true;
    }

    statusEl.textContent = "Informasi video berhasil dimuat.";
  } catch (error) {
    statusEl.textContent = error.message;
  }
}

loadVideo();
