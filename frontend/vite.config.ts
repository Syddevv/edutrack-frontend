import tailwindcss from "@tailwindcss/vite";

export default {
  envPrefix: ["VITE_", "GEMINI_"],
  plugins: [tailwindcss()],
};
