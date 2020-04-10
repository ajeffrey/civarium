import * as THREE from 'three';
import Entity from '../Entity';

export default function nearestFoodSource(coords: THREE.Vector2, entities: Entity[]) {
  const foodSources = entities.filter(e => e.tags.indexOf('FOOD_SOURCE') >= 0);
  let nearestDistance = Infinity;
  let nearestSource: Entity | null = null;
  
  for(const foodSource of foodSources) {
    const distance = coords.distanceTo(foodSource.coords);
    if(distance < nearestDistance) {
      nearestDistance = distance;
      nearestSource = foodSource;
    }
  }

  return nearestSource;
}