"use client";

import { useRef, useState } from "react";
import FlowerPicker from "../stages/FlowerPicker";
import BouquetCustomizer from "../stages/BouquetCustomizer";
import CardWriter from "../stages/CardWriter";
import ShareBouquet from "../stages/ShareBouquet";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBouquet } from "../../context/BouquetContext";

// Define the 4 steps of the bouquet creation process
const steps = ["Pick blooms", "Arrange", "Write a note", "Send love"];

// Client component that uses the bouquet context
export default function BouquetCreationFlow() {
  const { canProceed } = useBouquet();

  // Track which step the user is currently on (0-3)
  const [currentStep, setCurrentStep] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const moveToStep = (step: number) => {
    setCurrentStep(step);
    requestAnimationFrame(() => {
      stageRef.current?.focus({ preventScroll: true });
      stageRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
    });
  };

  // Navigation functions
  const nextStep = () =>
    moveToStep(Math.min(currentStep + 1, steps.length - 1));
  const prevStep = () => moveToStep(Math.max(currentStep - 1, 0));

  return (
    <main id="main-content" className="creation-shell" data-step={currentStep}>
      <ol className="step-list" aria-label="Bouquet progress">{steps.map((step, index) => <li key={step} aria-current={index === currentStep ? "step" : undefined} data-complete={index < currentStep}><span className="step-mark" aria-hidden="true" /><span className="sr-only">Step {index + 1} of {steps.length}: {step}</span></li>)}</ol>

      {/* Main content area - renders different components based on current step */}
      <div key={currentStep} ref={stageRef} tabIndex={-1} aria-label={steps[currentStep]} className="creation-stage gentle-enter">
        {/* Step 0: Flower Selection - Users pick flowers for their bouquet */}
        {currentStep === 0 && <FlowerPicker />}

        {/* Step 1: Bouquet Customization - Users arrange and customize their flowers */}
        {currentStep === 1 && <BouquetCustomizer />}

        {/* Step 2: Card Writing - Users write a message for their bouquet */}
        {currentStep === 2 && <CardWriter />}

        {/* Step 3: Sharing - Users can share their completed bouquet */}
        {currentStep === 3 && <ShareBouquet />}
      </div>

      {/* Navigation buttons */}
      <nav className="flow-navigation" aria-label="Bouquet steps">
        {/* Back button - only show if not on first step */}
        {currentStep > 0 && (
          <Button size="lg" variant="outline"
            className="flow-back"
            onClick={prevStep}
          >
            <ArrowLeft size={18} aria-hidden="true" /> Back
          </Button>
        )}

        {/* Next button - only show if not on last step */}
        {currentStep < steps.length - 1 && (
          <Button size="lg"
            onClick={nextStep}
            disabled={!canProceed}
            className="flow-continue"
          >
            Continue <ArrowRight size={18} aria-hidden="true" />
          </Button>
        )}
      </nav>
    </main>
  );
}
