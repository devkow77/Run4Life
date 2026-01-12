import { auth, db } from "@/firebaseConfig"; // popraw ścieżkę do swojego firebase.ts
import { Link } from "expo-router";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const History = () => {
  const [allRuns, setAllRuns] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const user = auth.currentUser;

  // Funkcja do pobrania wszystkich biegów
  const fetchAllRuns = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const runsRef = collection(db, "runs");
      const q = query(
        runsRef,
        where("userId", "==", user.uid),
        orderBy("createdAt", sortOrder)
      );
      const querySnapshot = await getDocs(q);
      const runs: any[] = [];
      querySnapshot.forEach((doc) => {
        runs.push({ id: doc.id, ...doc.data() });
      });
      setAllRuns(runs);
    } catch (err) {
      console.log("Błąd przy pobieraniu wszystkich biegów: ", err);
    }
  };

  useEffect(() => {
    fetchAllRuns();
  }, [sortOrder]);

  // Jeżeli użytkownik nie jest zalogowany
  if (!user)
    return (
      <View className="flex-1 pt-24 bg-white px-6">
        <Text className="text-xl font-black text-center mb-4">
          Zostałeś wylogowany
        </Text>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity className="w-full py-4 bg-green-600">
            <Text className="text-white text-center text-lg font-bold">
              Zaloguj się
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    );

  return (
    <View className="flex-1 pt-24 bg-white px-6">
      <Text className="font-black text-xl mb-4 text-[#171717]">
        Wszystkie zapisane trasy: {allRuns.length}
      </Text>
      <View className="flex flex-row items-center gap-x-4 mb-8">
        <Text className="font-semibold">Posortuj po dacie</Text>
        <View className="flex flex-row gap-2">
          <TouchableOpacity
            className={`${sortOrder == "desc" ? "bg-green-600" : "bg-[#171717]"} px-4 py-2`}
            onPress={() => setSortOrder("desc")}
          >
            <Text className="text-white">najnowsze</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`${sortOrder == "asc" ? "bg-green-600" : "bg-[#171717]"} px-4 py-2`}
            onPress={() => setSortOrder("asc")}
          >
            <Text className="text-white">najstarsze</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          borderRadius: "16px",
          gap: 16,
        }}
      >
        <View className="gap-y-4">
          {allRuns.length ? (
            allRuns.map((run) => (
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
                      :{(run.durationSec % 60).toString().padStart(2, "0")}min /
                      średnio {run.pace || 0} min/km
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
      </ScrollView>
      <View className="w-full h-[100px] bg-white"></View>
    </View>
  );
};

export default History;
