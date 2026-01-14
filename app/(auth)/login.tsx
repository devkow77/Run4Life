import { Button, Container, LabeledInput } from "@/components/index";
import { auth } from "@/firebaseConfig";
import { Link, useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

type FormProps = {
  email: string;
  password: string;
};

const formInitialState: FormProps = {
  email: "kacper@gmail.com",
  password: "Haslo12345.",
};

export default function Login() {
  const [formData, setFormData] = useState<FormProps>(formInitialState);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const handleFormValue = (name: keyof FormProps, value: string) => {
    setFormData((prev) => ({
      ...formData,
      [name]: value,
    }));
  };

  const handleRegister = async () => {
    const { email, password } = formData;

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
    <Container className="items-center justify-center">
      <Text className="text-2xl font-black mb-8">Logowanie</Text>
      <View className="w-full flex flex-col gap-3">
        <LabeledInput
          label="Email"
          placeholder="jankowalski@gmail.com"
          value={formData.email}
          onChangeText={(value) => handleFormValue("email", value)}
          keyboardType="email-address"
        />
        <LabeledInput
          label="Hasło"
          placeholder="********"
          value={formData.password}
          onChangeText={(value) => handleFormValue("password", value)}
          secureTextEntry
        />
        <View className="mt-4">
          <Button onPress={handleRegister} className="bg-green-500">
            {loading ? "Logowanie..." : "Zaloguj się"}
          </Button>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity className="w-full py-4">
              <Text className="text-black text-lg font-bold">
                NIE MASZ KONTA? ZAREJESTRUJ SIĘ
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </Container>
  );
}
