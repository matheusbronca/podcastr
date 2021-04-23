import { usePlayer } from 'contexts/PlayerContext';
import { useEffect, useRef, useState } from 'react';
import Slider from 'rc-slider';
import Image from 'next/image';
import styles from './styles.module.scss';
import 'rc-slider/assets/index.css';
import { convertDurationToTimeString } from 'utils/convertDurationToTimeString';

export default function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);

  const {
    episodeList,
    playNext,
    playPrevious,
    currentEpisodeIndex,
    isPlaying,
    isLooping,
    isShuffling,
    togglePlay,
    toggleLoop,
    toggleShuffle,
    setPlayingState,
    hasNext,
    hasPrevious,
    clearPlayerState,
  } = usePlayer();

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    if (isPlaying) {
      audioRef.current.play();
    }
    if (!isPlaying) {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  function setupProgressListener() {
    audioRef.current.currentTime = 0;

    audioRef.current.addEventListener('timeupdate', () => {
      setProgress(Math.floor(audioRef.current.currentTime));
    });
  }

  function handleSeek(amount: number) {
    audioRef.current.currentTime = amount;
    setProgress(amount);
  }

  function handleEpisodeEnded() {
    if (hasNext) {
      playNext();
    } else {
      clearPlayerState();
    }
  }

  const episode = episodeList[currentEpisodeIndex];

  return (
    <div className={styles.playerContainer}>
      <header>
        <img src="/playing.svg" alt="Tocando agora" />
        <strong>Tocando agora</strong>
      </header>

      {episode ? (
        <div className={styles.currentEpisode}>
          <Image
            width={592}
            height={592}
            src={episode.thumbnail}
            objectFit="cover"
          />
          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
        </div>
      ) : (
        <div className={styles.emptyPlayer}>
          <strong>Selecione um podcast para ouvir</strong>
        </div>
      )}

      <footer className={!episode ? styles.empty : ''}>
        <div className={styles.progress}>
          <span>{convertDurationToTimeString(progress)}</span>
          <div className={styles.slider}>
            {episode ? (
              <Slider
                max={episode.duration}
                value={progress}
                onChange={handleSeek}
                trackStyle={{ backgroundColor: '#04d361' }}
                railStyle={{ backgroundColor: '#9f75ff' }}
                handleStyle={{ borderColor: '#04d361', borderWidth: '4px' }}
              />
            ) : (
              <div className={styles.emptySlider} />
            )}
          </div>
          <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
        </div>

        {episode && (
          <audio
            ref={audioRef}
            src={episode.url}
            autoPlay
            loop={isLooping}
            onPlay={() => setPlayingState(true)}
            onPause={() => setPlayingState(false)}
            onEnded={handleEpisodeEnded}
            onLoadedData={setupProgressListener}
          />
        )}

        <div className={styles.buttons}>
          <button
            className={isShuffling ? styles.isActive : ''}
            type="button"
            onClick={toggleShuffle}
            disabled={!episode || episodeList.length === 1}
          >
            <img src="/shuffle.svg" alt="Embaralhar" />
          </button>
          <button type="button" disabled={!episode || !hasPrevious}>
            <img
              src="/play-previous.svg"
              onClick={playPrevious}
              alt="Tocar Podcast anterior"
            />
          </button>
          <button
            type="button"
            className={styles.playButton}
            disabled={!episode}
            onClick={togglePlay}
          >
            {!isPlaying ? (
              <img src="/play.svg" alt="Tocar Podcast" />
            ) : (
              <img src="/pause.svg" alt="Pausar Podcast" />
            )}
          </button>
          <button
            type="button"
            onClick={playNext}
            disabled={!episode || !hasNext}
          >
            <img src="/play-next.svg" alt="Tocar próximo Podcast" />
          </button>
          <button
            className={isLooping ? styles.isActive : ''}
            type="button"
            onClick={toggleLoop}
            disabled={!episode}
          >
            <img src="/repeat.svg" alt="Repetir" />
          </button>
        </div>
      </footer>
    </div>
  );
}
