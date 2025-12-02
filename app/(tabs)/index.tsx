import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { ScrollView, Text, View } from "react-native";
import "../global.css";

export default function Index() {
  return (
    <View className="flex-1 pt-10 bg-white px-6">
      <Navbar />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          minHeight: "100%",
          padding: 10,
          justifyContent: "center",
          alignItems: "center",
        }}
        className="bg-neutral-400"
      >
        <Text>Główny content</Text>
      </ScrollView>
      <Footer />
    </View>
  );
}
