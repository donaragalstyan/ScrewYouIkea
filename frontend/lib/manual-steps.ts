export type ManualStep = {
  index: number
  title: string
  thumbnail: string
  warnings: string[]
  threeCode?: string
}

const pointerControlsSnippet = `const state = { isPointerDown: false, lastX: 0, lastY: 0, targetX: 0.35, targetY: Math.PI / 4 };
const zoomState = { z: camera.position.length(), min: 3, max: 12 };

function onPointerDown(event) {
  state.isPointerDown = true;
  state.lastX = event.clientX;
  state.lastY = event.clientY;
}

function onPointerMove(event) {
  if (!state.isPointerDown) return;
  const deltaX = (event.clientX - state.lastX) * 0.005;
  const deltaY = (event.clientY - state.lastY) * 0.005;
  state.lastX = event.clientX;
  state.lastY = event.clientY;
  state.targetX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, state.targetX + deltaY));
  state.targetY += deltaX;
}

function onPointerUp() {
  state.isPointerDown = false;
}

function onWheel(event) {
  event.preventDefault();
  const delta = event.deltaY * 0.01;
  zoomState.z = Math.max(zoomState.min, Math.min(zoomState.max, zoomState.z + delta));
}

container.addEventListener('pointerdown', onPointerDown);
container.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', onPointerUp);
container.addEventListener('wheel', onWheel, { passive: false });
`;

const cleanupSnippet = `if (resizeObserver) {
  resizeObserver.disconnect();
}
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
`;

const sharedPrelude = `const bounds = container.getBoundingClientRect();
const width = bounds.width || container.clientWidth || 600;
const height = bounds.height || container.clientHeight || 600;

container.style.position = 'relative';
container.style.background = '#ffffff';

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(width, height, false);
renderer.setClearColor(0xffffff, 1);
container.appendChild(renderer.domElement);

const aspect = width / height;
const viewSize = 6;
const camera = new THREE.OrthographicCamera(
  (-viewSize * aspect) / 2,
  (viewSize * aspect) / 2,
  viewSize / 2,
  -viewSize / 2,
  0.1,
  100
);
camera.position.set(6, 6, 6);
camera.lookAt(0, 0, 0);

const scene = new THREE.Scene();
const root = new THREE.Group();
scene.add(root);

const grid = new THREE.GridHelper(12, 12, 0xcccccc, 0xe6e6e6);
scene.add(grid);

const resizeObserver =
  typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(() => {
        const nextBounds = container.getBoundingClientRect();
        const nextWidth = nextBounds.width || container.clientWidth || width;
        const nextHeight = nextBounds.height || container.clientHeight || height;
        renderer.setSize(nextWidth, nextHeight, false);
        const nextAspect = nextWidth / nextHeight;
        camera.left = (-viewSize * nextAspect) / 2;
        camera.right = (viewSize * nextAspect) / 2;
        camera.top = viewSize / 2;
        camera.bottom = -viewSize / 2;
        camera.updateProjectionMatrix();
      })
    : null;
if (resizeObserver) {
  resizeObserver.observe(container);
}

${pointerControlsSnippet}
`;

const sharedAnimate = `let animationFrameId = 0;

function updateCamera() {
  const radius = zoomState.z;
  const x = radius * Math.cos(state.targetX) * Math.cos(state.targetY);
  const y = radius * Math.sin(state.targetX) + 1.5;
  const z = radius * Math.cos(state.targetX) * Math.sin(state.targetY);
  camera.position.set(x, y, z);
  camera.lookAt(0, 1, 0);
}

function animate() {
  animationFrameId = requestAnimationFrame(animate);
  updateCamera();
  renderer.render(scene, camera);
}

animate();

window.SYI = {
  cleanup() {
    cancelAnimationFrame(animationFrameId);
    ${cleanupSnippet}
  },
};
`;

const stepOneCode = `
${sharedPrelude}

const frame = new THREE.Mesh(
  new THREE.BoxGeometry(4, 0.2, 2.2),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);
const frameEdges = new THREE.LineSegments(
  new THREE.EdgesGeometry(frame.geometry),
  new THREE.LineBasicMaterial({ color: 0x000000 })
);
frame.add(frameEdges);
frame.position.y = 0.1;
root.add(frame);

${sharedAnimate}
`;

const stepTwoCode = `
${sharedPrelude}

const frame = new THREE.Mesh(
  new THREE.BoxGeometry(4, 0.2, 2.2),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);
const frameEdges = new THREE.LineSegments(
  new THREE.EdgesGeometry(frame.geometry),
  new THREE.LineBasicMaterial({ color: 0x000000 })
);
frame.add(frameEdges);
frame.position.y = 0.1;
root.add(frame);

const legGeometry = new THREE.BoxGeometry(0.2, 3, 0.2);
const legMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const legPositions = [
  [-1.8, 1.5, -1.0],
  [1.8, 1.5, -1.0],
  [-1.8, 1.5, 1.0],
  [1.8, 1.5, 1.0],
];

legPositions.forEach(([x, y, z]) => {
  const leg = new THREE.Mesh(legGeometry, legMaterial);
  leg.position.set(x, y, z);
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(legGeometry),
    new THREE.LineBasicMaterial({ color: 0x000000 })
  );
  leg.add(edges);
  root.add(leg);
});

${sharedAnimate}
`;

