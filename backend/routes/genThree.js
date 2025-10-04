// backend/routes/genThree.js
const express = require('express');
const router = express.Router();

/**
 * POST /api/gen-three
 * Body:
 * {
 *   "prompt": "Describe the assembly steps...",
 *   "model": "gemini-2.0-flash-001",          // optional
 *   "image": { "mimeType": "image/png", "data": "<base64>" } // optional (no data: prefix)
 * }
 *
 * Returns: { code: "ES module JavaScript that exports default initScene(canvas)" }
 */

router.post('/', async (req, res) => {
  try {
    const { prompt, model, image } = req.body || {};

    // Basic validation
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing prompt (string).' });
    }
    if (image) {
      const okMime = typeof image.mimeType === 'string' && image.mimeType.startsWith('image/');
      const okData = typeof image.data === 'string' && image.data.length > 0;
      if (!okMime || !okData) {
        return res.status(400).json({ error: 'Invalid image. Provide { mimeType, data(base64) }.' });
      }
    }

    // ESM-only library; dynamically import from CommonJS
    const { GoogleGenerativeAI } = await import('@google/generative-ai');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    const modelName = model || 'gemini-2.0-flash-001'; // also fine: 'gemini-2.5-flash-lite'
    const genAI = new GoogleGenerativeAI(apiKey);

    // Comprehensive system instruction (forces runnable Three.js, ignores text in images)
    const systemInstruction = `
You are a 3D animation CODE GENERATOR that converts IKEA-style assembly instructions into runnable JavaScript using Three.js.

GOAL
- Produce a short, clear animation that shows the assembly step(s) described by the user and/or depicted in an input image.

HARD REQUIREMENTS (MUST FOLLOW)
1) Output ONLY JavaScript ES module code — no markdown, no backticks, no commentary.
2) Assume an existing <canvas id="three-canvas"></canvas> in the DOM.
3) Import Three.js exactly as:
   import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';
4) Export exactly one default function:
   export default function initScene(canvas) { ... }
5) Inside initScene(canvas):
   - Create scene, camera (PerspectiveCamera), renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
   - renderer.setSize(canvas.clientWidth, canvas.clientHeight)
   - renderer.setPixelRatio(window.devicePixelRatio)
   - Add basic lighting: AmbientLight + DirectionalLight
   - Use a neutral background (white or light gray) unless the user asks otherwise
   - Represent parts with simple geometry (BoxGeometry, CylinderGeometry, PlaneGeometry, etc.)
   - Group logical parts with THREE.Group() and name meshes/groups (e.g., 'tabletop', 'legFL')
   - Animate assembly (slide/rotate parts into place) with a requestAnimationFrame loop
   - Provide a resize handler that updates camera.aspect, projection matrix, and renderer size
   - Keep code self-contained; do not fetch external textures/models or use other libraries
6) NEVER render or recreate textual elements from input images (e.g., “Step 3”, labels, measurements). Ignore all printed text and symbols in images.
7) Do not draw 2D UI elements (no HTML overlays, arrows, captions). Show motion through 3D position/rotation/opacity changes only.
8) Do not access the DOM beyond the provided canvas; do not add event listeners except window resize.
9) Keep variable and function names descriptive and concise.

INTERPRETING INPUT
- If the user provides an image: Treat it as the primary visual source. Extract only shapes, spatial relations, and motion cues. IGNORE any printed text, numbers, or labels in the image.
- If the user provides text steps: Follow them literally and animate each sub-step in sequence.
- If both text and image are provided: Use the image for geometry/layout and the text for the intended action sequence.
- If measurements are ambiguous, use reasonable proportions consistent with furniture scale.

ANIMATION GUIDELINES
- Aim for 2–6 seconds per step; smooth, readable motion (ease in/out by adjusting per-frame deltas).
- Example motions: translate legs toward sockets; rotate panels into hinges; lower a shelf between legs.
- End with an unobtrusive idle rotation or slight camera orbit if helpful to show the final result (but keep subtle).
- Keep performance in mind: <= ~200K total vertices; avoid excessive subdivisions.

OUTPUT SHAPE (EXAMPLE SKELETON — ADAPT AS NEEDED)
import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';

export default function initScene(canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.set(0, 2, 6);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(3, 5, 2);
  scene.add(dir);

  // parts group
  const parts = new THREE.Group();
  parts.name = 'assembly';
  scene.add(parts);

  // TODO: build geometry per user/image
  // Position starting states off-screen or offset for animation.

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 1/60;

    // animate parts into place

    renderer.render(scene, camera);
  }

  function onResize() {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  }
  window.addEventListener('resize', onResize);

  animate();
}
`.trim();

    const modelRef = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction
    });

    // Build content parts for generateContent
    const parts = [{ text: prompt }];
    if (image) {
      // Ensure no data URL prefix is present
      const cleanBase64 = image.data.replace(/^data:[^,]+,/, '');
      parts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: cleanBase64
        }
      });
    }

    const result = await modelRef.generateContent(parts);
    const response = await result.response;
    let code = response.text();

    // Defensive: strip accidental markdown fences or prose
    code = extractCode(code);

    if (!code || typeof code !== 'string' || code.length < 20) {
      return res.status(502).json({ error: 'Model returned no usable code.' });
    }

    return res.json({ code });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Generation failed',
      detail: String(err?.message || err)
    });
  }
});

/**
 * If the model accidentally wraps code in ```...``` fences or adds prose,
 * extract the largest fenced block; otherwise return the original string.
 */
function extractCode(s) {
  if (!s || typeof s !== 'string') return s;

  // Try to find the largest fenced code block
  const fenceRegex = /```(?:\w+)?\s*([\s\S]*?)```/g;
  let match;
  let best = '';
  while ((match = fenceRegex.exec(s)) !== null) {
    if (match[1] && match[1].length > best.length) best = match[1];
  }
  if (best) return best.trim();

  // Otherwise, try to heuristically remove leading/trailing prose
  // Keep from first import line to end if present
  const importIdx = s.indexOf("import * as THREE");
  if (importIdx !== -1) {
    return s.slice(importIdx).trim();
  }
  return s.trim();
}

module.exports = router;