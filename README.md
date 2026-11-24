# Menasri V — Portfolio

A hand-written, dependency-free portfolio site (HTML, CSS, vanilla JS). No build step, no framework, no CDN: fonts and images are self-hosted. It works on any static host.

## Run locally
```bash
cd portfolio
python3 -m http.server 8000      # or: npx serve .
# open http://localhost:8000
```

## Structure
```
index.html            all content (semantic HTML, SEO meta, JSON-LD)
css/style.css         design system: light/dark themes, responsive layout
js/main.js            theme toggle, nav, reveal-on-scroll, dialogs, certificate filter/lightbox, contact form
assets/
  Menasri_V_Resume.pdf          resume download (v3)
  favicon.svg, og-image.png     favicon and social preview
  fonts/                        Lora + DM Sans (SIL OFL), subset to Latin, WOFF
  img/menasri*.webp|jpg         retouched portrait
  img/cert/*.webp               certificate previews (8)
  img/proj/*.webp               AI Image Transformation Tool screenshots (3)
tests/                          Playwright layout + interaction tests (need Chrome)
vercel.json                     long-term caching for /assets
```

## Editing content
- **Text, links, dates:** edit `index.html`.
- **Add a certificate:** copy a `<button class="cert" ...>` block in `#certs`; set `data-cat` (`tech`, `nptel` or `lang`), `data-img`, `data-title`, `data-meta` and optionally `data-verify`.
- **Add project screenshots:** put images in `assets/img/proj/` and replace the `.p-panel` block of that project with an `<img>` (see the Image Tool card), then add a `.shots` gallery to its dialog.
- **Contact form:** set `FORM_ENDPOINT` at the top of `js/main.js` to a Formspree or Web3Forms URL to send from the page. While it is empty, the form opens the visitor's email app with the message pre-filled (no backend needed).
- **Colours / type:** CSS variables at the top of `css/style.css`.

## Deploy (not done for you)
**Vercel** (your current host): create a new GitHub repo with this folder's contents, then *Add New Project → Import* it. Framework preset **Other**, no build command, output directory `.` (root). To keep your existing URL, import it into the existing project and replace the old Next.js code, or point the domain at the new project.
**Netlify / Cloudflare Pages / GitHub Pages** also work: publish the folder as-is.

After you have a final URL: make `og:image` in `index.html` an absolute URL (e.g. `https://your-domain/assets/og-image.png`) and add `<link rel="canonical" href="https://your-domain/">`, otherwise social previews may not show the image.

## What was tested (headless Chromium via Playwright, local server)
- Desktop 1440, tablet 820, mobile 390: zero console errors, zero failed requests, zero broken or distorted images, no horizontal overflow.
- Navigation anchors and scroll-spy, mobile menu, light/dark toggle (persists), all four project dialogs (open, Esc, close button, backdrop), screenshot tabs, certificate filters (8/3/4/1), all 8 certificate lightboxes, verify buttons only on the two certificates that have a verification link, contact-form validation, resume PDF served as `application/pdf`.

**Not tested:** Safari, Firefox and real phones (only Chromium viewport emulation); whether external sites (GitHub, LinkedIn, Credly, EF SET) are currently reachable, because the sandbox has no internet; the contact form actually delivering email (needs your email app or a form endpoint); Lighthouse scores.

## Assets and links used
- Photo: your uploaded selfie, flipped to true orientation, colour-corrected, background replaced with a neutral studio tone (face and features untouched).
- Certificates: your uploads (AWS, RHCSA, Udemy, EF SET, four NPTEL). Verification links come from the certificates themselves: Credly (RHCSA) and cert.efset.org (EF SET).
- Screenshots: three of your AI Image Transformation Tool screens, cropped to remove the browser bar, private IP address, taskbar and other people's photos.
- Links: GitHub `menasri2006-svg` (profile + 3 repos), LinkedIn `menasri-v-069095328`, email `menasri2006@gmail.com`.
- Fonts: Lora and DM Sans, SIL Open Font License.

## Still needs your input
See the message that came with this package.
