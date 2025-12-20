import { LabeledInput } from "@/components";
import { images } from "@/constants/images";
import { auth } from "@/firebaseConfig";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import React, { useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";

const Profile = () => {
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const router = useRouter();
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/(auth)/login");
    } catch (err: any) {
      Alert.alert("Błąd", "Nie udało się wylogować");
      console.log(err);
    }
  };

  return (
    <View className="flex-1 pt-24 bg-white px-6">
      <Text className="mb-6 text-xl font-black text-center">Twoje konto</Text>
      <View className="relative w-[100px] h-[100px] bg-black mb-2 mx-auto">
        <Image
          source={images.profile}
          alt="zdjęcie profilowe"
          className="absolute w-full h-full object-cover"
        />
      </View>
      {user ? (
        <View className="gap-2 mb-4">
          <Text className="text-center">
            Nazwa użytkownika: {user.displayName}
          </Text>
          <Text className="mb-4 text-center">Email: {user.email}</Text>
          <LabeledInput
            label="Hasło"
            placeholder="Nowe hasło..."
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <LabeledInput
            label="Potwierdź hasło"
            placeholder="Nowe hasło..."
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <View className="mt-4 flex flex-row gap-2 w-full mb-8">
            <TouchableOpacity
              className="bg-orange-500 py-4 w-1/2"
              onPress={() => {}}
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
          <View className="gap-2">
            <Text className="font-semibold">Statystyki użytkownika</Text>
            <Text>Liczba biegów: 6</Text>
            <Text>Ilość przebiegniętych kilometrów: 235</Text>
            <Text>Najdłuższa trasa: 82km</Text>
            <Text>Jesteś z nami od: 20-12-2025r.</Text>
          </View>
        </View>
      ) : (
        <Text className="text-lg mb-4">Brak zalogowanego użytkownika</Text>
      )}
    </View>
  );
};

export default Profile;
