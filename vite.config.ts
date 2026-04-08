import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Custom plugin to mock Netlify functions locally without needing `netlify dev`
const netlifyMockPlugin = () => ({
  name: 'netlify-mock-plugin',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      if (req.url && req.url.startsWith('/.netlify/functions/')) {
        if (req.method === 'POST' || req.method === 'GET') {
          let body = '';
          req.on('data', (chunk: any) => body += chunk.toString());
          req.on('end', async () => {
            try {
              const urlParts = req.url.split('?');
              const functionName = urlParts[0].replace('/.netlify/functions/', '');
              const fnPath = `/netlify/functions/${functionName}.ts`;
              
              // Ensure environment variables are loaded BEFORE the module is evaluated
              Object.assign(process.env, loadEnv(server.config.mode, process.cwd(), ''));
              
              const module = await server.ssrLoadModule(fnPath);
              if (module && module.handler) {
                
                const event = {
                  httpMethod: req.method,
                  body: body,
                  path: req.url,
                  headers: req.headers,
                  queryStringParameters: {},
                };
                
                const result = await module.handler(event, {});
                
                res.statusCode = result.statusCode || 200;
                if (result.headers) {
                  for (const [k, v] of Object.entries(result.headers)) {
                    res.setHeader(k, v as string);
                  }
                }
                res.end(result.body);
                return;
              }
            } catch (err) {
              console.error('Netlify Mock Plugin Error:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
              return;
            }
          });
          return;
        }
      }
      next();
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    netlifyMockPlugin()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
