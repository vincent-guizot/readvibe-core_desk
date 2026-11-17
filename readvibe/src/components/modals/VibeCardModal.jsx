'use client';

import React, { useState } from 'react';
import { AiFillStar, AiOutlineDownload, AiOutlineShareAlt, AiOutlineClose, AiOutlineCheck } from 'react-icons/ai';

export default function VibeCardModal({ isOpen, onClose, bookData }) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState('Twilight'); // 'Twilight' | 'Paper' | 'Botanical' | 'Sunset'

  if (!isOpen || !bookData) return null;

  const title = bookData.book?.title || 'Judul Buku';
  const author = bookData.book?.author?.pen_name || bookData.book?.author || 'Penulis';
  const rating = bookData.rating || 5;
  const quote = bookData.quote || 'Setiap halaman adalah perjalanan menemukan kedamaian batin.';
  const mood = bookData.moodTag || '✦ Calm & Mindful';
  const coverUrl = bookData.book?.image || bookData.book?.coverUrl || '/assets/books/midnight-library.jpg';

  const themePalettes = {
    Twilight: {
      gradient: ['#2E1B38', '#140A18'],
      text: '#FFFFFF',
      sub: '#CCCCCC',
      star: '#FFB26B',
      cardBg: 'linear-gradient(165deg, #2D1B36 0%, #150C1B 100%)',
    },
    Paper: {
      gradient: ['#FFFDF9', '#F4EDE4'],
      text: '#35233F',
      sub: '#756F78',
      star: '#EF786B',
      cardBg: 'linear-gradient(145deg, #FFF9F2 0%, #F5EDE4 100%)',
    },
    Botanical: {
      gradient: ['#2C3E33', '#16231B'],
      text: '#FFFFFF',
      sub: '#B5C7BC',
      star: '#FFD3B6',
      cardBg: 'linear-gradient(150deg, #2C3D32 0%, #17241C 100%)',
    },
    Sunset: {
      gradient: ['#F97769', '#782645'],
      text: '#FFFFFF',
      sub: '#FCE7DF',
      star: '#FFE082',
      cardBg: 'linear-gradient(150deg, #F97769 0%, #7E294A 100%)',
    },
  };

  const activePalette = themePalettes[theme] || themePalettes.Twilight;

  // Render high-res 1080x1920 canvas and download as PNG
  const handleDownloadPNG = () => {
    setDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');

      // Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
      grad.addColorStop(0, activePalette.gradient[0]);
      grad.addColorStop(1, activePalette.gradient[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Aesthetic background circle glow
      const radial = ctx.createRadialGradient(900, 200, 50, 900, 200, 600);
      radial.addColorStop(0, 'rgba(239, 120, 107, 0.45)');
      radial.addColorStop(1, 'transparent');
      ctx.fillStyle = radial;
      ctx.beginPath();
      ctx.arc(900, 200, 600, 0, Math.PI * 2);
      ctx.fill();

      // Top Tag
      ctx.fillStyle = activePalette.star;
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('✨ READVIBE WRAPPED', 100, 180);

      ctx.fillStyle = activePalette.sub;
      ctx.font = '32px sans-serif';
      ctx.fillText('#FinishedRead • 9:16 Story Card', 100, 230);

      const renderCanvasTexts = () => {
        // Title & Author
        ctx.fillStyle = activePalette.text;
        ctx.font = 'bold 58px serif';
        wrapText(ctx, title, 100, 1140, 880, 68);

        ctx.fillStyle = activePalette.sub;
        ctx.font = '36px sans-serif';
        ctx.fillText(`Karya: ${author}`, 100, 1280);

        // Quote Box
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.roundRect(100, 1340, 880, 320, 24);
        ctx.fill();

        ctx.fillStyle = '#EF786B';
        ctx.fillRect(100, 1340, 16, 320);

        ctx.fillStyle = activePalette.text;
        ctx.font = 'italic 40px serif';
        wrapText(ctx, `"${quote}"`, 160, 1420, 780, 52);

        // Footer Branding
        ctx.fillStyle = activePalette.sub;
        ctx.font = '32px sans-serif';
        ctx.fillText('readvibe.app', 100, 1780);

        ctx.fillStyle = activePalette.star;
        ctx.fillText('✨ Temukan bukumu sesuai mood', 550, 1780);

        // Export PNG
        const link = document.createElement('a');
        link.download = `readvibe-${title.toLowerCase().replace(/\s+/g, '-')}-story.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        setDownloading(false);
      };

      // Draw Cover image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 20;

        ctx.drawImage(img, 100, 320, 480, 720);
        ctx.restore();

        // Star Rating
        ctx.fillStyle = activePalette.star;
        ctx.font = '54px sans-serif';
        const stars = '★'.repeat(Math.min(5, Math.max(1, rating)));
        ctx.fillText(stars, 620, 480);

        ctx.fillStyle = activePalette.text;
        ctx.font = 'bold 44px sans-serif';
        ctx.fillText(`${rating}.0 / 5.0 Rating`, 620, 550);

        // Mood Badge
        ctx.fillStyle = 'rgba(233, 225, 241, 0.2)';
        ctx.beginPath();
        ctx.roundRect(620, 600, 360, 80, 40);
        ctx.fill();

        ctx.fillStyle = activePalette.text;
        ctx.font = 'bold 32px sans-serif';
        ctx.fillText(mood, 650, 652);

        renderCanvasTexts();
      };

      img.onerror = () => {
        renderCanvasTexts();
      };

      img.src = coverUrl;
    } catch (err) {
      console.error('Failed to generate image', err);
      setDownloading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `ReadVibe Card: ${title}`,
        text: `Saya baru saja menyelesaikan "${title}". Kuotasi favorit: "${quote}"`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${window.location.href}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Helper function for wrapping canvas text
  function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, y);
  }

  const themes = [
    { id: 'Twilight', label: 'Twilight' },
    { id: 'Paper', label: 'Paper' },
    { id: 'Botanical', label: 'Botanical' },
    { id: 'Sunset', label: 'Sunset' },
  ];

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px' }}>
        <div className="modal-content border-0 bg-transparent">
          <div className="d-flex justify-content-between align-items-center mb-2 px-1">
            {/* Theme switcher pills */}
            <div className="d-flex gap-1">
              {themes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={`btn btn-sm rounded-pill px-2.5 py-0.5 small ${
                    theme === t.id ? 'btn-rv-coral' : 'btn-light'
                  }`}
                  style={{ fontSize: '11px' }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <button className="btn btn-light rounded-circle p-2" onClick={onClose} aria-label="Tutup Modal">
              <AiOutlineClose size={18} />
            </button>
          </div>

          {/* 9:16 Card Container */}
          <div
            className="rv-vibe-card-9-16 mx-auto"
            style={{
              background: activePalette.cardBg,
              color: activePalette.text,
            }}
          >
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="badge bg-warning text-dark px-3 py-1 fw-bold rounded-pill" style={{ fontSize: '11px' }}>
                  FINISHED READ
                </span>
                <span className="small opacity-75" style={{ fontSize: '12px' }}>
                  #ReadVibeWrapped
                </span>
              </div>

              {/* Cover & Rating */}
              <div className="d-flex gap-3 align-items-center mb-3">
                <img
                  src={coverUrl}
                  alt={title}
                  className="rounded-3 shadow"
                  style={{ width: '90px', height: '135px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.src = '/assets/books/midnight-library.jpg';
                  }}
                />
                <div>
                  <div className="d-flex gap-1 mb-1" style={{ color: activePalette.star }}>
                    {[...Array(rating)].map((_, i) => (
                      <AiFillStar key={i} size={18} />
                    ))}
                  </div>
                  <h6
                    className="fw-bold mb-1 rv-editorial"
                    style={{ color: activePalette.text, fontSize: '1.2rem' }}
                  >
                    {title}
                  </h6>
                  <p className="small mb-2" style={{ color: activePalette.sub }}>
                    {author}
                  </p>
                  <span
                    className="badge rounded-pill px-2 py-1"
                    style={{ fontSize: '11px', background: 'rgba(255,255,255,0.18)', color: activePalette.text }}
                  >
                    {mood}
                  </span>
                </div>
              </div>

              {/* Favorite Quote */}
              <div
                className="p-3 rounded-3 my-3"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderLeft: `4px solid ${activePalette.star}`,
                }}
              >
                <p className="fst-italic small mb-0 rv-editorial" style={{ color: activePalette.text, fontSize: '0.95rem' }}>
                  &ldquo;{quote}&rdquo;
                </p>
              </div>
            </div>

            {/* Footer Watermark */}
            <div>
              <div className="pt-2 border-top d-flex justify-content-between align-items-center small opacity-75">
                <span>readvibe.app</span>
                <span>✨ 9:16 Story Card</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="d-flex gap-2 justify-content-center mt-3">
            <button
              className="btn btn-rv-coral px-4 d-flex align-items-center gap-2"
              onClick={handleDownloadPNG}
              disabled={downloading}
            >
              <AiOutlineDownload size={18} />
              <span>{downloading ? 'Merender...' : 'Unduh PNG (9:16)'}</span>
            </button>
            <button
              className="btn btn-light px-3 d-flex align-items-center gap-2 fw-semibold"
              onClick={handleShare}
            >
              {copied ? <AiOutlineCheck className="text-success" size={18} /> : <AiOutlineShareAlt size={18} />}
              <span>{copied ? 'Tautan Disalin!' : 'Bagikan'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
