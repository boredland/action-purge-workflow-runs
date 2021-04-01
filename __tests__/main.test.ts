import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  process.env['INPUT_INACTIVEDAYS'] = '10'
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'dist', 'index.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env,
    stdio: 'inherit'
  }
  cp.execFileSync(np, [ip], options)
})
