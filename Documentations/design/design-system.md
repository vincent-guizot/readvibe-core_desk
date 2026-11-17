# Design System Ekosistem ReadVibe & VibeDesk

---

## 1. READVIBE — Desain Editorial & Hangat

Karakter visual: **Hangat, editorial, personal, dan nyaman untuk membaca**.

### Palet Warna & Token (`--rv-*`)
| Nama Warna | Nilai HEX | Token CSS | Penggunaan |
| :--- | :--- | :--- | :--- |
| **Ink Plum** | `#35233F` | `--rv-ink-plum` | Warna primer, teks heading utama, kartu Vibe 9:16. |
| **Vibe Coral** | `#EF786B` | `--rv-vibe-coral` | Warna aksen hangat, tombol CTA utama, highlight. |
| **Cream Paper** | `#FFF8F0` | `--rv-cream-paper` | Latar belakang kanvas aplikasi seperti kertas buku novel. |
| **Soft Lilac** | `#E9E1F1` | `--rv-soft-lilac` | Latar belakang badge mood, kutipan personal, chip aktif. |
| **Muted Sage** | `#91A99A` | `--rv-muted-sage` | Status keberhasilan, indikator kebiasaan positif. |
| **Warm Gray** | `#756F78` | `--rv-warm-gray` | Teks sekunder, deskripsi metadata, garis pembatas lembut. |

### Tipografi ReadVibe
- **Heading Editorial**: `DM Serif Display` (`--font-editorial`) untuk judul buku, hero headline, dan kutipan favorit.
- **Antarmuka & Teks**: `Manrope` (`--font-ui`) untuk body text, label tombol, form, dan navigasi.

---

## 2. VIBEDESK — Desain Rapi & Profesional

Karakter visual: **Rapi, tenang, profesional, dan mudah dipindai**.

### Palet Warna & Token (`--vd-*`)
| Nama Warna | Nilai HEX | Token CSS | Penggunaan |
| :--- | :--- | :--- | :--- |
| **Desk Navy** | `#202B3C` | `--vd-desk-navy` | Warna teks utama, heading backoffice, kontras tegas. |
| **Curator Teal** | `#3C8C84` | `--vd-curator-teal` | Warna aksen kurator, tombol primer, indikator aktif sidebar. |
| **Soft Sand** | `#F5F2EC` | `--vd-soft-sand` | Latar belakang area konten utama (tenang di mata). |
| **Cloud White** | `#FFFFFF` | `--vd-cloud-white` | Latar belakang sidebar navigasi dan kartu data. |
| **Muted Gold** | `#D6A85F` | `--vd-muted-gold` | Indikator bobot kurasi, badge rating bintang. |
| **Slate Gray** | `#667085` | `--vd-slate-gray` | Teks keterangan, icon sekunder, border pemisah tabel. |

### Tipografi VibeDesk
- **Antarmuka Utuh**: `Manrope` (`--vd-font-sans`) untuk seluruh antarmuka tabel, form input, dan metrik analitik.

---

## 3. Aturan Visual & Tata Letak Bersama

- **Skala Spacing**: `4px`, `8px`, `16px`, `24px`, `32px`.
- **Skala Radius Sudut**: `8px` (`sm`), `12px` (`md`), `16px` (`lg`).
- **Aksesibilitas Kontras**: Rasio kontras teks selalu memenuhi pedoman WCAG AA.
- **Focus State**: Indikator outline `3px` solid warna aksen saat navigasi keyboard (`:focus-visible`).
- **Rasio Kartu Vibe**: Rasio **9:16** (`aspect-ratio: 9/16`), dirancang khusus untuk Instagram Stories & WhatsApp Status.

### Aset Logo
Semua logo resmi bersumber dari direktori `Assets/logos/`:
- **ReadVibe**: `readvibe-horizontal-color.png`, `readvibe-horizontal-white.png`, `readvibe-icon-color.png`.
- **VibeDesk**: `vibedesk-horizontal-color.png`, `vibedesk-horizontal-navy.png`, `vibedesk-icon-color.png`.
