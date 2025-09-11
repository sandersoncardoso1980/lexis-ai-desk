import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// substitui "lexis-ai-desk" pelo nome do teu repo
const repoName = lexis-ai-desk;

export default defineConfig(({ mode }) => ({
  base: mode === "development" ? "/" : repoName,  // <--- aqui
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
