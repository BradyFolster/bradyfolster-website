// ====== CONFIG ======
const PDF_URL = "/assets/pdf/Resume.pdf";
const ZOOM_STEP = 0.25;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4.0;

// ====== PDF.js setup ======
const pdfjsLib = window["pdfjs-dist/build/pdf"];
const pdfjsViewer = window["pdfjs-dist/web/pdf_viewer"];

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const eventBus = new pdfjsViewer.EventBus();
const container = document.getElementById("pdf-container");

let pdfDoc = null;
let pdfPageView = null;
let currentPage = 1;
let scale = 1.0;

const zoomLevelSpan = document.getElementById("zoom-level");
const pageInfoSpan = document.getElementById("page-info");

// We only want to set the container height ONCE (after first render)
let initialContainerHeightSet = false;

function setInitialContainerHeight() {
  if (!pdfPageView || initialContainerHeightSet) return;

  let height = 0;

  // Prefer actual rendered element height
  if (pdfPageView.div) {
    height = pdfPageView.div.offsetHeight;
  } else if (pdfPageView.viewport) {
    // Fallback to viewport height if needed
    height = pdfPageView.viewport.height;
  }

  if (height) {
    container.style.height = height + "px"; // lock height
    // allow internal scrolling once content gets bigger than this
    container.style.overflow = "auto";
    initialContainerHeightSet = true;
  }
}

function updateZoomLabel() {
  zoomLevelSpan.textContent = Math.round(scale * 100) + "%";
}

function setScale(newScale) {
  scale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newScale));
  if (!pdfPageView) return;

  pdfPageView.update({ scale });
  pdfPageView.draw();

  // NOTE: we do NOT change the container height here anymore.
  // The height stays whatever it was after the first render.
  updateZoomLabel();
}

function fitWidth() {
  if (!pdfPageView || !pdfDoc) return;
  pdfDoc.getPage(currentPage).then((page) => {
    const viewport = page.getViewport({ scale: 1 });
    const containerWidth = container.clientWidth;
    const newScale = containerWidth / viewport.width;
    setScale(newScale);
  });
}

function fitPage() {
  if (!pdfPageView || !pdfDoc) return;
  pdfDoc.getPage(currentPage).then((page) => {
    const viewport = page.getViewport({ scale: 1 });
    const containerWidth = container.clientWidth;
    // Use the current locked height or, if not set yet, container/client height
    const containerHeight =
      parseFloat(container.style.height) || container.clientHeight || window.innerHeight * 0.9;

    const scaleWidth = containerWidth / viewport.width;
    const scaleHeight = containerHeight / viewport.height;
    const newScale = Math.min(scaleWidth, scaleHeight);
    setScale(newScale);
  });
}

// Load the PDF and first (only) page
pdfjsLib
  .getDocument(PDF_URL)
  .promise.then((doc) => {
    pdfDoc = doc;
    pageInfoSpan.textContent = `Page ${currentPage} of ${pdfDoc.numPages}`;
    return pdfDoc.getPage(currentPage);
  })
  .then((page) => {
    const viewport = page.getViewport({ scale });

    // Create a PDFPageView with canvas rendering only
    pdfPageView = new pdfjsViewer.PDFPageView({
      container,
      id: currentPage,
      scale,
      defaultViewport: viewport,
      eventBus,
      // textLayerFactory / annotationLayerFactory intentionally omitted
    });

    pdfPageView.setPdfPage(page);
    pdfPageView.draw();

    // After the first render, lock the container height to the page height
    setInitialContainerHeight();
    updateZoomLabel();
  });

// ====== Toolbar events ======
document.getElementById("zoom-in").addEventListener("click", () => {
  setScale(scale + ZOOM_STEP);
});

document.getElementById("zoom-out").addEventListener("click", () => {
  setScale(scale - ZOOM_STEP);
});

document.getElementById("fit-width").addEventListener("click", fitWidth);
document.getElementById("fit-page").addEventListener("click", fitPage);

// ====== Open in New Tab ======
document.getElementById("open-tab").addEventListener("click", () => {
  window.open(PDF_URL, "_blank");
});

// ====== Download ======
document.getElementById("download-pdf").addEventListener("click", () => {
  const link = document.createElement("a");
  link.href = PDF_URL;
  link.download = PDF_URL.split("/").pop(); // "Resume.pdf"
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
// ====== Reset zoom to 100% when clicking the zoom label ======
document.getElementById("zoom-level").addEventListener("click", () => {
  setScale(1.0);   // reset to 100%
});
// ====== Ctrl+scroll & pinch-to-zoom support ======
// Many desktop browsers report pinch-zoom on a trackpad as a wheel event
// with event.ctrlKey === true. We use that to zoom the PDF instead of the page.
container.addEventListener("wheel", (event) => {
  // Only intercept if Ctrl (or Cmd on macOS) is pressed – covers ctrl+scroll and pinch
  if (!event.ctrlKey && !event.metaKey) return;

  event.preventDefault();

  // deltaY > 0 => zoom out, deltaY < 0 => zoom in
  const direction = event.deltaY > 0 ? -1 : 1;
  const step = ZOOM_STEP * 0.5; // smaller step feels smoother for wheel zoom

  setScale(scale + direction * step);
}, { passive: false });