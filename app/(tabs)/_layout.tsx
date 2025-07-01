import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { UnreadNotificationsProvider, useUnreadNotifications } from '../../components/UnreadNotificationsContext';

function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          headerShown: true,
          headerRight: () => {
            const { unread } = useUnreadNotifications();
            return (
              <Pressable onPress={() => { router.push('/(tabs)/notifications'); }} style={{ marginRight: 16 }}>
                <Ionicons name="notifications-outline" size={26} color={Colors[colorScheme ?? 'light'].tint} />
                {unread && (
                  <View style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: 'red',
                  }} />
                )}
              </Pressable>
            );
          },
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color }) => <Ionicons name="notifications-outline" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}

export default function LayoutWrapper() {
  return (
    <UnreadNotificationsProvider>
      <TabLayout />
    </UnreadNotificationsProvider>
  );
}
