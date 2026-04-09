import React, { useState, useRef } from "react";
import { toast } from "sonner";

const VoiceAssistant = ({
  fieldName,
  fieldValue,
  onValueChange,
  expectedType = "text",
  options = [],
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const synthRef = useRef(window.speechSynthesis);

  const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;

  // ✅ WORD → NUMBER CONVERTER
  const wordsToNumber = (text) => {
    const small = {
      zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
      six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
      eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
      fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19
    };

    const tens = {
      twenty: 20, thirty: 30, forty: 40, fifty: 50,
      sixty: 60, seventy: 70, eighty: 80, ninety: 90
    };

    let words = text.split(/\s+/);
    let num = 0;

    for (let word of words) {
      if (small[word] !== undefined) {
        num += small[word];
      } else if (tens[word]) {
        num += tens[word];
      }
    }

    return num || null;
  };

  // 🎤 START RECORDING
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await sendToDeepgram(blob);
      };

      mediaRecorder.start();
      setIsListening(true);

      setTimeout(() => {
        mediaRecorder.stop();
        setIsListening(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      toast.error("Mic access denied");
    }
  };

  // 📡 SEND TO DEEPGRAM
  const sendToDeepgram = async (blob) => {
    try {
    const res = await fetch(
  "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true",
  {
    method: "POST",
    headers: {
      Authorization: `Token ${DEEPGRAM_API_KEY}`,
      "Content-Type": "audio/webm",
    },
    body: blob,
  }
);

      const data = await res.json();

      const text =
        data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

      console.log("Deepgram Transcript:", text);

      setTranscript(text);

      if (text) {
        processVoiceInput(text);
      } else {
        toast.error("No speech detected");
      }
    } catch (err) {
      console.error(err);
      toast.error("Deepgram failed");
    }
  };

  // 🧠 PROCESS INPUT
  const processVoiceInput = (voiceText) => {
    const cleaned = voiceText.trim().toLowerCase();

    console.log("VOICE:", cleaned);

    if (expectedType === "number") {
      let number = null;

      // ✅ Case 1: digits
      const digitMatch = cleaned.match(/\d+/);
      if (digitMatch) {
        number = parseInt(digitMatch[0], 10);
      }

      // ✅ Case 2: words
      if (!number) {
        number = wordsToNumber(cleaned);
      }

      if (number !== null && !isNaN(number)) {
        onValueChange(String(number));
        speakResponse(`Setting ${fieldName} to ${number}`);
      } else {
        toast.error("Could not understand the number. Please try again.");
      }
    }

    // ✅ SELECT TYPE
    else if (expectedType === "select") {
      let matched = null;

      for (const option of options) {
        const label =
          typeof option === "string" ? option : option.label;

        if (
          cleaned.includes(label.toLowerCase()) ||
          label.toLowerCase().includes(cleaned)
        ) {
          matched = typeof option === "string" ? option : option.value;
          break;
        }
      }

      if (matched) {
        onValueChange(matched);

        const labelObj = options.find(
          (o) => (typeof o === "string" ? o : o.value) === matched
        );

        const display =
          typeof labelObj === "string" ? labelObj : labelObj.label;

        speakResponse(`Selected ${display}`);
      } else {
        const list = options
          .map((o) => (typeof o === "string" ? o : o.label))
          .join(", ");

        toast.error(`Choose from: ${list}`);
      }
    }

    // ✅ TEXT TYPE
    else {
      onValueChange(cleaned);
      speakResponse(`Got it: ${cleaned}`);
    }
  };

  // 🔊 SPEAK RESPONSE
  const speakResponse = (text) => {
    if (!synthRef.current) return;

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  return (
    <div className="relative inline-flex gap-1.5">
      {/* 🎤 MIC */}
      <button
        type="button"
        onClick={startRecording}
        className={`w-10 h-10 rounded-lg ${
          isListening
            ? "bg-red-500 text-white animate-pulse"
            : "bg-blue-100 text-blue-600"
        }`}
      >
        🎤
      </button>

      {/* 🔊 HELP */}
      <button
        type="button"
        onClick={() =>
          speakResponse(`Please provide your ${fieldName}`)
        }
        className="w-10 h-10 rounded-lg bg-amber-100"
      >
        🔊
      </button>

      {/* 📜 TRANSCRIPT */}
      {transcript && (
        <div className="absolute -bottom-8 left-0 bg-black text-white text-xs px-2 py-1 rounded">
          {transcript}
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;