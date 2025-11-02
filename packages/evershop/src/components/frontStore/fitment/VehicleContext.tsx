import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

interface FitmentVehicle {
  vehicleId?: number;
  year?: number | null;
  make?: string | null;
  model?: string | null;
  submodel?: string | null;
  engineCode?: string | null;
  engineName?: string | null;
  body?: string | null;
}

interface FitmentState {
  selectedVehicle: FitmentVehicle | null;
  isLoading: boolean;
  decodeVin: (vin: string) => Promise<FitmentVehicle | null>;
  setSelectedVehicle: (vehicle: FitmentVehicle | null) => void;
  clearSelection: () => void;
  loadOptions: (
    filters: Record<string, string | number | undefined>
  ) => Promise<FitmentOptions | null>;
}

interface FitmentOptions {
  years: number[];
  makes: string[];
  models: string[];
  submodels: string[];
  engines: Array<{ code: string | null; name: string | null }>;
  vehicle: FitmentVehicle | null;
}

const STORAGE_KEY = 'autoFitment.selectedVehicle';

const FitmentContext = createContext<FitmentState | undefined>(undefined);

const readStoredVehicle = (): FitmentVehicle | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as FitmentVehicle;
  } catch (error) {
    return null;
  }
};

const persistVehicle = (vehicle: FitmentVehicle | null) => {
  if (typeof window === 'undefined') {
    return;
  }
  if (!vehicle) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicle));
};

const defaultState: FitmentState = {
  selectedVehicle: null,
  isLoading: false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  decodeVin: async (_vin: string) => null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadOptions: async (_filters: Record<string, string | number | undefined>) => null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setSelectedVehicle: (_vehicle: FitmentVehicle | null) => undefined,
  clearSelection: () => undefined
};

interface ProviderProps {
  children: React.ReactNode;
}

export const VehicleFitmentProvider: React.FC<ProviderProps> = ({ children }) => {
  const [selectedVehicle, setSelectedVehicleState] = useState<FitmentVehicle | null>(() =>
    readStoredVehicle()
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    persistVehicle(selectedVehicle);
  }, [selectedVehicle]);

  const setSelectedVehicle = useCallback((vehicle: FitmentVehicle | null) => {
    setSelectedVehicleState(vehicle);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedVehicleState(null);
  }, []);

  const loadOptions = useCallback(
    async (filters: Record<string, string | number | undefined>) => {
      try {
        const response = await fetch('/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query FitmentOptions(
                $vehicleId: Int
                $year: Int
                $make: String
                $model: String
                $submodel: String
                $engineCode: String
                $engineName: String
              ) {
                fitmentOptions(
                  vehicleId: $vehicleId
                  year: $year
                  make: $make
                  model: $model
                  submodel: $submodel
                  engineCode: $engineCode
                  engineName: $engineName
                ) {
                  years
                  makes
                  models
                  submodels
                  engines {
                    code
                    name
                  }
                  vehicle {
                    vehicleId
                    year
                    make
                    model
                    submodel
                    engineCode
                    engineName
                    body
                  }
                }
              }
            `,
            variables: filters
          })
        });
        const json = await response.json();
        if (!response.ok || json.errors) {
          throw new Error(json.errors?.[0]?.message || 'Unable to load fitment data');
        }
        return json.data?.fitmentOptions as FitmentOptions;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('fitmentOptions query failed', error);
        return null;
      }
    },
    []
  );

  const decodeVin = useCallback(async (vin: string) => {
    if (!vin) {
      return null;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/fitment/decode-vin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vin })
      });
      const json = await response.json();
      if (!response.ok || json.error) {
        throw new Error(json.error?.message || 'No fue posible decodificar el VIN.');
      }
      const vehicle: FitmentVehicle | null = json.data?.fitment?.vehicle || json.data?.vehicle || null;
      if (vehicle) {
        setSelectedVehicle(vehicle);
      }
      return vehicle;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('VIN decode failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setSelectedVehicle]);

  const contextValue = useMemo<FitmentState>(
    () => ({
      selectedVehicle,
      isLoading,
      decodeVin,
      setSelectedVehicle,
      clearSelection,
      loadOptions
    }),
    [selectedVehicle, isLoading, decodeVin, setSelectedVehicle, clearSelection, loadOptions]
  );

  return <FitmentContext.Provider value={contextValue}>{children}</FitmentContext.Provider>;
};

export const useVehicleFitment = (): FitmentState => {
  const context = useContext(FitmentContext);
  if (!context) {
    throw new Error('useVehicleFitment debe utilizarse dentro de un VehicleFitmentProvider');
  }
  return context;
};
