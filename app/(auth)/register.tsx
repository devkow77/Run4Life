import { Button, Container, LabeledInput } from "@/components/index";
import { emailRegex, passwordRegex, usernameRegex } from "@/constants/regex";
import { auth } from "@/firebaseConfig";
import { Link, useRouter } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

type FormProps = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const formInitialState: FormProps = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const Register = () => {
  const [formData, setFormData] = useState<FormProps>(formInitialState);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const handleFormValue = (name: keyof FormProps, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async () => {
    const { username, email, password, confirmPassword } = formData;

    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Błąd rejestracji", "Wszystkie pola muszą być wypełnione.");
      return;
    }

    if (!usernameRegex.test(username)) {
      Alert.alert(
        "Błąd rejestracji",
        "Nazwa użytkownika musi tylko zawierac litery i cyfry od 3 do 35 znaków"
      );
      return;
    }

    if (!emailRegex.test(email)) {
      Alert.alert("Błąd rejestracji", "Podano nieprawidłowy format emaila.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Błąd rejestracji", "Hasła nie są takie same.");
      return;
    }

    if (!passwordRegex.test(password) || !passwordRegex.test(confirmPassword)) {
      Alert.alert(
        "Błąd rejestracji",
        "Hasło musi zawierać od 6 do 30 znaków, wielką literę i znak specjalny."
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
      setFormData(formInitialState);
    }
  };

  return (
    <Container className="items-center justify-center">
      <Text className="text-2xl font-black mb-8">Rejestracja</Text>
      <View className="w-full flex flex-col gap-3">
        <LabeledInput
          label="Nazwa użytkownika"
          placeholder="np. Jan Kowalski"
          value={formData.username}
          onChangeText={(value) => handleFormValue("username", value)}
        />
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
        <LabeledInput
          label="Potwierdź hasło"
          placeholder="********"
          value={formData.confirmPassword}
          onChangeText={(value) => handleFormValue("confirmPassword", value)}
          secureTextEntry
        />
        <View className="mt-4">
          <Button onPress={handleSignUp}>
            {loading ? "Rejestrowanie konta..." : "Zarejestruj się"}
          </Button>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity className="w-full py-4">
              <Text className="text-black text-lg font-bold">
                MASZ JUŻ KONTO? ZALOGUJ SIĘ
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </Container>
  );
};

export default Register;
