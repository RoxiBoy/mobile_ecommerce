import { Image, ImageStyle, StyleProp } from "react-native";
import { useMemo, useState } from "react";

interface RemoteImageProps {
  uri?: string | null;
  fallbackUri: string;
  style?: StyleProp<ImageStyle>;
  resizeMode?: "cover" | "contain" | "stretch" | "center";
}

export function RemoteImage({ uri, fallbackUri, style, resizeMode = "cover" }: RemoteImageProps) {
  const initial = useMemo(() => uri || fallbackUri, [uri, fallbackUri]);
  const [currentUri, setCurrentUri] = useState(initial);

  return (
    <Image
      source={{
        uri: currentUri,
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "image/*",
        },
      }}
      style={style}
      resizeMode={resizeMode}
      onError={(event) => {
        if (__DEV__) {
          console.warn("[RemoteImage] failed to load", currentUri, event.nativeEvent);
        }
        setCurrentUri(fallbackUri);
      }}
    />
  );
}
