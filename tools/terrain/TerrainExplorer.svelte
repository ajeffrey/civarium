<script lang="ts">
  import Heightmap from "src/terrain/Heightmap";
  import { Cell } from './types';
  import { chunkRain } from './chunkRain';
  // import { basinRain } from './basinRain';

  interface Magnifier {
    x: number;
    y: number;
    cells: Array<Cell | null>;
    flip: [boolean, boolean];
  }

  type RainType = 'none' | 'chunk' | 'basin';

  let chunkSize = 64;
  let chunkCount = 2;
  $: mapSize = chunkSize * chunkCount;
  let octaves = "1111111";
  let lacunarity = 2.5;
  let persistence = 2;

  let rainType: RainType = 'none';
  let minFlow: number = 10;

  let time: number | null = null;
  let magnifier: Magnifier | null = null;

  const seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString();

  function setPx(img, idx, r, g = r, b = g, a = 255) {
    img.data[idx * 4] = r;
    img.data[idx * 4 + 1] = g;
    img.data[idx * 4 + 2] = b;
    img.data[idx * 4 + 3] = a;
  }

  function hideMagnifier() {
    magnifier = null;
  }

  let c: HTMLCanvasElement;
  let cells: Cell[] = [];
  let min = Infinity, max = -Infinity;

  const magRadius = 2;

  function showMagnifier(event: PointerEvent) {
    const cbr = c.getBoundingClientRect();
    const x = event.clientX - cbr.left;
    const y = event.clientY - cbr.top;
    const px = Math.floor(x / cbr.width * mapSize);
    const py = Math.floor(y / cbr.height * mapSize);
    const flip: [boolean, boolean] = [false, false];
    if(x / cbr.width > 0.5) flip[0] = true;
    if(y / cbr.height > 0.5) flip[1] = true;

    const magCells: Array<Cell | null> = [];
    for(let iy = py - magRadius; iy <= py + magRadius; iy++) {
      for(let ix = px - magRadius; ix <= px + magRadius; ix++) {
        if(ix >= 0 && iy >= 0 && ix < mapSize && iy < mapSize) {
          magCells.push(cells[ix + iy * mapSize]);
        } else {
          magCells.push(null);
        }
      }
    }
    magnifier = { x, y, cells: magCells, flip };
  }

  function cellColour(cell: Cell | null, edge: boolean = false): [number, number, number] {
    if(!cell) {
      return [255, 255, 255];
    }

    const height = (cell.height - min) / (max - min) * 255;
    if(cell.lake || cell.river) {
      return[edge ? 50 : 0, 0, height];
    } else {
      return [edge ? (height > 200 ? height - 50 : height + 50) : height, height, height];
    }
  }

  const ARROWS = {
    'ru': '↗',
    'r': '→',
    'rd': '↘',
    'd': '↓',
    'ld': '↙',
    'l': '←',
    'lu': '↖',
    'u': '↑',
  }
  function cellCorner({ direction: [x, y] }: Cell['river']) {
    const chars = [];
    if(x > 0) chars.push('r');
    else if(x < 0) chars.push('l');
    if(y > 0) chars.push('d');
    else if(y < 0) chars.push('u');
    return ARROWS[chars.join('')];
  }

  $: {
    const heightmap = new Heightmap({
      algorithm: "simplex",
      octaves: octaves.length,
      lacunarity,
      persistence,
      seed,
    });

    if (c) {
      time = Date.now();

      const getHeight = (x: number, y: number) => {
        let height = 0;
        for (let i = 0; i < octaves.length; i++) {
          if (octaves[i] === "1") {
            height += heightmap.getOctave(i, x, y) * Math.pow(persistence, i);
          }
        }
        return height;
      }


      const ctx = c.getContext("2d");
      ctx.clearRect(0, 0, c.width, c.height);

      if(mapSize > 0) {
        c.width = mapSize;
        c.height = mapSize;
        ctx.imageSmoothingEnabled = false;
        ctx.translate(0.5, 0.5);  

        for(let cy = 0; cy < chunkCount; cy++) {
          for(let cx = 0; cx < chunkCount; cx++) {
            const offX = cx * chunkSize;
            const offY = cy * chunkSize;
            const getChunkHeight = (x: number, y: number) => getHeight(x + offX, y + offY);
            const chunk = (() => {
              switch(rainType) {
                case "chunk":
                  return chunkRain({
                    size: chunkSize,
                    minFlow,
                    getHeight: getChunkHeight
                  });
                default: {
                  const cells: Cell[] = [];
                  for (let y = 0; y < chunkSize; y++) {
                    for (let x = 0; x < chunkSize; x++) {
                      const height = getChunkHeight(x, y);
                      cells.push({ height });
                    }
                  }
                  return cells;
                };
              }
            })();

            //cells = [];
            for(let y = 0; y < chunkSize; y++) {
              for(let x = 0; x < chunkSize; x++) {
                cells[offX + x + mapSize * (offY + y)] = chunk[x + chunkSize * y];
              }
            }
          }
        }

        min = Infinity;
        max = -Infinity;
        for (let i = 0; i < mapSize * mapSize; i++) {
          const height = cells[i].height;
          if(height < min) min = height;
          if(height > max) max = height;
        }

        const image = ctx.createImageData(mapSize, mapSize);
        for (let i = 0; i < mapSize * mapSize; i++) {
          const edge = (i % chunkSize == 0 || Math.floor(i / mapSize) % chunkSize == 0);
          setPx(image, i, ...cellColour(cells[i], edge));
        }

        ctx.putImageData(image, 0, 0);
      }

      time = Date.now() - time;
    }
  }
