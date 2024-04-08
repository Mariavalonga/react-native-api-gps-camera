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




export default function Location() {
  const [location, setLocation] = useState(null);
  const mapRef = useRef(null);

  async function requestPermission() {
    const { granted } = await requestForegroundPermissionsAsync();
  
    if (granted) {
      const currentPosition = await getCurrentPositionAsync();
      setLocation(currentPosition);
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
  return (

    <View style={styles.container}>
      <Title title="Location" />

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
