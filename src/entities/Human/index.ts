import * as THREE from 'three';
import { Component, Entity, World } from '../../ecs';
import Time from '../../Time';
import Location from '../../components/Location';
import Stats from '../../components/Stats';
import { Model } from '../../components/Model';
import { StateMachine } from '../../components/StateMachine';
import { ICommand, idle } from '../../commands';
import Explorer from '../../components/Explorer';
import { createStateMachine, States } from './State';

export default class Human extends Component {
  private command: ICommand;
  public hunger: number;
  public thirst: number;
  public speed: number = 1.9; // todo: sync speed to animation
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
    entity.addComponent(Explorer, 10);
    this._model = entity.addComponent(Model, 'human', ['walking', 'picking fruit', 'idle', 'dying']);
    this._model.model.scale.setScalar(0.01);
    this.state = createStateMachine(this.entity);
    this.state.setState('idle');
    this.command = idle(this);

    if(localStorage.getItem('debug')) {
      entity.transform.add(new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 32), new THREE.MeshBasicMaterial({ color: 0xff0000 })));
    }
  }

  private getStats() {
    return [this.hunger, this.thirst];
  }

  update() {
    if(!(this.state.state instanceof States.Dying)) {
      this.hunger -= Time.deltaTime * 5;
      this.thirst -= Time.deltaTime * 5;

      if(this.hunger <= 0) {
        this.state.setState('dying');

      } else {
        this.command = this.command.step();
      }
    }
  }
}