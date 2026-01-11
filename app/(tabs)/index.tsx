import { RunMap } from "@/components";
import { auth, db } from "@/firebaseConfig";
import { Link } from "expo-router";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import "../global.css";

export default function Index() {
  const [lastRuns, setLastRuns] = useState<any[]>([]);

  // Funkcja do pobrania 3 ostatnich biegów
  const fetchLastRuns = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const runsRef = collection(db, "runs");
      const q = query(
        runsRef,
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(3)
      );
      const querySnapshot = await getDocs(q);
      const runs: any[] = [];
      querySnapshot.forEach((doc) => {
        runs.push({ id: doc.id, ...doc.data() });
      });
      setLastRuns(runs);
      console.log(runs);
    } catch (err) {
      console.log("Błąd przy pobieraniu 3 ostatnich biegów: ", err);
    }
  };

  useEffect(() => {
    fetchLastRuns();
  }, []);

  return (
    <View className="flex-1 pt-10 bg-white px-6">
      <View className="flex items-center flex-row justify-center pt-8 pb-8">
        <Text className="font-black text-lg text-center text-[#171717]">
          Run4Life
        </Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          gap: 32,
        }}
      >
        <RunMap />
        <View>
          <Text className="font-black text-center mb-4">Ostatnie 3 trasy</Text>
          <View className="gap-y-4">
            {lastRuns.length ? (
              lastRuns.map((run) => (
                <Link
                  key={run.id}
                  href={{
                    pathname: "/run/[id]",
                    params: { id: run.id },
                  }}
                  asChild
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    className="p-4 bg-white border-2 border-[#171717]"
                  >
                    <View>
                      <Text>
                        {new Date(
                          run.createdAt.seconds * 1000
                        ).toLocaleDateString("pl-PL", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </Text>
                      <Text className="text-2xl font-black text-[#171717]">
                        {run.startLocation?.city || "Nieznane miasto"}
                      </Text>
                      <Text>
                        ul. {run.startLocation?.street || "-"} - ul.{" "}
                        {run.endLocation?.street || "-"}
                      </Text>
                      <Text className="mb-4">
                        {run.distanceKm?.toFixed(2)}km /{" "}
                        {Math.floor(run.durationSec / 3600)
                          .toString()
                          .padStart(2, "0")}
                        :
                        {Math.floor((run.durationSec % 3600) / 60)
                          .toString()
                          .padStart(2, "0")}
                        :{(run.durationSec % 60).toString().padStart(2, "0")}min
                        / średnio {run.pace || 0} min/km
                      </Text>
                      <View className="w-40 bg-[#171717] py-2">
                        <Text className="text-white text-center">
                          Zobacz szczegóły
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Link>
              ))
            ) : (
              <Text className="text-center">
                Aktualnie nie masz zapisanych tras
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
      <View className="w-full h-[100px] bg-white"></View>
    </View>
  );
}
