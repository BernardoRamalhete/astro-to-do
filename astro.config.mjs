import { defineConfig } from 'astro/config';
import nodejs from '@astrojs/node';
import node from "@astrojs/node";
import vue from "@astrojs/vue";

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [vue()]
});