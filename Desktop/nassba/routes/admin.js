/**
 * /admin — Password-protected Admin Dashboard
 * View all contact submissions, mark as read/replied, search/filter.
 */

import { Router } from "express";
import db from "../middleware/db.js";

const router = Router();

// ─────────────────────────────────────────
// AUTH HELPER
// ─────────────────────────────────────────
function getAdminPass() {
  return (process.env.ADMIN_PASSWORD || "ahammar2024").trim();
}

function getCookieValue(cookieHeader, key) {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";");
  const prefix = `${key}=`;
  const match = cookies.find((c) => c.trim().startsWith(prefix));
  if (!match) return null;
  return decodeURIComponent(match.trim().slice(prefix.length));
}

function isAuthenticated(req) {
  const token = getCookieValue(req.headers.cookie, "admin_auth");
  return token === Buffer.from(getAdminPass()).toString("base64");
}

function requireAuth(req, res, next) {
  if (isAuthenticated(req)) return next();
  return res.redirect("/admin/login");
}

// ─────────────────────────────────────────
// GET /admin/login
// ─────────────────────────────────────────
router.get("/login", (req, res) => {
  if (isAuthenticated(req)) return res.redirect("/admin");
  res.send(loginPage());
});

// ─────────────────────────────────────────
// POST /admin/login
// ─────────────────────────────────────────
router.post("/login", (req, res) => {
  const password = String(req.body?.password || "").trim();
  if (password === getAdminPass()) {
    const token = Buffer.from(getAdminPass()).toString("base64");
    res.setHeader(
      "Set-Cookie",
      `admin_auth=${encodeURIComponent(token)}; HttpOnly; Path=/admin; SameSite=Strict`,
    );
    return res.redirect("/admin");
  }
  res.send(loginPage("❌ Incorrect password. Try again."));
});

// ─────────────────────────────────────────
// GET /admin/logout
// ─────────────────────────────────────────
router.get("/logout", (req, res) => {
  res.setHeader(
    "Set-Cookie",
    "admin_auth=; HttpOnly; Path=/admin; Max-Age=0; SameSite=Strict",
  );
  res.redirect("/admin/login");
});

// ─────────────────────────────────────────
// GET /admin — Dashboard
// ─────────────────────────────────────────
router.get("/", requireAuth, async (req, res) => {
  await db.read();
  const { search, status, page = 1 } = req.query;
  const perPage = 10;

  let contacts = [...db.data.contacts].reverse(); // newest first

  // Filter by status
  if (status && ["new", "read", "replied"].includes(status)) {
    contacts = contacts.filter((c) => c.status === status);
  }

  // Search by name or email
  if (search) {
    const q = search.toLowerCase();
    contacts = contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.message || "").toLowerCase().includes(q),
    );
  }

  const total = contacts.length;
  const totalPages = Math.ceil(total / perPage);
  const currentPage = Math.max(1, Math.min(parseInt(page), totalPages || 1));
  const paged = contacts.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  const stats = {
    total: db.data.contacts.length,
    new: db.data.contacts.filter((c) => c.status === "new").length,
    read: db.data.contacts.filter((c) => c.status === "read").length,
    replied: db.data.contacts.filter((c) => c.status === "replied").length,
  };

  res.send(
    dashboardPage(paged, stats, {
      search,
      status,
      currentPage,
      totalPages,
      total,
    }),
  );
});

// ─────────────────────────────────────────
// POST /admin/contact/:id/status — Update status
// ─────────────────────────────────────────
router.post("/contact/:id/status", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["new", "read", "replied"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  await db.read();
  const contact = db.data.contacts.find((c) => c.id === id);
  if (!contact) return res.status(404).json({ error: "Not found" });

  contact.status = status;
  await db.write();

  res.json({ success: true, status });
});

// ─────────────────────────────────────────
// POST /admin/contact/:id/delete
// ─────────────────────────────────────────
router.post("/contact/:id/delete", requireAuth, async (req, res) => {
  const { id } = req.params;

  await db.read();
  const index = db.data.contacts.findIndex((c) => c.id === id);
  if (index === -1) return res.status(404).json({ error: "Not found" });

  db.data.contacts.splice(index, 1);
  await db.write();

  res.redirect("/admin");
});

