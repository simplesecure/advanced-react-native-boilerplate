import { takeLatest, put, call, delay } from 'redux-saga/effects'
import { ActionType } from 'typesafe-actions'
import MainActions from '../Redux/MainRedux'
import Textile from '@textile/react-native-sdk'
import FS from 'react-native-fs'

const IPFS_PIN = 'QmZGaNPVSyDPF3xkDDF847rGcBsRRgEbhAqLLBD4gNB7ex/0/content'

function* initializeTextile() {
  try {
    const textileRepoPath = `${FS.DocumentDirectoryPath}/textile-go`

    const initialized = yield call(
      Textile.isInitialized,
      textileRepoPath
    )
    if (!initialized) {
      const phrase = yield call(
        Textile.initializeCreatingNewWalletAndAccount,
        textileRepoPath,
        false,
        false
      )
      console.log("Textile Phrase", phrase)
    }

    yield call(Textile.launch, textileRepoPath, false)

  } catch (error) {
    yield put(MainActions.newNodeState('error'))
  }
}

// function* initializeTextileWithSimpleID() {
//   try {
//     const textileSeed = "SX9ZgiGn7NqX1yQ1x1yZgscnb4KKqqUnu7wrSWwdRHgqzWH9"
//     const textileRepoPath = `${FS.DocumentDirectoryPath}/textile-go`
//     const phrase = yield call(
//       Textile.initialize,
//       textileRepoPath,
//       textileSeed,
//       false,
//       false
//     )
//     console.log("Textile Phrase", phrase)
//     yield call(Textile.launch, textileRepoPath, false)
//
//   } catch (error) {
//     yield put(MainActions.newNodeState('error'))
//   }
// }

export function* onOnline(action: ActionType<typeof MainActions.nodeOnline>) {
  console.info('Running onOnline Saga')
  yield put(MainActions.loadIPFSData())
}

export function* loadIPFSData(
  action: ActionType<typeof MainActions.loadIPFSData>
) {
  try {
    // here we request raw data, where in the view, we'll use TextileImage to just render the request directly
    const imageData: { data: Uint8Array; mediaType: string } = yield call(Textile.ipfs.dataAtPath, IPFS_PIN)
    // @ts-ignore
    yield put(MainActions.loadIPFSDataSuccess(imageData.data.toString('base64')))
    console.info('IPFS Success')
  } catch (error) {
    console.info('IPFS Failure. Waiting 0.5s')
    yield delay(1500)
    yield put(MainActions.loadIPFSData())
  }
}

/* eslint require-yield:1 */
export function* newNodeState(
  action: ActionType<typeof MainActions.newNodeState>
) {
  console.info('Running newNodeState Saga')

  if (action.payload.nodeState === 'started') {
      // Read about Textile Cafes here, https://docs.textile.io/concepts/cafes/
      yield call(Textile.cafes.register, 'https://us-west-dev.textile.cafe', 'uggU4NcVGFSPchULpa2zG2NRjw2bFzaiJo3BYAgaFyzCUPRLuAgToE3HXPyo')
  }
}

export function* simpleIDFun(action: ActionType<typeof MainActions.initSimpleID>) {
  console.info('Running simpleID Saga')
  const username = `username_${Date.now()}`
  const app_origin = 'https://textile.io/'
  let response = yield call (fetch, 'http://localhost:3000/keychain', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: '-LmCb96-TquOlN37LpM0',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password: 'test1234',
      email: 'nomailfakery@gmail.com',
      development: 'true',
      devId: 'imanewdeveloper'
    }),
  });
  // console.log("***************************Keychain", response._bodyText)
  if (response.status === 200) {
    console.log("Keychain", response._bodyText)
    response = yield call (fetch, 'http://localhost:3000/appkeys', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: '-LmCb96-TquOlN37LpM0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password: 'test1234',
        profile: `"{\\"@type\\":\\"Person\\",\\"@context\\":\\"http://schema.org\\",\\"apps\\":{\\"${app_origin}\\":\\"\\"}}"`,
        url: app_origin,
        development: 'true',
        devId: 'imanewdeveloper'
      }),
    });
    const appKeys = JSON.parse(response._bodyText)
    console.log("App Keys", appKeys, appKeys.textile)
    yield put(MainActions.loadSimpleID(appKeys.textile))
  }
  else {
    //simple id failed
    console.log('SimpleID failed')
    yield put(MainActions.loadSimpleID('FAILED'))
  }
}

// watcher saga: watches for actions dispatched to the store, starts worker saga
export function* mainSagaInit() {
  // yield call(initializeTextileWithSimpleID)
  yield call(initializeTextile)
  yield call(simpleIDFun)
  yield takeLatest('NODE_ONLINE', onOnline)
  yield takeLatest('NEW_NODE_STATE', newNodeState)
  yield takeLatest('LOAD_IPFS_DATA_REQUEST', loadIPFSData)
}
