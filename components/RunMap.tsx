import { auth, db } from "@/firebaseConfig"; // popraw ścieżkę do swojego firebase.ts
import * as Location from "expo-location";
import * as Torch from "expo-torch";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import MapView, { Polyline } from "react-native-maps";

// pomocnicza funkcja do obliczania dystansu (Haversine)
const toRad = (v: number) => (v * Math.PI) / 180;
const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function RunMap() {
  const mapRef = useRef<MapView | null>(null);
  const locationSub = useRef<Location.LocationSubscription | null>(null);
  const timerRef = useRef<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [route, setRoute] = useState<{ latitude: number; longitude: number }[]>(
    []
  );
  const [distance, setDistance] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const [startAddress, setStartAddress] = useState<{
    city: string;
    street: string;
  }>({ city: "", street: "" });
  const [endAddress, setEndAddress] = useState<{
    city: string;
    street: string;
  }>({ city: "", street: "" });
  const [torchOn, setTorchOn] = useState(false);

  useEffect(() => {
    return () => {
      locationSub.current?.remove();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    // Pobranie lokalizacji poczatkowej
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    const addr = await getAddress(
      location.coords.latitude,
      location.coords.longitude
    );
    setStartAddress(addr);

    setRoute([]);
    setDistance(0);
    setSeconds(0);
    setIsTracking(true);
    setPaused(false);

    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);

    locationSub.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 5,
      },
      (location) => {
        const { latitude, longitude, accuracy } = location.coords;
        if (accuracy && accuracy > 20) return;

        setRoute((prev) => {
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            const d = haversine(
              last.latitude,
              last.longitude,
              latitude,
              longitude
            );
            setDistance((dist) => dist + d);
          }
          const next = [...prev, { latitude, longitude }];
          if (next.length === 1) {
            mapRef.current?.animateCamera({
              center: { latitude, longitude },
              zoom: 17,
            });
          }
          return next;
        });
      }
    );
  };

  const stopTracking = () => {
    // zatrzymaj GPS
    locationSub.current?.remove();
    locationSub.current = null;

    // zatrzymaj timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsTracking(false);
    setPaused(true); // włącz overlay z opcją zapisu lub kontynuacji
  };

  const continueTracking = async () => {
    // usuń stary watch, jeśli istnieje
    if (locationSub.current) {
      locationSub.current.remove();
      locationSub.current = null;
    }

    // uruchom timer od nowa
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsTracking(true);
    setPaused(false);

    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);

    let firstPoint = true; // flaga pierwszego punktu po wznowieniu

    locationSub.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 5,
      },
      (location) => {
        const { latitude, longitude, accuracy } = location.coords;
        if (accuracy && accuracy > 20) return;

        setRoute((prev) => {
          if (prev.length === 0 || firstPoint) {
            // pierwszy punkt po wznowieniu - nie dodajemy dystansu
            firstPoint = false;
            return [...prev, { latitude, longitude }];
          }

          const last = prev[prev.length - 1];
          // dodaj dystans tylko jeśli punkt się zmienił
          if (last.latitude !== latitude || last.longitude !== longitude) {
            const d = haversine(
              last.latitude,
              last.longitude,
              latitude,
              longitude
            );
            setDistance((dist) => dist + d);
            return [...prev, { latitude, longitude }];
          }

          return prev;
        });
      }
    );
  };

  const saveRun = async () => {
    if (route.length < 2) return;

    const user = auth.currentUser;
    if (!user) return;

    // Zapis koncowej miejscowosci biegu
    const lastPoint = route[route.length - 1];
    const endAddr = await getAddress(lastPoint.latitude, lastPoint.longitude);
    setEndAddress(endAddr);

    try {
      await addDoc(collection(db, "runs"), {
        userId: user.uid,
        distanceKm: Number(distance.toFixed(2)),
        durationSec: seconds,
        pace: distance > 0 ? (seconds / 60 / distance).toFixed(2) : null,
        startLocation: startAddress,
        endLocation: endAddress,
        route,
        createdAt: serverTimestamp(),
      });

      // reset po zapisie
      setRoute([]);
      setDistance(0);
      setSeconds(0);
      setPaused(false);
    } catch (err) {
      console.log("Błąd przy zapisie biegu: ", err);
    }
  };

  const pace = distance > 0 ? seconds / 60 / distance : 0;

  // Funkcja do pobrania adresu na podstawie wspolrzednych
  const getAddress = async (latitude: number, longitude: number) => {
    try {
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      return {
        city: address.city || address.subregion || "",
        street: address.street || "",
        postalCode: address.postalCode || "",
      };
    } catch (err) {
      console.log("Błąd geokodowania:", err);
      return { city: "", street: "" };
    }
  };

  // Funkcja przelączająca latarke
  const toggleTorch = async () => {
    if (!Torch || !Torch.setStateAsync) {
      Alert.alert(
        "Latarka niedostępna",
        "Funkcja latarki działa tylko w dev build lub standalone APK"
      );
      return;
    }

    try {
      await Torch.setStateAsync(torchOn ? "off" : "on");
      setTorchOn((prev) => !prev);
    } catch (err) {
      console.log("Błąd przy sterowaniu latarką:", err);
    }
  };

  return (
    <View className="flex-1 gap-4">
      {/* Map */}
      <View className="relative w-full h-[400px]">
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          showsUserLocation
          followsUserLocation={isTracking}
          initialRegion={{
            latitude: 50.0412,
            longitude: 21.9991,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          {route.length > 1 && (
            <Polyline
              coordinates={route}
              strokeWidth={6}
              strokeColor="#2563eb"
            />
          )}
        </MapView>
        {/* Overlay po zatrzymaniu*/}
        {paused && (
          <View className="absolute bottom-4 w-full flex-row gap-2 items-center justify-center">
            <TouchableOpacity
              onPress={saveRun}
              className="bg-green-600  p-3 border border-neutral-300"
            >
              <Text className="text-white font-semibold">Zapisz trase</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={continueTracking}
              className="bg-white p-3 border border-neutral-300"
            >
              <Text className="text-black font-semibold">Kontynuuj</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Przycisk latarki */}
        <TouchableOpacity
          onPress={toggleTorch}
          className={`${torchOn ? "bg-yellow-400" : "bg-white "} border border-neutral-300 absolute bottom-4 right-4 p-3`}
        >
          <Text className="font-bold text-black">{torchOn ? "💡" : "🔦"}</Text>
        </TouchableOpacity>
      </View>
      {/* Dolny HUD */}
      <View className="relative flex flex-row items-center w-full bg-neutral-900 h-[80px]">
        <View className="w-1/3 h-full">
          {!isTracking ? (
            <TouchableOpacity
              onPress={startTracking}
              className={`${paused ? "bg-blue-600" : "bg-green-600"} h-[80px] items-center justify-center`}
            >
              <Text className="text-white font-semibold text-lg">
                {paused ? "NOWY BIEG" : "START"}
              </Text>
            </TouchableOpacity>
          ) : !paused ? (
            <TouchableOpacity
              onPress={stopTracking}
              className="bg-red-600 h-[80px] items-center justify-center"
            >
              <Text className="text-white font-semibold text-lg">
                ZATRZYMAJ
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <View className="w-2/3 h-full flex flex-col items-end justify-center px-4">
          <Text className="text-white">Dystans: {distance.toFixed(2)} km</Text>
          <Text className="text-white">
            Czas: {Math.floor(seconds / 60)}:
            {String(seconds % 60).padStart(2, "0")}
          </Text>
          <Text className="text-white">
            Średnia prędkość: {pace ? pace.toFixed(2) : "0"} min/km
          </Text>
        </View>
      </View>
    </View>
  );
}
