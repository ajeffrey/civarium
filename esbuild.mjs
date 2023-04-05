import fs from 'fs';
import * as esbuild from 'esbuild'
import sveltePlugin from "esbuild-svelte";
import sveltePreprocess from 'svelte-preprocess';

const tools = fs.readdirSync('./tools').filter(t => !t.endsWith('.swp'));

const config = {
  entryPoints: [
    { in: 'src/index.ts', out: 'game' },
    ...tools.map(t => ({
      in: `tools/${t}`,
      out: t.replace('.ts', ''), 
    }))
  ],
  bundle: true,
  outdir: 'public/build',
  plugins: [sveltePlugin({
    compilerOptions: {
      css: true
    },
    preprocess: sveltePreprocess(),
    filterWarnings(warning) {
      const ignore = ['a11y-label-has-associated-control'];
      return !ignore.includes(warning.code);
    }
  })],
};

if(process.argv.includes('--tools')) {
  config.entryPoints = config.entryPoints.filter(e => e.in.startsWith('tools/'));
}

if(process.argv.includes('--watch')) {
  const ctx = await esbuild.context(config);
  await ctx.watch();
  const { host, port } = await ctx.serve({
    servedir: 'public',
  })
  console.log(`Serving on ${host}:${port}`);

} else {
  await esbuild.build(config);
}
