'use client';

import React, { useRef, useState } from 'react';
import { AiFillStar, AiOutlineDownload, AiOutlineShareAlt, AiOutlineClose } from 'react-icons/ai';

export default function VibeCardModal({ isOpen, onClose, bookData }) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !bookData) return null;

  const title = bookData.book?.title || 'Judul Buku';
  const author = bookData.book?.author?.pen_name || 'Penulis';
  const rating = bookData.rating || 5;
  const quote = bookData.quote || 'Setiap halaman adalah perjalanan menemukan kedamaian batin.';
  const mood = bookData.moodTag || '🧘 Calm & Mindful';
  const coverUrl = bookData.book?.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400';

  // Render high-res 1080x1920 canvas and download as PNG
  const handleDownloadPNG = () => {
    setDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');

      // Background Gradient (Ink Plum to Deep Violet)
      const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
      grad.addColorStop(0, '#35233F');
      grad.addColorStop(0.5, '#26172E');
      grad.addColorStop(1, '#1A0E21');
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
      ctx.fillStyle = '#EF786B';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('✨ READVIBE WRAPPED', 100, 180);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '32px sans-serif';
      ctx.fillText('#FinishedRead • 9:16 Story Card', 100, 230);

      // Draw Cover image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Draw shadow for cover
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 20;

        ctx.drawImage(img, 100, 320, 480, 720);
        ctx.shadowColor = 'transparent';

        // Star Rating next to or below
        ctx.fillStyle = '#FFC107';
        ctx.font = '54px sans-serif';
        const stars = '★'.repeat(Math.min(5, Math.max(1, rating)));
        ctx.fillText(stars, 620, 480);

        ctx.fillStyle = '#FFF8F0';
        ctx.font = 'bold 44px sans-serif';
        ctx.fillText(`${rating}.0 / 5.0 Rating`, 620, 550);

        // Mood Badge
        ctx.fillStyle = 'rgba(233, 225, 241, 0.2)';
        ctx.beginPath();
        ctx.roundRect(620, 600, 360, 80, 40);
        ctx.fill();
        ctx.fillStyle = '#FFF8F0';
        ctx.font = 'bold 32px sans-serif';
        ctx.fillText(`Vibe: ${mood}`, 650, 652);

        // Book Title & Author
        ctx.fillStyle = '#FFF8F0';
        ctx.font = 'bold 64px Georgia, serif';
        ctx.fillText(title, 100, 1140, 880);

        ctx.fillStyle = '#EF786B';
        ctx.font = 'italic 40px sans-serif';
        ctx.fillText(`Karya ${author}`, 100, 1210);

        // Favorite Quote Box
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.roundRect(100, 1270, 880, 360, 24);
        ctx.fill();

        ctx.strokeStyle = '#EF786B';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(130, 1310);
        ctx.lineTo(130, 1590);
        ctx.stroke();

        ctx.fillStyle = '#FFF8F0';
        ctx.font = 'italic 38px Georgia, serif';
        wrapText(ctx, `"${quote}"`, 170, 1370, 780, 56);

        // Watermark & Footer
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '32px sans-serif';
        ctx.fillText('readvibe.app • Bagikan kesan membacamu', 100, 1780);

        // Download trigger
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `VibeCard-${title.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        link.href = dataUrl;
        link.click();
        setDownloading(false);
      };

      img.onerror = () => {
        // Fallback without image
        ctx.fillStyle = '#FFF8F0';
        ctx.font = 'bold 64px Georgia, serif';
        ctx.fillText(title, 100, 600, 880);
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `VibeCard-${title.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        link.href = dataUrl;
        link.click();
        setDownloading(false);
      };

      img.src = coverUrl;
    } catch (e) {
      console.error(e);
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Kesan Membaca: ${title}`,
          text: `"${quote}" — Baca selengkapnya di ReadVibe!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share dismissed');
      }
    } else {
      // Fallback: download PNG and copy link
      handleDownloadPNG();
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Helper text wrap
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

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px' }}>
        <div className="modal-content border-0 bg-transparent">
          <div className="d-flex justify-content-end mb-2">
            <button className="btn btn-light rounded-circle p-2" onClick={onClose} aria-label="Tutup Modal">
              <AiOutlineClose size={20} />
            </button>
          </div>

          {/* 9:16 Card Container */}
          <div className="rv-vibe-card-9-16 mx-auto">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="badge bg-warning text-dark px-3 py-1 fw-bold rounded-pill" style={{ fontSize: '11px' }}>
                  FINISHED READ
                </span>
                <span className="small text-white-50" style={{ fontSize: '12px' }}>
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
                />
                <div>
                  <div className="d-flex text-warning gap-1 mb-1">
                    {[...Array(rating)].map((_, i) => (
                      <AiFillStar key={i} size={18} />
                    ))}
                  </div>
                  <h6 className="fw-bold text-white mb-1" style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.2rem' }}>
                    {title}
                  </h6>
                  <p className="text-white-50 small mb-2">{author}</p>
                  <span className="badge bg-white-subtle text-light rounded-pill px-2 py-1" style={{ fontSize: '11px', background: 'rgba(255,255,255,0.15)' }}>
                    {mood}
                  </span>
                </div>
              </div>

              {/* Favorite Quote */}
              <div
                className="p-3 rounded-3 my-3"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderLeft: '4px solid var(--rv-vibe-coral)',
                }}
              >
                <p className="fst-italic small text-light mb-0" style={{ fontFamily: 'var(--font-editorial)', fontSize: '0.95rem' }}>
                  "{quote}"
                </p>
              </div>
            </div>

            {/* Footer Watermark */}
            <div>
              <div className="pt-2 border-top border-white-50 d-flex justify-content-between align-items-center small text-white-50">
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
              <AiOutlineShareAlt size={18} />
              <span>{copied ? 'Tautan Disalin!' : 'Bagikan'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
