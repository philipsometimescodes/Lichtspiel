import './App.css'
;
import { SceneController } from './SceneController';

const App = () => {
  return (
    <div style="position:fixed; z-index:1000; display: block; left:0;top:0">
      <p>Change position: WASD / clicky </p>
      <p>Go Up: Spacebar</p>
      <p>Go Down: Shift + Space</p>
      <p> More Light: Y</p>
      <p> DIMM!: X</p>
    </div>
  )
}
export default App;