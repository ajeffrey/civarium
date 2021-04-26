import * as THREE from 'three';
import { Component, Entity } from '../Entity';
import Time from '../Time';
import Location from '../components/Location';
import Stats from './Stats';
import { Model } from '../components/Model';
import { ICommand, idle, interrupt } from '../commands';
let lastCommand = null;

export default class Human extends Component {
  private command: ICommand;
  public hunger: number;
  public thirst: number;
  public speed: number = 5;
  public location: Location;
  private _model: Model;
  private _stats: Stats;

  constructor(entity: Entity, coords: THREE.Vector2) {
    super(entity);
    this.hunger = 100;
    this.thirst = 100;
    this._stats = entity.addComponent(Stats, () => this.getStats());
    this.location = entity.addComponent(Location, coords);
    this._model = entity.addComponent(Model, 'human');
    this.command = idle(this);
  }

  private getStats() {
    return [this.hunger, this.thirst];
  }

  update() {
    this.hunger -= Time.deltaTime * 5;
    this.thirst -= Time.deltaTime * 5;
    console.log(this.hunger, this.thirst);
    if(this.command.name !== lastCommand) {
      console.log('do', this.command.name);
    }
    this.command = interrupt(this, this.command)(() => this.command.step());
  }
}