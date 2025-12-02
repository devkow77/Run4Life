import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { Tabs } from "expo-router";
import React from "react";
import { Image, ImageBackground, Text, View } from "react-native";

const TabIcon = ({ focused, icon, title }: any) => {
  if (focused) {
    return (
      <ImageBackground
        source={images.hightlight}
        className="flex flex-row w-full flex-1 min-w-[190px] min-h-16 mt-4 justify-center gap-2 items-center rounded-full overflow-hidden"
      >
        <Image source={icon} tintColor="#151312" className="size-5" />
        <Text className="text-secondary text-base font-semibold">{title}</Text>
      </ImageBackground>
    );
  }

  return (
    <View className="size-full justify-center items-center mt-4 rounded-full">
      <Image source={icon} tintColor="#A8B5DB" className="size-5" />
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
          backgroundColor: "#221F3D",
          borderRadius: 50,
          marginHorizontal: 20,
          marginBottom: 36,
          height: 52,
          position: "absolute",
          overflow: "hidden",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "index",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} title="Home" icon={icons.home} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "history",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} title="History" icon={icons.history} />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
