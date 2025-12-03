const url = '/assets/pdf/Resume.pdf';

const pdfjsLib = window['pdfjs-dist/build/pdf'];

pdfjsLib.getDocument(url).promise.then(function(pdf) {
    pdf.getPage(1).then(function(page) {
        const viewport = page.getViewport({ scale: 1.2 });
        const canvas = document.getElementById("pdf-canvas");
        const context = canvas.getContext('2d');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        page.render({
            canvasContext: context,
            viewport: viewport
        });
    });
});