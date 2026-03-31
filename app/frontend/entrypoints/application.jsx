import "../styles/globals.css";
import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob("../pages/**/*.jsx", { eager: true });
    const page = pages[`../pages/${name}.jsx`];
    if (!page) {
      console.error(
        `Inertia page "${name}" not found. Available:`,
        Object.keys(pages)
      );
      throw new Error(`Page not found: ${name}`);
    }
    return page;
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />);
  },
});
