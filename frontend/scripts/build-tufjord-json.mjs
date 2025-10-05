import fs from 'fs'
import path from 'path'

const outputPath = path.join(process.cwd(), 'frontend', 'public', 'tufjord', '3js-demo.json')

const partCatalog = {
  A: { id: 'A', name: 'Left side rail', type: 'frame', image: '/tufjord/parts/part-A.jpg' },
  B: { id: 'B', name: 'Right side rail', type: 'frame', image: '/tufjord/parts/part-B.jpg' },
  C: { id: 'C', name: 'Headboard frame', type: 'frame', image: '/tufjord/parts/part-C.jpg' },
  D: { id: 'D', name: 'Headboard cushion', type: 'upholstery', image: '/tufjord/parts/part-D.jpg' },
  E: { id: 'E', name: 'Footboard frame', type: 'frame', image: '/tufjord/parts/part-E.jpg' },
  F: { id: 'F', name: 'Footboard cushion', type: 'upholstery', image: '/tufjord/parts/part-F.jpg' },
  G: { id: 'G', name: 'Center support beam', type: 'support', image: '/tufjord/parts/part-G.jpg' },
  H: { id: 'H', name: 'Front support leg', type: 'support', image: '/tufjord/parts/part-H.jpg' },
  I: { id: 'I', name: 'Rear support leg', type: 'support', image: '/tufjord/parts/part-I.jpg' },
  J: { id: 'J', name: 'Left cross brace', type: 'support', image: '/tufjord/parts/part-J.jpg' },
  K: { id: 'K', name: 'Right cross brace', type: 'support', image: '/tufjord/parts/part-K.jpg' },
  S1: { id: 'S1', name: 'Slat stack 1', type: 'slats', image: '/tufjord/parts/part-S1.jpg' },
  S2: { id: 'S2', name: 'Slat stack 2', type: 'slats', image: '/tufjord/parts/part-S2.jpg' },
  S3: { id: 'S3', name: 'Slat stack 3', type: 'slats', image: '/tufjord/parts/part-S3.jpg' },
  S4: { id: 'S4', name: 'Slat stack 4', type: 'slats', image: '/tufjord/parts/part-S4.jpg' },
  S5: { id: 'S5', name: 'Slat stack 5', type: 'slats', image: '/tufjord/parts/part-S5.jpg' },
  S6: { id: 'S6', name: 'Slat stack 6', type: 'slats', image: '/tufjord/parts/part-S6.jpg' },
  S7: { id: 'S7', name: 'Slat stack 7', type: 'slats', image: '/tufjord/parts/part-S7.jpg' },
  S8: { id: 'S8', name: 'Slat stack 8', type: 'slats', image: '/tufjord/parts/part-S8.jpg' },
  M1: { id: 'M1', name: 'Finishing caps - headboard', type: 'finishing', image: '/tufjord/parts/part-M1.jpg' },
  M2: { id: 'M2', name: 'Finishing caps - footboard', type: 'finishing', image: '/tufjord/parts/part-M2.jpg' },
  M3: { id: 'M3', name: 'Side cover trims', type: 'finishing', image: '/tufjord/parts/part-M3.jpg' },
  T1: { id: 'T1', name: 'Allen key', type: 'tool', image: '/tufjord/parts/part-T1.jpg' },
  T2: { id: 'T2', name: 'Torx key', type: 'tool', image: '/tufjord/parts/part-T2.jpg' },
  T3: { id: 'T3', name: 'Open wrench', type: 'tool', image: '/tufjord/parts/part-T3.jpg' },
  Q1: { id: 'Q1', name: 'Hardware pack A', type: 'hardware', image: '/tufjord/parts/part-Q1.jpg' },
  Q2: { id: 'Q2', name: 'Hardware pack B', type: 'hardware', image: '/tufjord/parts/part-Q2.jpg' }
}

