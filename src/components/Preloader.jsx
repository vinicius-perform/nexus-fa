'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const NexusStructuralBase = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    // Configuração das linhas (camadas de profundidade)
    const lineCount = 18;
    const lines = Array.from({ length: lineCount }).map((_, i) => ({
      yBase: canvas.height * 0.85,
      amplitude: 100 + Math.random() * 80,
      width: canvas.width * (0.6 + Math.random() * 0.4),
      speed: 0.002 + Math.random() * 0.003,
      offset: Math.random() * Math.PI * 2,
      opacity: 0.02 + (i / lineCount) * 0.12,
      thickness: 0.5 + (i / lineCount) * 1.5,
    }));

    let time = 0;

    const drawLine = (line, t) => {
      ctx.beginPath();
      ctx.moveTo(0, line.yBase);

      const centerX = canvas.width / 2;
      const sigma = canvas.width * 0.18; // Largura da "montanha"
      
      // Respiração lenta da amplitude central
      const currentAmplitude = line.amplitude + Math.sin(t * line.speed + line.offset) * 25;

      for (let x = 0; x <= canvas.width; x += 4) {
        // Equação de curva gaussiana para o pico central
        const exponent = -Math.pow(x - centerX, 2) / (2 * Math.pow(sigma, 2));
        const yOffset = currentAmplitude * Math.exp(exponent);
        
        // Adiciona um leve ruído/frequência tecnológica
        const noise = Math.sin(x * 0.01 + t * 0.5) * 2;
        
        ctx.lineTo(x, line.yBase - yOffset + noise);
      }

      ctx.strokeStyle = `rgba(34, 197, 94, ${line.opacity})`;
      ctx.lineWidth = line.thickness;
      ctx.stroke();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0B0F0D';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Adiciona um glow radial sutil no centro
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, 
        canvas.height * 0.75, 
        0, 
        canvas.width / 2, 
        canvas.height * 0.75, 
        canvas.width * 0.4
      );
      gradient.addColorStop(0, 'rgba(34, 197, 94, 0.03)');
      gradient.addColorStop(1, 'rgba(11, 15, 13, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      lines.forEach(line => drawLine(line, time));
      
      time += 0.05;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};

const Preloader = ({ onFinish }) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1, delay: 4.5 }} // Tempo extra para apreciar a estrutura
      onAnimationComplete={onFinish}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0B0F0D] overflow-hidden"
    >
      {/* Fundo Estrutural Premium */}
      <NexusStructuralBase />
      
      <div className="relative z-10 flex flex-col items-center translate-y-[-10%] md:translate-y-[-20%]">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          {/* Logo Glow Central */}
          <div className="absolute -inset-20 bg-accent/5 blur-[120px] rounded-full pointer-events-none animate-pulse" />
          
          <h1 className="text-white text-8xl md:text-[140px] font-black tracking-tighter mb-4 select-none drop-shadow-2xl">
            NEXUS
          </h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1.5 }}
            className="flex items-center gap-6 w-full"
          >
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-white/30" />
            <span className="text-white/40 text-xs md:text-sm font-bold tracking-[0.8em] uppercase whitespace-nowrap">
              Fazendo Acontecer
            </span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-white/10 to-white/30" />
          </motion.div>
        </motion.div>
        
        {/* Subtle status loader below text */}
        <div className="mt-20 w-64 h-[2px] bg-white/[0.03] rounded-full overflow-hidden">
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 4, ease: "easeInOut", delay: 0.5 }}
            className="h-full w-full bg-accent/40 origin-left shadow-[0_0_15px_rgba(34,197,94,0.3)]"
          />
        </div>
      </div>

      {/* Visual Depth: Scanlines & Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] opacity-60" />
      
      <motion.div 
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"
      />
    </motion.div>
  );
};

export default Preloader;
