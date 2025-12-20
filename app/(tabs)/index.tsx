import { Link } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import "../global.css";

export default function Index() {
  return (
    <View className="flex-1 pt-10 bg-white px-6">
      <View className="flex items-center flex-row justify-center pt-8 pb-8">
        <Text className="font-black text-lg text-center">Run4Life</Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          gap: 16,
        }}
      >
        <View className="w-full h-[550px] bg-black"></View>
        <View className="w-full h-[80px]  bg-black"></View>
        <View>
          <Text className="font-black text-center mb-4">
            Ostatnie 3 biegania
          </Text>
          <View className="gap-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Link
                key={i}
                href={{
                  pathname: "/run/[id]",
                  params: { id: i },
                }}
                asChild
                className="p-4 bg-white border-2 "
              >
                <TouchableOpacity activeOpacity={0.8}>
                  <View>
                    <Text>19 Grudzień 2025</Text>
                    <Text className="text-2xl font-black">Rzeszów</Text>
                    <Text>ul. Krakowska - ul. Podwisłocze</Text>
                    <Text className="mb-4">
                      10.85km / 01:10:32min / średnio 1km w 6.52min
                    </Text>
                    <View className="w-40 bg-black py-2">
                      <Text className="text-white text-center">
                        Zobacz szczegóły
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        </View>
      </ScrollView>
      <View className="w-full h-[100px] bg-white"></View>
    </View>
  );
}