const VIEW_SIZE = 50
const FOCUS_POINT = { x: 2.5, y: 1.6, z: -2.5 }
const ORBIT_RADIUS = 36
const INITIAL_POINTER = { pitch: 0.68, yaw: 1.4 }
const INITIAL_ZOOM = 0.42 * 5
const ZOOM_MIN = 0.18 * 5
const ZOOM_MAX = 1.2 * 5
const SCENE_OFFSET = { x: -6, y: 3.2, z: 6 }

const componentBlueprints = [
  { key: 'floor', step: 0, color: 0xe6e6e6, highlight: 0xffcc66, geometry: { type: 'box', args: [10, 0.05, 6] }, start: [0, -0.05, 0], target: [0, -0.05, 0], rotation: [0, 0, 0] },
  { key: 'leftRail', step: 1, color: 0x314354, highlight: 0xffb347, geometry: { type: 'box', args: [0.25, 0.4, 2.6] }, start: [-6, 0.2, -1.3], target: [-1.9, 0.4, -1.3], rotation: [0, 0, 0] },
  { key: 'rightRail', step: 2, color: 0x314354, highlight: 0xffb347, geometry: { type: 'box', args: [0.25, 0.4, 2.6] }, start: [6, 0.2, -1.3], target: [1.9, 0.4, -1.3], rotation: [0, 0, 0] },
  { key: 'headboardFrame', step: 3, color: 0x2b3a47, highlight: 0xffd966, geometry: { type: 'box', args: [3.8, 0.35, 0.2] }, start: [0, 0.35, -3.5], target: [0, 0.9, -1.7], rotation: [0, 0, 0] },
  { key: 'headboardPanel', step: 4, color: 0x3d4d60, highlight: 0xffd966, geometry: { type: 'box', args: [3.8, 1.4, 0.15] }, start: [0, 1.5, -4.5], target: [0, 1.4, -1.6], rotation: [0, 0, 0] },
  { key: 'footboardFrame', step: 5, color: 0x2b3a47, highlight: 0xffd966, geometry: { type: 'box', args: [3.8, 0.35, 0.2] }, start: [0, 0.35, 3.5], target: [0, 0.7, 1.7], rotation: [0, 0, 0] },
  { key: 'footboardPanel', step: 6, color: 0x3d4d60, highlight: 0xffd966, geometry: { type: 'box', args: [3.8, 1.0, 0.15] }, start: [0, 1.2, 4.5], target: [0, 1.1, 1.6], rotation: [0, 0, 0] },
  { key: 'centerBeam', step: 7, color: 0x4f5f6f, highlight: 0xffc56c, geometry: { type: 'box', args: [0.2, 0.35, 2.6] }, start: [0, 0.2, 4], target: [0, 0.6, -1.3], rotation: [0, 0, 0] },
  { key: 'supportLegFront', step: 8, color: 0x3c4a57, highlight: 0xffc56c, geometry: { type: 'box', args: [0.35, 1.2, 0.35] }, start: [-4, -0.2, -0.5], target: [-1.9, 0.6, -0.5], rotation: [0, 0, 0] },
  { key: 'supportLegRear', step: 9, color: 0x3c4a57, highlight: 0xffc56c, geometry: { type: 'box', args: [0.35, 1.2, 0.35] }, start: [4, -0.2, -0.5], target: [1.9, 0.6, -0.5], rotation: [0, 0, 0] },
  { key: 'crossBraceLeft', step: 10, color: 0x506273, highlight: 0xffc56c, geometry: { type: 'box', args: [0.2, 0.3, 2.0] }, start: [-6, 1.1, -1.0], target: [-0.95, 1.0, -1.0], rotation: [0, Math.PI / 12, 0] },
  { key: 'crossBraceRight', step: 11, color: 0x506273, highlight: 0xffc56c, geometry: { type: 'box', args: [0.2, 0.3, 2.0] }, start: [6, 1.1, -1.0], target: [0.95, 1.0, -1.0], rotation: [0, -Math.PI / 12, 0] },
  { key: 'slat01', step: 12, color: 0xf6e0b5, highlight: 0xffb347, geometry: { type: 'box', args: [3.6, 0.12, 0.25] }, start: [0, 1.5, -4], target: [0, 1.0, -1.5], rotation: [0, 0, 0] },
  { key: 'slat02', step: 13, color: 0xf6e0b5, highlight: 0xffb347, geometry: { type: 'box', args: [3.6, 0.12, 0.25] }, start: [0, 1.5, -4], target: [0, 1.0, -1.2], rotation: [0, 0, 0] },
  { key: 'slat03', step: 14, color: 0xf6e0b5, highlight: 0xffb347, geometry: { type: 'box', args: [3.6, 0.12, 0.25] }, start: [0, 1.5, -4], target: [0, 1.0, -0.9], rotation: [0, 0, 0] },
  { key: 'slat04', step: 15, color: 0xf6e0b5, highlight: 0xffb347, geometry: { type: 'box', args: [3.6, 0.12, 0.25] }, start: [0, 1.5, -4], target: [0, 1.0, -0.6], rotation: [0, 0, 0] },
  { key: 'slat05', step: 16, color: 0xf6e0b5, highlight: 0xffb347, geometry: { type: 'box', args: [3.6, 0.12, 0.25] }, start: [0, 1.5, -4], target: [0, 1.0, -0.3], rotation: [0, 0, 0] },
  { key: 'slat06', step: 17, color: 0xf6e0b5, highlight: 0xffb347, geometry: { type: 'box', args: [3.6, 0.12, 0.25] }, start: [0, 1.5, -4], target: [0, 1.0, 0.0], rotation: [0, 0, 0] },
  { key: 'slat07', step: 18, color: 0xf6e0b5, highlight: 0xffb347, geometry: { type: 'box', args: [3.6, 0.12, 0.25] }, start: [0, 1.5, -4], target: [0, 1.0, 0.3], rotation: [0, 0, 0] },
  { key: 'slat08', step: 19, color: 0xf6e0b5, highlight: 0xffb347, geometry: { type: 'box', args: [3.6, 0.12, 0.25] }, start: [0, 1.5, -4], target: [0, 1.0, 0.6], rotation: [0, 0, 0] },
  { key: 'headboardTopRail', step: 20, color: 0x314354, highlight: 0xffd966, geometry: { type: 'box', args: [3.8, 0.15, 0.2] }, start: [-4, 2.5, -2.5], target: [0, 2.1, -1.6], rotation: [0, 0, 0] },
  { key: 'footboardTopRail', step: 21, color: 0x314354, highlight: 0xffd966, geometry: { type: 'box', args: [3.8, 0.15, 0.2] }, start: [4, 2.5, 2.5], target: [0, 1.7, 1.6], rotation: [0, 0, 0] },
  { key: 'sideCapLeft', step: 22, color: 0x283440, highlight: 0xffd966, geometry: { type: 'box', args: [0.25, 0.8, 2.6] }, start: [-6, 0.8, 1.2], target: [-1.95, 0.8, 1.2], rotation: [0, 0, 0] },
  { key: 'sideCapRight', step: 23, color: 0x283440, highlight: 0xffd966, geometry: { type: 'box', args: [0.25, 0.8, 2.6] }, start: [6, 0.8, 1.2], target: [1.95, 0.8, 1.2], rotation: [0, 0, 0] },
  { key: 'finishingCaps', step: 24, color: 0xffc56c, highlight: 0xfff0a3, geometry: { type: 'sphere', args: [0.12, 12, 12] }, start: [0, 4, 0], target: [0, 1.9, 0], rotation: [0, 0, 0], duplicates: [
      { offset: [-1.8, 1.9, -1.4] },
      { offset: [1.8, 1.9, -1.4] },
      { offset: [-1.8, 1.9, 1.4] },
      { offset: [1.8, 1.9, 1.4] }
    ] },
  { key: 'mattressSupport', step: 25, color: 0xf7f2eb, highlight: 0xffe5bd, geometry: { type: 'box', args: [3.6, 0.3, 2.4] }, start: [0, 3.5, 0], target: [0, 1.35, -0.3], rotation: [0, 0, 0] },
  { key: 'decorPillows', step: 26, color: 0xcfd8e3, highlight: 0xfff7d6, geometry: { type: 'box', args: [1.2, 0.4, 0.6] }, start: [0, 3, -3], target: [-0.6, 1.6, -1.4], rotation: [0, 0, 0], duplicates: [
      { offset: [-0.6, 1.6, -1.4] },
      { offset: [0.6, 1.6, -1.4] }
    ] },
  { key: 'finalGlow', step: 27, color: 0xffffcc, highlight: 0xffffcc, geometry: { type: 'ring', args: [2.8, 3.5, 64] }, start: [0, 1.2, 0], target: [0, 1.2, 0], rotation: [Math.PI / 2, 0, 0] }
]

