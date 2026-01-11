import { LabeledInput } from "@/components";
import { auth } from "@/firebaseConfig";
import { Link, useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

export default function Login() {
  const [email, setEmail] = useState<string>("kacper@gmail.com");
  const [password, setPassword] = useState<string>("Haslo12345.");
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("Błąd logowania", "Wszystkie pola muszą być wypełnione.");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/(tabs)");
    } catch (err: any) {
      if (err.code === "auth/invalid-credential") {
        Alert.alert("Błąd logowania", "Konto o takich danych nie istnieje.");
        return;
      }
      Alert.alert("Nieznany błąd", err.code);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="bg-white w-screen h-screen flex items-center justify-center px-8">
      <Text className="text-2xl font-black mb-8">Logowanie</Text>
      <View className="w-full flex flex-col gap-3">
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
        <TouchableOpacity
          className="bg-green-500 py-4 mt-4"
          onPress={handleRegister}
        >
          <Text className="text-white text-center font-semibold">
            {loading ? "Logowanie..." : "Zaloguj się"}
          </Text>
        </TouchableOpacity>
        <Link href="/(auth)/register" asChild>
          <TouchableOpacity className="w-full py-4">
            <Text className="text-black text-lg font-bold">
              NIE MASZ KONTA? ZAREJESTRUJ SIĘ
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}