const stepThreeCode = `
${sharedPrelude}

const frame = new THREE.Mesh(
  new THREE.BoxGeometry(4, 0.2, 2.2),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);
const frameEdges = new THREE.LineSegments(
  new THREE.EdgesGeometry(frame.geometry),
  new THREE.LineBasicMaterial({ color: 0x000000 })
);
frame.add(frameEdges);
frame.position.y = 0.1;
root.add(frame);

const legGeometry = new THREE.BoxGeometry(0.2, 3, 0.2);
const legMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const legPositions = [
  [-1.8, 1.5, -1.0],
  [1.8, 1.5, -1.0],
  [-1.8, 1.5, 1.0],
  [1.8, 1.5, 1.0],
];

legPositions.forEach(([x, y, z]) => {
  const leg = new THREE.Mesh(legGeometry, legMaterial);
  leg.position.set(x, y, z);
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(legGeometry),
    new THREE.LineBasicMaterial({ color: 0x000000 })
  );
  leg.add(edges);
  root.add(leg);
});

const sidePanelGeometry = new THREE.BoxGeometry(4, 2.8, 0.15);
const sidePanel = new THREE.Mesh(sidePanelGeometry, new THREE.MeshBasicMaterial({ color: 0xffffff }));
sidePanel.position.set(0, 1.6, -1.05);
const sideEdges = new THREE.LineSegments(
  new THREE.EdgesGeometry(sidePanelGeometry),
  new THREE.LineBasicMaterial({ color: 0x000000 })
);
sidePanel.add(sideEdges);
root.add(sidePanel);

${sharedAnimate}
`;

const defaultCode = `
${sharedPrelude}

const placeholder = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);
const placeholderEdges = new THREE.LineSegments(
  new THREE.EdgesGeometry(placeholder.geometry),
  new THREE.LineBasicMaterial({ color: 0x000000 })
);
placeholder.add(placeholderEdges);
root.add(placeholder);

const textCanvas = document.createElement('canvas');
textCanvas.width = 512;
textCanvas.height = 128;
const ctx = textCanvas.getContext('2d');
if (ctx) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, textCanvas.width, textCanvas.height);
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('3D preview coming soon', textCanvas.width / 2, 64);
}
const texture = new THREE.CanvasTexture(textCanvas);
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(4.5, 1.2),
  new THREE.MeshBasicMaterial({ map: texture })
);
plane.position.set(0, 2.2, 0);
root.add(plane);

${sharedAnimate}
`;

export const manualSteps: ManualStep[] = [
  {
    index: 0,
    title: 'Prepare workspace',
    thumbnail: '/step-1-prepare-workspace.jpg',
    warnings: ['Ensure flat surface'],
    threeCode: stepOneCode,
  },
  {
    index: 1,
    title: 'Attach legs to frame',
    thumbnail: '/step-2-attach-legs.jpg',
    warnings: [],
    threeCode: stepTwoCode,
  },
  {
    index: 2,
    title: 'Install side panels',
    thumbnail: '/step-3-side-panels.jpg',
    warnings: ['Do not overtighten'],
    threeCode: stepThreeCode,
  },
  {
    index: 3,
    title: 'Secure bottom shelf',
    thumbnail: '/step-4-bottom-shelf.jpg',
    warnings: [],
    threeCode: defaultCode,
  },
  {
    index: 4,
    title: 'Add middle shelf',
    thumbnail: '/step-5-middle-shelf.jpg',
    warnings: [],
    threeCode: defaultCode,
  },
  {
    index: 5,
    title: 'Install top shelf',
    thumbnail: '/step-6-top-shelf.jpg',
    warnings: [],
    threeCode: defaultCode,
  },
  {
    index: 6,
    title: 'Attach back panel',
    thumbnail: '/step-7-back-panel.jpg',
    warnings: ['Align carefully'],
    threeCode: defaultCode,
  },
  {
    index: 7,
    title: 'Secure all fasteners',
    thumbnail: '/step-8-secure-fasteners.jpg',
    warnings: [],
    threeCode: defaultCode,
  },
  {
    index: 8,
    title: 'Check stability',
    thumbnail: '/step-9-check-stability.jpg',
    warnings: ['Test before loading'],
    threeCode: defaultCode,
  },
  {
    index: 9,
    title: 'Final adjustments',
    thumbnail: '/step-10-adjustments.jpg',
    warnings: [],
    threeCode: defaultCode,
  },
  {
    index: 10,
    title: 'Clean up',
    thumbnail: '/step-11-cleanup.jpg',
    warnings: [],
    threeCode: defaultCode,
  },
  {
    index: 11,
    title: 'Complete',
    thumbnail: '/step-12-complete.jpg',
    warnings: [],
    threeCode: defaultCode,
  },
];

export function getStepCode(index: number): string | undefined {
  return manualSteps.find((step) => step.index === index)?.threeCode;
}
