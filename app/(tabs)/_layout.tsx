import { icons } from "@/constants/icons";
import { Tabs } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";

const TabIcon = ({ focused, icon, title }: any) => {
  if (focused) {
    return (
      <View className="bg-[#16a34a] flex flex-row w-full flex-1 min-w-[106px] min-h-[52px] mt-4 justify-center gap-2 items-center overflow-hidden">
        <Image source={icon} tintColor="#fff" className="size-5" />
        <Text className="text-white text-base font-semibold">{title}</Text>
      </View>
    );
  }

  return (
    <View className="size-full justify-center items-center mt-4 ">
      <Image source={icon} tintColor="#fff" className="size-5" />
    </View>
  );
};

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarStyle: {
          backgroundColor: "#171717",
          marginHorizontal: 20,
          marginBottom: 36,
          height: 50,
          position: "absolute",
          overflow: "hidden",
          width: 318,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "index",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} title="Główna" icon={icons.home} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "history",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} title="Historia" icon={icons.history} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} title="Konto" icon={icons.profile} />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
