<script lang="ts">
  import { onMount } from "svelte";
  import Heightmap from "src/terrain/Heightmap";

  const testSize = 256;
  const scaled = testSize * 4;

  let octaves = '1111111';
  let lacunarity = 2.5;
  let persistence = 2;
  const seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString();

  function setPx(img, idx, r, g = r, b = g, a = 255) {
    img.data[idx * 4] = r;
    img.data[idx * 4 + 1] = g;
    img.data[idx * 4 + 2] = b;
    img.data[idx * 4 + 3] = a;
  }

  function drawHeights(ctx, size, heights) {
    const image = ctx.createImageData(testSize, testSize);
    const min = Math.min(...heights);
    const max = Math.max(...heights);
    for(let i = 0; i < size * size; i++) {
      const height = Math.round((heights[i] - min) / (max - min) * 255);
      setPx(image, i, height);
    }

    ctx.putImageData(image, 0, 0);
  }

  let heightCanvas: HTMLCanvasElement;

  $: {
    const heightmap = new Heightmap({ algorithm: 'fast-simplex', octaves, lacunarity, persistence, seed });

    if(heightCanvas) {
      const octaveindices = octaves.split('').filter(v => v === '1').map((_, i) => i);
      const heights = [];
      for(let y = 0; y < testSize; y++) {
        for(let x = 0; x < testSize; x++) {
          let height = 0;
          for(let i = 0; i < octaves.length; i++) {
            if(octaves[i] === '1') {
              height += heightmap.getOctave(i, x, y) * Math.pow(persistence, i);
            }
          }
          heights.push(height);
        }
      }

      console.log('render');
      const ctx = heightCanvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      const dpr = window.devicePixelRatio || 1;
      const bsr = (ctx as any).webkitBackingStorePixelRatio || (ctx as any).backingStorePixelRatio || 1;

      const ratio = dpr / bsr;
      ctx.translate(0.5, 0.5);
      drawHeights(ctx, testSize, heights);
    }
  }

</script>
<p><label>octaves: </label><input type="text" bind:value={octaves} /></p>
<p><label>lacunarity: </label><input type="number" bind:value={lacunarity} /></p>
<p><label>persistence: </label><input type="number" bind:value={persistence} /></p>
<canvas width={testSize} height={testSize} bind:this={heightCanvas} />
<style>
p {
  margin: 0;
  padding: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
}
p+p {
  padding-top: 0;
}
label {
  flex-grow: 1;
}
input {
  padding: 3px 8px;
  border: 1px solid #999;
  margin-left: 10px;
}
canvas {
  width: 100%;
}
</style>
