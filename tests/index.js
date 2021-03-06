const dotenv = require('dotenv')
const sinon = require('sinon')
const tap = require('tap')
const loadConfiguration = require('../index')

tap.test('loadConfiguration', (module) => {
  let configStub

  module.beforeEach((done) => {
    this._env = process.env
    process.env = {}
    configStub = sinon.stub(dotenv, 'config')
    done()
  })

  module.afterEach((done) => {
    process.env = this._env
    configStub.restore()
    done()
  })

  module.test('simple', (test) => {
    configStub.callsFake(() => {
      process.env.FOO = 'my foo'
    })

    const config = loadConfiguration({
      foo: 'FOO',
      bar: 'BAR'
    })

    test.same(config, {
      foo: 'my foo',
      bar: null
    })

    test.end()
  })

  module.test('complex', (test) => {
    configStub.callsFake(() => {
      process.env.WEB_PORT = 1234
      process.env.DB_HOST = 'db-host'
    })

    const config = loadConfiguration({
      web: {
        port: {
          env: 'WEB_PORT',
          default: 3000
        }
      },
      db: {
        host: 'DB_HOST',
        port: {
          env: 'DB_PORT',
          default: 8000
        }
      }
    })

    test.same(config, {
      web: {
        port: 1234
      },
      db: {
        host: 'db-host',
        port: 8000
      }
    })

    test.end()
  })

  module.test('empty values', (test) => {
    configStub.callsFake(() => {
      process.env.EMPTY_STRING1 = ''
      process.env.EMPTY_STRING2 = ''
      process.env.SPACE = ' '
    })

    const config = loadConfiguration({
      string1: 'EMPTY_STRING1',
      string2: {
        env: 'EMPTY_STRING2',
        default: 'default value'
      },
      string3: {
        env: 'EMPTY_STRING3',
        default: 'default value'
      }
    })

    test.deepEqual(config, {
      string1: '',
      string2: '',
      string3: 'default value'
    })

    test.end()
  })

  module.end()
})
