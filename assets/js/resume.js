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

// Resize the viewer container so its height matches the rendered page
function resizeContainerToPage() {
  if (!pdfPageView) return;

  let height = null;

  // Prefer the viewport height if available
  if (pdfPageView.viewport) {
    height = pdfPageView.viewport.height;
  }

  // Fallback to the actual DOM element height
  if (!height && pdfPageView.div) {
    height = pdfPageView.div.offsetHeight;
  }

  if (height) {
    container.style.height = height + "px";
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

  // Match container height to the new page height
  resizeContainerToPage();
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
    const containerHeight = container.clientHeight || window.innerHeight * 0.9;

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
      // No textLayerFactory / annotationLayerFactory here
    });

    pdfPageView.setPdfPage(page);
    pdfPageView.draw();

    // Make the container match the page height on initial render
    resizeContainerToPage();
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
