import { createEffect, createSignal, onMount, Show } from 'solid-js';
import './App.css'
  ;
import { SceneController } from './SceneController';
import { Vector3 } from 'three';

const App = () => {
  const [controller, setController] = createSignal<SceneController>()
  const [enableStart, setEnableStart] = createSignal<boolean>(true)
  const [isDead, setIsDead] = createSignal<boolean>(false)

  const onDeath = () => {
    console.log("onDeath")
    setEnableStart(true)
    setIsDead(true)
  }

  const onStart = () => {
    controller()?.startGame()
    setEnableStart(false)
    setIsDead(false)

  }

  onMount(() => {
    let newController = SceneController.create(document.getElementById("scene") as HTMLElement, onDeath)
    setController(newController)
  }
  )


  return (
    <>
      {/* <div style="position:fixed; z-index:1000; display: block; left:0;top:0">
        <p>Change position: WASD / clicky </p>
        <p>Go Up: Spacebar</p>
        <p>Go Down: Shift + Space</p>
        <p> More Light: Y</p>
        <p> DIMM!: X</p>
        <button id="start" disabled={!enableStart()} onClick={() => onStart()}>Start</button>
      </div> */}
      <Show when={enableStart()}>
        <div style="position:absolute;left:0;top:0; z-index: 1000; display: flex; flex-direction:column; width:100vw; height:100vh; justify-content:center; align-items:center;margin-top:-20vh;">
          <Show when={isDead()} fallback={
            <h1 style=" marg">
              Welcome to Lichtspiel!
            </h1>
          }>
            <h1>YOU DEAD</h1>
          </Show>
          <button id="start" disabled={!enableStart()} onClick={() => onStart()}>Start</button>
        </div>

      </Show>
    </>
  )
}
export default App;