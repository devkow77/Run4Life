import React from "react";
import { Text, TextInput, View } from "react-native";

type KeyboardTypeOptions =
  | "default"
  | "email-address"
  | "numeric"
  | "phone-pad"
  | "number-pad"
  | "decimal-pad"
  | "url"
  | "ascii-capable"
  | "numbers-and-punctuation"
  | "name-phone-pad"
  | "twitter"
  | "web-search"
  | "visible-password";

interface Props {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
}

const LabeledInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry,
}: Props) => {
  return (
    <View>
      <Text className="mb-2 font-semibold">{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#666"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize="none"
        secureTextEntry={secureTextEntry}
        className="bg-black/5 text-black p-3"
      />
    </View>
  );
};

export default LabeledInput;
