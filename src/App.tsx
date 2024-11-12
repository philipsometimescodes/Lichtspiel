import { createEffect, createSignal, onMount } from 'solid-js';
import './App.css'
  ;
import { SceneController } from './SceneController';
import { Vector3 } from 'three';

const App = () => {
  const [controller, setController] = createSignal<SceneController>()
  const [position, setPosition] = createSignal<THREE.Vector3 | undefined>(new Vector3(0,0,0))

  onMount(() => {
    let newController = SceneController.create(document.getElementById("scene") as HTMLElement)
    setController(newController)
    }
  )
  createEffect(() => {
    if (controller()?.character.light.position) {
      setPosition(controller()?.character.light.position)
    }
  }
  )

  return (
    <div style="position:fixed; z-index:1000; display: block; left:0;top:0">
      <p>Change position: WASD / clicky </p>
      <p>Go Up: Spacebar</p>
      <p>Go Down: Shift + Space</p>
      <p> More Light: Y</p>
      <p> DIMM!: X</p>
      <p>
        x: {position()?.x}
        y: {position()?.y}
        z: {position()?.z}
      </p>
      <button onClick={() => console.log(controller())}>test</button>
    </div>
  )
}
export default App;