import { Link } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const History = () => {
  return (
    <View className="flex-1 pt-24 bg-white px-6">
      <Text className="font-black text-xl mb-2">
        Obecnie masz zapisanych 6 biegów.
      </Text>
      <View className="flex flex-row items-center gap-x-4 mb-8">
        <Text className="font-semibold">Posortuj po dacie</Text>
        <View className="flex flex-row gap-2">
          <View className="px-4 py-2 bg-black">
            <Text className="text-white">najnowsze</Text>
          </View>
          <View className="px-4 py-2 bg-black">
            <Text className="text-white">najstarsze</Text>
          </View>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          borderRadius: "16px",
          gap: 16,
        }}
      >
        <View className="gap-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Link
              key={i}
              href={{
                pathname: "/run/[id]",
                params: { id: i },
              }}
              asChild
              className="p-4 bg-white border-2"
            >
              <TouchableOpacity activeOpacity={0.8}>
                <View>
                  <Text>16 Grudzień 2025</Text>
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
      </ScrollView>
      <View className="w-full h-[100px] bg-white"></View>
    </View>
  );
};

export default History;
