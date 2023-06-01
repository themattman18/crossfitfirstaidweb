'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "8a2a3a53ee2510d4c3fb0cd6c5c57510",
"assets/assets/images/ankle-test.webp": "2496caefeabf367ec439ee2a31b63789",
"assets/assets/images/bridge.webp": "37f45cbba8ec99a3da53a0eb0363b7fb",
"assets/assets/images/butt-wink.webp": "008b7ad8745f76ba642356631c97c433",
"assets/assets/images/ext-2.webp": "a0586f1e4a7c0106a077af487cf27707",
"assets/assets/images/good-posture.webp": "5aa0ab1ea726b5a187bcaa42a18ee897",
"assets/assets/images/heel-drop-1.webp": "8a5e0a02e2cd90238e28e21c01d4f2f7",
"assets/assets/images/heel-drop-2.webp": "da5387b4c7d245b49db9641f6df7bb20",
"assets/assets/images/hip-ext.webp": "a4ed70b957f413f2bb9a25f1dc4f79d0",
"assets/assets/images/img_09301.webp": "b4ccf202928552eafab8596c1b06bb9d",
"assets/assets/images/img_09341-e1511297356127.webp": "dec179003ba16cf9baae0882ef35b92c",
"assets/assets/images/img_3230.webp": "f63437d37219cafa2e980ff91fc240c7",
"assets/assets/images/img_3231.webp": "4e9600fa5df827f864ef65dbe9d2a311",
"assets/assets/images/img_32321.webp": "b59c54b96c7634b1a45752816fdf9305",
"assets/assets/images/lift-1.webp": "25f99c79c1535abc5640d9f3fa8f75f9",
"assets/assets/images/lift-2.webp": "541947cf9fb104778137df8e7f295ddb",
"assets/assets/images/poor-posture.webp": "3d54b4019cb59da9fb608ed2ef60a0c0",
"assets/assets/images/pronewebp.webp": "e338b24723a8081153a2de75ffbad998",
"assets/assets/images/rdl-2.webp": "8b7b9d3e4e85053076b09cfc07879cbb",
"assets/assets/images/rdl.webp": "aee89b1f49048a813be6b94396153860",
"assets/assets/images/seated-2.webp": "de0543c912153a86bf0511ec87beeb9e",
"assets/assets/images/seated-3.webp": "7c1504a5d79a39ae149cf0e924d08a79",
"assets/assets/images/seated.webp": "a60fb771fb6ea26f10348fe9672d0e0f",
"assets/assets/images/uni-bridge.webp": "d7cc6cfbdddc89ba8154caafcd79d07a",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"assets/NOTICES": "d36677cc3f6611031f6269e0c51b0cd0",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/shaders/ink_sparkle.frag": "87f61146d03b9da3e19e81144ed336c2",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"index.html": "ac3a0fc8ec739aa13d70f11bc07cad1e",
"/": "ac3a0fc8ec739aa13d70f11bc07cad1e",
"main.dart.js": "a14c1769097fdf3bb729e1b4036b3cf7",
"manifest.json": "26ad5f5e2c80b203b6e1801133adcbd6",
"version.json": "5038eb6c1720f724821e38ec72c1df32"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
