import { LabeledInput } from "@/components";
import { auth } from "@/firebaseConfig";
import { Link, useRouter } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Register = () => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const signUp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;

    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Błąd rejestracji", "Wszystkie pola muszą być wypełnione.");
      return;
    }

    if (!emailRegex.test(email)) {
      Alert.alert("Błąd rejestracji", "Podany email nie istnieje.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Błąd rejestracji", "Hasła nie są takie same.");
      return;
    }

    if (!passwordRegex.test(password) || !passwordRegex.test(confirmPassword)) {
      Alert.alert(
        "Błąd rejestracji",
        "Hasło musi zawierać minimum 6 znaków, wielką literę i znak specjalny."
      );
      return;
    }

    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email.trim(), password);

      if (auth.currentUser)
        await updateProfile(auth.currentUser, { displayName: username });

      Alert.alert("Gratulacje", "Konto zostało pomyślnie utworzone!");
      router.push("/(auth)/login");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        Alert.alert("Błąd rejestracji", "Konto o podanym emailu już istnieje.");
        return;
      }
      Alert.alert("Nieznany błąd rejestracji", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-white w-screen h-screen flex items-center justify-center px-8">
      <Text className="text-2xl font-black mb-8">Rejestracja</Text>
      <View className="w-full flex flex-col gap-3">
        <LabeledInput
          label="Nazwa użytkownika"
          placeholder="np. Jan Kowalski"
          value={username}
          onChangeText={setUsername}
        />
        <LabeledInput
          label="Email"
          placeholder="jankowalski@gmail.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <LabeledInput
          label="Hasło"
          placeholder="********"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <LabeledInput
          label="Potwierdź hasło"
          placeholder="********"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <TouchableOpacity className="bg-[#171717] py-4 mt-4" onPress={signUp}>
          <Text className="text-white text-center font-semibold">
            {loading ? "Rejestrowanie konta..." : "Zarejestruj się"}
          </Text>
        </TouchableOpacity>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity className="w-full py-4">
            <Text className="text-black text-lg font-bold">
              MASZ JUŻ KONTO? ZALOGUJ SIĘ
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
};

export default Register;
