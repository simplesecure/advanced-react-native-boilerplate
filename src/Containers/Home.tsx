import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import {
  View,
  Text,
  Image,
  Button
} from 'react-native'
import { RootAction, RootState } from '../Redux/Types'
import styles from './Styles'
import { NodeState } from '../Redux/MainRedux'
import MainActions from '../Redux/MainRedux'

class Home extends React.Component<StateProps> {
  render() {
    const previewText = !this.props.online
      ? 'waiting to come online...'
      : this.props.ipfsImage == null
      ? 'requesting ipfs hash...'
      : 'ipfs request complete'
    // if (this.props.online) {
    //   return this.renderPanZoom()
    // }
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            local node state: {this.props.nodeState}
          </Text>
        </View>
        <View style={styles.ipfs}>
          <Text style={styles.statusText}>{previewText}</Text>
          {this.props.ipfsImage && this.renderImage()}
          <Button
            title="SimpleID Textile Seed"
            disabled
            onPress={() => this.props.doSimpleIdStuff()}
          />
          <Text style={styles.statusText}>{this.props.simpleTextile}</Text>
        </View>
      </View>
    )
  }

  renderImage = () => {
    console.log(this.props.ipfsImage)
    return (
      <Image
        style={{ width: 150, height: 150, marginTop: 20 }}
        source={{ uri: this.props.ipfsImage }}
        resizeMode={'cover'}
      />
    )
  }
}

interface StateProps {
  nodeState: NodeState
  simpleTextile: string
  online: boolean
  ipfsImage?: string
}
function mapStateToProps(state: RootState): StateProps {
  return {
    nodeState: state.main.nodeState,
    simpleTextile: state.main.simpleTextile,
    online: state.main.online,
    ipfsImage: state.main.ipfsImage
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): {} {
  return {
    doSimpleIdStuff: MainActions.initSimpleID()
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home)
