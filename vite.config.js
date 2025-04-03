import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    hmr:
      process.env.NODE_ENV === "production"
        ? false
        : {
            host: "qlue.in",
            protocol: "wss",
            clientPort: 443,
            secure: true,
          },
	allowedHosts:['qlue.in','www.qlue.in','0.0.0.0']
  },
  plugins: [react()],
});
