import * as THREE from 'three';
import Stats from '../../components/Stats';
import { Model } from '../../components/Model';
import { State, StateMachine } from '../../components/StateMachine';
import { Entity } from 'src/ecs';

export namespace States {
  export class Idle extends State {
    name = 'idle';

    enter(machine: StateMachine) {
      console.log('idle');
      machine.entity.getComponent(Model).setAnimation('idle');
    }

    exit(machine: StateMachine) {
    }
  }

  export class Moving extends State {
    name = 'moving';

    enter(machine: StateMachine) {
      console.log('moving');
      machine.entity.getComponent(Model).setAnimation('walking');
    }

    exit(machine: StateMachine) {
      console.log('moving exit');
    }
  }

  export class PickingFruit extends State {
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

  export class Dying extends State {
    name = 'dying';

    enter(machine: StateMachine) {
      machine.entity.getComponent(Stats).hide();
      const model = machine.entity.getComponent(Model);
      model.animations.dying.clampWhenFinished = true;
      model.animations.dying.setLoop(THREE.LoopOnce, 0);
      model.setAnimation('dying');
    }
  }
}

export function createStateMachine(entity: Entity) {
  const stateMachine = new StateMachine(entity);
  stateMachine.addState(new States.Idle);
  stateMachine.addState(new States.Moving);
  stateMachine.addState(new States.PickingFruit);
  stateMachine.addState(new States.Dying);
  stateMachine.setState('idle');
  return stateMachine;
}
