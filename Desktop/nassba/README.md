# AHAMMAR Event Planning — Backend

Node.js + Express backend for the AHAMMAR luxury event planning website.

## Features
- ✅ Contact form API with server-side validation
- ✅ Email notifications via Nodemailer (Gmail or SMTP)
- ✅ Auto-reply emails to clients
- ✅ JSON database (no setup required)
- ✅ Password-protected admin dashboard
- ✅ Rate limiting & security headers
- ✅ Serves the frontend static files

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your email credentials and admin password
```

### 3. Start the server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

### 4. Access
- **Website:** http://localhost:3000
- **Admin dashboard:** http://localhost:3000/admin (password: see .env)
- **API health:** http://localhost:3000/api/health

## Email Setup (Gmail)
1. Enable 2FA on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Create an App Password for "Mail"
4. In `.env`, set:
   ```
   MAIL_SERVICE=gmail
   MAIL_USER=your@gmail.com
   MAIL_PASS=xxxx-xxxx-xxxx-xxxx   ← App Password
   MAIL_TO=info@ahammar-events.com
   ```

## Admin Dashboard
Visit http://localhost:3000/admin — enter the password from `.env`  
Default password: `ahammar2024` (change in .env!)

Features:
- View all contact form submissions
- Filter by status (New / Read / Replied)
- Search by name, email, or message
- Update submission status
- Delete submissions

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Server health check |
| POST | /api/contact | Submit contact form |
| GET | /api/contact/count | Total submissions count |

## Project Structure
```
ahammar-backend/
├── server.js          ← Main Express server
├── routes/
│   ├── contact.js     ← POST /api/contact
│   └── admin.js       ← Admin dashboard
├── middleware/
│   ├── db.js          ← JSON database (lowdb)
│   └── email.js       ← Nodemailer email service
├── public/            ← Frontend static files
│   ├── index.html
│   ├── css/style.css
│   ├── js/script.js   ← Updated to call real API
│   └── images/
├── data/
│   └── db.json        ← Auto-created database file
├── .env.example       ← Environment template
└── README.md
```
