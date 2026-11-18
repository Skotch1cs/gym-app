const CACHE = 'gym-v8';
const IMG_CACHE = 'gym-img-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
// Exercise pictures, kept in their own cache so app updates don't download them again.
const IMAGES = ["ab-crunch-machine", "arnold-dumbbell-press", "barbell-bench-press-medium-grip", "barbell-curl", "barbell-deadlift", "barbell-incline-bench-press-medium-grip", "barbell-squat", "bench-dips", "bent-over-barbell-row", "butterfly", "cable-crossover", "cable-crunch", "cable-hammer-curls-rope-attachment", "cable-rear-delt-fly", "cable-rope-overhead-triceps-extension", "calf-press-on-the-leg-press-machine", "close-grip-barbell-bench-press", "concentration-curls", "crunches", "decline-crunch", "dips-chest-version", "dumbbell-bench-press", "dumbbell-bicep-curl", "dumbbell-flyes", "dumbbell-incline-row", "dumbbell-lunges", "dumbbell-shoulder-press", "ez-bar-skullcrusher", "face-pull", "flat-bench-lying-leg-raise", "goblet-squat", "hack-squat", "hammer-curls", "hanging-leg-raise", "hyperextensions-back-extensions", "incline-dumbbell-curl", "incline-dumbbell-flyes", "incline-dumbbell-press", "leg-extensions", "leg-press", "leverage-incline-chest-press", "leverage-iso-row", "lying-dumbbell-tricep-extension", "lying-leg-curls", "machine-bench-press", "machine-bicep-curl", "machine-shoulder-military-press", "machine-triceps-extension", "one-arm-dumbbell-row", "preacher-curl", "pullups", "pushups", "reverse-barbell-curl", "reverse-crunch", "reverse-flyes", "reverse-machine-flyes", "romanian-deadlift", "rope-straight-arm-pulldown", "seated-bent-over-rear-delt-raise", "seated-cable-rows", "seated-calf-raise", "seated-dumbbell-curl", "seated-leg-curl", "seated-side-lateral-raise", "side-lateral-raise", "smith-machine-bench-press", "smith-machine-bent-over-row", "smith-machine-incline-bench-press", "smith-machine-squat", "smith-machine-stiff-legged-deadlift", "split-squat-with-dumbbells", "standing-biceps-cable-curl", "standing-calf-raises", "standing-dumbbell-calf-raise", "standing-dumbbell-triceps-extension", "standing-leg-curl", "standing-low-pulley-deltoid-raise", "standing-military-press", "stiff-leg-barbell-good-morning", "stiff-legged-dumbbell-deadlift", "straight-arm-dumbbell-pullover", "straight-arm-pulldown", "t-bar-row-with-handle", "tricep-dumbbell-kickback", "triceps-pushdown", "triceps-pushdown-rope-attachment", "underhand-cable-pulldowns", "upright-barbell-row", "v-bar-pulldown", "wide-grip-lat-pulldown"].map(n => './img/' + n + '.webp');

async function cacheImages() {
  const c = await caches.open(IMG_CACHE);
  const have = new Set((await c.keys()).map(r => r.url));
  const need = IMAGES.filter(u => !have.has(new URL(u, self.location).href));
  await Promise.all(need.map(u => c.add(u).catch(() => {})));
}
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(cacheImages).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== IMG_CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).pathname.includes('/img/')) {
    // Pictures never change: cache first.
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const copy = res.clone();
      if (res.ok) caches.open(IMG_CACHE).then(c => c.put(e.request, copy));
      return res;
    })));
    return;
  }
  // Everything else: network first, so updates arrive when online; cache as offline fallback.
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
