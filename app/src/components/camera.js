import React from 'react'
import {
  Animated,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  View,
  Text,
  Image,
  Dimensions,
  DeviceEventEmitter
} from 'react-native'

import * as Permissions from 'expo-permissions'
import {Gyroscope} from 'expo-sensors'
import {Camera} from 'expo-camera'

import { gameItems } from '../utils/gameObjects'

const { height, width } = Dimensions.get('window')
const charImage = {
  0: gameItems.items[0].url,
  1: gameItems.items[1].url,
  2: gameItems.items[2].url,
  3: gameItems.items[3].url,
  4: gameItems.items[4].url,
  5: gameItems.items[5].url,
  6: gameItems.items[6].url,
  7: gameItems.items[7].url,
  8: gameItems.items[8].url,
}

export default class Cam extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      hasCameraPermission: null,
      captured: false,
      time:0,
    }

    // set up refs
    this.gyroTracker = null

    // Set up animations
    this.animatedspritePosition = new Animated.ValueXY()
    this.spritePosition = { x: 0, y: 0 }

    this.animatedspritego = new Animated.ValueXY()

    this.interpolatedRotateAnimation = this.animatedspritego.x.interpolate({
      inputRange: [0, width/2, width],
      outputRange: ['-360deg', '0deg', '360deg']
    })

    // Set up touch handlers
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponderCapture: () => true,

      onPanResponderMove: Animated.event([null,
        { dx: this.animatedspritego.x, dy: this.animatedspritego.y }
      ],{useNativeDriver:false}),

      onPanResponderRelease: (event, gesture) => {
        if (this.isCaptured(gesture)) {
          this.setState({ captured: true }, () => {
            setTimeout(this.goBack, 1500)
          })
        }
        else {
          Animated.spring(
            this.animatedspritego,
            { toValue: { x: 0, y: 0 } }
          ).start()
        }
      }
    })

    // Bind component methods
    this.goBack = this.goBack.bind(this)
    this.trackGyrometer = this.trackGyrometer.bind(this)
    this.isCaptured = this.isCaptured.bind(this)
  }

  componentDidMount() {
    Permissions.askAsync(Permissions.CAMERA)
      .then(({ status }) => {
        this.setState({
          hasCameraPermission: status === 'granted'
        })
      })
      
      
  
    Gyroscope.setUpdateInterval(50)

    Gyroscope.addListener(
      this.trackGyrometer(
        Animated.event([
          { x: this.animatedspritePosition.x, y: this.animatedspritePosition.y }
        ],{useNativeDriver:false}
        )
      )
    )
  }

  componentWillUnmount() {
    Gyroscope.removeAllListeners()
    if(this.state.captured){
    //TODO: add endpoint to increment score
  }
}

  trackGyrometer(eventHandler) {
    return (data) => {
      this.spritePosition.x += ((data.y - 0.03) * 30)
      this.spritePosition.y += ((data.x + 0.05) * 30)

      eventHandler(this.spritePosition)
    }
  }

  goBack() {
    this.props.navigation.pop()
  }

  isCaptured(gesture) {
    const spritegoX = gesture.moveX
    const spritegoY = gesture.moveY

    const spriteX = (width/2) + this.spritePosition.x
    const spriteY = (height/3) + this.spritePosition.y

    return ((Math.abs((spritegoX - spriteX)) < 100) && (Math.abs((spritegoY - spriteY)) < 100))
  }

  render() {
    const { navigation, route } = this.props;
    const { sprite, char } = route.params;
    
    return (
      
      <View style={styles.container}>
        

        {this.state.hasCameraPermission && (
          <Camera
            style={styles.camera}
            type={'back'}
            onBarCodeRead={() => {}}
          />
        )}

        {this.state.captured ? (
          <View style={[styles.overlay, styles.captureOverlay]}>
            <Text style={styles.cancelText}>
              Good job!
            </Text>
          </View>
        ) : (
          <Animated.Image
            source={{uri:sprite.image}}
            style={[styles.sprite, {
              transform: [
                { translateX: this.animatedspritePosition.x },
                { translateY: this.animatedspritePosition.y }
              ]
            }]}
          />
        )}

        <View style={[styles.overlay, styles.topOverlay]}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={this.goBack}
          >
            <Text style={styles.cancelText}>X</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.overlay, styles.bottomOverlay]}>
          <Animated.Image
            source={require('../assets/logo-sm.png')}
            style={{
              transform: [
                { translateX: this.animatedspritego.x },
                { translateY: this.animatedspritego.y },
                { rotate: this.interpolatedRotateAnimation }
              ]
            }}
            { ...this.panResponder.panHandlers }
          />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    padding: 16,
    right: 0,
    left: 0,
    alignItems: 'center',
  },
  topOverlay: {
    top: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bottomOverlay: {
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  captureOverlay: {
    top: width/4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButton: {
    padding: 15,
  },
  cancelText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 28
  },
  sprite: {
    position: 'absolute',
    top: height/3,
    bottom: height/3,
    right: width/3,
    left: width/3,
    resizeMode:'contain'
  },
})
