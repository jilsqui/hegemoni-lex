# Email Setup Guide - Hegemoni Lex

**Status:** Password reset email system needs configuration

---

## Masalah Saat Ini

Endpoint forgot-password mengalami error karena **email service belum dikonfigurasi**. Sistem saat ini mendukung 2 pilihan:

1. **Gmail (via nodemailer)** - Gratis, tapi lebih kompleks
2. **Resend** - Lebih reliable, free tier 100 emails/day

---

## Opsi 1: Setup dengan Resend (DIREKOMENDASIKAN ✅)

**Keuntungan:**
- Free tier: 100 emails/day (cukup untuk startup)
- Tidak perlu App Password
- Reliable delivery
- Dashboard untuk monitoring

**Langkah Setup:**

### 1. Daftar di Resend
- Buka https://resend.com
- Sign up dengan email Anda
- Verifikasi email

### 2. Buat API Key
- Login ke Resend dashboard
- Menu: Settings → API Keys
- Copy API Key

### 3. Update Environment Variables

**Untuk Development (.env.local):**
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**Untuk Production (Vercel):**
```bash
vercel env add RESEND_API_KEY
```
Paste API Key Anda saat diminta.

### 4. Verify Domain (Optional tapi Recommended)

Di Resend Dashboard:
- Domains → Add Domain
- Masukkan: hegemonilex.com
- Follow DNS setup instructions
- Verifikasi DNS records

Setelah verified, update endpoint untuk gunakan verified domain:
```
from: 'noreply@hegemonilex.com'
```

### 5. Test Email

Jalankan test script:
```bash
node scripts/test-email.js
```

Atau curl:
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com"}'
```

---

## Opsi 2: Setup dengan Gmail (Jika lebih prefer)

**Keuntungan:**
- Gratis selamanya
- Sudah terintegrasi di kode

**Langkah Setup:**

### 1. Enable 2-Step Verification di Gmail
- Buka https://myaccount.google.com/security
- Cari "2-Step Verification"
- Follow setup wizard

### 2. Create App Password
Gmail akan generate password khusus aplikasi:
- Settings → Security
- App passwords (akan muncul jika 2FA enabled)
- Select app: Mail
- Select device: Windows Computer (atau device apapun)
- Copy password yang generated

### 3. Update Environment Variables

**Untuk Development (.env.local):**
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
```

**Untuk Production (Vercel):**
```bash
vercel env add EMAIL_USER
vercel env add EMAIL_PASS
```

### 4. Test Email

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test-user@gmail.com"}'
```

---

## Perbandingan

| Aspek | Resend | Gmail |
|---|---|---|
| Setup | 5 menit | 10 menit |
| Reliability | Excellent | Good |
| Free limit | 100/hari | Unlimited |
| Deliverability | Excellent | Good |
| Custom domain | Ya (Free) | Tidak |
| Support | Good | Gmail support |
| Recommended | ✅ | Fallback only |

---

## Troubleshooting

### "Terjadi kesalahan server" di forgot-password

**Check:**
1. Apakah environment variables sudah set?
   ```bash
   vercel env ls
   ```

2. Cek logs di Vercel
   ```bash
   vercel logs
   ```
   Atau setup real-time logs:
   ```bash
   vercel logs --follow
   ```

3. Untuk development, check console:
   ```bash
   npm run dev
   ```
   Lihat terminal output untuk error details

### Email tidak masuk ke inbox

**Jika pakai Gmail:**
- Cek folder Spam/Promotions
- Whitelist sender di Gmail settings
- Baca log error: `console.error('Gmail send error...')`

**Jika pakai Resend:**
- Cek Resend Dashboard → Logs
- Verify domain ownership untuk better deliverability

### "Invalid credentials" di Gmail

- Ensure 2FA is enabled dan App Password created
- Copy - paste app password, jangan ketik manual
- Remove spaces dari password saat paste

---

## After Setup: Deployment

### 1. Build & Test Locally
```bash
npm run build
npm run dev
```

### 2. Push ke Git
```bash
git add -A
git commit -m "Fix: Implement email service for password reset (Resend)"
git push origin main
```

### 3. Vercel akan auto-deploy
- Wait untuk build selesai
- Check logs untuk ensure no errors

### 4. Test di Production
```bash
curl -X POST https://hegemonilex.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test-email@gmail.com"}'
```

---

## Monitoring Email Delivery

### With Resend
- Dashboard → Logs
- Real-time notification jika ada error
- Track open rates, click rates (jika enabled)

### With Gmail
- Gmail Sent folder
- Google Security dashboard untuk activity log
- Check error logs di application logs

---

## Next Steps

1. **Choose:** Resend (recommended) atau Gmail
2. **Setup:** Follow langkah di atas
3. **Test:** Verify email delivery
4. **Deploy:** Push ke production
5. **Monitor:** Setup alerts untuk delivery failures

---

## Production Checklist

- [ ] Email service configured (Resend atau Gmail)
- [ ] Environment variables set di Vercel
- [ ] Test email delivery di production
- [ ] Monitor logs untuk failures
- [ ] Setup backup email dari domain (jika pakai Resend)
- [ ] Add SPF/DKIM records untuk better deliverability

---

**Created:** March 28, 2026  
**Last Updated:** March 28, 2026
