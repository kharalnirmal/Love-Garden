"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Bouquet from "../bouquet/Bouquet";
import { useBouquet } from "../../context/BouquetContext";

export default function ShareBouquet() {
  const { bouquet } = useBouquet();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // Consent is a fresh, manual choice each time this screen is entered.
  const [publicConsent, setPublicConsent] = useState(false);
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
        body: JSON.stringify({ ...bouquet, visibility: publicConsent ? "public" : "unlisted" }),
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
      <fieldset className="garden-consent">
        <legend>Share a little beauty?</legend>
        <label className="garden-consent-choice">
          <input type="checkbox" checked={publicConsent} disabled={saving}
            aria-describedby="unlisted-privacy garden-privacy"
            onChange={(event) => setPublicConsent(event.target.checked)} />
           Add my bouquet to the public garden <span className="consent-optional">(optional)</span>
        </label>
        <p id="unlisted-privacy">Leave unchecked to keep your gift unlisted. Only people with its link can open it.</p>
        <p id="garden-privacy">Only your bouquet design is shared in the garden. Your names, message, and gift tag are never shown there. Your personal note stays with your recipient’s separate gift link.</p>
      </fieldset>
      {error && <p role="alert" className="max-w-md mx-auto mb-4 text-red-800">{error}</p>}
      <Button size="lg" onClick={handleCreateBouquet} disabled={saving}>
        {saving ? <LoaderCircle className="loading-icon" size={18} aria-hidden="true" /> : <Link2 size={18} aria-hidden="true" />}{saving ? "Saving…" : "Create link"}
      </Button>
    </div>
  );
}
