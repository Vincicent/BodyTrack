import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { useColorScheme } from "react-native";

export default function RootLayout() {
  const isDark = useColorScheme() === 'dark';
  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options= {{headerShown: false}} />
        <Stack.Screen name="entry/new" options= {{presentation: 'modal', title: 'Add weight'}} />
        <Stack.Screen name="entry/[id]" options= {{title: 'Edit weight'}} />
        <Stack.Screen name="mesuremennt/new" options= {{presentation: 'modal', title: 'Add mesurements'}} />
      </Stack>
    </ThemeProvider>
  )
}
