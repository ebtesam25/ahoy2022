import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, Button, ImageBackground} from 'react-native';
import AppLoading from 'expo-app-loading';
import * as Font from 'expo-font';
import { TextInput } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';



export default function Splash({navigation}) {
    const [name, setname] = useState('');
    const [code, setcode] = useState('');

    const _getAllObjects = () => {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      var raw = JSON.stringify({
        "action": "getallitems"
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

    const _gameInit = () => {
        //TODO: add endpoint
    }
  return(
 <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.header}></Image>
      <KeyboardAwareScrollView>
      <TextInput
      label="Name"
      value={name}
      mode="outlined"
      outlineColor="#FFD200"
      activeOutlineColor="#FFD700"
      placeholderTextColor="#FFF"
      theme={{colors: {text: '#FFF', placeholder:"#FFD700" }}}
      style={{width:'50%', alignSelf:'center', marginTop:'5%', backgroundColor:"#000"}}
      onChangeText={text => setname(text)}
    />
    <TextInput
      label="Game Code (optional)"
      placeholderTextColor="#FFF"
      value={code}
      mode="outlined"
      outlineColor="#FFD200"
      activeOutlineColor="#FFD700"
      theme={{colors: {text: '#FFF', placeholder: "#FFD700" }}}
      style={{width:'50%', alignSelf:'center', marginTop:'5%', backgroundColor:"#000"}}
      onChangeText={text => setcode(text)}
    />
    <Text style={{textAlign:'center', marginHorizontal:'5%', color:"#FFD700"}}>*Leave game code blank to start a new game</Text>
      <Text style={{fontSize:20,margin:'auto', fontWeight:'bold', textAlign:'center', color:'#FFF', padding:'2.5%', width:'50%', borderWidth:2, borderColor:'#FFF', borderRadius:10, alignSelf:'center', marginTop:'15%'}} onPress={()=>{navigation.navigate('StartGame',{name:name,code:code})}}>Start</Text>
      
      </KeyboardAwareScrollView>
    </View>
  );
  }


const styles = StyleSheet.create({
  container: {
    height:'100%',
    position:'relative',
    backgroundColor:'#000',
  },
  header:{
    height:'20%',
    width:'50%',
    marginTop:'45%',
    alignSelf:'center',
    resizeMode:'contain',
  },
  
});