import { View } from "react-native";
import { requestForegroundPermissionsAsync } from "expo-location";
import styles from "./styles";
import Title from "../../components/Title";
import { useEffect } from "react";
import { useState } from "react";
import { getCurrentPositionAsync } from "expo-location";
import { AnimatedMapView } from "react-native-maps/lib/MapView";
import { MarkerAnimated } from "react-native-maps";
import { LocationAccuracy } from "expo-location";
import { watchPositionAsync } from "expo-location";
import { useRef } from "react";
import { Axios } from "axios";
import { ActivityIndicator } from "react-native";



export default function Location() {
  const [location, setLocation] = useState(null);
  const [ errorMsg, setErrorMsg] = useState(null);
  const [ weatherData, setWeatherData] = useState(null);
  const mapRef = useRef(null);

  async function requestPermission() {
    const { granted, status } = await requestForegroundPermissionsAsync();
    if(status !== "granted"){
      setErrorMsg("Permissão para acessar a localização foi negada!");
      console.log("Permissão para acessar a localização foi negada!");
    }
  
    if (granted) {
      const currentPosition = await getCurrentPositionAsync();
      setLocation(currentPosition);
      getWeather(location.coords.latitude, location.coords.longiude);
      console.log("Localização atual", currentPosition);
      return;
    }
  }
  
  useEffect(() => {
    requestPermission();
  }, []);
  useEffect(() => {
    watchPositionAsync(
      {
        accuracy: LocationAccuracy.Highest,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (response) => {
        setLocation(response);
        console.log("Nova localização", response);
        mapRef.current?.animateCamera({
          center: response.coords,
          pitch: 50,
        });
      }
    );
  }, []);
  const getWeather = async (latitude, longitude) => {
    try {
      console.log("Latitude: ", latitude, "Longitude: ", longitude);
      const apiKey = "d2b17491b2a840713b385d9b2fb02057";
      const response = await axios.get(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&appid=${apiKey}`
      );
      console.log(response.data);
      setWeatherData(response.data);
    } catch (error) {
      setErrorMsg(error.message);
    }
  };
  return (

    <View style={styles.container}>
      <Title title="Location" />
      {weatherData ? (
        
          <Text>Temperatura:
            {weatherData.current.temp / 10}°C
          </Text>
          ) : (
            <ActivityIndicator size="large" />
          
      )}
      {errorMsg && <Text>{errorMsg}</Text>}

      {location && (
  <AnimatedMapView
    style={styles.map}
    initialRegion={{
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }}
  >
    <MarkerAnimated
      coordinate={{
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }}
      title="Você está aqui"
      description="Sua localização atual"
    />
  </AnimatedMapView>
)}

    </View>
  );
}