// ─────────────────────────────────────────
// HTML TEMPLATES
// ─────────────────────────────────────────
function loginPage(error = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AHAMMAR Admin — Login</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { min-height: 100vh; display: flex; align-items: center; justify-content: center;
           background: #0a0a0a; font-family: 'Segoe UI', sans-serif; }
    .card { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px;
            padding: 48px 40px; width: 380px; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
    h1 { color: #fff; font-size: 28px; letter-spacing: 4px; text-align: center; margin-bottom: 4px; }
    .sub { color: #888; text-align: center; font-size: 13px; margin-bottom: 32px; }
    label { color: #aaa; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; display: block; margin-bottom: 6px; }
    input { width: 100%; background: #111; border: 1px solid #333; border-radius: 6px;
            color: #fff; padding: 12px 14px; font-size: 15px; outline: none; transition: border .2s; }
    input:focus { border-color: #C0392B; }
    button { width: 100%; background: #C0392B; color: white; border: none; border-radius: 6px;
             padding: 13px; font-size: 15px; font-weight: 600; letter-spacing: 1px;
             cursor: pointer; margin-top: 16px; transition: background .2s; }
    button:hover { background: #a93226; }
    .error { background: rgba(192,57,43,0.15); border: 1px solid rgba(192,57,43,0.4);
             color: #e74c3c; padding: 10px 14px; border-radius: 6px; font-size: 13px; margin-top: 16px; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <h1>AHAMMAR</h1>
    <p class="sub">Admin Dashboard</p>
    <form method="POST" action="/admin/login">
      <label for="password">Password</label>
      <input type="password" id="password" name="password" placeholder="Enter admin password" required autofocus>
      <button type="submit">Sign In →</button>
      ${error ? `<div class="error">${error}</div>` : ""}
    </form>
  </div>
</body>
</html>`;
}

function statusBadge(status) {
  const colors = { new: "#e74c3c", read: "#f39c12", replied: "#27ae60" };
  return `<span style="background:${colors[status]}22;color:${colors[status]};border:1px solid ${colors[status]}44;
    padding:2px 10px;border-radius:12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">${status}</span>`;
}

function dashboardPage(
  contacts,
  stats,
  { search, status, currentPage, totalPages, total },
) {
  const buildUrl = (params) => {
    const q = new URLSearchParams({
      ...(search && { search }),
      ...(status && { status }),
      page: 1,
      ...params,
    });
    return "/admin?" + q.toString();
  };

  const rows =
    contacts.length === 0
      ? `<tr><td colspan="6" style="text-align:center;padding:40px;color:#555;">No submissions found.</td></tr>`
      : contacts
          .map(
            (c) => `
      <tr id="row-${c.id}" style="border-bottom:1px solid #222;">
        <td style="padding:14px 12px;color:#aaa;font-size:12px;">${new Date(c.submittedAt).toLocaleDateString("en-GB")}</td>
        <td style="padding:14px 12px;color:#fff;font-weight:600;">${escHtml(c.name)}</td>
        <td style="padding:14px 12px;color:#888;font-size:13px;">${escHtml(c.email)}</td>
        <td style="padding:14px 12px;color:#aaa;font-size:13px;">${c.eventType || "—"}</td>
        <td style="padding:14px 12px;color:#aaa;font-size:13px;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(c.message)}</td>
        <td style="padding:14px 12px;">
          ${statusBadge(c.status)}
          <div style="margin-top:8px;display:flex;gap:6px;">
            <select onchange="updateStatus('${c.id}', this.value)" style="background:#222;color:#ccc;border:1px solid #333;border-radius:4px;padding:3px 6px;font-size:11px;cursor:pointer;">
              <option value="new" ${c.status === "new" ? "selected" : ""}>New</option>
              <option value="read" ${c.status === "read" ? "selected" : ""}>Read</option>
              <option value="replied" ${c.status === "replied" ? "selected" : ""}>Replied</option>
            </select>
            <button onclick="deleteContact('${c.id}')" style="background:#3a1a1a;color:#e74c3c;border:1px solid #5a2a2a;border-radius:4px;padding:3px 8px;font-size:11px;cursor:pointer;">🗑</button>
          </div>
        </td>
      </tr>`,
          )
          .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AHAMMAR Admin Dashboard</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0a0a0a; color: #ccc; font-family: 'Segoe UI', sans-serif; min-height: 100vh; }
    .topbar { background: #111; border-bottom: 1px solid #222; padding: 16px 32px;
              display: flex; align-items: center; justify-content: space-between; }
    .topbar h1 { color: #fff; font-size: 20px; letter-spacing: 4px; }
    .topbar span { color: #888; font-size: 13px; }
    .topbar a { color: #C0392B; text-decoration: none; font-size: 13px; }
    .main { max-width: 1300px; margin: 0 auto; padding: 32px 24px; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
    .stat { background: #111; border: 1px solid #222; border-radius: 10px; padding: 20px 22px; }
    .stat-num { font-size: 32px; font-weight: 700; color: #fff; }
    .stat-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
    .toolbar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .toolbar input { background: #111; border: 1px solid #333; border-radius: 6px; color: #fff;
                     padding: 9px 14px; font-size: 14px; flex: 1; min-width: 200px; outline: none; }
    .toolbar input:focus { border-color: #C0392B; }
    .toolbar select { background: #111; border: 1px solid #333; border-radius: 6px; color: #ccc;
                      padding: 9px 14px; font-size: 14px; outline: none; cursor: pointer; }
    .toolbar button { background: #C0392B; color: white; border: none; border-radius: 6px;
                      padding: 9px 20px; font-size: 14px; cursor: pointer; }
    .table-wrap { background: #111; border: 1px solid #1e1e1e; border-radius: 10px; overflow: auto; }
    table { width: 100%; border-collapse: collapse; }
    thead th { background: #161616; color: #666; font-size: 11px; text-transform: uppercase;
               letter-spacing: 1px; padding: 12px; text-align: left; border-bottom: 1px solid #222; }
    tbody tr:hover { background: #161616; }
    .pagination { display: flex; gap: 8px; align-items: center; justify-content: flex-end; margin-top: 20px; }
    .pagination a { background: #111; border: 1px solid #333; color: #ccc; padding: 6px 14px;
                    border-radius: 6px; text-decoration: none; font-size: 13px; }
    .pagination a:hover { border-color: #C0392B; color: #C0392B; }
    .pagination .current { background: #C0392B; border-color: #C0392B; color: #fff; cursor: default; }
    .pagination span { color: #666; font-size: 13px; }
  </style>
</head>
<body>
  <div class="topbar">
    <h1>AHAMMAR <span style="color:#C0392B;font-size:14px;">ADMIN</span></h1>
    <span>${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
    <a href="/admin/logout">Sign out →</a>
  </div>

  <div class="main">
    <!-- Stats -->
    <div class="stats">
      <div class="stat"><div class="stat-num">${stats.total}</div><div class="stat-label">Total Inquiries</div></div>
      <div class="stat"><div class="stat-num" style="color:#e74c3c">${stats.new}</div><div class="stat-label">New</div></div>
      <div class="stat"><div class="stat-num" style="color:#f39c12">${stats.read}</div><div class="stat-label">Read</div></div>
      <div class="stat"><div class="stat-num" style="color:#27ae60">${stats.replied}</div><div class="stat-label">Replied</div></div>
    </div>

    <!-- Toolbar -->
    <form method="GET" action="/admin">
      <div class="toolbar">
        <input name="search" placeholder="Search by name, email or message..." value="${escHtml(search || "")}">
        <select name="status">
          <option value="">All statuses</option>
          <option value="new" ${status === "new" ? "selected" : ""}>New</option>
          <option value="read" ${status === "read" ? "selected" : ""}>Read</option>
          <option value="replied" ${status === "replied" ? "selected" : ""}>Replied</option>
        </select>
        <button type="submit">Filter</button>
        <a href="/admin" style="background:#1a1a1a;border:1px solid #333;color:#aaa;padding:9px 16px;border-radius:6px;text-decoration:none;font-size:14px;">Reset</a>
      </div>
    </form>

    <!-- Table -->
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Email</th>
            <th>Event</th>
            <th>Message</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <!-- Pagination -->
    ${
      totalPages > 1
        ? `<div class="pagination">
      <span>${total} result${total !== 1 ? "s" : ""} · Page ${currentPage} of ${totalPages}</span>
      ${currentPage > 1 ? `<a href="${buildUrl({ page: currentPage - 1 })}">← Prev</a>` : ""}
      ${currentPage < totalPages ? `<a href="${buildUrl({ page: currentPage + 1 })}">Next →</a>` : ""}
    </div>`
        : ""
    }
  </div>

  <script>
    async function updateStatus(id, status) {
      const res = await fetch('/admin/contact/' + id + '/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) alert('Failed to update status.');
    }

    function deleteContact(id) {
      if (!confirm('Delete this submission permanently?')) return;
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/admin/contact/' + id + '/delete';
      document.body.appendChild(form);
      form.submit();
    }
  </script>
</body>
</html>`;
}

function escHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default router;
