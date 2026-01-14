import { images } from "@/constants/images";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Link } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import "./global.css";

export default function Index() {
  return (
    <View className="flex-1">
      {/* Top content - image */}
      <View className="relative w-full h-4/5 h-min-[500px] bg-black">
        <Image
          source={images.start}
          alt="runner image"
          className="w-full h-full object-cover absolute"
        />
        <View className="w-full h-full bg-black/60 absolute top-0 left-0 p-10 pt-20">
          <Text className="text-4xl text-white font-black text-center">
            Run4Life
          </Text>
        </View>
      </View>
      {/* Bottom content - buttons */}
      <View className="px-8 flex flex-col justify-center flex-1">
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
