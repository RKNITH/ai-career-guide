import React, { useState, useRef } from "react";
import { FaMicrophone, FaPlay, FaStop, FaHeartbeat } from "react-icons/fa";

const App = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef(null);

  // Call backend API
  const handleGetAdvice = async () => {
    if (!prompt) {
      alert("कृपया अपनी रुचि या कौशल बताइए!");
      return;
    }
    setIsLoading(true);
    setResponse("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/get-career-advice`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        }
      );

      const data = await res.json();
      if (data.result) setResponse(data.result);
    } catch (err) {
      console.error("❌ Error:", err);
      alert("अभी करियर सलाह नहीं दे पा रहा हूँ, कृपया दुबारा कोशिश करें।");
    } finally {
      setIsLoading(false);
    }
  };

  // Speak AI response
  // const handleSpeak = () => {
  //   if (isSpeaking) {
  //     window.speechSynthesis.cancel();
  //     setIsSpeaking(false);
  //     return;
  //   }

  //   if (response) {
  //     const utterance = new SpeechSynthesisUtterance(response);

  //     let voices = window.speechSynthesis.getVoices();
  //     if (!voices.length) {
  //       window.speechSynthesis.onvoiceschanged = () => handleSpeak();
  //       return;
  //     }

  //     const hindiVoice = voices.find((v) => v.lang === "hi-IN") || voices[0];
  //     utterance.voice = hindiVoice;

  //     utterance.pitch = 1.1;
  //     utterance.rate = 0.9;
  //     utterance.volume = 1;

  //     utterance.onend = () => setIsSpeaking(false);

  //     utteranceRef.current = utterance;
  //     window.speechSynthesis.speak(utterance);
  //     setIsSpeaking(true);
  //   }
  // };

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!response) return;

    const utterance = new SpeechSynthesisUtterance(response);

    const speak = () => {
      let voices = window.speechSynthesis.getVoices();
      if (!voices.length) {
        // wait for voices to load
        window.speechSynthesis.onvoiceschanged = speak;
        return;
      }

      const hindiVoice = voices.find(v => v.lang === "hi-IN") || voices[0];
      utterance.voice = hindiVoice;
      utterance.pitch = 1.1;
      utterance.rate = 0.9;
      utterance.volume = 1;
      utterance.onend = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    };

    speak();
  };


  // Voice input
  const startRecognition = () => {
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setPrompt(speechResult);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      alert("मैं समझ नहीं पाया, कृपया दोबारा बोलें।");
    };
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <header className="text-center my-8">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-400">
            🎯 AI Career Guide
          </h1>
          <p className="mt-2 text-gray-400">
            अपनी रुचि और कौशल बताइए, और AI से करियर सलाह प्राप्त कीजिए
          </p>
        </header>

        {/* Input Box */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="जैसे: मुझे कंप्यूटर साइंस पसंद है"
              className="w-full p-4 rounded-lg bg-gray-700 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <button
              onClick={startRecognition}
              className="p-4 rounded-full bg-blue-500 text-gray-900 hover:bg-blue-400"
            >
              <FaMicrophone size={22} />
            </button>
          </div>

          <button
            onClick={handleGetAdvice}
            disabled={isLoading}
            className="w-full mt-4 flex items-center justify-center gap-2 text-lg font-semibold bg-blue-500 text-gray-900 py-3 rounded-lg hover:bg-blue-400 disabled:bg-gray-500"
          >
            {isLoading ? "सलाह लाया जा रहा है..." : "करियर सलाह प्राप्त करें"}
            <FaHeartbeat />
          </button>
        </div>

        {/* Response Section */}
        {response && (
          <div className="mt-8 bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-blue-400 text-center mb-4">
              📝 आपकी करियर रिपोर्ट
            </h2>
            <p className="whitespace-pre-wrap text-lg">{response}</p>
            <div className="text-center mt-6">
              <button
                onClick={handleSpeak}
                className="p-4 rounded-full bg-blue-500 text-gray-900 hover:bg-blue-400"
              >
                {isSpeaking ? <FaStop size={24} /> : <FaPlay size={24} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
