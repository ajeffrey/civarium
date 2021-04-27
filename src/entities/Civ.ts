import * as THREE from 'three';
import { Component, Entity } from '../Entity';
import Time from '../Time';
import Location from '../components/Location';
import Stats from '../components/Stats';
import { Model } from '../components/Model';
import { State, StateMachine } from '../components/StateMachine';
import { ICommand, idle, interrupt } from '../commands';

class IdleState extends State {
  name = 'idle';

  enter(machine: StateMachine) {
    console.log('idle');
  }
}

class MovingState extends State {
  name = 'moving';

  enter(machine: StateMachine) {
    console.log('moving');
  }
}

class DyingState extends State {
  name = 'dying';

  enter(machine: StateMachine) {
    console.log('dying');
    const model = machine.entity.getComponent(Model);
    console.log(model.model.animations);
  }
}

export default class Human extends Component {
  private command: ICommand;
  public hunger: number;
  public thirst: number;
  public speed: number = 5;
  public location: Location;
  public state: StateMachine;
  private _model: Model;
  private _stats: Stats;

  constructor(entity: Entity, coords: THREE.Vector2) {
    super(entity);
    this.hunger = 100;
    this.thirst = 100;
    this._stats = entity.addComponent(Stats, () => this.getStats());
    this.location = entity.addComponent(Location, coords);
    this._model = entity.addComponent(Model, 'human');
    const model = this._model.model;
    model.scale.setScalar(0.3);
    this.state = entity.addComponent(StateMachine);
    this.state.addState(new IdleState);
    this.state.addState(new MovingState);
    this.state.addState(new DyingState);
    this.state.setState('idle');
    this.command = idle(this);
  }

  private getStats() {
    return [this.hunger, this.thirst];
  }

  update() {
    this.hunger -= Time.deltaTime * 5;
    this.thirst -= Time.deltaTime * 5;
    this.command = interrupt(this, this.command)(() => this.command.step());
  }
}