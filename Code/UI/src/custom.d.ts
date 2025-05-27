declare module '*.mp4' {
    const src: string;
    export default src;
  }
  declare module "html2pdf.js" {
    interface Html2PdfOptions {
      margin?: number;
      filename?: string;
      image?: { type?: string; quality?: number };
      html2canvas?: { scale?: number };
      jsPDF?: { unit?: string; format?: string | number[]; orientation?: string };
    }
  
    function html2pdf(): {
      from: (source: string | HTMLElement) => any;
      set: (options: Html2PdfOptions) => any;
      save: () => void;
    };
  
    export = html2pdf;
  }