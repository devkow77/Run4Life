import { images } from "@/constants/images";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Link } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function Welcome() {
  return (
    <View className="w-screen h-screen">
      {/* Image */}
      <View className="w-full h-[700px] bg-black relative">
        <Image
          source={images.start}
          alt="runner image"
          className="absolute w-full h-full object-cover"
        />
        <View className="size-full bg-black/50 absolute p-10 pt-20">
          <Text className="text-6xl text-white font-black">Smart{"\n"}Run</Text>
        </View>
      </View>
      {/* Buttons */}
      <View className="px-8 flex flex-col gap-2 justify-center flex-1">
        <Link href="/(auth)/register" asChild>
          <TouchableOpacity className="bg-black w-full py-4 flex flex-row items-center justify-between px-8">
            <Text className="text-white text-lg font-semibold">
              ROZPOCZNIJ SWOJĄ PRZYGODĘ
            </Text>
            <AntDesign name="arrow-right" size={20} color="white" />
          </TouchableOpacity>
        </Link>
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
