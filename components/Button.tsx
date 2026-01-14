import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { twMerge } from "tailwind-merge";

type Props = {
  children: React.ReactNode;
  className?: string;
  onPress?: () => {};
};

const Button = ({ children, className, onPress }: Props) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={twMerge("w-full bg-black py-4", className)}
    >
      <Text className="text-center text-white font-semibold">{children}</Text>
    </TouchableOpacity>
  );
};

export default Button;