const stepDefinitions = [
  { title: 'Organize workplace', instructions: ['Lay out all TUFJORD components, hardware, and tools.'], parts: ['Q1', 'Q2', 'T1', 'T2', 'T3'], image: '/tufjord/page_1.jpg' },
  { title: 'Attach left side rail', instructions: ['Slide the left side rail into the headboard bracket.'], parts: ['A', 'Q1', 'T1'], image: '/tufjord/page_2.jpg' },
  { title: 'Attach right side rail', instructions: ['Mirror the alignment on the right side rail.'], parts: ['B', 'Q1', 'T1'], image: '/tufjord/page_3.jpg' },
  { title: 'Install headboard frame beam', instructions: ['Lock the lower headboard beam between the rails.'], parts: ['C', 'Q1', 'T2'], image: '/tufjord/page_4.jpg' },
  { title: 'Mount headboard cushion', instructions: ['Position the upholstered panel onto the headboard frame.'], parts: ['D', 'Q2', 'T2'], image: '/tufjord/page_5.jpg' },
  { title: 'Fix footboard frame', instructions: ['Secure the footboard beam between side rails.'], parts: ['E', 'Q1', 'T2'], image: '/tufjord/page_6.jpg' },
  { title: 'Mount footboard cushion', instructions: ['Align the footboard cushion over the frame and fasten.'], parts: ['F', 'Q2', 'T2'], image: '/tufjord/page_7.jpg' },
  { title: 'Add center beam', instructions: ['Drop the centre support beam onto the brackets.'], parts: ['G', 'Q1', 'T1'], image: '/tufjord/page_8.jpg' },
  { title: 'Secure front support leg', instructions: ['Fasten the front support leg to the center beam.'], parts: ['H', 'Q1', 'T1'], image: '/tufjord/page_9.jpg' },
  { title: 'Secure rear support leg', instructions: ['Repeat for the rear center support leg.'], parts: ['I', 'Q1', 'T1'], image: '/tufjord/page_10.jpg' },
  { title: 'Install left cross brace', instructions: ['Lock the left cross brace between rail and beam.'], parts: ['J', 'Q1', 'T1'], image: '/tufjord/page_11.jpg' },
  { title: 'Install right cross brace', instructions: ['Add the right cross brace to stabilize the frame.'], parts: ['K', 'Q1', 'T1'], image: '/tufjord/page_12.jpg' },
  { title: 'Lay first slat stack', instructions: ['Fan out the first slat section starting at the headboard.'], parts: ['S1', 'Q2'], image: '/tufjord/page_13.jpg' },
  { title: 'Lay second slat stack', instructions: ['Continue with the next slat group and align gaps evenly.'], parts: ['S2', 'Q2'], image: '/tufjord/page_14.jpg' },
  { title: 'Lay third slat stack', instructions: ['Position the third slat stack into the frame.'], parts: ['S3', 'Q2'], image: '/tufjord/page_15.jpg' },
  { title: 'Lay fourth slat stack', instructions: ['Add the fourth slat stack and ensure contact with side rails.'], parts: ['S4', 'Q2'], image: '/tufjord/page_16.jpg' },
  { title: 'Lay fifth slat stack', instructions: ['Install the fifth slat stack towards the centre.'], parts: ['S5', 'Q2'], image: '/tufjord/page_17.jpg' },
  { title: 'Lay sixth slat stack', instructions: ['Place the sixth slat stack with uniform spacing.'], parts: ['S6', 'Q2'], image: '/tufjord/page_18.jpg' },
  { title: 'Lay seventh slat stack', instructions: ['Drop the seventh slat assembly near the footboard.'], parts: ['S7', 'Q2'], image: '/tufjord/page_19.jpg' },
  { title: 'Lay final slat stack', instructions: ['Finish with the final slat group and align the run.'], parts: ['S8', 'Q2'], image: '/tufjord/page_20.jpg' },
  { title: 'Fit headboard top rail', instructions: ['Cap the headboard with the finishing rail.'], parts: ['M1', 'T2'], image: '/tufjord/page_21.jpg' },
  { title: 'Fit footboard top rail', instructions: ['Cap the footboard with the finishing rail.'], parts: ['M2', 'T2'], image: '/tufjord/page_22.jpg' },
  { title: 'Install left side cover', instructions: ['Snap the left side cover over the rail.'], parts: ['M3', 'Q1'], image: '/tufjord/page_23.jpg' },
  { title: 'Install right side cover', instructions: ['Repeat with the right side cover trim.'], parts: ['M3', 'Q1'], image: '/tufjord/page_24.jpg' },
  { title: 'Fit finishing caps', instructions: ['Press finishing caps onto exposed bolts.'], parts: ['M1', 'M2'], image: '/tufjord/page_25.jpg' },
  { title: 'Drop mattress support', instructions: ['Lower the fabric base panel over the slats.'], parts: ['S8', 'Q2'], image: '/tufjord/page_26.jpg' },
  { title: 'Arrange pillows', instructions: ['Place decorative pillows and upholstery elements.'], parts: ['D', 'F'], image: '/tufjord/page_27.jpg' },
  { title: 'Final inspection', instructions: ['Check alignment, tighten hardware, and admire the result.'], parts: ['T1', 'T3'], image: '/tufjord/page_28.jpg' }
]

