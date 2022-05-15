import React from 'react'
import {
  StyleSheet,
  PropTypes,
  View,
  Text,
  Image
} from 'react-native'
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import { Gyroscope } from 'expo-sensors';
import MapView from 'react-native-maps';
import { throttle } from 'lodash'
import generateRandomsprite from '../utils/randomEnemy'
import { gameItems } from '../utils/gameObjects';

const INTERVAL= 10000
const latitudeDelta = 0.0100
const longitudeDelta = 0.0080
const imageChar = {
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

export default class Map extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      trainer: {
        latitude: 10,
        longitude: 20,
        latitudeDelta,
        longitudeDelta,
        
      cscore:0,
      tscore:0,
      },
      sprite: []
    }

    this.locationWatcher = null
    this.spawnInterval = null

    this.spawnWildsprite = this.spawnWildsprite.bind(this)
  }

  getScore(){
    
    //TODO: add endpoint

    }

    _startGame(){
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      var raw = JSON.stringify({
        "action": "startgame",
        "code": code,
        "loc": {
          "lat": 1,
          "lng": -1
        }
      });

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
      };

      fetch("https://us-central1-aiot-fit-xlab.cloudfunctions.net/hacksparrow", requestOptions)
        .then(response => response.json())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
    }
  

  componentDidMount() {

    this._startGame();
    
            this.setState({
              trainer: {
                latitude: 40.687757,
                longitude: -73.853083,
                latitudeDelta,
                longitudeDelta,
              }
            })
        
            this.getScore()
          this.spawnInterval = setInterval(this.spawnWildsprite, INTERVAL)

        } 

  componentWillUnmount() {
    this.locationWatcher && this.locationWatcher.remove()
    this.spawnInterval && clearInterval(this.spawnInterval)
  }

  spawnWildsprite() {
    const location = this.state.trainer

    let newsprite = generateRandomsprite(3, location)

    if (this.state.sprite.length) {
      newsprite = newsprite.concat(this.state.sprite.slice(0, 3))
    }

    this.setState({
      sprite: newsprite
    })
    console.log(this.state.sprite)
  }

  render() {
    const { navigation, route } = this.props;
    const { code } = route.params;
   const pick = 1;
    return (
      <View style={styles.container}>
        <Text style={{zIndex:4, position:'absolute', fontWeight:'bold', backgroundColor:'#FFF', padding:'5%', top:'5%'}}>Current Score:{this.state.cscore} Total Score: {this.state.tscore} </Text>
        <MapView
          style={styles.map}
          region={this.state.trainer}
          scrollEnabled={false}
          showsTraffic={false}
          showsIndoors={false}
          showsPointsOfInterest={false}
        >
          <MapView.Marker
            key={'trainer'}
            image={require('../assets/logo-sm.png')}
            coordinate={this.state.trainer}
            onPress={()=>this.getScore()}
          />

          {this.state.sprite.map(p =>
            <MapView.Marker
              key={`${p.latitude}::${p.longitude}`}
              coordinate={p}
              onPress={() => {
                this.props.navigation.navigate('Cam',{ sprite: p, char: pick })
              }}
            >
              <Image source={{uri:p.image}} style={{height:30, width:30, resizeMode:'contain'}}/>
            </MapView.Marker>
          )}
        </MapView>

        
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
})

