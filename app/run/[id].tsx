import { auth, db } from "@/firebaseConfig";
import { Link, useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

const RunDetails = () => {
  const { id } = useLocalSearchParams();
  const [run, setRun] = useState<any>(null);
  const mapRef = useRef<MapView | null>(null);

  // Funkcja do pobrania trasy po id
  const fetchUniqueRun = async () => {
    const user = auth.currentUser;
    if (!user || !id) return;

    try {
      const runRef = doc(db, "runs", id as string);
      const runSnap = await getDoc(runRef);

      if (runSnap.exists() && runSnap.data().userId === user.uid) {
        setRun({ id: runSnap.id, ...runSnap.data() });
      } else {
        console.log("Bieg nie istnieje lub nie należy do tego użytkownika");
      }
    } catch (err) {
      console.log("Błąd przy pobieraniu biegu: ", err);
    }
  };

  useEffect(() => {
    fetchUniqueRun();
  }, [id]);

  useEffect(() => {
    if (run?.route?.length && mapRef.current) {
      mapRef.current.fitToCoordinates(run.route, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [run]);

  if (!run) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Ładowanie biegu...</Text>
      </View>
    );
  }

  const startTime = new Date(run.createdAt.seconds * 1000);
  const endTime = new Date(startTime.getTime() + run.durationSec * 1000);

  return (
    <View className="flex-1">
      {/* Mapa trasy */}
      <View className="w-full h-[450px] mb-4">
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          showsUserLocation={false}
          initialRegion={{
            latitude: run.route?.[0]?.latitude || 50.0412,
            longitude: run.route?.[0]?.longitude || 21.9991,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          {run.route?.length > 1 && (
            <>
              <Polyline
                coordinates={run.route}
                strokeWidth={5}
                strokeColor="#2563eb"
              />
              {/* Marker startu */}
              <Marker
                coordinate={run.route[0]}
                title="Start"
                pinColor="green"
              />
              {/* Marker końca */}
              <Marker
                coordinate={run.route[run.route.length - 1]}
                title="Koniec"
                pinColor="red"
              />
            </>
          )}
        </MapView>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 16 }}
        className="px-6"
      >
        <Text className="font-black text-xl">Szczegóły biegu</Text>
        <View className="gap-1">
          <Text>
            Data:{" "}
            {startTime.toLocaleDateString("pl-PL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
          <Text>Miasto: {run.startLocation?.city || "-"}</Text>
          <Text>
            Miejsce startu - końca: ul. {run.startLocation?.street || "-"} - ul.{" "}
            {run.endLocation?.street || "-"}
          </Text>
          <Text>Dystans: {run.distanceKm?.toFixed(2)} km</Text>
          <Text>Średnia prędkość: {run.pace || 0} min/km</Text>
          <Text>Ilość kroków: {run.steps || 0}</Text>
          <Text>Rozpoczęto: {startTime.toLocaleTimeString("pl-PL")}</Text>
          <Text>Zakończono: {endTime.toLocaleTimeString("pl-PL")}</Text>
        </View>
        <Link href="/(tabs)/history" asChild>
          <TouchableOpacity className="bg-green-600 py-4 mt-4">
            <Text className="text-white text-center font-semibold">
              Wróć do historii biegów
            </Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </View>
  );
};

export default RunDetails;
