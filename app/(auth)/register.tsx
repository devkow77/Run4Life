import { Link } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Register() {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const handleRegister = () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Błąd", "Wszystkie pola muszą być wypełnione");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Błąd", "Hasła nie są takie same");
      return;
    }

    console.log("Rejestracja użytkownika:", {
      username,
      email,
      password,
    });
  };

  return (
    <View className="bg-white w-screen h-screen flex items-center justify-center px-8">
      <Text className="text-2xl font-black mb-6">Rejestracja</Text>
      <View className="w-full flex flex-col gap-3">
        <View>
          <Text className="mb-2 font-semibold">Username</Text>
          <TextInput
            placeholder="np. Jan Kowalski"
            placeholderTextColor="#666"
            value={username}
            onChangeText={setUsername}
            className="bg-black/10 text-black rounded-md p-3"
          />
        </View>
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
        <View>
          <Text className="mb-2 font-semibold">Potwierdź hasło</Text>
          <TextInput
            placeholder="********"
            placeholderTextColor="#666"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            className="bg-black/10 text-black rounded-md p-3"
          />
        </View>
        <TouchableOpacity
          className="bg-blue-500 py-4 rounded-md mt-4"
          onPress={handleRegister}
        >
          <Text className="text-white text-center font-semibold">
            Zarejestruj się
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
    </View>
  );
}
