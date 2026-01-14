import { Container, RunCard, UnauthenticatedView } from "@/components/index";
import { RunFirestoreData, RunProps } from "@/constants/types";
import { auth, db } from "@/firebaseConfig";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const History = () => {
  const [allRuns, setAllRuns] = useState<RunProps[]>([]);
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
      const allRuns = await getDocs(q);
      const tempAllRuns: RunProps[] = [];
      allRuns.forEach((doc) => {
        const data = doc.data() as RunFirestoreData;
        tempAllRuns.push({ id: doc.id, ...data });
      });
      setAllRuns(tempAllRuns);
    } catch (err) {
      console.log("Błąd przy pobieraniu wszystkich biegów: ", err);
    }
  };

  useEffect(() => {
    fetchAllRuns();
  }, [sortOrder]);

  // Jeżeli użytkownik nie jest zalogowany
  if (!user) return <UnauthenticatedView />;

  return (
    <Container className="pt-16">
      <Text className="font-black text-xl mb-4 text-black">
        Wszystkie zapisane trasy: {allRuns.length}
      </Text>
      <View className="flex flex-row items-center gap-x-4 mb-8">
        <Text className="font-semibold">Posortuj po dacie</Text>
        <View className="flex flex-row gap-2">
          <TouchableOpacity
            className={`${
              sortOrder == "desc" ? "bg-green-600" : "bg-black"
            } px-4 py-2`}
            onPress={() => setSortOrder("desc")}
          >
            <Text className="text-white">najnowsze</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`${
              sortOrder == "asc" ? "bg-green-600" : "bg-black"
            } px-4 py-2`}
            onPress={() => setSortOrder("asc")}
          >
            <Text className="text-white">najstarsze</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          gap: 16,
        }}
      >
        {allRuns.length ? (
          allRuns.map((run) => <RunCard key={run.id} {...run} />)
        ) : (
          <Text className="text-center">
            Aktualnie nie masz zapisanych tras
          </Text>
        )}
      </ScrollView>
      <View className="w-full h-[100px] bg-white"></View>
    </Container>
  );
};

export default History;
