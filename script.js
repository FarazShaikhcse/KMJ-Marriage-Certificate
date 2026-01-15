const { jsPDF } = window.jspdf;
const TOP_MARGIN = 50;
/**
 * Aadhaar formatter
 * - digits only
 * - max 12 digits
 * - space after every 4 digits
 */
function formatAadhar(input) {
  let value = input.value.replace(/\D/g, "");
  value = value.substring(0, 12);
  const groups = value.match(/.{1,4}/g);
  input.value = groups ? groups.join(" ") : "";
}

/**
 * Convert YYYY-MM-DD → DD-MM-YYYY
 */
function formatDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}-${m}-${y}`;
}

function generatePDF() {
  // ---- Read inputs ----
  const issueDate = formatDate(document.getElementById("date").value);
  const marriageDate = formatDate(document.getElementById("marriageDate").value);

  const groomName = document.getElementById("groomName").value.trim();
  const groomFather = document.getElementById("groomFather").value.trim();
  const groomAddress = document.getElementById("groomAddress").value.trim();
  const groomAadharRaw = document
    .getElementById("groomAadhar")
    .value.replace(/\s/g, "");

  const brideName = document.getElementById("brideName").value.trim();
  const brideFather = document.getElementById("brideFather").value.trim();
  const brideAddress = document.getElementById("brideAddress").value.trim();
  const brideAadharRaw = document
    .getElementById("brideAadhar")
    .value.replace(/\s/g, "");

  const marriagePlace = document.getElementById("marriagePlace").value.trim();
  const registerNo = document.getElementById("registerNo").value.trim();
  const officiant = document.getElementById("officiant").value.trim();

  // ---- Aadhaar validation ----
  if (groomAadharRaw.length !== 12 || brideAadharRaw.length !== 12) {
    alert("Aadhaar number must be exactly 12 digits");
    return;
  }

  // ---- Create PDF ----
  const doc = new jsPDF();
  doc.setFont("Times", "Bold");
  doc.setFontSize(12);

  // Issue date (right aligned)
  doc.text(`Date: ${issueDate}`, 185, TOP_MARGIN , { align: "right" });

  // Title
  doc.setFontSize(16);
  doc.text("MARRIAGE CERTIFICATE", 105, TOP_MARGIN + 10, { align: "center" });

  doc.setFontSize(14);

  // ---- Inline paragraph renderer (NO overlap, supports bold) ----
  let xStart = 20;
  let y = TOP_MARGIN  + 30;
  const pageRight = 180;
  const lineHeight = 8;

  function drawInlineParagraph(parts) {
    let x = xStart;

    parts.forEach(part => {
      doc.setFont("Times", part.bold ? "Bold" : "Normal");

      part.text.split(" ").forEach(word => {
        const text = word + " ";
        const width = doc.getTextWidth(text);

        if (x + width > pageRight) {
          x = xStart;
          y += lineHeight;
        }

        doc.text(text, x, y);
        x += width;
      });
    });

    y += lineHeight;
  }

  // ---- MAIN PARAGRAPH (single paragraph, flowing) ----
  drawInlineParagraph([
    { text: "This is to certify that the marriage (Nikah) between" },

    { text: groomName + ",", bold: true },

    {
      text:
        ` S/o ${groomFather}, residing at ${groomAddress} ` +
        `(Aadhar No. ${groomAadharRaw}), and`
    },

    { text: brideName + ",", bold: true },

    {
      text:
        ` D/o ${brideFather}, residing at ${brideAddress} ` +
        `(Aadhar No. ${brideAadharRaw}), was solemnized on ${marriageDate} ` +
        `at ${marriagePlace}.`
    }
  ]);

  // ---- Remaining paragraphs ----
  drawInlineParagraph([
    { text: `This certificate is issued as per Marriage Registrar No. ${registerNo}. The marriage was solemnized by ${officiant}.` }
  ]);

  // ---- Download ----
  doc.save("Marriage_Certificate.pdf");
}

