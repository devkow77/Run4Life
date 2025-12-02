import { Link } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleRegister = () => {
    if (!email || !password) {
      Alert.alert("Błąd", "Wszystkie pola muszą być wypełnione");
      return;
    }

    console.log("Logowanie użytkownika:", {
      email,
      password,
    });
  };

  return (
    <View className="bg-white w-screen h-screen flex items-center justify-center px-8">
      <Text className="text-2xl font-black mb-6">Logowanie</Text>
      <View className="w-full flex flex-col gap-3">
        <View>
          <Text className="mb-2 font-semibold">Email</Text>
          <TextInput
            placeholder="np. jankowalski@gmail.com"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            className="bg-black/10 text-black rounded-md p-3"
          />
        </View>
        <View>
          <Text className="mb-2 font-semibold">Hasło</Text>
          <TextInput
            placeholder="********"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="bg-black/10 text-black rounded-md p-3"
          />
        </View>
        <TouchableOpacity
          className="bg-blue-500 py-4 rounded-md mt-4"
          onPress={handleRegister}
        >
          <Text className="text-white text-center font-semibold">
            Zaloguj się
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
