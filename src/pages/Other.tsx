import { useState } from "react";

const Other = () => {
  const [areButtonsDisabled, setButtonsDisabled] = useState(false); // State to disable all buttons
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null); // State to track the currently playing audio

  const handleButtonClick = (audioSrc: string) => {
    if (currentAudio) {
      // If an audio is already playing, stop it
      currentAudio.pause();
      currentAudio.currentTime = 0;

      // If the same button is clicked, re-enable all buttons and stop the audio
      if (currentAudio.src.includes(audioSrc)) {
        setCurrentAudio(null);
        setButtonsDisabled(false);
        return;
      }
    }

    // Play the new audio
    const newAudio = new Audio(audioSrc);
    newAudio.play();
    setCurrentAudio(newAudio);
    setButtonsDisabled(true); // Disable all buttons
  };

  return (
    <div>
      {/* First Button */}
      <button
        onClick={() => handleButtonClick("/oies.mp3")}
        disabled={areButtonsDisabled && currentAudio?.src.includes("/oies.mp3")}
      >
        <img rel="preload" src="/oies.gif" alt="Animated GIF" />
      </button>

      {/* Second Button */}
      <button
        onClick={() => handleButtonClick("/samantha.mp3")}
        disabled={areButtonsDisabled && currentAudio?.src.includes("/samantha.mp3")}
      >
        <img rel="preload" src="/samantha-olaf.gif" alt="Animated GIF" />
      </button>
    </div>
  );
};

export default Other;