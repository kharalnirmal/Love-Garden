import { BouquetProvider } from "../../context/BouquetContext";
import BouquetCreationFlow from "../../components/bouquet/BouquetCreationFlow";

// Main component that provides the context
export default async function Home(props: {
  searchParams: Promise<{ mode?: string }>;
}) {
  // Extract mode from URL params, default to "mono" if not specified
  // This allows different styling/functionality based on mode
  const mode = (await props.searchParams).mode === "color" ? "color" : "mono";

  return (
    <BouquetProvider mode={mode}>
      <BouquetCreationFlow />
    </BouquetProvider>
  );
}
