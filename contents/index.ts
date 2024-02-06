import html2canvas from "html2canvas";
import type { PlasmoCSConfig } from "plasmo"
import { jsPDF } from 'jspdf'

import { listen } from "@plasmohq/messaging/message"

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

listen(async (req, res) => {
  if (req.name === "generate-canvas") {
    // Define a custom PDF format that matches the 1920x1080 slide aspect ratio
    // Convert slide dimensions to a size that fits within the A4 landscape orientation
    // Note: jsPDF uses mm as default unit; 1px = 0.264583 mm (25.4 mm/inch / 96 px/inch)
    const slideWidthInMM = 1920 * 0.264583;
    const slideHeightInMM = 1080 * 0.264583;
    const pdfFormat = [slideWidthInMM, slideHeightInMM];

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: pdfFormat,
      compress: true
    });

    let isFirstSlide = true;

    while (true) {
      const slide: HTMLElement = document.querySelector('.canvas-precision-wrapper');
      if (!slide) break;

      const canvas = await html2canvas(slide, { logging: true, useCORS: true });
      const imgData = canvas.toDataURL("image/png", 1.0);
      // const imgProps = pdf.getImageProperties(imgData);
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const slideAspectRatio = 1920 / 1080;
      let imgWidth = pdfWidth; // Maximum width the image can have to fit the page
      let imgHeight = imgWidth / slideAspectRatio; // Calculate height to maintain aspect ratio

      // Check if the calculated height exceeds the PDF page height
      if (imgHeight > pdfHeight) {
        // Adjust width to fit the height in this case
        imgHeight = pdfHeight;
        imgWidth = imgHeight * slideAspectRatio;
      }

      // Center the image on the page
      const xOffset = (pdfWidth - imgWidth) / 2;
      const yOffset = (pdfHeight - imgHeight) / 2;

      if (!isFirstSlide) {
        pdf.addPage();
      }
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
      isFirstSlide = false;

      const nextSlideButton: HTMLButtonElement = document.querySelector('[aria-label="next"]');
      if (nextSlideButton.disabled) {
        break;
      } else {
        nextSlideButton?.click();
        await sleep(100);
      }
    }
    
    pdf.save("presentation.pdf");
    res.send({ body: 'success' });
  }
})

export const config: PlasmoCSConfig = {
  matches: ["https://pitch.com/*", "https://pitch-assets.imgix.net/*"],
  all_frames: true
}

