import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, Button, ImageBackground} from 'react-native';
import AppLoading from 'expo-app-loading';
import * as Font from 'expo-font';
import { TextInput } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native';


export default function StartGame({route, navigation}) {

    const {name, code} = route.params
    const [players, setplayers] = useState([name, 'Hack Sparrow'])
    const [gcode, setgcode] = useState('')

    const _getAllPlayers = () => {
        //TODO: add endpoint
    }
    const _getGameCode = () => {
        //TODO: add endpoint
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
        "action": "creategame",
        "name": name,
        "phone": "+15714901702"
        });

        var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
        };

        fetch("https://us-central1-aiot-fit-xlab.cloudfunctions.net/hacksparrow", requestOptions)
        .then(response => response.json())
        .then(result => {console.log(result);setgcode(result.invitecode)})
        .catch(error => console.log('error', error));
    }
    useEffect(() => {
        if( code ==''){
            _getGameCode();
        }
        
    }, [])
  return(
 <View style={styles.container}>
      <KeyboardAwareScrollView>
        <View style={{alignSelf:'center'}}>
        <CountdownCircleTimer
        isPlaying
        duration={30}
        colors={['#004777', '#F7B801', '#A30000', '#A30000']}
        colorsTime={[30, 20, 10, 0]}
        >
        {({ remainingTime }) => <Text style={{color:"#FFF", fontWeight:'bold'}}>Starting in {remainingTime}</Text>}
        </CountdownCircleTimer>
        </View>


        <Text style={{color:"#FFF", fontWeight:'bold', fontSize:15, textAlign:'center', marginTop:'15%'}}>Share Game Code</Text>
        <Text style={{color:"#FFD700", fontWeight:'bold', fontSize:20, marginBottom:'2.5%', textAlign:'center'}} selectable>{code==''?gcode:code}</Text>

        <Text style={{color:"#FFF", fontWeight:'bold', fontSize:20, marginBottom:'2.5%'}}>Players</Text>

        <View style={{height:300}}><ScrollView>{players.map((p, index)=>(<View style={{borderRadius:20, borderWidth:1, borderColor:"#FFD700", paddingVertical:'5%', marginVertical:'2.5%'}}>
            <Text style={{color:"#FFD700", alignSelf:'flex-start', marginLeft:'5%', fontWeight:'bold'}}>{index+1}. {p}</Text>
        </View>))}</ScrollView></View>

      
            
      <Text style={{fontSize:20,margin:'auto', fontWeight:'bold', textAlign:'center', color:'#FFF', padding:'2.5%', width:'50%', borderWidth:2, borderColor:'#FFF', borderRadius:10, alignSelf:'center', marginTop:'15%'}} onPress={()=>{navigation.navigate('Map',{code:code})}}>Start</Text>
      
      </KeyboardAwareScrollView>
    </View>
  );
  }


const styles = StyleSheet.create({
  container: {
    height:'100%',
    position:'relative',
    backgroundColor:'#000',
    paddingTop:'15%',
    paddingHorizontal:'10%'
  },
  header:{
    height: 50,
    width:50,
    marginHorizontal:'10%',
    resizeMode:'contain',
  },
  
});