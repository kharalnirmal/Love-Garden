"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { Check, Copy, Download, QrCode, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GiftShareTools({ id, recipientUrl }: { id: string; recipientUrl: string }) {
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const panelId = useId();
  const qrUrl = `/gift/${encodeURIComponent(id)}/qr`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(recipientUrl);
      setCopied(true);
      setError("");
    } catch {
      setError("Couldn’t copy the gift link. Please try again.");
    }
  }

  async function download(format: "png" | "svg") {
    if (downloading) return;
    setDownloading(true);
    setError("");
    try {
      const response = await fetch(`${qrUrl}?format=${format}`);
      if (!response.ok) throw new Error("QR_UNAVAILABLE");
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `love-garden-qr.${format}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("QR unavailable. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="gift-share">
      <div className="share-tool-row">
        <Button variant="outline" onClick={copyLink}>{copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}{copied ? "Copied" : "Copy link"}</Button>
        <Button variant="outline" aria-expanded={qrOpen} aria-controls={panelId} onClick={() => setQrOpen(!qrOpen)}><QrCode aria-hidden="true" /> QR code</Button>
      </div>
      {qrOpen && <div id={panelId} className="qr-panel gentle-enter">
        <Image src={qrUrl} alt="QR code for this gift link" width={176} height={176} unoptimized onError={() => setError("QR unavailable. Please try again.")} />
        <div className="qr-downloads">{(["png", "svg"] as const).map((format) => <Button variant="outline" key={format} disabled={downloading} onClick={() => download(format)}>{downloading ? <LoaderCircle className="loading-icon" aria-hidden="true" /> : <Download aria-hidden="true" />}{format.toUpperCase()}</Button>)}</div>
      </div>}
      <p role="status" className="privacy-hint">{error || (copied ? "Link copied. Ready to share." : "")}</p>
    </div>
  );
}
