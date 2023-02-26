
<button class="toggle" on:click={toggleVisible}>Console</button>
{#if isOpen}
<div class="terminal">
  <pre class="output">{output}</pre>
  <form action="" on:submit={executeCommand}>
    <input type="text" class="input" on:change={updateInput} value={input} use:focus />
  </form>
</div>
{/if}
<style>
  .toggle {
    position: absolute;
    right: 0;
    bottom: 0;
    background: #00dd00;
    color: white;
    padding: 5px 10px;
    border: none;
    cursor: pointer;
    z-index: 1;
  }
  .terminal {
    background: rgba(0, 0, 0, 0.75);
    position: absolute;
    left: 50px;
    top: 50px;
    right: 50px;
    bottom: 50px;
    display: flex;
    flex-direction: column;
    padding: 10px 0;
    font-family: monospace;
    font-size: 16px;
  }
  .output {
    flex-grow: 1;
    padding: 0 10px;
    color: white;
  }
  form {
    display: flex;
    flex-direction: column;
  }
  .input {
    background: none;
    color: white;
    padding: 0 10px;
    border: none;
    font-size: inherit;
    font-family: inherit;
  }
  input:focus {
    outline: none;
  }
</style>
<script lang="ts">
  interface Command {
    command: string;
    callback(args: string): Promise<string>;
  }
  export let commands: Command[] = [];

  let input = '';
  let output = '';
  let isOpen = false;

  export function toggleVisible() {
    isOpen = !isOpen;
  }

  export function addCommand(command: string, callback: (args: string) => Promise<string>) {
    commands.push({ command, callback });
  }

  function updateInput(event) {
    input = event.target.value;
  }

  function executeCommand(event) {
    event.preventDefault();
    const [command, ...args] = input.split(' ');
    const toExec = commands.find(c => c.command === command);
    output += `$ ${input}\n`;
    if(!toExec) {
      output += `command "${command}" not found\n`;
    }

    input = '';
    toExec.callback(args.join(' ')).then(result => output += result);
  }

  function focus(el) {
    el.focus();
  }
</script>