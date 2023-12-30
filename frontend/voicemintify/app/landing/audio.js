import { useEffect, useState } from 'react'

let recognition = null;
if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.lang = "en-US";
}

const useSpeechRecognition = () => {
    const [text, setText] = useState("");
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        if (!recognition) {
            return;
        }

        recognition.onresult = (event) => {
            console.log("onresult event: ", event);
            setText(event.results[0][0].transcript);
            recognition.stop();
            setIsListening(false);
        };
    }, []);

