import { Entity, Component } from "../Entity";

export class State {
  name: string;
  enter(machine: StateMachine) {}
  update(machine: StateMachine) {}
  exit(machine: StateMachine) {}
}

export class StateMachine extends Component {
  public state: State | null;
  private _states: {[key: string]: State};

  constructor(entity: Entity) {
    super(entity);
    this._states = {};
    this.state = null;
  }

  addState(state: State) {
    this._states[state.name] = state;
  }

  setState(name: string) {
    const newState = this._states[name];
    if(!newState) {
      throw new Error(`state ${name} not found`);
    }

    if(this.state) {
      this.state.exit(this);
    }

    this.state = this._states[name];
    this.state.enter(this);
  }

  update() {
    if(this.state) {
      this.state.update(this);
    }
  }
}