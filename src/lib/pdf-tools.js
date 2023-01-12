import PdfPrinter from "pdfmake";

export const getPDFReadableStream = (blogsArray, index) => {
  const fonts = {
    Roboto: {
      normal: "Helvetica",
    },
  };

  const printer = new PdfPrinter(fonts);

  const docDefinition = {
    content: [
      { text: blogsArray[index].title, style: "header" },
      blogsArray[index].content
        .split("<p>")
        .map((paragraph) => paragraph.replace(/<[^>]+>/g, "")),
    ],
    styles: {
      header: {
        fontSize: 18,
        fontWeight: "bold",
      },
    },
  };

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition);
  pdfReadableStream.end();

  return pdfReadableStream;
};
