const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db');

const router = express.Router();

const uploadDir = path.resolve(__dirname, '../../', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Use memoryStorage — file is held in RAM until DB insert succeeds
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.zip'];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext) ? cb(null, true) : cb(new Error('Invalid file type'));
  },
});

// ── POST /api/candidates ──────────────────────────────────────────────────────
router.post('/', upload.single('attachment'), async (req, res) => {
  const b = req.body;

  if (!b['Full Name'] || !b['Email Address']) {
    return res.status(400).json({ success: false, message: 'Full Name and Email are required.' });
  }

  const college = b['College/University'] || b['College'] || b['University'] || null;

  const sql = `
    INSERT INTO candidates (
      role, full_name, email, phone, city_country,
      linkedin, github, portfolio,
      qualification, college, graduated, grad_year_semester,
      comfortable_technologies, mern_stack_rating, mern_project_links,
      ai_tools_used, prompt_engineering_exp,
      seo_experience_level, seo_tools, keyword_strategy, screening_task,
      social_platforms, managed_accounts_before, writing_skills,
      hours_per_week, expected_duration, why_this_role,
      resume_path, declaration, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // Determine filename but don't write yet
  const fileBuffer = req.file ? req.file.buffer : null;
  const fileName = req.file
    ? `${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    : null;

  const values = [
    b['Role']                          || null,
    b['Full Name'],
    b['Email Address'],
    b['Phone Number']                  || null,
    b['City & Country']                || null,
    b['LinkedIn Profile']              || null,
    b['GitHub Profile']                || null,
    b['Portfolio Website']             || null,
    b['Current Qualification']         || null,
    college,
    b['Have you graduated']            || null,
    b['Grad Year / Semester']          || null,
    b['Comfortable Technologies']      || null,
    b['MERN Stack Rating']             ? parseInt(b['MERN Stack Rating']) : null,
    b['MERN Projects Links']           || null,
    b['AI Tools Used']                 || null,
    b['Prompt Engineering Experience'] || null,
    b['SEO Experience Level']          || null,
    b['SEO Tools']                     || null,
    b['Keyword Strategy']              || null,
    b['Screening Task']                || null,
    b['Social Platforms']              || null,
    b['Managed Accounts Before']       || null,
    b['Writing Skills']                || null,
    b['Hours per Week']                || null,
    b['Expected Duration']             || null,
    b['Why this role']                 || null,
    fileName,  // store filename only after successful DB insert below
    b['Declaration'] ? 1 : 0,
    'applied',
  ];

  try {
    // 1. Insert to DB first
    const [result] = await pool.execute(sql, values);

    // 2. DB succeeded — now write file to disk
    if (fileBuffer && fileName) {
      fs.writeFileSync(path.join(uploadDir, fileName), fileBuffer);
    }

    res.json({ success: true, message: 'Application submitted successfully!', id: result.insertId });
  } catch (err) {
    // DB failed — file never touches disk
    console.error('DB insert error:', err);
    res.status(500).json({ success: false, message: 'Database error. Please try again.' });
  }
});

// ── GET /api/candidates (admin) ───────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM candidates ORDER BY applied_at DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('DB fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch candidates.' });
  }
});

module.exports = router;
