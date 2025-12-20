import { Link, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const RunDetails = () => {
  const { id } = useLocalSearchParams();
  return (
    <View className="flex-1">
      <View className="w-full h-[550px] bg-black mb-8"></View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          gap: 16,
        }}
        className="px-6"
      >
        <Text className="font-black text-xl">Szczegóły biegu</Text>
        <View className="gap-1">
          <Text>Data: 16 Grudzień 2025</Text>
          <Text>Miasto: Rzeszów</Text>
          <Text>Start - Koniec: ul. Krakowska - ul. Podwisłocze</Text>
          <Text>Dystans:10.85km</Text>
          <Text>Rozpoczęto: 15:34:32</Text>
          <Text>Zakończono: 16:28:16</Text>
          <Text>Największa prędkość: 32km per hour</Text>
          <Text>Średnia prędkość: 9.5km per hour</Text>
          <Text>Ilość kroków: 10200</Text>
        </View>
        <Link href="/(tabs)/history" asChild>
          <TouchableOpacity className="bg-black py-4">
            <Text className="text-white text-center font-semibold">
              Wróć do historii biegów
            </Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </View>
  );
};

export default RunDetails;