</script>
<div class="grid">
  <div class="col">
    <h2>Heightmap</h2>
    <p>
      <label for="chunkSize">chunk size</label>
      <input type="number" name="chunkSize" bind:value={chunkSize} />
    </p>
    <p>
      <label for="chunkCount">chunk count</label>
      <input type="number" name="chunkCount" bind:value={chunkCount} />
    </p>
  </div>
  <div class="col">
    <h2>Noise</h2>
    <p>
      <label for="octaves">octaves</label>
      <input type="text" pattern="[01]" name="octaves" bind:value={octaves} />
    </p>
    <p>
      <label for="lacunarity">lacunarity</label>
      <input type="number" name="lacunarity" bind:value={lacunarity} />
    </p>
    <p>
      <label for="persistence">persistence</label>
      <input type="number" name="persistence" bind:value={persistence} />
    </p>
  </div>
  <div class="col">
    <h2>Rain</h2>
    <p>
      <label for="raintype">type</label>
      <select name="raintype" bind:value={rainType}>
        <option value="none">None</option>
        <option value="chunk">Chunk</option>
        <option value="basin">Basin</option>
      </select>
    </p>
    <p>
      <label for="minFlow">minimum river flow</label>
      <input type="number" name="minFlow" bind:value={minFlow} />
    </p>
  </div>
</div>
<div class="wrap">
  <span class="timer">completed in {time}ms</span>
  {#if magnifier}
    <div class="magnifier" style={`left: ${magnifier.x}px; top: ${magnifier.y}px; transform: translate(${magnifier.flip[0] ? '-100%' : '0%'}, ${magnifier.flip[1] ? '-100%' : '0%'}); grid-template-columns: repeat(${1 + magRadius * 2}, 1fr);`}>
      {#each magnifier.cells as cell}
        <div class="cell" style={`background: rgb(${cellColour(cell).join(',')})`}>
          {#if cell?.river}
            <div class="dir">{cellCorner(cell.river)}</div>
            <div class="vol">{cell.river.flow}</div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
  <canvas bind:this={c} on:pointermove={showMagnifier} on:pointerleave={hideMagnifier} on:pointerdown={showMagnifier} />
</div>

<style lang="scss">
  .grid {
    max-width: 1500px;
    margin: 0 auto;
    padding: 10px;
    display: grid;
    gap: 20px;

    @media (min-width: 600px) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (min-width: 900px) {
      grid-template-columns: repeat(3, 1fr);
    }
    @media (min-width: 1200px) {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  .wrap {
    position: relative;
    .timer {
      position: absolute;
      display: block;
      padding: 5px;
      left: 0;
      top: 0;
      color: white;
      text-shadow: 0 1px 1px #000;
    }
    .magnifier {
      pointer-events: none;
      position: absolute;
      background: white;
      display: grid;
      .cell {
        position: relative;
        width: 50px;
        height: 50px;
        .dir {
          line-height: 50px;
          text-align: center;
          font-size: 20px;
          color: white;
          text-shadow: 0 0 2px #000;
        }
        .vol {
          position: absolute;
          right: 2px;
          top: 0;
          color: white;
          text-shadow: 0 0 2px #000;
        }
      }
    }
  }
  h2 {
    font-size: 18px;
  }
  p {
    margin: 0;
    padding: 10px 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    & + & {
      padding-top: 0;
    }
  }
  label {
    flex-grow: 1;
  }
  input,select {
    box-sizing: border-box;
    padding: 3px 8px;
    border: 1px solid #999;
    margin-left: 10px;
    min-width: 100px;
  }
  canvas {
    width: 100%;
  }
</style>
