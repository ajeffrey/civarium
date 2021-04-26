import { Entity, Component } from "../Entity";

export interface IState {
  update(stateMachine: StateMachine)
}

export class StateMachine extends Component {
  public state: IState;

  constructor(entity: Entity, initialState: IState) {
    super(entity);
    this.state = initialState;
  }

  setState(state: IState) {
    this.state = state;
  }

  update() {
    this.state.update(this);
  }
}