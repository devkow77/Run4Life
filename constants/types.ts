type RunProps = {
  id?: string;
  endLocation: {
    city: string;
    postalCode?: string;
    street: string;
  };
  pace: number;
  route: {
    latitude: number;
    longitude: number;
  }[];
  startLocation: {
    city: string;
    postalCode?: string;
    street: string;
  };
  userId: string;
  createdAt: any;
  durationSec: number;
  distanceKm: number;
  steps: number;
};

type RunFirestoreData = Omit<RunProps, "id">;

export type { RunFirestoreData, RunProps };
