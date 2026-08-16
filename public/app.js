const raw = document.getElementById("raw");
const generate = document.getElementById("generate");
const mic = document.getElementById("mic");
const status = document.getElementById("status");
const resultCard = document.getElementById("resultCard");
const result = document.getElementById("result");
const copy = document.getElementById("copy");

generate.addEventListener("click", async () => {
  if (!raw.value.trim()) {
    status.textContent = "اول اتفاقات این هفته رو بنویس 🙂";
    return;
  }

  generate.disabled = true;
  status.textContent = "دارم خبر رو جمع‌وجور و خوش‌خوان می‌کنم... ✍️";

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw: raw.value })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "خطا");

    result.textContent = data.text;
    resultCard.classList.remove("hidden");
    status.textContent = "خبر آماده‌ست! 🎉";
    resultCard.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (err) {
    status.textContent = err.message || "یه مشکلی پیش اومد.";
  } finally {
    generate.disabled = false;
  }
});

copy.addEventListener("click", async () => {
  await navigator.clipboard.writeText(result.textContent);
  copy.textContent = "کپی شد ✓";
  setTimeout(() => copy.textContent = "کپی متن", 1400);
});

// ورود صوتی با Speech Recognition مرورگر؛ در Chrome معمولاً در دسترس است.
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  mic.title = "ورود صوتی در این مرورگر پشتیبانی نمی‌شود.";
} else {
  const recognition = new SpeechRecognition();
  recognition.lang = "fa-IR";
  recognition.interimResults = true;
  recognition.continuous = false;

  mic.addEventListener("click", () => {
    recognition.start();
    mic.textContent = "🔴 در حال شنیدن...";
    status.textContent = "صحبت کن؛ متن حرف‌هات اینجا نوشته می‌شه.";
  });

  recognition.onresult = (event) => {
    let text = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      text += event.results[i][0].transcript;
    }
    raw.value += (raw.value.trim() ? "\n" : "") + text;
  };

  recognition.onend = () => {
    mic.textContent = "🎙️ ورود صوتی";
    status.textContent = "متن صوتی اضافه شد.";
  };

  recognition.onerror = () => {
    mic.textContent = "🎙️ ورود صوتی";
    status.textContent = "ورود صوتی در این مرورگر/دستگاه در دسترس نبود.";
  };
}