function buildThreeCode(stepIndex) {
  const code = `
const bounds = container.getBoundingClientRect();
const width = bounds.width || container.clientWidth || 640;
const height = bounds.height || container.clientHeight || 480;
container.style.position = 'relative';
container.style.background = '#ffffff';
container.style.touchAction = 'none';

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(width, height, false);
renderer.setClearColor(0xf5f7fa, 1);
container.appendChild(renderer.domElement);
renderer.domElement.style.touchAction = 'none';
renderer.domElement.style.pointerEvents = 'auto';

const aspect = width / height;
const viewSize = ${VIEW_SIZE};
const focusPoint = new THREE.Vector3(${FOCUS_POINT.x}, ${FOCUS_POINT.y}, ${FOCUS_POINT.z});
const camera = new THREE.OrthographicCamera(
  (-viewSize * aspect) / 2,
  (viewSize * aspect) / 2,
  viewSize / 2,
  -viewSize / 2,
  0.1,
  100
);
const orbitRadius = ${ORBIT_RADIUS};
const cosPitch = Math.cos(${INITIAL_POINTER.pitch});
const sinPitch = Math.sin(${INITIAL_POINTER.pitch});
const cosYaw = Math.cos(${INITIAL_POINTER.yaw});
const sinYaw = Math.sin(${INITIAL_POINTER.yaw});
camera.position.set(
  focusPoint.x + orbitRadius * cosPitch * cosYaw,
  focusPoint.y + orbitRadius * sinPitch,
  focusPoint.z + orbitRadius * cosPitch * sinYaw
);
camera.lookAt(focusPoint);
camera.zoom = ${INITIAL_ZOOM};
camera.updateProjectionMatrix();

const scene = new THREE.Scene();
const root = new THREE.Group();
root.position.set(${SCENE_OFFSET.x}, ${SCENE_OFFSET.y}, ${SCENE_OFFSET.z});
scene.add(root);

const ambient = new THREE.AmbientLight(0xf8fbff, 0.95);
const keyLight = new THREE.DirectionalLight(0xffffff, 0.65);
keyLight.position.set(6, 10, 4);
const fillLight = new THREE.DirectionalLight(0xffffff, 0.35);
fillLight.position.set(-6, 6, -4);
scene.add(ambient);
scene.add(keyLight);
scene.add(fillLight);

const grid = new THREE.GridHelper(12, 12, 0xd7dde5, 0xe5ecf5);
root.add(grid);

const background = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 18),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);
background.position.set(0, 0, -6);
background.rotation.x = -Math.PI / 2;
background.receiveShadow = false;
background.visible = false;
root.add(background);

const pointerState = { isDown: false, lastX: 0, lastY: 0, targetX: ${INITIAL_POINTER.pitch}, targetY: ${INITIAL_POINTER.yaw} };
const orbitState = { radius: orbitRadius };
const zoomState = { value: camera.zoom, min: ${ZOOM_MIN}, max: ${ZOOM_MAX} };

function onPointerDown(event) {
  pointerState.isDown = true;
  pointerState.lastX = event.clientX;
  pointerState.lastY = event.clientY;
}

function onPointerMove(event) {
  if (!pointerState.isDown) return;
  const deltaX = (event.clientX - pointerState.lastX) * 0.004;
  const deltaY = (event.clientY - pointerState.lastY) * 0.004;
  pointerState.lastX = event.clientX;
  pointerState.lastY = event.clientY;
  pointerState.targetX = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, pointerState.targetX + deltaY));
  pointerState.targetY += deltaX;
}

function onPointerUp() {
  pointerState.isDown = false;
}

function onWheel(event) {
  event.preventDefault();
  const zoomFactor = Math.exp(event.deltaY * 0.0015);
  const nextZoom = zoomState.value / zoomFactor;
  zoomState.value = Math.max(zoomState.min, Math.min(zoomState.max, nextZoom));
  camera.zoom = zoomState.value;
  camera.updateProjectionMatrix();
}

container.addEventListener('pointerdown', onPointerDown);
container.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', onPointerUp);
container.addEventListener('wheel', onWheel, { passive: false });
renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

const componentBlueprints = ${JSON.stringify(componentBlueprints)};
const stepIndex = ${stepIndex};

const materialCache = new Map();
function getMaterial(color, highlight) {
  const key = String(color) + '-' + String(highlight);
  if (!materialCache.has(key)) {
    const base = new THREE.MeshStandardMaterial({ color, metalness: 0.1, roughness: 0.6 });
    base.userData.highlight = highlight;
    materialCache.set(key, base);
  }
  return materialCache.get(key);
}

function createGeometry(def) {
  switch (def.type) {
    case 'box':
      return new THREE.BoxGeometry(...def.args);
    case 'cylinder':
      return new THREE.CylinderGeometry(...def.args);
    case 'sphere':
      return new THREE.SphereGeometry(...def.args);
    case 'ring':
      return new THREE.RingGeometry(...def.args);
    default:
      return new THREE.BoxGeometry(1, 1, 1);
  }
}

function createComponent(def) {
  const geometry = createGeometry(def.geometry);
  const material = getMaterial(def.color, def.highlight || def.color);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = false;
  mesh.receiveShadow = true;

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry, 45),
    new THREE.LineBasicMaterial({ color: 0x0f172a, opacity: 0.4, transparent: true })
  );
  mesh.add(edges);

  if (def.duplicates && Array.isArray(def.duplicates)) {
    const group = new THREE.Group();
    def.duplicates.forEach((dup) => {
      const child = mesh.clone();
      child.position.set(...dup.offset);
      group.add(child);
    });
    return group;
  }

  return mesh;
}

const components = componentBlueprints.map((definition) => {
  const wrapper = new THREE.Group();
  const base = createComponent(definition);
  wrapper.add(base);
  wrapper.position.set(...definition.start);
  wrapper.rotation.set(...definition.rotation);
  wrapper.visible = false;
  wrapper.userData.definition = definition;
  wrapper.userData.progress = 0;
  wrapper.userData.start = new THREE.Vector3(...definition.start);
  wrapper.userData.target = new THREE.Vector3(...definition.target);
  wrapper.userData.step = definition.step;
  root.add(wrapper);
  return wrapper;
});

const easing = (t) => 1 - Math.pow(1 - t, 3);

let animationFrameId = 0;
function updateComponents() {
  components.forEach((component) => {
    const shouldBeVisible = stepIndex >= component.userData.step;
    if (!shouldBeVisible) {
      component.visible = false;
      component.userData.progress = 0;
      component.position.copy(component.userData.start);
      return;
    }

    component.visible = true;
    if (component.userData.progress < 1) {
      component.userData.progress = Math.min(1, component.userData.progress + 0.04);
      const eased = easing(component.userData.progress);
      component.position.lerpVectors(component.userData.start, component.userData.target, eased);

      const baseObj = component.children[0];
      if (baseObj) {
        const mats = Array.isArray(baseObj.material) ? baseObj.material : [baseObj.material];
        mats.forEach((mat) => {
          if (!mat || !mat.userData || !mat.userData.highlight) return;
          const baseColor = new THREE.Color(component.userData.definition.color);
          const highlight = new THREE.Color(mat.userData.highlight || component.userData.definition.highlight || component.userData.definition.color);
          const lerped = baseColor.clone().lerp(highlight, Math.sin(component.userData.progress * Math.PI));
          mat.color.copy(lerped);
        });
      }
    } else {
      component.position.copy(component.userData.target);
      const baseObj = component.children[0];
      if (baseObj) {
        const mats = Array.isArray(baseObj.material) ? baseObj.material : [baseObj.material];
        mats.forEach((mat) => {
          if (!mat) return;
          const baseColor = new THREE.Color(component.userData.definition.color);
          mat.color.copy(baseColor);
        });
      }
    }
  });
}

function updateCamera() {
  const radius = orbitState.radius;
  const x = focusPoint.x + radius * Math.cos(pointerState.targetX) * Math.cos(pointerState.targetY);
  const y = focusPoint.y + radius * Math.sin(pointerState.targetX);
  const z = focusPoint.z + radius * Math.cos(pointerState.targetX) * Math.sin(pointerState.targetY);
  camera.position.set(x, y, z);
  camera.lookAt(focusPoint);
}

function animate() {
  animationFrameId = requestAnimationFrame(animate);
  updateCamera();
  updateComponents();
  renderer.render(scene, camera);
}

animate();

window.SYI = {
  cleanup() {
    cancelAnimationFrame(animationFrameId);
    container.removeEventListener('pointerdown', onPointerDown);
    container.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    container.removeEventListener('wheel', onWheel);
    if (renderer) {
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    }
  },
};
`
  return code.trim()
}

const steps = stepDefinitions.map((step, index) => {
  const parts = step.parts.map((partKey) => {
    const base = partCatalog[partKey];
    if (!base) throw new Error(`Missing part catalog entry for ${partKey}`);
    return {
      ...base,
      quantity: 1
    };
  });

  return {
    index,
    title: step.title,
    instructions: step.instructions,
    image: step.image,
    parts,
    threeCode: buildThreeCode(index)
  };
});

const manualDefinition = {
  id: 'tufjord',
  name: 'TUFJORD Upholstered Bed Frame',
  description: '3D animated assembly guide generated for the IKEA TUFJORD bed frame.',
  thumbnail: '/tufjord/page_1.jpg',
  steps
};

fs.writeFileSync(outputPath, JSON.stringify(manualDefinition, null, 2));
console.log(`Wrote ${steps.length} steps to ${outputPath}`);
