import React from "react";
import { Text, View } from "react-native";

const Footer = () => {
  return (
    <View className="py-6">
      <Text className="font-black mb-4">SmartRun</Text>
      <Text className="leading-6">
        Aplikacja stworzona z myślą o osobach, które kochają biegać i dbać o
        swoją formę. Monitoruj treningi, śledź progres i ciesz się aktywnym
        stylem życia każdego dnia.
      </Text>
      <View className="my-6 flex flex-row justify-between">
        <Text className="font-bold">Nasze social media</Text>
        <View className="flex flex-row gap-x-4">
          <Text className="font-bold">FB</Text>
          <Text className="font-bold">IG</Text>
          <Text className="font-bold">TW</Text>
        </View>
      </View>
      <Text className="leading-6">
        Aplikacja mobilna utworzona przy użyciu frameworka Expo/React Native.
      </Text>
    </View>
  );
};

export default Footer;
