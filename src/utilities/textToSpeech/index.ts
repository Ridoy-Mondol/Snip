export const speakText = (
    text: string,
    setIsSpeaking: (val: boolean) => void,
    setIsPaused: (val: boolean) => void
  ) => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-Speech is not supported in this browser.");
      return;
    }
  
    // Stop any previous speech
    speechSynthesis.cancel();
  
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = "en-US";
  
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
  
    // Speak the text
    speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  };

  export const pauseSpeech = (setIsPaused: (val: boolean) => void, setIsSpeaking: (val: boolean) => void) => {
    if (speechSynthesis.speaking) {
      speechSynthesis.pause();
      setIsPaused(true);
    } else {
      setIsPaused(false);
      setIsSpeaking(false);
    }
  };
  

