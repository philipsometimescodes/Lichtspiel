/* @refresh reload */
import { render } from 'solid-js/web'

import './index.css'
import App from './App'
import { SceneController } from './SceneController'
const scene = SceneController.create(document.getElementById("scene") as HTMLElement)
const root = document.getElementById('app')

render(() => <App />, root!)
