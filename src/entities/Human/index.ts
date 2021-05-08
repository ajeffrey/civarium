import * as THREE from 'three';
import { Component, Entity } from '../../Entity';
import Time from '../../Time';
import Location from '../../components/Location';
import Stats from '../../components/Stats';
import { Model } from '../../components/Model';
import { State, StateMachine } from '../../components/StateMachine';
import { ICommand, idle } from '../../commands';

class IdleState extends State {
  name = 'idle';

  enter(machine: StateMachine) {
    console.log('idle');
    machine.entity.getComponent(Model).setAnimation('idle');
  }

  exit(machine: StateMachine) {
  }
}

class MovingState extends State {
  name = 'moving';

  enter(machine: StateMachine) {
    console.log('moving');
    machine.entity.getComponent(Model).setAnimation('walking');
  }

  exit(machine: StateMachine) {
    console.log('moving exit');
  }
}

class PickingFruitState extends State {
  name = 'picking fruit';
  public animation: THREE.AnimationClip;

  enter(machine: StateMachine) {
    console.log('picking fruit');
    const model = machine.entity.getComponent(Model);
    const anim = model.animations['picking fruit'];
    // anim.setLoop(THREE.LoopOnce, 0);
    model.setAnimation('picking fruit');
  }
}

class DyingState extends State {
  name = 'dying';

  enter(machine: StateMachine) {
    machine.entity.getComponent(Stats).hide();
    const model = machine.entity.getComponent(Model);
    model.animations.dying.clampWhenFinished = true;
    model.animations.dying.setLoop(THREE.LoopOnce, 0);
    model.setAnimation('dying');
  }
}

class HumanState extends StateMachine {
  constructor(entity) {
    super(entity);
    this.addState(new IdleState);
    this.addState(new MovingState);
    this.addState(new PickingFruitState);
    this.addState(new DyingState);
    this.setState('idle');
  }
}

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
    this._model = entity.addComponent(Model, 'human', ['walking', 'picking fruit', 'idle', 'dying']);
    this._model.model.scale.setScalar(0.01);
    this.state = entity.addComponent(HumanState);
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
    if(!(this.state.state instanceof DyingState)) {
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