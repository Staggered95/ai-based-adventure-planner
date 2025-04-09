// Simple slider functionality
const distanceSlider = document.getElementById('distance-range');
const distanceValue = document.getElementById('distance-value');

distanceSlider.addEventListener('input', function() {
  distanceValue.textContent = this.value;
});

//form retrieval
document.getElementById("userForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  document.getElementById("loadingDiv").classList.remove("hidden");
  const formData = new FormData(e.target);
  let message;
  if (formData.get("location")) {
    message = `
    Plan a trip to ${formData.get("location")} from ${formData.get("start")} to ${formData.get("end")}.
    Activity: ${formData.get("activity")}, Group Size: ${formData.get("group-size")}, Experience: ${formData.get("experience")},
    Distance: ${formData.get("distance")} km, Elevation: ${formData.get("elevation")}, Features: ${formData.get("features")},
    Additional Info: ${formData.get("additional-info")}`;
  }else {
    message = "I am unsure about where to go fo the adventure, help me decide and please guide properly";
  }
  const data = { message };
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
  });

  const json = await res.json();

  // Store result temporarily
  localStorage.setItem("initialBotResponse", json.message); // whatever key you're returning

  // Redirect to chat.html
  window.location.href = "chat.html";
} catch (err) {
  console.error("Failed to send form:", err);
  }
});