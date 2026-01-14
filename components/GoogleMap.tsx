import { auth, db } from "@/firebaseConfig";
import { Camera, CameraView } from "expo-camera";
import * as Location from "expo-location";
import { Pedometer } from "expo-sensors";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { Alert, Text, TouchableOpacity, Vibration, View } from "react-native";
import MapView, { Polyline, PROVIDER_GOOGLE } from "react-native-maps";

// Konwersja stopni na radiany
const toRad = (v: number) => (v * Math.PI) / 180;

// Haversine – dystans w km
const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function GoogleMap() {
  const mapRef = useRef<MapView | null>(null);
  const locationSub = useRef<Location.LocationSubscription | null>(null);
  const timerRef = useRef<number | null>(null);
  const kmReached = useRef(0);

  const [isTracking, setIsTracking] = useState(false);
  const [route, setRoute] = useState<{ latitude: number; longitude: number }[]>(
    []
  );
  const [distance, setDistance] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const [steps, setSteps] = useState(0);
  const [torchOn, setTorchOn] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [startAddress, setStartAddress] = useState<{
    city: string;
    street: string;
  }>({ city: "", street: "" });
  const [endAddress, setEndAddress] = useState<{
    city: string;
    street: string;
  }>({ city: "", street: "" });

  const pedometerSub = useRef<any>(null);
  const stepOffset = useRef(0);

  useEffect(() => {
    return () => {
      locationSub.current?.remove();
      if (timerRef.current) clearInterval(timerRef.current);
      pedometerSub.current?.remove();
    };
  }, []);

  // GET ADDRESS
  const getAddress = async (lat: number, lon: number) => {
    try {
      const [addr] = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lon,
      });
      return {
        city: addr.city || addr.subregion || "",
        street: addr.street || "",
      };
    } catch (err) {
      return { city: "", street: "" };
    }
  };

  // START ŚLEDZENIA
  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    setLoadingLocation(true);
    setRoute([]);
    setDistance(0);
    setSeconds(0);
    setSteps(0);
    stepOffset.current = 0;
    kmReached.current = 0;
    setIsTracking(true);
    setPaused(false);

    // Pedometr
    pedometerSub.current?.remove();
    pedometerSub.current = Pedometer.watchStepCount((result) => {
      if (stepOffset.current === 0) {
        stepOffset.current = result.steps;
        return;
      }
      setSteps(result.steps - stepOffset.current);
    });

    // Timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);

    // GPS
    locationSub.current?.remove();
    locationSub.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 1000,
        distanceInterval: 5,
      },
      async (location) => {
        const { latitude, longitude, accuracy } = location.coords;
        if (accuracy && accuracy > 50) return;

        setRoute((prev) => {
          if (prev.length === 0) {
            (async () =>
              setStartAddress(await getAddress(latitude, longitude)))();
            mapRef.current?.animateCamera({
              center: { latitude, longitude },
              zoom: 17,
            });
            setLoadingLocation(false);
            return [{ latitude, longitude }];
          }

          const last = prev[prev.length - 1];
          const d = haversine(
            last.latitude,
            last.longitude,
            latitude,
            longitude
          );

          setDistance((dist) => {
            const newDist = dist + d;
            if (Math.floor(newDist) > kmReached.current) {
              kmReached.current = Math.floor(newDist);
              Vibration.vibrate([0, 500, 200, 500]);
            }
            return newDist;
          });

          return [...prev, { latitude, longitude }];
        });
      }
    );
  };

  // STOP / PAUSE
  const stopTracking = () => {
    locationSub.current?.remove();
    locationSub.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    pedometerSub.current?.remove();
    pedometerSub.current = null;
    setIsTracking(false);
    setPaused(true);
  };

  const cancelRun = () => {
    locationSub.current?.remove();
    pedometerSub.current?.remove();
    if (timerRef.current) clearInterval(timerRef.current);

    setRoute([]);
    setDistance(0);
    setSeconds(0);
    setSteps(0);
    setPaused(false);
    setIsTracking(false);
    kmReached.current = 0;
  };

  const continueTracking = async () => {
    setPaused(false);
    setIsTracking(true);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);

    let firstPoint = true;
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
            firstPoint = false;
            return [...prev, { latitude, longitude }];
          }
          const last = prev[prev.length - 1];
          if (last.latitude !== latitude || last.longitude !== longitude) {
            const d = haversine(
              last.latitude,
              last.longitude,
              latitude,
              longitude
            );
            setDistance((dist) => {
              const newDist = dist + d;
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

  const saveRun = async () => {
    const user = auth.currentUser;
    if (!user) return;

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
        endLocation: endAddr,
        route,
        createdAt: serverTimestamp(),
      });
      cancelRun();
    } catch (err) {
      console.log("Błąd przy zapisie biegu: ", err);
    }
  };

  const toggleTorch = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Komunikat",
        "Musisz pozwolic na dostęp do aparatu, aby włączyc latarkę."
      );
      return;
    }
    setTorchOn((prev) => !prev);
  };

  return (
    <View className="flex-1 gap-4">
      {/* MAP */}
      <View className="w-full h-3/5 min-h-[400px] max-h-screen bg-black">
        {loadingLocation && (
          <View className="absolute inset-0 z-50 bg-black/80 items-center justify-center">
            <Text className="text-white font-bold text-lg">
              🌍 Ładowanie GPS...
            </Text>
          </View>
        )}
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
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
              strokeColor="#16a34a"
            />
          )}
        </MapView>

        {/* Overlay po pauzie */}
        {paused && (
          <View className="absolute bottom-4 w-full flex-row gap-2 items-center justify-center">
            <TouchableOpacity
              onPress={saveRun}
              className="bg-green-600 p-3 border border-neutral-300"
            >
              <Text className="text-white font-semibold">Zapisz trasę</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={continueTracking}
              className="bg-white p-3 border border-neutral-300"
            >
              <Text className="text-black font-semibold">Kontynuuj</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={cancelRun}
              className="bg-red-600 px-4 py-3 border border-neutral-300"
            >
              <Text className="text-white font-semibold">Zakończ</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Latarka */}
        <TouchableOpacity
          onPress={toggleTorch}
          className={`${
            torchOn ? "bg-yellow-400" : "bg-white"
          } shadow-md shadow-black absolute top-3.5 right-16 p-[9px]`}
        >
          <Text className="font-bold text-black">{torchOn ? "💡" : "🔦"}</Text>
        </TouchableOpacity>

        {/* CameraView minimalny do latarki */}
        <CameraView
          style={{ width: 1, height: 1, position: "absolute" }}
          enableTorch={torchOn}
        />
      </View>

      {/* HUD */}
      <View className="relative flex flex-row items-center w-full bg-black h-[90px]">
        <View className="w-1/3 h-full">
          {!isTracking ? (
            <TouchableOpacity
              onPress={startTracking}
              className={`${
                paused ? "bg-blue-600" : "bg-green-600"
              } h-[90px] items-center justify-center`}
            >
              <Text className="text-white font-semibold text-lg">
                {paused ? "NOWY BIEG" : "START"}
              </Text>
            </TouchableOpacity>
          ) : !paused ? (
            <TouchableOpacity
              onPress={stopTracking}
              className="bg-red-600 h-[90px] items-center justify-center"
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
          <Text className="text-white">Kroki: {steps}</Text>
        </View>
      </View>
    </View>
  );
}
