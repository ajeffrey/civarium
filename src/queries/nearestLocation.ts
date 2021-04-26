import * as THREE from 'three';
import Location from '../components/Location';

export default function nearestLocation(coords: THREE.Vector2, locations: Location[]) {
  let nearestDistance = Infinity;
  let nearestSource: Location | null = null;
  
  for(const location of locations) {
    const distance = coords.distanceTo(location.coords);
    if(distance < nearestDistance) {
      nearestDistance = distance;
      nearestSource = location;
    }
  }

  return nearestSource;
}