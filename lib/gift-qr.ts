import QRCode from "qrcode";

// Dark rose on white, no logo or decoration over modules, four-module quiet zone.
export const giftQrOptions = {
  errorCorrectionLevel: "H" as const,
  margin: 4,
  width: 768,
  color: { dark: "#742F50", light: "#FFFFFF" },
};

export async function giftQrPng(url: string) {
  return QRCode.toBuffer(url, { ...giftQrOptions, type: "png" });
}

export async function giftQrSvg(url: string) {
  return QRCode.toString(url, { ...giftQrOptions, type: "svg" });
}
