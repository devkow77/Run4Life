import { Button, Container } from "@/components";
import { Link } from "expo-router";
import React from "react";
import { Text } from "react-native";

const UnauthenticatedView = () => {
  return (
    <Container className="pt-16">
      <Text className="text-xl font-black text-center mb-4">
        Zostałeś wylogowany
      </Text>
      <Link href={"/(auth)/login"}>
        <Button className="bg-green-500">Zaloguj się</Button>
      </Link>
    </Container>
  );
};

export default UnauthenticatedView;
