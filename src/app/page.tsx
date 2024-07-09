import Image from "next/image";
import styles from "./page.module.css";
import dynamic from "next/dynamic";

const MyComponentNoSSR = dynamic(() => import("./components/comp"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className={styles.main}>
      <MyComponentNoSSR />
    </main>
  );
}
