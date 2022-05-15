import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Cam from './src/components/camera';
import Map from './src/components/map';
import Splash from './src/screens/splash';
import StartGame from './src/screens/startGame';

const Stack = createStackNavigator();

function MyStack() {
  return (
    <Stack.Navigator>
        <Stack.Screen 
        name="Splash" 
        component={Splash}
        options={{ headerShown: false}} 
        />
        <Stack.Screen 
        name="StartGame" 
        component={StartGame}
        options={{ headerShown: false}} 
        />
        <Stack.Screen 
        name="Map" 
        component={Map}
        options={{ headerShown: false}} 
        />
        <Stack.Screen 
        name="Cam" 
        component={Cam}
        options={{ headerShown: false}} 
        /> 
         
       
      
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <MyStack />
    </NavigationContainer>
  );
}