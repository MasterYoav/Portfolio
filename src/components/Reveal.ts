import dynamic from "next/dynamic";

const Reveal = dynamic(() => import("./RevealInner"), { ssr: false });
export default Reveal;
