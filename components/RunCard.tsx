import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import Button from "./Button";

const RunCard = ({
  id,
  createdAt,
  startLocation,
  endLocation,
  distanceKm,
  durationSec,
  pace,
}: any) => {
  return (
    <View className="p-4 bg-white border-2 border-black gap-4">
      <View>
        <Text>
          {new Date(createdAt.seconds * 1000).toLocaleDateString("pl-PL", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Text>
        <Text className="text-2xl font-black text-black">
          {startLocation?.city || "Nieznane miasto"}
        </Text>
        <Text>
          ul. {startLocation?.street || "-"} - ul. {endLocation?.street || "-"}
        </Text>
        <Text>
          {distanceKm?.toFixed(2)}km /{" "}
          {Math.floor(durationSec / 3600)
            .toString()
            .padStart(2, "0")}
          :
          {Math.floor((durationSec % 3600) / 60)
            .toString()
            .padStart(2, "0")}
          :{(durationSec % 60).toString().padStart(2, "0")}min / średnio{" "}
          {pace || 0} min/km
        </Text>
      </View>
      <Link href={{ pathname: "/run/[id]", params: { id } }} asChild>
        <Button className="w-40 py-2">Zobacz szczegóły</Button>
      </Link>
    </View>
  );
};

export default RunCard;
