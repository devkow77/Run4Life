import { auth, db } from "@/firebaseConfig";
import * as Location from "expo-location";
import { Pedometer } from "expo-sensors";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, Vibration, View } from "react-native";
import MapView, { Polyline } from "react-native-maps";

// Konwersja stopni na radiany (używane w Haversine)
const toRad = (v: number) => (v * Math.PI) / 180;

// Obliczanie dystansu między dwoma punktami GPS w kilometrach (Haversine)
const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // promień Ziemi w km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function RunMap() {
  const mapRef = useRef<MapView | null>(null); // referencja do MapView, żeby np. centrować kamerę
  const locationSub = useRef<Location.LocationSubscription | null>(null); // referencja do subskrypcji GPS
  const timerRef = useRef<number | null>(null); // referencja do timera sekund
  const kmReached = useRef(0); // śledzi ostatni pełny km, żeby wibrować co 1 km

  const [isTracking, setIsTracking] = useState(false); // czy bieg jest aktywny
  const [route, setRoute] = useState<{ latitude: number; longitude: number }[]>(
    []
  ); // zapis trasy
  const [distance, setDistance] = useState(0); // dystans w km
  const [seconds, setSeconds] = useState(0); // czas w sekundach
  const [paused, setPaused] = useState(false); // czy bieg jest wstrzymany
  const [startAddress, setStartAddress] = useState<{
    city: string;
    street: string;
  }>({ city: "", street: "" }); // początkowy adres
  const [endAddress, setEndAddress] = useState<{
    city: string;
    street: string;
  }>({ city: "", street: "" }); // końcowy adres
  const [torchOn, setTorchOn] = useState(false); // stan latarki
  const [loadingLocation, setLoadingLocation] = useState(false); // stan ladowania lokalizacji gps przy starcie
  const [steps, setSteps] = useState(0); // liczenie kroków
  const pedometerSub = useRef<any>(null); // referencja do liczenia kroków

  useEffect(() => {
    return () => {
      // usuń subskrypcję GPS i timer po zamknięciu komponentu
      locationSub.current?.remove();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // START ŚLEDZENIA BIEGU
  const startTracking = async () => {
    // poproś o uprawnienia
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    setLoadingLocation(true); // pokaż overlay ładowania GPS

    // uruchom timer od razu
    setSeconds(0);
    setDistance(0);
    setRoute([]);
    setIsTracking(true);
    setPaused(false);

    // uruchom liczenie kroków
    pedometerSub.current?.remove(); // usuń stare subskrypcje
    setSteps(0);

    pedometerSub.current = Pedometer.watchStepCount((result) => {
      setSteps(result.steps);
    });

    locationSub.current?.remove();
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);

    // od razu startujemy watchPositionAsync, bez czekania na getCurrentPositionAsync
    locationSub.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 1000,
        distanceInterval: 5,
      },
      async (location) => {
        const { latitude, longitude, accuracy } = location.coords;
        if (accuracy && accuracy > 50) return; // ignoruj bardzo niedokładne

        setRoute((prev) => {
          const next = [...prev, { latitude, longitude }];

          // liczenie dystansu tylko raz
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            const d = haversine(
              last.latitude,
              last.longitude,
              latitude,
              longitude
            );

            setDistance((dist) => {
              const newDist = dist + d;

              // wibracja co 1 km
              if (Math.floor(newDist) > kmReached.current) {
                kmReached.current = Math.floor(newDist);
                Vibration.vibrate([0, 500, 200, 500]);
              }

              return newDist;
            });
          }

          // pierwszy punkt – ustaw kamerę i pobierz adres
          if (prev.length === 0) {
            (async () => {
              const addr = await getAddress(latitude, longitude);
              setStartAddress(addr);
            })();

            mapRef.current?.animateCamera({
              center: { latitude, longitude },
              zoom: 17,
            });

            setLoadingLocation(false);
          }

          return next;
        });
      }
    );
  };

  // ZATRZYMANIE BIEGU
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
    setPaused(true); // pokaż overlay z opcją zapisu lub kontynuacji
    pedometerSub.current?.remove();
    pedometerSub.current = null;
  };

  // KONTYNUACJA BIEGU PO PAUZIE
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
          // pierwszy punkt po wznowieniu - nie dodajemy dystansu
          if (prev.length === 0 || firstPoint) {
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

            setDistance((dist) => {
              const newDist = dist + d;

              // wibracja co 1 km
              if (Math.floor(newDist) > kmReached.current) {
                kmReached.current = Math.floor(newDist);
                Vibration.vibrate([0, 500, 200, 500]);
              }

              return newDist;
            });

            return [...prev, { latitude, longitude }];
          }

          return prev;
        });
      }
    );
  };

  // ZAPIS BIEGU DO FIRESTORE
  const saveRun = async () => {
    kmReached.current = 0; // reset km po zapisie

    const user = auth.currentUser;
    if (!user) return;

    // pobierz końcowy adres
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

      // reset stanów po zapisie
      setRoute([]);
      setDistance(0);
      setSeconds(0);
      setPaused(false);
    } catch (err) {
      console.log("Błąd przy zapisie biegu: ", err);
    }
  };

  // POBRANIE ADRESU NA PODSTAWIE WSPÓŁRZĘDNYCH
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

  // PRZEŁĄCZANIE LATARKI
  const toggleTorch = async () => {
    try {
      // await ExpoTorch.setStateAsync(torchOn ? ExpoTorch.OFF : ExpoTorch.ON);
      setTorchOn((prev) => !prev);
    } catch (err) {
      console.log("Błąd przy sterowaniu latarką:", err);
    }
  };

  return (
    <View className="flex-1 gap-4">
      {/* MAPA */}
      <View className="relative w-full h-[400px]">
        {loadingLocation && (
          <View className="absolute inset-0 z-50 bg-black/80 items-center justify-center">
            <Text className="text-white font-bold text-lg">
              🌍 Ładowanie GPS...
            </Text>
          </View>
        )}
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
          {/* Linia trasy */}
          {route.length > 1 && (
            <Polyline
              coordinates={route}
              strokeWidth={6}
              strokeColor="#2563eb"
            />
          )}
        </MapView>

        {/* Overlay po zatrzymaniu */}
        {paused && (
          <View className="absolute bottom-4 w-full flex-row gap-2 items-center justify-center">
            <TouchableOpacity
              onPress={saveRun}
              className="bg-green-600 p-3 border border-neutral-300"
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

      {/* HUD na dole */}
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
            Średnia prędkość:{" "}
            {distance > 0 ? (seconds / 60 / distance).toFixed(2) : "0"}: min/km
          </Text>
          <Text className="text-white">Liczba kroków: {steps}</Text>
        </View>
      </View>
    </View>
  );
}
