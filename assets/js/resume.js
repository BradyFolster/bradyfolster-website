const PDF_URL = "/assets/pdf/Resume.pdf";
const ZOOM_STEP = 0.25;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4.0;

const pdfjsLib = window["pdfjs-dist/build/pdf"];
const pdfjsViewer = window["pdfjs-dist/web/pdf_viewer"];

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const eventBus = new pdfjsViewer.EventBus();
const container = document.getElementById("pdf-container");

let pdfDoc = null;
let pdfPageView = null;
let currentPage = 1;
let scale = 1;
let initialHeightSet = false;

const zoomLabel = document.getElementById("zoom-level");
const pageInfo = document.getElementById("page-info");

function setInitialHeight() {
  if (!pdfPageView || initialHeightSet) return;

  let h = 0;
  if (pdfPageView.div) h = pdfPageView.div.offsetHeight;
  else if (pdfPageView.viewport) h = pdfPageView.viewport.height;

  if (h) {
    container.style.height = h + "px";
    container.style.overflow = "auto";
    initialHeightSet = true;
  }
}

function updateZoomLabel() {
  zoomLabel.textContent = Math.round(scale * 100) + "%";
}

function setScale(newScale) {
  scale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newScale));
  if (!pdfPageView) return;
  pdfPageView.update({ scale });
  pdfPageView.draw();
  updateZoomLabel();
}

function fitWidth() {
  if (!pdfPageView || !pdfDoc) return;
  pdfDoc.getPage(currentPage).then((page) => {
    const vp = page.getViewport({ scale: 1 });
    const w = container.clientWidth;
    setScale(w / vp.width);
  });
}

function fitPage() {
  if (!pdfPageView || !pdfDoc) return;
  pdfDoc.getPage(currentPage).then((page) => {
    const vp = page.getViewport({ scale: 1 });
    const w = container.clientWidth;
    const h =
      parseFloat(container.style.height) ||
      container.clientHeight ||
      window.innerHeight * 0.9;
    setScale(Math.min(w / vp.width, h / vp.height));
  });
}

pdfjsLib
  .getDocument(PDF_URL)
  .promise.then((doc) => {
    pdfDoc = doc;
    pageInfo.textContent = `Page ${currentPage} of ${pdfDoc.numPages}`;
    return pdfDoc.getPage(currentPage);
  })
  .then((page) => {
    const vp = page.getViewport({ scale });

    pdfPageView = new pdfjsViewer.PDFPageView({
      container,
      id: currentPage,
      scale,
      defaultViewport: vp,
      eventBus,
    });

    pdfPageView.setPdfPage(page);
    pdfPageView.draw();
    setInitialHeight();
    updateZoomLabel();
  });

document.getElementById("zoom-in").addEventListener("click", () => {
  setScale(scale + ZOOM_STEP);
});

document.getElementById("zoom-out").addEventListener("click", () => {
  setScale(scale - ZOOM_STEP);
});

document.getElementById("fit-width").addEventListener("click", fitWidth);
document.getElementById("fit-page").addEventListener("click", fitPage);

document.getElementById("open-tab").addEventListener("click", () => {
  window.open(PDF_URL, "_blank");
});

document.getElementById("download-pdf").addEventListener("click", () => {
  const a = document.createElement("a");
  a.href = PDF_URL;
  a.download = PDF_URL.split("/").pop();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

zoomLabel.addEventListener("click", () => {
  setScale(1);
});

container.addEventListener(
  "wheel",
  (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const dir = e.deltaY > 0 ? -1 : 1;
    const step = ZOOM_STEP * 0.5;
    setScale(scale + dir * step);
  },
  { passive: false }
);
