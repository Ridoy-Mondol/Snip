"use client"
import "regenerator-runtime/runtime";
import { useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

const useSpeechToText = () => {
  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const [fieldSetter, setFieldSetter] = useState<((value: string) => void) | null>(null);

  // Function to start listening and set field setter
  const startListening = (setFieldValue: (value: string) => void) => {
    setFieldSetter(() => setFieldValue);
    SpeechRecognition.startListening({ continuous: false, language: "en-US" });
  };

  // When speech ends, update the field
  if (!listening && transcript && fieldSetter) {
    fieldSetter(transcript);
    resetTranscript();
  }

  return {
    transcript,
    listening,
    startListening,
    stopListening: SpeechRecognition.stopListening,
    resetTranscript,
    isSupported: SpeechRecognition.browserSupportsSpeechRecognition(),
  };
};

export default useSpeechToText;



