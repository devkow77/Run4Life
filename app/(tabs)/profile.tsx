import {
  Container,
  LabeledInput,
  UnauthenticatedView,
} from "@/components/index";
import { images } from "@/constants/images";
import { passwordRegex } from "@/constants/regex";
import { auth, db } from "@/firebaseConfig";
import { useRouter } from "expo-router";
import { signOut, updatePassword } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type FormProps = {
  password: string;
  confirmPassword: string;
};

type StatsProps = {
  runsCount: number;
  totalKm: number;
  longestRun: number;
  firstRunDate: Date | null;
  bestPace: null | number;
  avgPace: number | null;
  currentStreak: number;
  bestStreak: number;
  monthProgress: number;
};

const formInitialState: FormProps = {
  password: "",
  confirmPassword: "",
};

const statsInitialState: StatsProps = {
  runsCount: 0,
  totalKm: 0,
  longestRun: 0,
  firstRunDate: null as Date | null,
  bestPace: null as number | null,
  avgPace: null as number | null,
  currentStreak: 0,
  bestStreak: 0,
  monthProgress: 0,
};

const Profile = () => {
  const [formData, setFormData] = useState<FormProps>(formInitialState);
  const [stats, setStats] = useState<StatsProps>(statsInitialState);

  const router = useRouter();
  const user = auth.currentUser;

  const handleFormValue = (name: keyof FormProps, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Funkcja wyloowania użytkownika
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/(auth)/login");
    } catch (err: any) {
      Alert.alert("Błąd", "Nie udało się wylogować");
      console.log(err);
    }
  };

  // Funkcja zmiany hasła użytkonika
  const handleChangePassword = async () => {
    if (!user) return;

    const { password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      Alert.alert("Błąd", "Hasła nie są takie same.");
      return;
    }

    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Błąd",
        "Hasło musi zawierać od 6 do 30 znaków, wielką literę i znak specjalny."
      );
      return;
    }

    try {
      await updatePassword(user, password);
      Alert.alert("Sukces", "Hasło zostało zmienione.");
      setFormData(formInitialState);
    } catch (err: any) {
      if (err.code === "auth/requires-recent-login") {
        Alert.alert(
          "Wymagane ponowne logowanie",
          "Zaloguj się ponownie, aby zmienić hasło."
        );
      } else {
        Alert.alert("Błąd", "Nie udało się zmienić hasła.");
      }
      console.log(err);
    }
  };

  // Funkcja do zliczania statystyk użytkownika
  const fetchUserStats = async () => {
    if (!user) return;

    try {
      const q = query(collection(db, "runs"), where("userId", "==", user.uid));
      const stats = await getDocs(q);

      let runsCount = stats.size;
      let totalKm = 0;
      let totalTime = 0;
      let longestRun = 0;
      let bestPace: number | null = null;
      let firstRun: Date | null = null;

      const runDays: Date[] = [];

      const now = new Date();
      const thisMonth = now.getMonth();
      const lastMonth = thisMonth - 1;
      let kmThisMonth = 0;
      let kmLastMonth = 0;

      stats.forEach((doc) => {
        const data = doc.data();

        const distance = data.distanceKm || 0;
        const duration = data.durationSec || 0;
        const pace = Number(data.pace);

        totalKm += distance;
        totalTime += duration;

        if (distance > longestRun) longestRun = distance;
        if (!isNaN(pace)) {
          bestPace = bestPace === null ? pace : Math.min(bestPace, pace);
        }

        if (data.createdAt?.seconds) {
          const date = new Date(data.createdAt.seconds * 1000);
          runDays.push(date);

          if (!firstRun || date < firstRun) firstRun = date;

          if (date.getMonth() === thisMonth) kmThisMonth += distance;
          if (date.getMonth() === lastMonth) kmLastMonth += distance;
        }
      });

      // ŚREDNIE TEMPO
      const avgPace = totalKm > 0 ? totalTime / 60 / totalKm : null;

      // SERIE
      const uniqueDays = Array.from(
        new Set(runDays.map((d) => d.toDateString()))
      )
        .map((d) => new Date(d))
        .sort((a, b) => a.getTime() - b.getTime());

      let bestStreak = 0;
      let currentStreak = 0;
      let streak = 1;

      for (let i = 1; i < uniqueDays.length; i++) {
        const diff =
          (uniqueDays[i].getTime() - uniqueDays[i - 1].getTime()) / 86400000;
        if (diff === 1) {
          streak++;
        } else {
          bestStreak = Math.max(bestStreak, streak);
          streak = 1;
        }
      }
      bestStreak = Math.max(bestStreak, streak);

      // aktualna seria
      let day = new Date();
      const daySet = new Set(uniqueDays.map((d) => d.toDateString()));
      while (daySet.has(day.toDateString())) {
        currentStreak++;
        day.setDate(day.getDate() - 1);
      }

      const monthProgress =
        kmLastMonth > 0
          ? ((kmThisMonth - kmLastMonth) / kmLastMonth) * 100
          : kmThisMonth > 0
          ? 100
          : 0;

      setStats({
        runsCount,
        totalKm: Number(totalKm.toFixed(2)),
        longestRun: Number(longestRun.toFixed(2)),
        firstRunDate: firstRun,
        bestPace,
        avgPace,
        currentStreak,
        bestStreak,
        monthProgress: Number(monthProgress.toFixed(1)),
      });
    } catch (err) {
      console.log("Błąd pobierania statystyk:", err);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, [user]);

  // Jeżeli użytkownik nie jest zalogowany
  if (!user) return <UnauthenticatedView />;

  return (
    <Container className="pt-16">
      <Text className="text-xl font-black text-center">Twoje konto</Text>
      {/* avatar, nazwa, email */}
      <View className="mb-6">
        <View className="relative w-[100px] h-[100px] bg-black mx-auto">
          <Image
            source={images.profile}
            alt="zdjęcie profilowe"
            className="absolute w-full h-full object-cover"
          />
        </View>
        <Text className="text-center font-semibold">{user.displayName}</Text>
        <Text className="text-center">{user.email}</Text>
      </View>
      {/* formulaz */}
      <View className="gap-2 mb-4">
        <LabeledInput
          label="Hasło"
          placeholder="Nowe hasło..."
          value={formData.password}
          onChangeText={(value) => handleFormValue("password", value)}
          secureTextEntry
        />
        <LabeledInput
          label="Potwierdź hasło"
          placeholder="Nowe hasło..."
          value={formData.confirmPassword}
          onChangeText={(value) => handleFormValue("confirmPassword", value)}
          secureTextEntry
        />
        <View className="mt-4 flex flex-row gap-2 w-full mb-4">
          <TouchableOpacity
            className="bg-green-600 py-4 w-1/2"
            onPress={handleChangePassword}
          >
            <Text className="text-white text-center font-semibold">
              Zmień hasło
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-600 py-4 w-1/2"
          >
            <Text className="text-white font-semibold text-center">
              Wyloguj się
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* statystyki */}
      <Text className="font-semibold text-lg mb-4">Statystyki użytkownika</Text>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
      >
        <Text>🏃 Liczba tras: {stats.runsCount}</Text>
        <Text>📏 Łączny dystans: {stats.totalKm} km</Text>
        <Text>🏆 Najdłuższa trasa: {stats.longestRun} km</Text>
        <Text>
          🚀 Najlepsze tempo:{" "}
          {stats.bestPace ? `${stats.bestPace.toFixed(2)} min/km` : "- min/km"}
        </Text>
        <Text>
          📊 Średnie tempo:{" "}
          {stats.avgPace ? `${stats.avgPace.toFixed(2)} min/km` : "- min/km"}
        </Text>
        <Text>🔥 Aktualna seria: {stats.currentStreak} dni</Text>
        <Text>🏆 Rekord serii: {stats.bestStreak} dni</Text>
        <Text>
          📈 Postęp miesiąc do miesiąca: {stats.monthProgress >= 0 ? "+" : ""}
          {stats.monthProgress}%
        </Text>
        <Text>
          📅 Jesteś z nami od:{" "}
          {stats.firstRunDate
            ? stats.firstRunDate.toLocaleDateString("pl-PL")
            : "-"}
        </Text>
      </ScrollView>
      <View className="w-full h-[100px] bg-white"></View>
    </Container>
  );
};

export default Profile;
