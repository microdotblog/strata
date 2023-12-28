import { types, flow } from 'mobx-state-tree'
// import crypto from 'react-native-quick-crypto'

export default Crypto = types.model('Crypto', {})
  .actions(self => ({

    decrypt: flow(function*() {
      console.log("Crypto:decrypt")
    }),

    encrypt: flow(function*() {
      console.log("Crypto:encrypt")
    })

  }))
  .create();