const express = require('express');
const { ObjectId } = require('mongodb');
const multer = require('multer');
const { getMongo } = require('../db');
const { Readable } = require('stream');

const router = express.Router();

// Memory storage lets us stream file.buffer into GridFS
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB — raise if needed
  fileFilter: (req, file, cb) => {
    const okTypes = [
      'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif',
      'application/pdf'
    ];
    if (okTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Unsupported file type'), false);
  },
});

// POST /api/files/upload  (form-data: file)
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { bucket } = getMongo();
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    const filename = req.file.originalname;
    const contentType = req.file.mimetype;

    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        contentType,
        originalName: filename,
        // add any extra metadata you need, e.g. userId, tags, etc.
      },
    });

    // Pipe the in-memory buffer to GridFS as a readable stream
    Readable.from(req.file.buffer).pipe(uploadStream)
      .on('error', (err) => {
        console.error(err);
        res.status(500).json({ error: 'Upload failed' });
      })
      .on('finish', () => {
        res.status(201).json({
          id: uploadStream.id,
          filename: uploadStream.filename,
          length: uploadStream.length,
          chunkSize: uploadStream.chunkSizeBytes,
          uploadDate: uploadStream.uploadDate,
          contentType,
        });
      });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/files        -> list files (optional filters via query)
router.get('/', async (req, res) => {
  try {
    const { bucket } = getMongo();
    const { contentType, filename } = req.query;

    const query = {};
    if (contentType) query['metadata.contentType'] = contentType;
    if (filename) query.filename = filename;

    const files = await bucket.find(query).sort({ uploadDate: -1 }).toArray();
    res.json(files.map(f => ({
      id: f._id,
      filename: f.filename,
      length: f.length,
      uploadDate: f.uploadDate,
      contentType: f.metadata?.contentType,
      metadata: f.metadata || {},
    })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/files/:id    -> stream/download by id
router.get('/:id', async (req, res) => {
  try {
    const { bucket } = getMongo();
    const id = new ObjectId(req.params.id);

    // Try to look up file for headers
    const files = await bucket.find({ _id: id }).toArray();
    if (!files.length) return res.status(404).json({ error: 'File not found' });

    const file = files[0];
    if (file.metadata?.contentType) {
      res.setHeader('Content-Type', file.metadata.contentType);
    }
    res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);

    bucket.openDownloadStream(id)
      .on('error', (err) => {
        console.error(err);
        res.status(404).json({ error: 'File not found' });
      })
      .pipe(res);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'Invalid file id' });
  }
});

// DELETE /api/files/:id -> delete by id
router.delete('/:id', async (req, res) => {
  try {
    const { bucket } = getMongo();
    const id = new ObjectId(req.params.id);
    await bucket.delete(id);
    res.json({ ok: true, id });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;