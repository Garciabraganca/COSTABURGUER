"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  VideoClip,
  VideoSequence,
  generateVideoSequence,
  flattenSequence,
  calculateTotalDuration,
} from '@/lib/videoMapping';

interface KitchenTheaterProps {
  ingredientes: string[];
  extras?: string[];
  pedidoId?: string;
  onComplete?: () => void;
  autoPlay?: boolean;
}

export default function KitchenTheater({
  ingredientes,
  extras = [],
  pedidoId,
  onComplete,
  autoPlay = true,
}: KitchenTheaterProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [sequence, setSequence] = useState<VideoSequence | null>(null);
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const [currentLabel, setCurrentLabel] = useState('');
  const [totalDuration, setTotalDuration] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Gera a sequência de vídeos quando os ingredientes mudam
  useEffect(() => {
    const newSequence = generateVideoSequence(ingredientes, extras);
    setSequence(newSequence);
    const flatClips = flattenSequence(newSequence);
    setClips(flatClips);
    setTotalDuration(calculateTotalDuration(newSequence));
    setCurrentIndex(0);
    setElapsedTime(0);
    setProgress(0);
    setIsComplete(false);
    setVideoError(false);

    if (flatClips.length > 0) {
      setCurrentLabel(flatClips[0].label);
    }

    // Cleanup timer on unmount or re-init
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [ingredientes, extras]);

  // Avança para o próximo vídeo
  const advanceToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      if (nextIndex >= clips.length) {
        // Sequência completa
        setIsComplete(true);
        setProgress(100);
        onComplete?.();
        return prevIndex;
      }

      // Atualiza tempo decorrido
      const completedDuration = clips
        .slice(0, nextIndex)
        .reduce((sum, clip) => sum + clip.duration, 0);
      setElapsedTime(completedDuration);

      return nextIndex;
    });
  }, [clips, onComplete]);

  // Simula progresso quando o vídeo não existe (para desenvolvimento)
  const simulateVideoProgress = useCallback((duration: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed >= duration) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        advanceToNext();
      }
    }, 100);
  }, [advanceToNext]);

  // Carrega o vídeo atual
  useEffect(() => {
    if (clips.length > 0 && currentIndex < clips.length && videoRef.current) {
      const currentClip = clips[currentIndex];
      videoRef.current.src = currentClip.src;
      setCurrentLabel(currentClip.label);
      setVideoError(false);

      if (isPlaying) {
        videoRef.current.play().catch(() => {
          // Se o vídeo não existir, simula a duração e passa pro próximo
          setVideoError(true);
          simulateVideoProgress(currentClip.duration);
        });
      }
    }
  }, [currentIndex, clips, isPlaying, simulateVideoProgress]);

  // Atualiza progresso durante a reprodução
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && totalDuration > 0) {
      const currentVideoProgress = videoRef.current.currentTime;
      const previousDuration = clips
        .slice(0, currentIndex)
        .reduce((sum, clip) => sum + clip.duration, 0);
      const totalElapsed = previousDuration + currentVideoProgress;
      const newProgress = (totalElapsed / totalDuration) * 100;
      setProgress(Math.min(newProgress, 100));
      setElapsedTime(totalElapsed);
    }
  }, [currentIndex, clips, totalDuration]);

  // Controles de play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Formata tempo em MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calcula fase atual
  const getCurrentPhase = () => {
    if (!sequence) return '';
    const introCount = sequence.intro.length;
    const ingredientesCount = sequence.ingredientes.length;
    const montagemCount = sequence.montagem.length;
    const extrasCount = sequence.extras.length;

    if (currentIndex < introCount) return 'Iniciando';
    if (currentIndex < introCount + ingredientesCount) return 'Selecionando ingredientes';
    if (currentIndex < introCount + ingredientesCount + montagemCount) return 'Preparando';
    if (currentIndex < introCount + ingredientesCount + montagemCount + extrasCount) return 'Extras';
    return 'Finalizando';
  };

  // Handler para erro de vídeo
  const handleVideoError = () => {
    setVideoError(true);
    simulateVideoProgress(clips[currentIndex]?.duration || 3);
  };

  if (clips.length === 0) {
    return (
      <div className="kitchen-theater kitchen-theater--loading">
        <div className="kitchen-theater__loader">
          <span className="loader-icon">🍔</span>
          <p>Preparando sua experiência...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="kitchen-theater">
      {/* Header com info do pedido */}
      <div className="kitchen-theater__header">
        <div className="header-left">
          <span className="phase-badge">{getCurrentPhase()}</span>
          {pedidoId && <span className="pedido-id">Pedido #{pedidoId}</span>}
        </div>
        <div className="header-right">
          <span className="time-display">
            {formatTime(elapsedTime)} / {formatTime(totalDuration)}
          </span>
        </div>
      </div>

      {/* Container do vídeo */}
      <div className="kitchen-theater__video-container">
        {isComplete ? (
          <div className="kitchen-theater__complete">
            <span className="complete-icon">✨</span>
            <h3>Seu pedido está pronto!</h3>
            <p>Saindo para entrega...</p>
          </div>
        ) : videoError ? (
          <div className="kitchen-theater__placeholder">
            <span className="placeholder-icon">👨‍🍳</span>
            <p>{currentLabel}</p>
            <small>Vídeo em produção...</small>
          </div>
        ) : (
          <video
            ref={videoRef}
            className="kitchen-theater__video"
            playsInline
            muted
            onEnded={advanceToNext}
            onTimeUpdate={handleTimeUpdate}
            onError={handleVideoError}
          />
        )}

        {/* Overlay com label */}
        {!isComplete && (
          <div className="kitchen-theater__overlay">
            <p className="current-action">{currentLabel}</p>
          </div>
        )}

        {/* Controle de play/pause */}
        {!isComplete && (
          <button
            className="kitchen-theater__play-btn"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
        )}
      </div>

      {/* Barra de progresso */}
      <div className="kitchen-theater__progress">
        <div className="progress-bar">
          <div
            className="progress-bar__fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="progress-steps">
          {clips.map((clip, idx) => (
            <div
              key={clip.id}
              className={`progress-step ${idx <= currentIndex ? 'completed' : ''} ${idx === currentIndex ? 'active' : ''}`}
              title={clip.label}
            />
          ))}
        </div>
      </div>

      {/* Contador de etapas */}
      <div className="kitchen-theater__footer">
        <span className="step-counter">
          Etapa {currentIndex + 1} de {clips.length}
        </span>
        <span className="progress-percent">{Math.round(progress)}% concluído</span>
      </div>
    </div>
  );
}
