/**
 * POST /api/contact
 * Handles contact form submissions:
 * 1. Validates input
 * 2. Saves to JSON database
 * 3. Sends email notification to team
 * 4. Sends auto-reply to client
 */

import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { nanoid } from 'nanoid';
import db from '../middleware/db.js';
import { sendContactNotification, sendClientAutoReply } from '../middleware/email.js';

const router = Router();

// ─────────────────────────────────────────
// VALIDATION RULES
// ─────────────────────────────────────────
const contactValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.')
    .matches(/^[\p{L}\s'-]+$/u).withMessage('Name contains invalid characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('eventType')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(['wedding', 'birthday', 'engagement', 'corporate', 'other'])
    .withMessage('Invalid event type.'),

  body('message')
    .trim()
    .notEmpty().withMessage('Message is required.')
    .isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters.')
    .escape(),
];

// ─────────────────────────────────────────
// POST /api/contact
// ─────────────────────────────────────────
router.post('/', contactValidation, async (req, res) => {
  // 1. Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }

  const { name, email, eventType, message } = req.body;

  // 2. Save to database
  const contact = {
    id: nanoid(10),
    name,
    email,
    eventType: eventType || null,
    message,
    submittedAt: new Date().toISOString(),
    ip: req.ip,
    status: 'new', // new | read | replied
  };

  await db.read();
  db.data.contacts.push(contact);
  await db.write();

  // 3. Send emails (non-blocking — don't fail request if email fails)
  const emailsEnabled = process.env.MAIL_USER && process.env.MAIL_PASS;

  if (emailsEnabled) {
    Promise.allSettled([
      sendContactNotification(contact),
      sendClientAutoReply(contact),
    ]).then(results => {
      results.forEach((result, i) => {
        const label = i === 0 ? 'Notification email' : 'Auto-reply email';
        if (result.status === 'rejected') {
          console.error(`${label} failed:`, result.reason?.message);
        } else {
          console.log(`✅ ${label} sent`);
        }
      });
    });
  } else {
    console.warn('⚠️  Email not configured. Set MAIL_USER and MAIL_PASS in .env to enable emails.');
  }

  // 4. Respond to client
  return res.status(201).json({
    success: true,
    message: 'Thank you! Your message has been received. We will contact you within 24 hours.',
    id: contact.id,
  });
});

// ─────────────────────────────────────────
// GET /api/contact/count — public stats
// ─────────────────────────────────────────
router.get('/count', async (req, res) => {
  await db.read();
  res.json({ count: db.data.contacts.length });
});

export default router;
