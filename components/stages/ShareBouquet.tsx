"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Bouquet from "../bouquet/Bouquet";
import { useBouquet } from "../../context/BouquetContext";

export default function ShareBouquet() {
  const { bouquet, setBouquet } = useBouquet();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const inFlight = useRef(false);

  async function handleCreateBouquet() {
    if (inFlight.current) return;
    inFlight.current = true;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/bouquets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bouquet),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save your bouquet.");
      router.push(`/bouquet/${encodeURIComponent(result.id)}/share`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save your bouquet. Please try again.");
      inFlight.current = false;
      setSaving(false);
    }
  }

  return (
    <div className="share-stage text-center">
      <h1 className="stage-title">Ready to send.</h1>
      <Bouquet bouquet={bouquet} />
      <div className="max-w-md mx-auto mb-6 text-sm space-y-3">
        <label className="flex gap-3 items-center justify-center min-h-11">
          <input type="checkbox" checked={bouquet.visibility === "public"} disabled={saving}
            aria-describedby="unlisted-privacy garden-privacy"
            onChange={(event) => setBouquet((prev) => ({ ...prev, visibility: event.target.checked ? "public" : "unlisted" }))} />
           Show in the public garden
        </label>
        <p id="unlisted-privacy" className="privacy-hint">Unlisted by default: only people with the link can open your gift.</p>
        <p id="garden-privacy" className="privacy-hint">The garden shows flowers only, never your names or message. A public gift can be opened by anyone from the garden.</p>
      </div>
      {error && <p role="alert" className="max-w-md mx-auto mb-4 text-red-800">{error}</p>}
      <Button size="lg" onClick={handleCreateBouquet} disabled={saving}>
        {saving ? <LoaderCircle className="loading-icon" size={18} aria-hidden="true" /> : <Link2 size={18} aria-hidden="true" />}{saving ? "Saving…" : "Create link"}
      </Button>
    </div>
  );
}
