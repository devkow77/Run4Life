import React from "react";
import { Text, View } from "react-native";

const Navbar = () => {
  return (
    <View className="flex flex-row justify-between py-6">
      <Text className="font-black">Smart Run</Text>
      <Text className="font-bold">Profil</Text>
    </View>
  );
};

export default Navbar;
