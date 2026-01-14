import {
  Container,
  GoogleMap,
  RunCard,
  UnauthenticatedView,
} from "@/components/index";
import { RunFirestoreData, RunProps } from "@/constants/types";
import { auth, db } from "@/firebaseConfig";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import "../global.css";

export default function Index() {
  const [lastRuns, setLastRuns] = useState<RunProps[]>([]);

  const user = auth.currentUser;

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
      const lastRuns = await getDocs(q);
      const tempLastRuns: RunProps[] = [];
      lastRuns.forEach((doc) => {
        const data = doc.data() as RunFirestoreData;
        tempLastRuns.push({ id: doc.id, ...data });
      });
      setLastRuns(tempLastRuns);
    } catch (err) {
      console.log("Błąd przy pobieraniu 3 ostatnich biegów: ", err);
    }
  };

  useEffect(() => {
    fetchLastRuns();
  }, []);

  // Jeżeli użytkownik nie jest zalogowany
  if (!user) return <UnauthenticatedView />;

  return (
    <Container className="pt-16">
      <Text className="font-black text-lg text-center text-black mb-6">
        Run4Life
      </Text>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          gap: 32,
        }}
      >
        <GoogleMap />
        <View>
          <Text className="font-black text-center mb-4">Ostatnie 3 trasy</Text>
          <View className="gap-y-4">
            {lastRuns.length ? (
              lastRuns.map((run) => <RunCard key={run.id} {...run} />)
            ) : (
              <Text className="text-center">
                Aktualnie nie masz zapisanych tras
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
      <View className="w-full h-[100px] bg-white"></View>
    </Container>
  );
}
