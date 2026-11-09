import Link from "next/link";
import styles from "./credits.module.css";

export default function Credits() {
  return (
    <footer className={styles.footer}>
      <p className={styles.maker}>Made by <a href="https://www.instagram.com/nirmalkharal/" target="_blank" rel="noopener noreferrer">@nirmalkharal</a></p>
      <details className={styles.credits}>
        <summary>Credits</summary>
        <div className={styles.panel}>Love Garden is a personalized DigiBouquet fork. Original project and flower artwork credit: <Link href="https://x.com/pau_wee_">@pau_wee_</Link>. Reuse permissions are pending confirmation.</div>
      </details>
    </footer>
  );
}
