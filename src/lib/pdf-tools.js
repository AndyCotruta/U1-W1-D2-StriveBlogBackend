import axios from "axios";
import imageToBase64 from "image-to-base64";
import PdfPrinter from "pdfmake";
import striptags from "striptags";
import pdfMake from "pdfmake";
import { promisify } from "util";
import { getPDFWritableStream } from "./fs-tools.js";
import { pipeline } from "stream";

export const getPDFReadableStream = (blog) => {
  const fonts = {
    Roboto: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
  };

  const printer = new PdfPrinter(fonts);

  //   let imagePart = {};
  //   if (blog.cover) {
  //     const response = axios.get(blog.cover, {
  //       responseType: "arraybuffer",
  //     });
  //     const blogCoverURLParts = blog.cover.split("/");
  //     const fileName = blogCoverURLParts[blogCoverURLParts.length - 1];
  //     const [id, extension] = fileName.split(".");
  //     const base64 = response.data.toString("base64");
  //     const base64Image = `data:image/${extension};base64,${base64}`;
  //     imagePart = { image: base64Image, width: 500, margin: [0, 0, 0, 40] };
  //   }
  let responseString = {};
  const base64Image = imageToBase64(blog.cover).then(
    (response) => (responseString = response)
  );

  const Image = `data:image/png;base64,${responseString}`;
  const imagePart = { image: Image };
  const docDefinition = {
    content: [
      { text: blog.title, style: "header" },
      blog.content
        .split("<p>")
        .map((paragraph) => paragraph.replace(/<[^>]+>/g, "")),
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        marginBottom: 20,
      },
    },
  };

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition);
  pdfReadableStream.end();

  return pdfReadableStream;
};

export const asyncPDFGeneration = async (blog) => {
  const source = getPDFReadableStream(blog);
  const destination = getPDFWritableStream("test.pdf");

  const promiseBasedPipeline = promisify(pipeline);

  await promiseBasedPipeline(source, destination);
};
