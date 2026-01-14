import React from "react";
import { View } from "react-native";
import { twMerge } from "tailwind-merge";

type Props = {
  children: React.ReactNode;
  className?: string;
};

const Container = ({ children, className }: Props) => {
  return (
    <View className={twMerge("px-6 flex-1 bg-white", className)}>
      {children}
    </View>
  );
};

export default Container;
