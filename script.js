
const form = document.getElementById("converterForm");
const urlInput = document.getElementById("videoUrl");
const pasteBtn = document.getElementById("pasteBtn");
const statusText = document.getElementById("status");
const resultCard = document.getElementById("resultCard");
const resultText = document.getElementById("resultText");

pasteBtn.addEventListener("click", async () => {
  try {
    urlInput.value = await navigator.clipboard.readText();
    statusText.textContent = "Tautan berhasil ditempel.";
  } catch {
    statusText.textContent =
      "Izin clipboard tidak tersedia. Tempel URL secara manual.";
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const url = urlInput.value.trim();

  resultCard.hidden = true;
  statusText.textContent = "Sedang memeriksa video...";

  const submitButton = form.querySelector('[type="submit"]');
  submitButton.disabled = true;

  try {
    const response = await fetch("/api/video-info", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Permintaan gagal.");
    }

    resultText.replaceChildren();

    const image = document.createElement("img");
    image.src = data.thumbnail;
    image.alt = "Thumbnail video";
    image.style.cssText =
      "width:100%;max-width:320px;border-radius:10px;margin:10px 0";

    const title = document.createElement("h3");
    title.textContent = data.title;

    const channel = document.createElement("p");
    channel.textContent = "Channel: " + data.channel;

    const duration = document.createElement("p");
    duration.textContent = "Durasi: " + data.duration;

    resultText.append(title, image, channel, duration);
    resultCard.hidden = false;
    statusText.textContent = "Informasi video berhasil diambil.";
  } catch (error) {
    statusText.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
});
