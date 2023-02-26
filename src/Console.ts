import { Entity, Component } from 'src/ecs';
import { SvelteComponent } from 'svelte';
import ConsoleUI from './Console.svelte';

export class Console extends Component {
  private ui: SvelteComponent;
  constructor(entity: Entity) {
    super(entity);
    this.ui = new ConsoleUI({
      target: document.body
    });
  }

  toggleVisible() {
    this.ui.toggleVisible();
  }

  addCommand(command: string, callback: (args: string) => Promise<string>) {
    this.ui.addCommand(command, callback);
  }
}